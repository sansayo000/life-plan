// App Global State
let myChart = null;
let expensePieChart = null;
let simData = []; // Array to store year-by-year simulation results

const DETAILED_EDUCATION_COSTS = {
    nursery: { public: 20, private: 50 },     // Age 3-5 (approx annual cost in Man-Yen)
    elementary: { public: 35, private: 160 }, // Age 6-11
    junior_high: { public: 50, private: 140 },// Age 12-14
    high_school: { public: 50, private: 100 },// Age 15-17
    university: {
        national: 100, // 国公立
        private_humanities: 150, // 私立文系
        private_science: 200 // 私立理系
    }, // Age 18-21
    grad_school: {
        none: 0,
        national: 100, // 国公立
        private: 150 // 私立
    } // Age 22-23
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
        <div class="child-entry p-4 border border-slate-200 rounded-lg bg-white relative mt-3 shadow-sm">
            <button type="button" onclick="removeChildEntry(this)" class="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition-colors" title="削除">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-6 mt-2">
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">現在の年齢</label>
                    <input type="number" class="child-age input-field block w-full rounded-md border-slate-300 shadow-sm sm:text-sm focus:border-primary-500 focus:ring-primary-500" value="0" min="0" max="25">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">保育園/幼稚園</label>
                    <select class="child-nursery input-field block w-full rounded-md border-slate-300 shadow-sm sm:text-sm">
                        <option value="public">公立</option>
                        <option value="private">私立</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">小学校</label>
                    <select class="child-elementary input-field block w-full rounded-md border-slate-300 shadow-sm sm:text-sm">
                        <option value="public">公立</option>
                        <option value="private">私立</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">中学校</label>
                    <select class="child-junior input-field block w-full rounded-md border-slate-300 shadow-sm sm:text-sm">
                        <option value="public">公立</option>
                        <option value="private">私立</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">高校</label>
                    <select class="child-high input-field block w-full rounded-md border-slate-300 shadow-sm sm:text-sm">
                        <option value="public">公立</option>
                        <option value="private">私立</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">大学等</label>
                    <select class="child-univ input-field block w-full rounded-md border-slate-300 shadow-sm sm:text-sm">
                        <option value="national">国公立</option>
                        <option value="private_humanities" selected>私立(文系)</option>
                        <option value="private_science">私立(理系)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">大学院</label>
                    <select class="child-grad input-field block w-full rounded-md border-slate-300 shadow-sm sm:text-sm">
                        <option value="none" selected>なし</option>
                        <option value="national">国公立</option>
                        <option value="private">私立</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', childHtml);
    if (simData.length > 0) calculateSimulation();
}

function removeChildEntry(btn) {
    btn.closest('.child-entry').remove();
    if (simData.length > 0) calculateSimulation();
}

function addCustomEvent() {
    const container = document.getElementById('custom-events-container');
    const eventHtml = `
        <div class="custom-event-entry p-3 border border-slate-200 rounded-lg bg-white relative shadow-sm flex flex-wrap gap-3 items-end">
            <button type="button" onclick="removeCustomEvent(this)" class="absolute top-2 right-2 text-slate-400 hover:text-rose-500 transition-colors" title="削除">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div class="w-24">
                <label class="block text-xs font-medium text-slate-700 mb-1">発生年齢</label>
                <div class="relative">
                    <input type="number" class="event-age input-field block w-full rounded-md border-slate-300 shadow-sm sm:text-sm pr-6" value="35" min="0" max="100">
                    <span class="absolute inset-y-0 right-0 pr-2 flex items-center text-xs text-slate-500">歳</span>
                </div>
            </div>
            <div class="w-32">
                <label class="block text-xs font-medium text-slate-700 mb-1">費用</label>
                <div class="relative">
                    <input type="number" class="event-cost input-field block w-full rounded-md border-slate-300 shadow-sm sm:text-sm pr-8" value="100" min="0">
                    <span class="absolute inset-y-0 right-0 pr-2 flex items-center text-xs text-slate-500">万円</span>
                </div>
            </div>
            <div class="flex-1 min-w-[150px]">
                <label class="block text-xs font-medium text-slate-700 mb-1">イベント名</label>
                <input type="text" class="event-name input-field block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" value="マイカー購入" placeholder="例: 車の購入">
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', eventHtml);
    if (simData.length > 0) calculateSimulation();
}

function removeCustomEvent(btn) {
    btn.closest('.custom-event-entry').remove();
    if (simData.length > 0) calculateSimulation();
}

// --- Mortgage Real-time UI & Logic ---
function calcMonthlyMortgage(principal, months, annualRate) {
    if (principal <= 0 || months <= 0) return 0;
    if (annualRate === 0) return principal / months;
    const monthlyRate = annualRate / 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

function calcMortgageLifecycle(bal, years, type, method, initRate, rateEvents) {
    let months = years * 12;
    let balance = bal;
    let totalPaid = 0;
    let firstMonthPayment = 0;
    let currentAnnualRate = initRate;
    let fixedPrincipalPayment = bal / months;

    for (let m = 1; m <= months; m++) {
        if (type === 'variable') {
            const yearIndex = Math.floor((m - 1) / 12) + 1;
            for (const ev of rateEvents) {
                if (ev.years === yearIndex - 1 && (m - 1) % 12 === 0) {
                    currentAnnualRate = ev.rate;
                }
            }
        }

        let currentMonthlyRate = currentAnnualRate / 12;
        let interest = balance * currentMonthlyRate;
        let payment = 0;
        let principalPayment = 0;

        if (method === 'equal_pi') {
            payment = calcMonthlyMortgage(balance, months - m + 1, currentAnnualRate);
            principalPayment = payment - interest;
        } else {
            principalPayment = fixedPrincipalPayment;
            payment = principalPayment + interest;
        }

        if (m === 1) firstMonthPayment = payment;

        balance -= principalPayment;
        totalPaid += payment;
        if (balance <= 0) break;
    }
    return { firstMonth: firstMonthPayment, total: totalPaid };
}

function getYearlyMortgagePayments(bal, years, type, method, initRate, rateEvents) {
    let months = years * 12;
    let balance = bal;
    let currentAnnualRate = initRate;
    let yearlyPayments = Array(years).fill(0);
    let yearlyBalances = Array(years).fill(0);
    let fixedPrincipalPayment = bal / months;

    for (let m = 1; m <= months; m++) {
        let yearIndex = Math.floor((m - 1) / 12);

        if (type === 'variable') {
            for (const ev of rateEvents) {
                if (ev.years === yearIndex && (m - 1) % 12 === 0) {
                    currentAnnualRate = ev.rate;
                }
            }
        }

        let currentMonthlyRate = currentAnnualRate / 12;
        let interest = balance * currentMonthlyRate;
        let payment = 0;
        let principalPayment = 0;

        if (method === 'equal_pi') {
            payment = calcMonthlyMortgage(balance, months - m + 1, currentAnnualRate);
            principalPayment = payment - interest;
        } else {
            principalPayment = fixedPrincipalPayment;
            payment = principalPayment + interest;
        }

        balance -= principalPayment;
        yearlyPayments[yearIndex] += payment;

        if (m % 12 === 0 || balance <= 0) {
            if (yearlyBalances[yearIndex] === 0) {
                yearlyBalances[yearIndex] = Math.max(0, balance);
            }
        }

        if (balance <= 0) {
            for (let i = yearIndex; i < years; i++) {
                if (yearlyBalances[i] === undefined || yearlyBalances[i] === 0 && i > yearIndex) {
                    yearlyBalances[i] = 0;
                }
            }
            break;
        }
    }
    return { payments: yearlyPayments, balances: yearlyBalances };
}

function toggleMortgageUI() {
    const type = document.getElementById('mortgage-interest-type').value;
    document.getElementById('mortgage-variable-events').classList.toggle('hidden', type !== 'variable');
    calculateRealtimeMortgage();
    if (typeof simData !== 'undefined' && simData.length > 0) calculateSimulation();
}

function toggleBuyUI() {
    const type = document.getElementById('buy-interest-type').value;
    document.getElementById('buy-variable-events').classList.toggle('hidden', type !== 'variable');
    calculateRealtimeBuy();
    if (typeof simData !== 'undefined' && simData.length > 0) calculateSimulation();
}

function calculateRealtimeMortgage() {
    const bal = parseFloat(document.getElementById('mortgage-balance').value) || 0;
    const years = parseInt(document.getElementById('mortgage-years').value) || 0;
    const type = document.getElementById('mortgage-interest-type').value;
    const method = document.getElementById('mortgage-repayment-method').value;
    const rate = (parseFloat(document.getElementById('mortgage-rate').value) || 0) / 100;
    const events = Array.from(document.querySelectorAll('#mortgage-variable-events-container .mortgage-rate-entry')).map(entry => ({
        years: parseInt(entry.querySelector('.rate-years').value) || 0,
        rate: (parseFloat(entry.querySelector('.rate-value').value) || 0) / 100
    })).sort((a, b) => a.years - b.years);

    const res = calcMortgageLifecycle(bal, years, type, method, rate, events);
    document.getElementById('mortgage-monthly-display').innerText = bal > 0 && years > 0 ? res.firstMonth.toFixed(1) + '万円' : '---万円';
    document.getElementById('mortgage-total-display').innerText = bal > 0 && years > 0 ? Math.round(res.total) + '万円' : '---万円';
}

function calculateRealtimeBuy() {
    const bal = (parseFloat(document.getElementById('buy-price').value) || 0) - (parseFloat(document.getElementById('buy-downpayment').value) || 0);
    const years = parseInt(document.getElementById('buy-years').value) || 0;
    const type = document.getElementById('buy-interest-type').value;
    const method = document.getElementById('buy-repayment-method').value;
    const rate = (parseFloat(document.getElementById('buy-rate').value) || 0) / 100;
    const events = Array.from(document.querySelectorAll('#buy-variable-events-container .buy-rate-entry')).map(entry => ({
        years: parseInt(entry.querySelector('.rate-years').value) || 0,
        rate: (parseFloat(entry.querySelector('.rate-value').value) || 0) / 100
    })).sort((a, b) => a.years - b.years);

    const res = calcMortgageLifecycle(bal > 0 ? bal : 0, years, type, method, rate, events);
    document.getElementById('buy-monthly-display').innerText = bal > 0 && years > 0 ? res.firstMonth.toFixed(1) + '万円' : '---万円';
    document.getElementById('buy-total-display').innerText = bal > 0 && years > 0 ? Math.round(res.total) + '万円' : '---万円';
}

function addVariableRateEvent(prefix) {
    const container = document.getElementById(`${prefix}-variable-events-container`);
    const eventHtml = `
        <div class="${prefix}-rate-entry flex items-center gap-2 relative">
            <input type="number" class="rate-years input-field block w-20 rounded-md border-slate-300 shadow-sm sm:text-sm" value="5" min="1" placeholder="年後">
            <span class="text-xs text-slate-500">年後に</span>
            <input type="number" class="rate-value input-field block w-20 rounded-md border-slate-300 shadow-sm sm:text-sm" value="1.5" step="0.1" min="0" placeholder="金利">
            <span class="text-xs text-slate-500">% に変更</span>
            <button type="button" onclick="removeVariableRateEvent(this, '${prefix}')" class="text-slate-400 hover:text-rose-500 ml-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', eventHtml);

    const newInputs = container.lastElementChild.querySelectorAll('input');
    newInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (prefix === 'mortgage') calculateRealtimeMortgage();
            else calculateRealtimeBuy();
            if (typeof simData !== 'undefined' && simData.length > 0) calculateSimulation();
        });
    });

    if (prefix === 'mortgage') calculateRealtimeMortgage();
    else calculateRealtimeBuy();
    if (typeof simData !== 'undefined' && simData.length > 0) calculateSimulation();
}

function removeVariableRateEvent(btn, prefix) {
    btn.closest(`.${prefix}-rate-entry`).remove();
    if (prefix === 'mortgage') calculateRealtimeMortgage();
    else calculateRealtimeBuy();
    if (typeof simData !== 'undefined' && simData.length > 0) calculateSimulation();
}
// --- End Mortgage Real-time ---

// Event Listeners for real-time updates
document.addEventListener('DOMContentLoaded', () => {
    // Sync living expense yearly display and sum detailed items
    const livingItems = document.querySelectorAll('.living-item');
    const livingTotalDisplay = document.getElementById('living-expense-total-display');
    const livingHiddenInput = document.getElementById('living-expense');
    const livingDisplay = document.getElementById('living-expense-yearly-display');

    const updateLivingTotal = () => {
        let total = 0;
        livingItems.forEach(item => {
            total += parseFloat(item.value) || 0;
        });
        livingHiddenInput.value = total;
        livingTotalDisplay.textContent = total;
        livingDisplay.textContent = `年間: ${total * 12}万円`;
    };

    livingItems.forEach(item => {
        item.addEventListener('input', updateLivingTotal);
        item.addEventListener('change', updateLivingTotal);
    });
    // Initialize
    updateLivingTotal();

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

    // Auto-calculate simulation on any generic input change to provide real-time feedback
    document.addEventListener('change', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
            if (e.target.id.startsWith('mortgage-')) calculateRealtimeMortgage();
            if (e.target.id.startsWith('buy-')) calculateRealtimeBuy();

            // Ignore sliders and housing type which have their own listeners
            if (!e.target.id.includes('slider') && e.target.id !== 'housing-type') {
                if (simData.length > 0) calculateSimulation();
            }
        }
    });

    calculateRealtimeMortgage();
    calculateRealtimeBuy();

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
        nursery: entry.querySelector('.child-nursery').value,
        elementary: entry.querySelector('.child-elementary').value,
        junior: entry.querySelector('.child-junior').value,
        high: entry.querySelector('.child-high').value,
        univ: entry.querySelector('.child-univ').value,
        grad: entry.querySelector('.child-grad').value
    }));

    const customEvents = Array.from(document.querySelectorAll('.custom-event-entry')).map(entry => ({
        age: parseInt(entry.querySelector('.event-age').value) || 0,
        cost: parseFloat(entry.querySelector('.event-cost').value) || 0,
        name: entry.querySelector('.event-name').value || 'カスタムイベント'
    }));

    // Detailed living expenses
    const getLivingItem = (id) => parseFloat(document.getElementById(id).value) || 0;
    const detailedLiving = {
        food: getLivingItem('living-food'),
        daily: getLivingItem('living-daily'),
        util: getLivingItem('living-util'),
        comm: getLivingItem('living-comm'),
        medi: getLivingItem('living-medi'),
        hobby: getLivingItem('living-hobby'),
        beauty: getLivingItem('living-beauty'),
        social: getLivingItem('living-social'),
        ins: getLivingItem('living-ins'),
        extraEdu: getLivingItem('living-extra-edu'),
        trans: getLivingItem('living-trans'),
        other: getLivingItem('living-other')
    };

    return {
        // Basic
        age: parseInt(getVal('current-age')),
        simYears: parseInt(getVal('sim-years')),
        incomeMain: getVal('income-main'),
        incomeGrowth: getVal('income-growth') / 100,
        incomeCapAgeMain: parseInt(getVal('income-cap-age-main')) || 60,
        retirementAgeMain: parseInt(getVal('retirement-age-main')) || 60,
        shokakuIncomeMain: getVal('shokaku-income-main'),
        pensionStartMain: parseInt(getVal('pension-start-main')) || 65,
        pensionAmountMain: getVal('pension-amount-main'),
        retirementBonusMain: getVal('retirement-bonus-main'),

        // Spouse
        hasSpouse: document.getElementById('has-spouse').checked,
        spouseAge: parseInt(getVal('spouse-age')),
        incomeSpouse: getVal('income-spouse'),
        incomeGrowthSpouse: getVal('income-growth-spouse') / 100,
        incomeCapAgeSpouse: parseInt(getVal('income-cap-age-spouse')) || 60,
        retirementAgeSpouse: parseInt(getVal('retirement-age-spouse')) || 60,
        shokakuIncomeSpouse: getVal('shokaku-income-spouse'),
        pensionStartSpouse: parseInt(getVal('pension-start-spouse')) || 65,
        pensionAmountSpouse: getVal('pension-amount-spouse'),
        retirementBonusSpouse: getVal('retirement-bonus-spouse'),

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
        mortgageYears: parseInt(getVal('mortgage-years')) || 25,
        mortgageInterestType: document.getElementById('mortgage-interest-type').value,
        mortgageRepaymentMethod: document.getElementById('mortgage-repayment-method').value,
        mortgageRate: getVal('mortgage-rate') / 100,
        mortgageDeductionApply: document.getElementById('mortgage-deduction-apply') ? document.getElementById('mortgage-deduction-apply').checked : false,
        mortgageDeductionYears: parseInt(getVal('mortgage-deduction-years')) || 0,
        mortgageVariableRates: Array.from(document.querySelectorAll('.mortgage-rate-entry')).map(entry => ({
            years: parseInt(entry.querySelector('.rate-years').value) || 0,
            rate: parseFloat(entry.querySelector('.rate-value').value) / 100 || 0
        })).sort((a, b) => a.years - b.years),

        // Future Buy
        buyAge: getVal('buy-age'),
        buyPrice: getVal('buy-price'),
        buyDown: getVal('buy-downpayment'),
        buyInterestType: document.getElementById('buy-interest-type').value,
        buyRepaymentMethod: document.getElementById('buy-repayment-method').value,
        buyYears: parseInt(getVal('buy-years')) || 35,
        buyRate: getVal('buy-rate') / 100,
        buyDeductionApply: document.getElementById('buy-deduction-apply') ? document.getElementById('buy-deduction-apply').checked : false,
        buyCurrentRent: getVal('buy-current-rent') * 12,
        buyVariableRates: Array.from(document.querySelectorAll('.buy-rate-entry')).map(entry => ({
            years: parseInt(entry.querySelector('.rate-years').value) || 0,
            rate: parseFloat(entry.querySelector('.rate-value').value) / 100 || 0
        })).sort((a, b) => a.years - b.years),

        children: children,
        customEvents: customEvents,
        detailedLiving: detailedLiving
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
    const mortgageData = getYearlyMortgagePayments(
        inputs.mortgageBal, inputs.mortgageYears, inputs.mortgageInterestType,
        inputs.mortgageRepaymentMethod, inputs.mortgageRate, inputs.mortgageVariableRates
    );
    const mortgageYearlyPayments = mortgageData.payments;
    const mortgageYearlyBalances = mortgageData.balances;
    let futureBuyYearlyPayments = [];
    let futureBuyYearlyBalances = [];

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
        let incomeM = 0;
        const peakGrowthYearsM = Math.max(0, inputs.incomeCapAgeMain - currentAge);
        const peakIncomeM = inputs.incomeMain * Math.pow(1 + inputs.incomeGrowth, peakGrowthYearsM);

        if (yearAge >= inputs.pensionStartMain) {
            incomeM = inputs.pensionAmountMain * inflationMultiplier;          // ④年金期
        } else if (yearAge >= inputs.retirementAgeMain) {
            incomeM = inputs.shokakuIncomeMain;                                // ③嘱託期
        } else if (yearAge >= inputs.incomeCapAgeMain) {
            incomeM = peakIncomeM;                                             // ②横ばい期
        } else {
            const growthYears = Math.max(0, yearAge - currentAge);
            incomeM = inputs.incomeMain * Math.pow(1 + inputs.incomeGrowth, growthYears); // ①昇給期
        }

        // Retirement Bonus Main (定年年齢に発生)
        if (yearAge === inputs.retirementAgeMain && inputs.retirementBonusMain > 0) {
            incomeM += inputs.retirementBonusMain * inflationMultiplier;
            events.push({ age: yearAge, text: `本人退職金受取 (${Math.round(inputs.retirementBonusMain * inflationMultiplier)}万円)`, type: 'event' });
        }

        let sAge = inputs.spouseAge + i;
        let incomeS = 0;
        if (inputs.hasSpouse) {
            const peakGrowthYearsS = Math.max(0, inputs.incomeCapAgeSpouse - inputs.spouseAge);
            const peakIncomeS = inputs.incomeSpouse * Math.pow(1 + inputs.incomeGrowthSpouse, peakGrowthYearsS);

            if (sAge >= inputs.pensionStartSpouse) {
                incomeS = inputs.pensionAmountSpouse * inflationMultiplier;          // ④年金期
            } else if (sAge >= inputs.retirementAgeSpouse) {
                incomeS = inputs.shokakuIncomeSpouse;                                // ③嘱託期
            } else if (sAge >= inputs.incomeCapAgeSpouse) {
                incomeS = peakIncomeS;                                             // ②横ばい期
            } else {
                const growthYears = Math.max(0, sAge - inputs.spouseAge);
                incomeS = inputs.incomeSpouse * Math.pow(1 + inputs.incomeGrowthSpouse, growthYears); // ①昇給期
            }

            // Retirement Bonus Spouse (定年年齢に発生)
            if (sAge === inputs.retirementAgeSpouse && inputs.retirementBonusSpouse > 0) {
                incomeS += inputs.retirementBonusSpouse * inflationMultiplier;
                events.push({ age: sAge, text: `配偶者退職金受取 (${Math.round(inputs.retirementBonusSpouse * inflationMultiplier)}万円)`, type: 'event' });
            }
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
                expHousing = mortgageYearlyPayments[i] || 0;
                if (inputs.mortgageDeductionApply && i < inputs.mortgageDeductionYears) {
                    let endOfYearBal = mortgageYearlyBalances[i] || 0;
                    let deduction = Math.min(21, endOfYearBal * 0.007);
                    totalIncome += deduction;
                }
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
                const buyMortgageData = getYearlyMortgagePayments(
                    principal, inputs.buyYears, inputs.buyInterestType,
                    inputs.buyRepaymentMethod, inputs.buyRate, inputs.buyVariableRates
                );
                futureBuyYearlyPayments = buyMortgageData.payments;
                futureBuyYearlyBalances = buyMortgageData.balances;

                expHousing += futureBuyYearlyPayments[0] || 0;
                if (inputs.buyDeductionApply && 0 < 13) {
                    let endOfYearBal = futureBuyYearlyBalances[0] || 0;
                    let deduction = Math.min(21, endOfYearBal * 0.007);
                    totalIncome += deduction;
                }
            } else {
                // Post purchase
                let yearsPaid = yearAge - inputs.buyAge;
                if (yearsPaid < inputs.buyYears) {
                    expHousing = futureBuyYearlyPayments[yearsPaid] || 0;
                    if (inputs.buyDeductionApply && yearsPaid < 13) {
                        let endOfYearBal = futureBuyYearlyBalances[yearsPaid] || 0;
                        let deduction = Math.min(21, endOfYearBal * 0.007);
                        totalIncome += deduction;
                    }
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
            if (childAge >= 3 && childAge <= 23) {
                let cost = 0;
                let stageName = '';

                if (childAge >= 3 && childAge <= 5) {
                    cost = DETAILED_EDUCATION_COSTS.nursery[child.nursery] || 0;
                    stageName = '保育園/幼稚園';
                } else if (childAge >= 6 && childAge <= 11) {
                    cost = DETAILED_EDUCATION_COSTS.elementary[child.elementary] || 0;
                    stageName = '小学校';
                } else if (childAge >= 12 && childAge <= 14) {
                    cost = DETAILED_EDUCATION_COSTS.junior_high[child.junior] || 0;
                    stageName = '中学校';
                } else if (childAge >= 15 && childAge <= 17) {
                    cost = DETAILED_EDUCATION_COSTS.high_school[child.high] || 0;
                    stageName = '高校';
                } else if (childAge >= 18 && childAge <= 21) {
                    cost = DETAILED_EDUCATION_COSTS.university[child.univ] || 0;
                    stageName = '大学等';
                } else if (childAge >= 22 && childAge <= 23) {
                    cost = DETAILED_EDUCATION_COSTS.grad_school[child.grad] || 0;
                    stageName = '大学院';
                }

                let adjustedCost = cost * inflationMultiplier;
                expEdu += adjustedCost;

                // Events
                if (childAge === 6 && i > 0) events.push({ age: yearAge, text: `第${index + 1}子 小学校入学`, type: 'edu' });
                if (childAge === 12 && i > 0) events.push({ age: yearAge, text: `第${index + 1}子 中学校入学`, type: 'edu' });
                if (childAge === 15 && i > 0) events.push({ age: yearAge, text: `第${index + 1}子 高校入学`, type: 'edu' });
                if (childAge === 18 && i > 0) events.push({ age: yearAge, text: `第${index + 1}子 大学等入学`, type: 'edu' });
                if (childAge === 22 && i > 0 && child.grad !== 'none') events.push({ age: yearAge, text: `第${index + 1}子 大学院入学`, type: 'edu' });
            }
        });
        totalEdu += expEdu;

        // 4. Events / Others Placeholder
        let expOther = 0;

        // Custom Events
        inputs.customEvents.forEach(evt => {
            if (evt.age === yearAge) {
                let adjustedCost = evt.cost * inflationMultiplier;
                expOther += adjustedCost;
                events.push({ age: yearAge, text: `${evt.name} (${Math.round(adjustedCost)}万円)`, type: 'other' });
            }
        });

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

                    investmentMain = Math.max(0, investmentMain - drawMain);
                    investmentSpouse = Math.max(0, investmentSpouse - drawSpouse);
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
            expLiving: expLiving,
            expHousing: expHousing,
            expEdu: expEdu,
            expOther: expOther,
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
    const uniqueEvents = limitEvents.filter((v, i, a) => a.findIndex(t => (t.age === v.age && t.text === v.text)) === i).sort((a, b) => a.age - b.age);

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
                    backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue-500
                    yAxisID: 'y1',
                    stack: 'incomeGroup'
                },
                {
                    label: '生活費',
                    type: 'bar',
                    data: data.map(d => d.expLiving),
                    backgroundColor: 'rgba(148, 163, 184, 0.8)', // slate-400
                    yAxisID: 'y1',
                    stack: 'expenseGroup'
                },
                {
                    label: '住宅費',
                    type: 'bar',
                    data: data.map(d => d.expHousing),
                    backgroundColor: 'rgba(245, 158, 11, 0.8)', // amber-500
                    yAxisID: 'y1',
                    stack: 'expenseGroup'
                },
                {
                    label: '教育費',
                    type: 'bar',
                    data: data.map(d => d.expEdu),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)', // emerald-500
                    yAxisID: 'y1',
                    stack: 'expenseGroup'
                },
                {
                    label: 'その他支出',
                    type: 'bar',
                    data: data.map(d => d.expOther),
                    backgroundColor: 'rgba(139, 92, 246, 0.8)', // violet-500
                    yAxisID: 'y1',
                    stack: 'expenseGroup'
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
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
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
                    stacked: true, // required for bar stacking on this axis
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
            if (data.incomeCapAgeMain) document.getElementById('income-cap-age-main').value = data.incomeCapAgeMain;
            if (data.pensionStartMain) document.getElementById('pension-start-main').value = data.pensionStartMain;
            if (data.retirementAgeMain !== undefined) document.getElementById('retirement-age-main').value = data.retirementAgeMain;
            if (data.shokakuIncomeMain !== undefined) document.getElementById('shokaku-income-main').value = data.shokakuIncomeMain;
            if (data.retirementAgeSpouse !== undefined) document.getElementById('retirement-age-spouse').value = data.retirementAgeSpouse;
            if (data.shokakuIncomeSpouse !== undefined) document.getElementById('shokaku-income-spouse').value = data.shokakuIncomeSpouse;
            if (data.pensionAmountMain) document.getElementById('pension-amount-main').value = data.pensionAmountMain;
            if (data.retirementBonusMain !== undefined && document.getElementById('retirement-bonus-main')) document.getElementById('retirement-bonus-main').value = data.retirementBonusMain;

            document.getElementById('current-savings').value = data.savings;

            // Detailed living (re-populate and re-sum)
            if (data.detailedLiving) {
                const keys = Object.keys(data.detailedLiving);
                keys.forEach(k => {
                    const el = document.getElementById(`living-${k === 'extraEdu' ? 'extra-edu' : k}`);
                    if (el) el.value = data.detailedLiving[k];
                });
                // Manually trigger sum update logic (wait for DOM ready which is already true here in loadData but just in case, call the function if it was global, or dispatch event)
                const firstLivingItem = document.querySelector('.living-item');
                if (firstLivingItem) firstLivingItem.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Individual investments
            if (data.monthlyInvestMain !== undefined) document.getElementById('monthly-invest-main').value = data.monthlyInvestMain;
            if (data.yieldMain !== undefined) document.getElementById('investment-yield-main').value = data.yieldMain * 100;

            // Housing & Mortgage
            if (data.housingType) {
                document.getElementById('housing-type').value = data.housingType;
                toggleHousingType(); // ensure correct sections show
            }

            if (data.mortgageBal !== undefined) document.getElementById('mortgage-balance').value = data.mortgageBal;
            if (data.mortgageYears !== undefined) document.getElementById('mortgage-years').value = data.mortgageYears;
            if (data.mortgageRate !== undefined) document.getElementById('mortgage-rate').value = data.mortgageRate * 100;
            if (data.mortgageInterestType) document.getElementById('mortgage-interest-type').value = data.mortgageInterestType;
            if (data.mortgageRepaymentMethod) document.getElementById('mortgage-repayment-method').value = data.mortgageRepaymentMethod;

            if (data.mortgageDeductionApply !== undefined && document.getElementById('mortgage-deduction-apply')) {
                document.getElementById('mortgage-deduction-apply').checked = data.mortgageDeductionApply;
                document.getElementById('mortgage-deduction-years-wrapper').classList.toggle('opacity-50', !data.mortgageDeductionApply);
            }
            if (data.mortgageDeductionYears !== undefined && document.getElementById('mortgage-deduction-years')) document.getElementById('mortgage-deduction-years').value = data.mortgageDeductionYears;

            if (data.mortgageVariableRates && Array.isArray(data.mortgageVariableRates)) {
                const evContainer = document.getElementById('mortgage-variable-events-container');
                evContainer.innerHTML = '';
                data.mortgageVariableRates.forEach(evt => {
                    addVariableRateEvent('mortgage');
                    const lastEvt = evContainer.lastElementChild;
                    lastEvt.querySelector('.rate-years').value = evt.years || 0;
                    lastEvt.querySelector('.rate-value').value = (evt.rate * 100).toFixed(1) || 0;
                });
            }
            toggleMortgageUI();

            // Buy Future
            if (data.buyAge !== undefined) document.getElementById('buy-age').value = data.buyAge;
            if (data.buyPrice !== undefined) document.getElementById('buy-price').value = data.buyPrice;
            if (data.buyDown !== undefined) document.getElementById('buy-downpayment').value = data.buyDown;
            if (data.buyCurrentRent !== undefined) document.getElementById('buy-current-rent').value = data.buyCurrentRent / 12;
            if (data.buyYears !== undefined) document.getElementById('buy-years').value = data.buyYears;
            if (data.buyRate !== undefined) document.getElementById('buy-rate').value = data.buyRate * 100;
            if (data.buyInterestType) document.getElementById('buy-interest-type').value = data.buyInterestType;
            if (data.buyRepaymentMethod) document.getElementById('buy-repayment-method').value = data.buyRepaymentMethod;
            if (data.buyDeductionApply !== undefined && document.getElementById('buy-deduction-apply')) document.getElementById('buy-deduction-apply').checked = data.buyDeductionApply;

            if (data.buyVariableRates && Array.isArray(data.buyVariableRates)) {
                const evContainer = document.getElementById('buy-variable-events-container');
                evContainer.innerHTML = '';
                data.buyVariableRates.forEach(evt => {
                    addVariableRateEvent('buy');
                    const lastEvt = evContainer.lastElementChild;
                    lastEvt.querySelector('.rate-years').value = evt.years || 0;
                    lastEvt.querySelector('.rate-value').value = (evt.rate * 100).toFixed(1) || 0;
                });
            }
            toggleBuyUI();

            if (data.children && Array.isArray(data.children)) {
                const container = document.getElementById('children-container');
                container.innerHTML = ''; // clear default
                data.children.forEach(child => {
                    addChild(); // Will append a new child DOM element using the updated template
                    const lastChild = container.lastElementChild;

                    lastChild.querySelector('.child-age').value = child.age || 0;
                    if (child.course && !child.nursery) {
                        // Migration from old basic course to new detailed course (simple map)
                        const legacyMap = {
                            'public_all': { n: 'public', e: 'public', j: 'public', h: 'public', u: 'national' },
                            'private_univ': { n: 'public', e: 'public', j: 'public', h: 'public', u: 'private_humanities' },
                            'private_high_univ': { n: 'public', e: 'public', j: 'public', h: 'private', u: 'private_humanities' },
                            'private_all': { n: 'private', e: 'private', j: 'private', h: 'private', u: 'private_humanities' }
                        };
                        const map = legacyMap[child.course] || legacyMap['public_all'];
                        lastChild.querySelector('.child-nursery').value = map.n;
                        lastChild.querySelector('.child-elementary').value = map.e;
                        lastChild.querySelector('.child-junior').value = map.j;
                        lastChild.querySelector('.child-high').value = map.h;
                        lastChild.querySelector('.child-univ').value = map.u;
                    } else {
                        if (child.nursery) lastChild.querySelector('.child-nursery').value = child.nursery;
                        if (child.elementary) lastChild.querySelector('.child-elementary').value = child.elementary;
                        if (child.junior) lastChild.querySelector('.child-junior').value = child.junior;
                        if (child.high) lastChild.querySelector('.child-high').value = child.high;
                        if (child.univ) lastChild.querySelector('.child-univ').value = child.univ;
                        if (child.grad) lastChild.querySelector('.child-grad').value = child.grad;
                    }
                });
            }

            if (data.customEvents && Array.isArray(data.customEvents)) {
                const evContainer = document.getElementById('custom-events-container');
                evContainer.innerHTML = '';
                data.customEvents.forEach(evt => {
                    addCustomEvent();
                    const lastEvt = evContainer.lastElementChild;
                    lastEvt.querySelector('.event-age').value = evt.age || 0;
                    lastEvt.querySelector('.event-cost').value = evt.cost || 0;
                    lastEvt.querySelector('.event-name').value = evt.name || '';
                });
            }

            if (data.hasSpouse) {
                document.getElementById('has-spouse').checked = true;
                toggleSpouseInputs();
                document.getElementById('spouse-age').value = data.spouseAge || 30;
                document.getElementById('income-spouse').value = data.incomeSpouse || 0;
                if (data.incomeGrowthSpouse !== undefined) document.getElementById('income-growth-spouse').value = data.incomeGrowthSpouse * 100;
                if (data.incomeCapAgeSpouse) document.getElementById('income-cap-age-spouse').value = data.incomeCapAgeSpouse;
                if (data.pensionStartSpouse) document.getElementById('pension-start-spouse').value = data.pensionStartSpouse;
                if (data.pensionAmountSpouse) document.getElementById('pension-amount-spouse').value = data.pensionAmountSpouse;
                if (data.retirementBonusSpouse !== undefined && document.getElementById('retirement-bonus-spouse')) document.getElementById('retirement-bonus-spouse').value = data.retirementBonusSpouse;
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
