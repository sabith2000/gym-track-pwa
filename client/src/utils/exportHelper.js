import { ATTENDANCE_STATUS } from './constants';
import { getRecords, getStatusMap } from './syncManager';
import { calculateStats, calculateStreak, calculateBestStreak, calculateAdvancedStats } from './dateHelpers';

const FILE_NAME_PREFIX = "GymTrack_Report";

export const generateExcelReport = async () => {
  try {
    // 1. Fetch fresh data right now (no stale UI state)
    const rawRecords = await getRecords();
    const history = getStatusMap(rawRecords);
    
    // 2. Generate stats dynamically
    const { total } = calculateStats(history);
    const streak = calculateStreak(history);
    const bestStreak = calculateBestStreak(history);
    const advanced = calculateAdvancedStats(history);

    if (Object.keys(history).length === 0 || !advanced) {
      throw new Error("NoHistory");
    }

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
    titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FF0F172A' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    summarySheet.mergeCells('B3:E3');
    const subtitleCell = summarySheet.getCell('B3');
    subtitleCell.value = `Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)`;
    subtitleCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF64748B' } };
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // 2. Core Metrics Table
    summarySheet.getCell('B5').value = 'Core Metrics';
    summarySheet.getCell('B5').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1E293B' } };
    
    const statsData = [
      ['Metric', 'Value'],
      ['Total Days Tracked', total.present + total.absent],
      ['Total Attendance', `${total.percentage}%`],
      ['Days Present', total.present],
      ['Days Absent', total.absent],
      ['Current Streak', `${streak} Days`],
      ['Best Streak', `${bestStreak} Days`],
    ];

    statsData.forEach((row, index) => {
      const rowIndex = 6 + index;
      const labelCell = summarySheet.getCell(`B${rowIndex}`);
      const valueCell = summarySheet.getCell(`C${rowIndex}`);
      
      labelCell.value = row[0];
      valueCell.value = row[1];
      summarySheet.getRow(rowIndex).height = 22;
      
      labelCell.alignment = { vertical: 'middle' };
      valueCell.alignment = { horizontal: 'right', vertical: 'middle' };
      
      if (index === 0) { // Header Row
        labelCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        valueCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } }; // Deep Navy
        valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
      } else {
        labelCell.font = { name: 'Arial', size: 11, color: { argb: 'FF334155' } };
        valueCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF0F172A' } };
        if (index % 2 === 0) {
           labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }; // Light Slate
           valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
      }
      labelCell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, left: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      valueCell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, right: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
    });

    // 3. Advanced Analytics Table
    summarySheet.getCell('E5').value = 'Advanced Analytics';
    summarySheet.getCell('E5').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1E293B' } };

    const advData = [
      ['Insight', 'Value'],
      ['Most Active Day', `${advanced.mostActiveDay.name} (${advanced.mostActiveDay.percentage}%)`],
      ['Least Active Day', `${advanced.leastActiveDay.name} (${advanced.leastActiveDay.percentage}%)`],
      ['Most Consistent Month', `${advanced.mostConsistentMonth.label} (${advanced.mostConsistentMonth.percentage}%)`],
      ['Longest Rest Period', `${advanced.longestRest} Days`],
    ];

    advData.forEach((row, index) => {
      const rowIndex = 6 + index;
      const labelCell = summarySheet.getCell(`E${rowIndex}`);
      const valueCell = summarySheet.getCell(`F${rowIndex}`);
      
      labelCell.value = row[0];
      valueCell.value = row[1];
      summarySheet.getRow(rowIndex).height = 22;

      labelCell.alignment = { vertical: 'middle' };
      valueCell.alignment = { horizontal: 'right', vertical: 'middle' };
      
      if (index === 0) { // Header
         labelCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
         valueCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
         labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } }; 
         valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
      } else {
         labelCell.font = { name: 'Arial', size: 11, color: { argb: 'FF334155' } };
         valueCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF0F172A' } };
         if (index % 2 === 0) {
            labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
            valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
         }
      }
      labelCell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, left: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      valueCell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, right: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
    });

    // 4. Monthly Trends Table
    const trendsStartRow = Math.max(statsData.length, advData.length) + 8;
    summarySheet.getCell(`B${trendsStartRow}`).value = 'Monthly Trends';
    summarySheet.getCell(`B${trendsStartRow}`).font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1E293B' } };

    const trendsHeader = ['Month', 'Days Logged', 'Present', 'Absent', 'Consistency %'];
    const trendsRowHeader = trendsStartRow + 1;
    
    trendsHeader.forEach((col, i) => {
      const cell = summarySheet.getCell(trendsRowHeader, 2 + i); // Column B is 2
      cell.value = col;
      cell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }; // Royal Blue
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, top: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
    });
    summarySheet.getRow(trendsRowHeader).height = 25;

    advanced.monthlyTrends.forEach((month, index) => {
      const r = trendsRowHeader + 1 + index;
      summarySheet.getRow(r).height = 22;
      
      const c1 = summarySheet.getCell(r, 2); // Month
      const c2 = summarySheet.getCell(r, 3); // Logged
      const c3 = summarySheet.getCell(r, 4); // Present
      const c4 = summarySheet.getCell(r, 5); // Absent
      const c5 = summarySheet.getCell(r, 6); // Consistency
      
      c1.value = month.label;
      c2.value = month.total;
      c3.value = month.present;
      c4.value = month.absent;
      c5.value = `${month.percentage}%`;

      [c1, c2, c3, c4, c5].forEach(cell => {
         cell.font = { name: 'Arial', size: 11, color: { argb: 'FF334155' } };
         cell.alignment = { horizontal: 'center', vertical: 'middle' };
         cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, left: { style: 'thin', color: { argb: 'FFE2E8F0' } }, right: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
         if (index % 2 !== 0) { // odd index data rows -> zebra
           cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
         }
      });
      c5.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };
    });

    // Set Column Widths for Summary
    summarySheet.getColumn('B').width = 22;
    summarySheet.getColumn('C').width = 15;
    summarySheet.getColumn('D').width = 15; // Spacing for upper, data for lower
    summarySheet.getColumn('E').width = 25;
    summarySheet.getColumn('F').width = 20;

    // ==========================================
    // SHEET 2: DETAILED LOG
    // ==========================================
    const logSheet = workbook.addWorksheet('Daily Log');

    // Define Columns with Professional Widths
    logSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Day', key: 'day', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Month', key: 'month', width: 12 },
      { header: 'Year', key: 'year', width: 10 },
    ];

    // Add AutoFilter & Freeze Top Header Row
    logSheet.autoFilter = 'A1:E1';
    logSheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Style Header Row
    const headerRow = logSheet.getRow(1);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // Slate 900
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Sort & Add Data
    const sortedDates = Object.keys(history).sort().reverse();

    sortedDates.forEach((dateStr) => {
      const status = history[dateStr];
      const dateObj = new Date(dateStr);
      
      const row = logSheet.addRow({
        date: dateObj, 
        day: dateObj.toLocaleDateString('default', { weekday: 'long' }),
        status: status,
        month: dateObj.toLocaleDateString('default', { month: 'long' }),
        year: dateObj.getFullYear()
      });

      // Status Coloring
      const statusCell = row.getCell('status');
      statusCell.font = { bold: true };
      statusCell.alignment = { horizontal: 'center' };
      
      // UPDATED: Use Constant here
      if (status === ATTENDANCE_STATUS.PRESENT) {
        statusCell.font.color = { argb: 'FF15803D' }; // Green text
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; // Light Green bg
      } else {
        statusCell.font.color = { argb: 'FFBE123C' }; // Red text
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE4E6' } }; // Light Red bg
      }

      // Date Formatting
      row.getCell('date').numFmt = 'dd/mm/yyyy';
      row.getCell('date').alignment = { horizontal: 'left', vertical: 'middle' }; // Left align dates
      row.getCell('day').alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell('month').alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell('year').alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Add borders to the entire data set
    const lastRow = logSheet.rowCount;
    for (let i = 1; i <= lastRow; i++) {
        const row = logSheet.getRow(i);
        row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
        });
    }

    // 7. Generate & Save (with IST Timestamp filename)
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Format: GymTrack_Report_YYYY-MM-DD_HH-MM-SS.xlsx (in IST)
    const now = new Date();
    const options = { 
      timeZone: 'Asia/Kolkata', 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit', second: '2-digit', 
      hourCycle: 'h23' 
    };
    // Result format: "dd/mm/yyyy, HH:MM:SS" -> "yyyy-mm-dd_HH-MM-SS"
    const istString = new Intl.DateTimeFormat('en-IN', options).format(now);
    const [datePart, timePart] = istString.split(', ');
    const [d, m, y] = datePart.split('/');
    const timeSafe = timePart.replace(/:/g, '-');
    const fileName = `${FILE_NAME_PREFIX}_${y}-${m}-${d}_${timeSafe}.xlsx`;
    
    saveAs(new Blob([buffer]), fileName);
    
    return true;

  } catch (error) {
    console.error("Export Failed:", error);
    throw error;
  }
};