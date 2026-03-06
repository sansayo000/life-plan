// Export functionality for PDF and Excel

document.addEventListener('DOMContentLoaded', () => {

    // setup PDF export
    document.getElementById('btn-export-pdf').addEventListener('click', async () => {
        const btn = document.getElementById('btn-export-pdf');
        const originalText = btn.innerHTML;

        try {
            // UI Feedback
            btn.innerHTML = '<span class="btn-loading text-transparent relative w-full h-full flex items-center justify-center">L</span> 出力中...';
            btn.classList.add('opacity-75', 'cursor-wait');

            // Add mode class for styling adjustments (e.g., removing shadows for better print rendering)
            const mainContent = document.querySelector('main');
            mainContent.classList.add('pdf-mode');

            // Allow layout to settle
            await new Promise(r => setTimeout(r, 100));

            // Capture the entire main tag area
            const canvas = await html2canvas(mainContent, {
                scale: 2, // Higher quality
                useCORS: true,
                logging: false,
                windowWidth: mainContent.scrollWidth,
                windowHeight: mainContent.scrollHeight
            });

            // Revert UI changes
            mainContent.classList.remove('pdf-mode');

            // Setup jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, Millimeters, A4

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            // Logic to handle multi-page if image height exceeds A4 height
            let heightLeft = pdfHeight;
            let position = 0;
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('lifeplan_simulation.pdf');

        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('PDFの出力に失敗しました。');
        } finally {
            // Restore button state
            btn.innerHTML = originalText;
            btn.classList.remove('opacity-75', 'cursor-wait');
        }
    });

    // setup Excel export
    document.getElementById('btn-export-excel').addEventListener('click', () => {
        // simData is globally available from app.js
        if (!window.simData || window.simData.length === 0) {
            alert('シミュレーションを実行してから出力してください。');
            return;
        }

        // Format data for sheet
        const sheetData = window.simData.map(row => ({
            '年齢 (歳)': row.age,
            '年間収入 (万円)': Math.round(row.income),
            '年間支出 (万円)': Math.round(row.expense),
            '年間収支 (万円)': Math.round(row.balance),
            '貯蓄残高 (万円)': Math.round(row.savings),
            '投資残高 (万円)': Math.round(row.investment),
            '純資産合計 (万円)': Math.round(row.netWorth)
        }));

        // create workbook
        const wb = XLSX.utils.book_new();
        // create worksheet
        const ws = XLSX.utils.json_to_sheet(sheetData);

        // Adjust column widths roughly
        const wscols = [
            { wch: 10 }, // 年齢
            { wch: 15 }, // 収入
            { wch: 15 }, // 支出
            { wch: 15 }, // 収支
            { wch: 15 }, // 貯蓄
            { wch: 15 }, // 投資
            { wch: 20 }  // 純資産
        ];
        ws['!cols'] = wscols;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "シミュレーション結果");

        // Write and download
        XLSX.writeFile(wb, "lifeplan_data.xlsx");
    });
});
