const FILE_NAME_PREFIX = "GymTrack_Report";

export const generateExcelReport = async (history, stats) => {
  try {
    const ExcelJS = await import('exceljs');
    const { saveAs } = await import('file-saver');

    const workbook = new ExcelJS.default.Workbook();
    workbook.creator = 'GymTrack App';
    workbook.created = new Date();

    // ==========================================
    // SHEET 1: DASHBOARD (Summary)
    // ==========================================
    const summarySheet = workbook.addWorksheet('Dashboard');

    // 1. Title
    summarySheet.mergeCells('B2:E2');
    const titleCell = summarySheet.getCell('B2');
    titleCell.value = 'GymTrack Performance Report';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF1E293B' } };
    titleCell.alignment = { horizontal: 'center' };

    // 2. Key Stats Table
    summarySheet.getCell('B4').value = 'Key Metrics';
    summarySheet.getCell('B4').font = { bold: true };

    const statsData = [
      ['Metric', 'Value'],
      ['Current Streak', `${stats.streak} Days`],
      ['Best Streak', `${stats.bestStreak} Days`],
      ['Total Attendance', `${stats.total.percentage}%`],
      ['Days Present', stats.total.present],
      ['Days Absent', stats.total.absent],
    ];

    // Add Stats Table
    statsData.forEach((row, index) => {
      const rowIndex = 5 + index;
      const labelCell = summarySheet.getCell(`B${rowIndex}`);
      const valueCell = summarySheet.getCell(`C${rowIndex}`);
      
      labelCell.value = row[0];
      valueCell.value = row[1];

      // Styling
      labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }; // Light Gray
      labelCell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      valueCell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      valueCell.alignment = { horizontal: 'right' };
      
      if (index === 0) { // Header Row
        labelCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } }; // Blue
        valueCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
      }
    });

    // Set Column Widths for Summary
    summarySheet.getColumn('B').width = 20;
    summarySheet.getColumn('C').width = 15;

    // ==========================================
    // SHEET 2: DETAILED LOG
    // ==========================================
    const logSheet = workbook.addWorksheet('Daily Log');

    // Define Columns with Professional Widths
    logSheet.columns = [
      { header: 'Date', key: 'date', width: 18 },
      { header: 'Day', key: 'day', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Month', key: 'month', width: 12 },
      { header: 'Year', key: 'year', width: 10 },
    ];

    // Style Header Row
    const headerRow = logSheet.getRow(1);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }; // Slate 800
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Sort & Add Data
    const sortedDates = Object.keys(history).sort().reverse();

    sortedDates.forEach((dateStr) => {
      const status = history[dateStr];
      const dateObj = new Date(dateStr);
      
      const row = logSheet.addRow({
        date: dateObj, // Passing Date Object for Excel filtering
        day: dateObj.toLocaleDateString('default', { weekday: 'long' }),
        status: status,
        month: dateObj.toLocaleDateString('default', { month: 'long' }),
        year: dateObj.getFullYear()
      });

      // Status Coloring
      const statusCell = row.getCell('status');
      statusCell.font = { bold: true };
      statusCell.alignment = { horizontal: 'center' };
      
      if (status === 'PRESENT') {
        statusCell.font.color = { argb: 'FF15803D' }; // Green text
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; // Light Green bg
      } else {
        statusCell.font.color = { argb: 'FFBE123C' }; // Red text
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE4E6' } }; // Light Red bg
      }

      // Date Formatting
      row.getCell('date').numFmt = 'dd/mm/yyyy';
      row.getCell('date').alignment = { horizontal: 'center' };
    });

    // Add borders to the entire data set
    const lastRow = logSheet.rowCount;
    for (let i = 1; i <= lastRow; i++) {
        const row = logSheet.getRow(i);
        row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
            };
        });
    }

    // 7. Generate & Save
    const buffer = await workbook.xlsx.writeBuffer();
    const today = new Date().toISOString().split('T')[0];
    saveAs(new Blob([buffer]), `${FILE_NAME_PREFIX}_${today}.xlsx`);
    
    return true;

  } catch (error) {
    console.error("Export Failed:", error);
    throw error;
  }
};