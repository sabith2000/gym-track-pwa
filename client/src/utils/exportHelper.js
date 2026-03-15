import { ATTENDANCE_STATUS } from './constants';
import { getRecords, getStatusMap } from './syncManager';
import { calculateStats, calculateStreak, calculateBestStreak } from './dateHelpers';

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

    if (Object.keys(history).length === 0) {
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

    // 2. Key Stats Table
    summarySheet.getCell('B5').value = 'Key Metrics';
    summarySheet.getCell('B5').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1E293B' } };
    
    const statsData = [
      ['Metric', 'Value'],
      ['Current Streak', `${streak} Days`],
      ['Best Streak', `${bestStreak} Days`],
      ['Total Attendance', `${total.percentage}%`],
      ['Days Present', total.present],
      ['Days Absent', total.absent],
    ];

    // Add Stats Table
    statsData.forEach((row, index) => {
      const rowIndex = 6 + index;
      const labelCell = summarySheet.getCell(`B${rowIndex}`);
      const valueCell = summarySheet.getCell(`C${rowIndex}`);
      
      labelCell.value = row[0];
      valueCell.value = row[1];

      // Row Height
      summarySheet.getRow(rowIndex).height = 22;

      // Styling
      labelCell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      valueCell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      
      labelCell.alignment = { vertical: 'middle' };
      labelCell.font = { name: 'Arial', size: 11, color: { argb: 'FF334155' } };
      
      valueCell.alignment = { horizontal: 'right', vertical: 'middle' };
      valueCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF0F172A' } };
      
      if (index === 0) { // Header Row
        labelCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }; // Royal Blue
        valueCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
        labelCell.border = {}; // Clear bottom border on header 
        valueCell.border = {};
      } else {
        labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }; // Light Slate
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