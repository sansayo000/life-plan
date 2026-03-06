// App Global State
let myChart = null;
let expensePieChart = null;
let simData = []; // Array to store year-by-year simulation results

// Constants for calculations
const EDUCATION_COSTS = {
    // Cumulative costs per year approximately (simplified model in Man-Yen)
    'public_all': { 0: 0, 3: 30, 4: 30, 5: 30, 6: 30, 7: 30, 8: 30, 9: 30, 10: 30, 11: 30, 12: 45, 13: 45, 14: 45, 15: 45, 16: 45, 17: 45, 18: 60, 19: 60, 20: 60, 21: 60 },
    'private_univ': { 0: 0, 3: 30, 4: 30, 5: 30, 6: 30, 7: 30, 8: 30, 9: 30, 10: 30, 11: 30, 12: 45, 13: 45, 14: 45, 15: 45, 16: 45, 17: 45, 18: 150, 19: 150, 20: 150, 21: 150 },
    'private_high_univ': { 0: 0, 3: 30, 4: 30, 5: 30, 6: 30, 7: 30, 8: 30, 9: 30, 10: 30, 11: 30, 12: 45, 13: 45, 14: 45, 15: 100, 16: 100, 17: 100, 18: 150, 19: 150, 20: 150, 21: 150 },
    'private_all': { 0: 0, 3: 60, 4: 60, 5: 60, 6: 100, 7: 100, 8: 100, 9: 100, 10: 100, 11: 100, 12: 120, 13: 120, 14: 120, 15: 100, 16: 100, 17: 100, 18: 150, 19: 150, 20: 150, 21: 150 },
};

// UI Interaction Functions
function toggleSection(contentId) {
    const content = document.getElementById(contentId);
    const icon = document.getElementById(contentId.replace('content', 'icon'));

    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        if (icon) icon.classList.remove('rotate-180');
    } else {
        content.classList.add('hidden');
        if (icon) icon.classList.add('rotate-180');
    }
}

function toggleSpouseInputs() {
    const isChecked = document.getElementById('has-spouse').checked;

    // Original spouse inputs
    const spouseInputs = document.getElementById('spouse-inputs');
    const inputs = spouseInputs.querySelectorAll('input');

    // New spouse investment inputs
    const spouseInvestInputs = document.getElementById('spouse-invest-inputs');
    const investInputs = spouseInvestInputs ? spouseInvestInputs.querySelectorAll('input') : [];
    const spouseYieldContainer = document.getElementById('spouse-yield-container');

    if (isChecked) {
        spouseInputs.classList.remove('hidden');
        setTimeout(() => spouseInputs.classList.remove('opacity-50'), 10);
        inputs.forEach(input => {
            input.disabled = false;
            input.classList.remove('bg-slate-50', 'cursor-not-allowed');
        });

        if (investInputs.length > 0) {
            investInputs.forEach(input => {
                input.disabled = false;
                input.classList.remove('bg-slate-50', 'cursor-not-allowed');
            });
            if (spouseYieldContainer) {
                spouseYieldContainer.classList.remove('opacity-50');
            }
        }
    } else {
        spouseInputs.classList.add('opacity-50');
        setTimeout(() => spouseInputs.classList.add('hidden'), 300);
        inputs.forEach(input => {
            input.disabled = true;
            input.classList.add('bg-slate-50', 'cursor-not-allowed');
        });

        if (investInputs.length > 0) {
            investInputs.forEach(input => {
                input.disabled = true;
                input.classList.add('bg-slate-50', 'cursor-not-allowed');
            });
            if (spouseYieldContainer) {
                spouseYieldContainer.classList.add('opacity-50');
            }
        }
    }
    // Auto-calculate on toggle if data exists
    if (simData.length > 0) calculateSimulation();
}

function toggleHousingType() {
    const type = document.getElementById('housing-type').value;
    document.getElementById('housing-rent').classList.add('hidden');
    document.getElementById('housing-mortgage').classList.add('hidden');
    document.getElementById('housing-buy-future').classList.add('hidden');

    if (type === 'rent') document.getElementById('housing-rent').classList.remove('hidden');
    if (type === 'mortgage') document.getElementById('housing-mortgage').classList.remove('hidden');
    if (type === 'buy_future') document.getElementById('housing-buy-future').classList.remove('hidden');

    if (simData.length > 0) calculateSimulation();
}

function addChild() {
    const container = document.getElementById('children-container');
    const childHtml = `
        <div class="child-entry p-3 border border-slate-200 rounded-lg bg-white relative mt-3">
            <button type="button" onclick="removeChild(this)" class="absolute top-2 right-2 text-slate-400 hover:text-red-500" title="削除">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div class="grid grid-cols-2 gap-3 pr-6">
                <div>
                    <label class="block text-xs text-slate-500 mb-1">現在の年齢 (0=今年誕生)</label>
                    <input type="number" class="child-age input-field block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" value="0">
                </div>
                <div>
                    <label class="block text-xs text-slate-500 mb-1">進路コース</label>
                    <select class="child-course input-field block w-full rounded-md border-slate-300 shadow-sm sm:text-sm">
                        <option value="public_all">全て公立</option>
                        <option value="private_univ" selected>大学のみ私立(文系)</option>
                        <option value="private_high_univ">高校・大学私立</option>
                        <option value="private_all">全て私立</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', childHtml);
    if (simData.length > 0) calculateSimulation();
}

function removeChild(btn) {
    btn.closest('.child-entry').remove();
    if (simData.length > 0) calculateSimulation();
}

// Event Listeners for real-time updates
document.addEventListener('DOMContentLoaded', () => {
    // Sync living expense yearly display
    const livingInput = document.getElementById('living-expense');
    const livingDisplay = document.getElementById('living-expense-yearly-display');
    livingInput.addEventListener('input', (e) => {
        livingDisplay.textContent = `年間: ${e.target.value * 12}万円`;
    });

    // Sync sliders with inputs
    const syncSliderInput = (sliderId, inputId) => {
        const slider = document.getElementById(sliderId);
        const input = document.getElementById(inputId);
        if (!slider || !input) return;
        slider.addEventListener('input', (e) => {
            input.value = e.target.value;
            if (simData.length > 0) calculateSimulation();
        });
        input.addEventListener('change', (e) => {
            slider.value = e.target.value;
            if (simData.length > 0) calculateSimulation();
        });
    };

    syncSliderInput('investment-yield-main-slider', 'investment-yield-main');
    syncSliderInput('investment-yield-spouse-slider', 'investment-yield-spouse');
    syncSliderInput('inflation-rate-slider', 'inflation-rate');

    // Attach calculate button
    document.getElementById('btn-calculate').addEventListener('click', () => {
        const btn = document.getElementById('btn-calculate');
        btn.innerHTML = '<span class="mr-2">計算中...</span>';
        btn.classList.add('opacity-75');

        setTimeout(() => { // small delay for UI feedback
            calculateSimulation();
            btn.innerHTML = 'シミュレーション実行';
            btn.classList.remove('opacity-75');

            // Show data table
            document.getElementById('data-table-section').classList.remove('hidden');
        }, 50);
    });

    // Save/Load Data (Auto save on calculate, Auto load on init)
    loadData();
});

// Main Calculation Logic
function getInputs() {
    // Helper to get float
    const getVal = (id) => parseFloat(document.getElementById(id).value) || 0;

    // Children parsing
    const children = Array.from(document.querySelectorAll('.child-entry')).map(entry => ({
        age: parseInt(entry.querySelector('.child-age').value) || 0,
        course: entry.querySelector('.child-course').value
    }));

    return {
        // Basic
        age: parseInt(getVal('current-age')),
        simYears: parseInt(getVal('sim-years')),
        incomeMain: getVal('income-main'),
        incomeGrowth: getVal('income-growth') / 100,
        pensionStartMain: parseInt(getVal('pension-start-main')) || 65,
        pensionAmountMain: getVal('pension-amount-main'),

        // Spouse
        hasSpouse: document.getElementById('has-spouse').checked,
        spouseAge: parseInt(getVal('spouse-age')),
        incomeSpouse: getVal('income-spouse'),
        incomeGrowthSpouse: getVal('income-growth-spouse') / 100,
        pensionStartSpouse: parseInt(getVal('pension-start-spouse')) || 65,
        pensionAmountSpouse: getVal('pension-amount-spouse'),

        // Assets & Scenarios
        savings: getVal('current-savings'),
        investmentMain: getVal('current-investments'), // Re-purposed the original id 'current-investments' to total for load, logic down later
        monthlyInvestMain: getVal('monthly-invest-main'),
        yieldMain: getVal('investment-yield-main') / 100,
        monthlyInvestSpouse: getVal('monthly-invest-spouse'),
        yieldSpouse: getVal('investment-yield-spouse') / 100,
        inflation: getVal('inflation-rate') / 100,

        // Expenses
        livingVar: getVal('living-expense') * 12, // Annual
        housingType: document.getElementById('housing-type').value,

        // Rent
        rent: getVal('rent-expense') * 12,

        // Mortgage
        mortgageBal: getVal('mortgage-balance'),
        mortgageYears: getVal('mortgage-years'),
        mortgageRate: getVal('mortgage-rate') / 100,

        // Future Buy
        buyAge: getVal('buy-age'),
        buyPrice: getVal('buy-price'),
        buyDown: getVal('buy-downpayment'),
        buyRate: getVal('buy-rate') / 100,
        buyCurrentRent: getVal('buy-current-rent') * 12,

        children: children
    };
}

// Calculate Mortgage Yearly Payment (PMT function equivalent)
function calcYearlyMortgage(principal, years, annualRate) {
    if (principal <= 0 || years <= 0) return 0;
    if (annualRate === 0) return principal / years;

    const monthlyRate = annualRate / 12;
    const months = years * 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return monthlyPayment * 12;
}

function calculateSimulation() {
    const inputs = getInputs();
    simData = []; // clear global
    let events = [];

    let currentAge = inputs.age;
    let savings = inputs.savings;
    // Split the initial investment evenly as a fallback, or if we want we can just put it all in main for starting 
    // since we don't have separate current investment inputs for main/spouse
    let investmentMain = inputs.investmentMain;
    let investmentSpouse = 0;
    let mortgageBalance = inputs.housingType === 'mortgage' ? inputs.mortgageBal : 0;

    // Future buy state tracking
    let hasBoughtHouse = false;
    let futureMortgageYears = 35; // default 35 years for future buy
    let futureMortgagePayment = 0;

    // Fixed Mortgage Payment calculation for existing mortgage
    const existingMortgagePayment = calcYearlyMortgage(inputs.mortgageBal, inputs.mortgageYears, inputs.mortgageRate);

    // Totals for Pie Chart
    let totalLiving = 0;
    let totalHousing = 0;
    let totalEdu = 0;
    let totalOthers = 0;

    let depletionAge = null;
    let peakExpense = 0;
    let peakExpenseAge = 0;

    for (let i = 0; i <= inputs.simYears; i++) {
        let yearAge = currentAge + i;
        let inflationMultiplier = Math.pow(1 + inputs.inflation, i);

        // --- Income ---
        // Pension is dynamic based on user set ages and amounts
        let incomeRatio = yearAge < inputs.pensionStartMain ? Math.pow(1 + inputs.incomeGrowth, i) : 0;
        let incomeM = yearAge < inputs.pensionStartMain ? inputs.incomeMain * incomeRatio : inputs.pensionAmountMain * inflationMultiplier;

        let sAge = inputs.spouseAge + i;
        let incomeS = 0;
        if (inputs.hasSpouse) {
            incomeS = sAge < inputs.pensionStartSpouse ? inputs.incomeSpouse * Math.pow(1 + inputs.incomeGrowthSpouse, i) : inputs.pensionAmountSpouse * inflationMultiplier;
        }

        let totalIncome = incomeM + incomeS;

        // --- Expenses ---
        // 1. Living (scales with inflation, drops slightly in retirement)
        let retirementDrop = (yearAge >= inputs.pensionStartMain || sAge >= inputs.pensionStartSpouse) ? 0.8 : 1.0;
        let expLiving = inputs.livingVar * inflationMultiplier * retirementDrop;
        totalLiving += expLiving;

        // 2. Housing
        let expHousing = 0;
        if (inputs.housingType === 'rent') {
            expHousing = inputs.rent * inflationMultiplier;
        } else if (inputs.housingType === 'mortgage') {
            if (i < inputs.mortgageYears) {
                expHousing = existingMortgagePayment;
                mortgageBalance -= (existingMortgagePayment - (mortgageBalance * inputs.mortgageRate));
            } else {
                expHousing = 20 * inflationMultiplier; // Maint/Tax after paid off (placeholder)
            }
        } else if (inputs.housingType === 'buy_future') {
            if (yearAge < inputs.buyAge) {
                expHousing = inputs.buyCurrentRent * inflationMultiplier;
            } else if (yearAge === inputs.buyAge) {
                // Year of purchase
                hasBoughtHouse = true;
                expHousing = inputs.buyDown;
                events.push({ age: yearAge, text: `住宅購入: 頭金 ${Math.round(expHousing)}万円`, type: 'event' });

                let principal = inputs.buyPrice - inputs.buyDown;
                mortgageBalance = principal;
                futureMortgagePayment = calcYearlyMortgage(principal, futureMortgageYears, inputs.buyRate);
                expHousing += futureMortgagePayment; // Add first year payment
            } else {
                // Post purchase
                let yearsPaid = yearAge - inputs.buyAge;
                if (yearsPaid < futureMortgageYears) {
                    expHousing = futureMortgagePayment;
                    mortgageBalance -= (futureMortgagePayment - (mortgageBalance * inputs.buyRate));
                } else {
                    expHousing = 20 * inflationMultiplier; // Maint/Tax after paid off
                }
            }
        }
        totalHousing += expHousing;

        // 3. Education
        let expEdu = 0;
        inputs.children.forEach((child, index) => {
            let childAge = child.age + i;
            if (childAge >= 0 && childAge <= 22) { // Univ ends at 22 approx
                let costMap = EDUCATION_COSTS[child.course];
                // Find nearest age cost (simplified)
                let cost = costMap[childAge] || (costMap[Math.floor(childAge / 3) * 3] || 0);
                if (childAge > 22) cost = 0;

                let adjustedCost = cost * inflationMultiplier;
                expEdu += adjustedCost;

                // Events
                if (childAge === 6 && i > 0) events.push({ age: yearAge, text: `第${index + 1}子 小学校入学`, type: 'edu' });
                if (childAge === 15 && i > 0) events.push({ age: yearAge, text: `第${index + 1}子 高校入学`, type: 'edu' });
                if (childAge === 18 && i > 0) events.push({ age: yearAge, text: `第${index + 1}子 大学入学`, type: 'edu' });
            }
        });
        totalEdu += expEdu;

        // 4. Events / Others Placeholder (Car buy every 10 years after 30)
        let expOther = 0;
        if (yearAge % 10 === 0 && yearAge >= 30 && yearAge <= 70) {
            expOther = 300 * inflationMultiplier;
            events.push({ age: yearAge, text: `車の買い替え等の一時費用 (${Math.round(expOther)}万円)`, type: 'other' });
        }
        totalOthers += expOther;

        let totalExpense = expLiving + expHousing + expEdu + expOther;

        if (totalExpense > peakExpense) {
            peakExpense = totalExpense;
            peakExpenseAge = yearAge;
        }

        // --- Balance & Assets ---
        let balance = totalIncome - totalExpense;

        let invReturnMain = investmentMain * inputs.yieldMain;
        let invReturnSpouse = investmentSpouse * (inputs.hasSpouse ? inputs.yieldSpouse : 0);

        // Annual investment additions
        let annualInvestMain = inputs.monthlyInvestMain * 12;
        let annualInvestSpouse = inputs.hasSpouse ? (inputs.monthlyInvestSpouse * 12) : 0;
        let totalAnnualInvest = annualInvestMain + annualInvestSpouse;

        // Apply returns and intended investments
        investmentMain += invReturnMain + annualInvestMain;
        investmentSpouse += invReturnSpouse + annualInvestSpouse;

        // Adjust balance by the intended investments (investment is a form of "expense" from cashflow perspective to shift to assets)
        let cashBalanceAfterInvest = balance - totalAnnualInvest;

        if (cashBalanceAfterInvest > 0) {
            savings += cashBalanceAfterInvest;
        } else {
            // Deficit covering strategy
            let deficit = Math.abs(cashBalanceAfterInvest);
            if (savings >= deficit) {
                savings -= deficit;
            } else {
                deficit -= savings;
                savings = 0;

                // Draw from investments to cover remaining deficit (draw from spouse first, then main linearly, or proportional)
                let totalInv = investmentMain + investmentSpouse;
                if (totalInv > 0) {
                    let mainShare = investmentMain / totalInv;
                    let spouseShare = investmentSpouse / totalInv;

                    let drawMain = deficit * mainShare;
                    let drawSpouse = deficit * spouseShare;

                    investmentMain -= drawMain;
                    investmentSpouse -= drawSpouse;
                } else {
                    // Everything zeroed out
                    investmentMain = 0;
                    investmentSpouse = 0;
                }
            }
        }

        let netWorth = savings + investmentMain + investmentSpouse;

        if (netWorth < 0 && !depletionAge) {
            depletionAge = yearAge;
            events.push({ age: yearAge, text: `🔥 資産が枯渇する見込みです`, type: 'alert' });
        }

        simData.push({
            age: yearAge,
            income: totalIncome,
            expense: totalExpense,
            balance: balance,
            savings: savings,
            investment: investmentMain + investmentSpouse,
            netWorth: netWorth // Removed Math.max(0, netWorth) to allow negatives
        });
    }

    // --- Update UI ---
    updateSummaryUI(simData, events, depletionAge, peakExpenseAge, peakExpense);
    drawMainChart(simData);
    drawPieChart(totalLiving, totalHousing, totalEdu, totalOthers);
    updateDataTable(simData);
    saveData(inputs);
}

function updateSummaryUI(data, events, depletionAge, peakExpenseAge, peakExpense) {
    // 65yo Asset
    const age65Data = data.find(d => d.age === 65);
    const asset65 = age65Data ? age65Data.netWorth : data[data.length - 1].netWorth;
    document.getElementById('summary-asset-65').innerHTML = `${Math.round(asset65).toLocaleString()}<span class="text-lg font-normal text-slate-500"> 万円</span>`;

    // Depletion
    const depEl = document.getElementById('summary-depletion');
    if (depletionAge) {
        depEl.textContent = `${depletionAge}歳`;
        depEl.classList.add('text-rose-600');
        depEl.classList.remove('text-primary-600');
    } else {
        depEl.textContent = 'なし';
        depEl.classList.remove('text-rose-600');
        depEl.classList.add('text-primary-600');
    }

    // Rough Insurance Need (simplified: Peak Expense * 5 years minus current assets)
    const currentAssets = data[0] ? data[0].netWorth : 0;
    const requiredInsurance = Math.max(0, (peakExpense * 5) - Math.max(0, currentAssets));
    document.getElementById('summary-insurance').innerHTML = `${Math.round(requiredInsurance).toLocaleString()}<span class="text-lg font-normal text-slate-500"> 万円</span>`;

    // Events List
    const limitEvents = events.sort((a, b) => a.age - b.age);
    // Add peak expense event
    limitEvents.push({ age: peakExpenseAge, text: `支出ピーク予想 (${Math.round(peakExpense)}万円/年)`, type: 'alert' });

    // Deduplicate and re-sort
    const uniqueEvents = limitEvents.filter((v, i, a) => a.findIndex(t => (t.age === v.age && t.text === t.text)) === i).sort((a, b) => a.age - b.age);

    const eventsHtml = uniqueEvents.map(e => {
        let colorClass = 'bg-blue-500';
        if (e.type === 'alert') colorClass = 'bg-rose-500';
        if (e.type === 'edu') colorClass = 'bg-amber-500';

        return `
            <li class="relative pl-6 py-2">
                <span class="absolute left-0 top-3 -ml-1 w-3 h-3 rounded-full ${colorClass} ring-4 ring-white md:left-1/2 md:-ml-1.5 md:hidden"></span>
                <div class="flex flex-col md:flex-row md:items-center">
                   <span class="font-bold text-slate-700 w-16">${e.age}歳</span>
                   <span class="text-sm text-slate-600 ml-0 md:ml-4">${e.text}</span>
                </div>
            </li>
        `;
    }).join('');

    document.getElementById('events-list').innerHTML = eventsHtml || '<li class="text-slate-500 text-sm italic py-4">特筆すべきイベントはありません</li>';
}

function drawMainChart(data) {
    const ctx = document.getElementById('mainChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    const labels = data.map(d => d.age + '歳');

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '純資産',
                    data: data.map(d => d.netWorth),
                    borderColor: '#10b981', // emerald-500
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    yAxisID: 'y',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: '収入',
                    type: 'bar',
                    data: data.map(d => d.income),
                    backgroundColor: 'rgba(59, 130, 246, 0.4)', // blue-500
                    yAxisID: 'y1'
                },
                {
                    label: '支出',
                    type: 'bar',
                    data: data.map(d => d.expense),
                    backgroundColor: 'rgba(244, 63, 94, 0.4)', // rose-500
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) label += new Intl.NumberFormat('ja-JP').format(Math.round(context.parsed.y)) + '万円';
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: '資産残高 (万円)' },
                    ticks: {
                        callback: function (value) { return value.toLocaleString(); }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: '年間収支 (万円)' },
                    grid: { drawOnChartArea: false }, // only want the grid lines for one axis to show up
                    min: 0, // Ensure income/expense bar charts stay grounded at 0, otherwise they float if assets go negative
                    ticks: {
                        callback: function (value) { return value.toLocaleString(); }
                    }
                }
            }
        }
    });
}

function drawPieChart(living, housing, edu, other) {
    const ctx = document.getElementById('pieChart').getContext('2d');

    if (expensePieChart) {
        expensePieChart.destroy();
    }

    expensePieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['生活費', '住宅費', '教育費', 'その他'],
            datasets: [{
                data: [living, housing, edu, other].map(v => Math.round(v)),
                backgroundColor: [
                    '#3b82f6', // blue-500
                    '#f59e0b', // amber-500
                    '#10b981', // emerald-500
                    '#8b5cf6'  // violet-500
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let val = context.parsed;
                            let total = context.dataset.data.reduce((a, b) => a + b, 0);
                            let percent = Math.round((val / total) * 100);
                            return ` ${context.label}: ${new Intl.NumberFormat('ja-JP').format(val)}万円 (${percent}%)`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

function updateDataTable(data) {
    const tbody = document.getElementById('data-table-body');
    let html = '';

    data.forEach((row, i) => {
        // Show every year or maybe every 5 years to save space? Let's show every 5 for the table by default to keep DOM light, unless it's the specific export.
        if (i === 0 || i === data.length - 1 || row.age % 5 === 0) {
            html += `
                <tr class="hover:bg-slate-50">
                    <td class="px-4 py-3 whitespace-nowrap text-center">${row.age}</td>
                    <td class="px-4 py-3 whitespace-nowrap">${Math.round(row.income).toLocaleString()}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-rose-600">${Math.round(row.expense).toLocaleString()}</td>
                    <td class="px-4 py-3 whitespace-nowrap ${row.balance >= 0 ? 'text-primary-600' : 'text-slate-600'}">${Math.round(row.balance).toLocaleString()}</td>
                    <td class="px-4 py-3 whitespace-nowrap font-bold text-emerald-600">${Math.round(row.netWorth).toLocaleString()}</td>
                </tr>
            `;
        }
    });

    // Note at bottom
    html += `<tr><td colspan="5" class="px-4 py-2 text-xs text-center text-slate-400">※表示は5年ごとの抜粋です。全データはExcel出力で確認できます。</td></tr>`;
    tbody.innerHTML = html;
}

// LocalStorage Persistence
function saveData(inputs) {
    try {
        localStorage.setItem('lifePlanData', JSON.stringify(inputs));
    } catch (e) {
        console.log('Unable to save to localStorage', e);
    }
}

function loadData() {
    try {
        const saved = localStorage.getItem('lifePlanData');
        if (saved) {
            const data = JSON.parse(saved);
            // Re-populate basic inputs (simplified)
            // In a real app we'd map all fields carefully
            document.getElementById('current-age').value = data.age;
            document.getElementById('income-main').value = data.incomeMain;
            if (data.pensionStartMain) document.getElementById('pension-start-main').value = data.pensionStartMain;
            if (data.pensionAmountMain) document.getElementById('pension-amount-main').value = data.pensionAmountMain;

            document.getElementById('current-savings').value = data.savings;

            // Individual investments
            if (data.monthlyInvestMain !== undefined) document.getElementById('monthly-invest-main').value = data.monthlyInvestMain;
            if (data.yieldMain !== undefined) document.getElementById('investment-yield-main').value = data.yieldMain * 100;

            if (data.hasSpouse) {
                document.getElementById('has-spouse').checked = true;
                toggleSpouseInputs();
                document.getElementById('spouse-age').value = data.spouseAge || 30;
                document.getElementById('income-spouse').value = data.incomeSpouse || 0;
                if (data.incomeGrowthSpouse !== undefined) document.getElementById('income-growth-spouse').value = data.incomeGrowthSpouse * 100;
                if (data.pensionStartSpouse) document.getElementById('pension-start-spouse').value = data.pensionStartSpouse;
                if (data.pensionAmountSpouse) document.getElementById('pension-amount-spouse').value = data.pensionAmountSpouse;
                if (data.monthlyInvestSpouse !== undefined) document.getElementById('monthly-invest-spouse').value = data.monthlyInvestSpouse;
                if (data.yieldSpouse !== undefined) document.getElementById('investment-yield-spouse').value = data.yieldSpouse * 100;
            }

            // Re-sync sliders
            const range1 = document.getElementById('investment-yield-main-slider');
            if (range1) range1.value = data.yieldMain * 100 || 3;
            const range2 = document.getElementById('investment-yield-spouse-slider');
            if (range2) range2.value = data.yieldSpouse * 100 || 3;
            // Execute once loaded if data seems valid
            if (data.age) {
                calculateSimulation();
            }
        } else {
            // Initial calc for default values
            calculateSimulation();
        }
    } catch (e) {
        console.log('Error loading data', e);
        calculateSimulation();
    }
}
