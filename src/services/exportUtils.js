/**
 * Utility to generate and download CSV reports
 */

export function downloadCSV(csvContent, fileName) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportRecordsToCSV(records, reportTitle = 'CampusFlow_Attendance_Report') {
  const headers = [
    'Record ID',
    'Date',
    'Register Number',
    'Student Name',
    'Department',
    'Year',
    'Entry Time',
    'Exit Time',
    'Entry Source',
    'Exit Source',
    'Status'
  ];

  const rows = records.map(r => [
    r.id,
    r.date,
    r.regNo,
    `"${r.studentName.replace(/"/g, '""')}"`,
    r.department,
    r.year,
    r.entryTime || 'N/A',
    r.exitTime || 'N/A',
    r.entrySource || 'N/A',
    r.exitSource || 'N/A',
    r.statusLabel || (r.classification ? r.classification.label : 'Active')
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `${reportTitle}_${timestamp}.csv`);
}

export function exportPunctualityReportToCSV(leaderboardData, reportTitle = 'CampusFlow_Punctuality_Summary') {
  const headers = [
    'Rank',
    'Register Number',
    'Student Name',
    'Department',
    'Year',
    'Total Recorded Days',
    'On-Time Days',
    'Late Arrivals',
    'Very Late Arrivals',
    'Early Exits',
    'Missing Exits',
    'Punctuality Score (%)'
  ];

  const rows = leaderboardData.map((item, index) => [
    index + 1,
    item.student.regNo,
    `"${item.student.name.replace(/"/g, '""')}"`,
    item.student.department,
    item.student.year,
    item.totalRecordedDays,
    item.onTimeDays,
    item.lateDays,
    item.veryLateDays,
    item.earlyExits,
    item.missingExits,
    `${item.punctualityScore}%`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `${reportTitle}_${timestamp}.csv`);
}
