import { timeToMinutes, minutesToTime, classifyRecord } from './classificationEngine';

const TODAY_DATE = '2026-10-05';

/**
 * Filter records by date range, department, and year
 */
export function filterRecords(records, { dateFilter = 'this_month', department = 'ALL', year = 'ALL', customStart = null, customEnd = null } = {}) {
  return records.filter(rec => {
    // Department filter
    if (department !== 'ALL' && rec.department !== department) return false;
    // Year filter
    if (year !== 'ALL' && rec.year !== year) return false;

    // Date filter
    if (dateFilter === 'today') {
      return rec.date === TODAY_DATE;
    } else if (dateFilter === 'this_week') {
      // Last 5 working days: 2026-09-29 to 2026-10-05
      return rec.date >= '2026-09-29' && rec.date <= TODAY_DATE;
    } else if (dateFilter === '7_days') {
      return rec.date >= '2026-09-25' && rec.date <= TODAY_DATE;
    } else if (dateFilter === 'this_month') {
      return rec.date >= '2026-09-01' && rec.date <= TODAY_DATE;
    } else if (dateFilter === 'semester') {
      return true; // All records in semester
    } else if (dateFilter === 'custom' && customStart && customEnd) {
      return rec.date >= customStart && rec.date <= customEnd;
    }
    return true;
  });
}

/**
 * Computes primary KPI metrics for the Admin Dashboard
 */
export function calculateTodayKPIs(allStudents, allRecords, rules, currentTimeStr = '17:15') {
  const totalDayScholars = allStudents.length;
  const expectedToday = totalDayScholars;

  const todayRecords = allRecords.filter(r => r.date === TODAY_DATE);
  const enteredToday = todayRecords.filter(r => Boolean(r.entryTime)).length;
  const notYetEntered = Math.max(0, expectedToday - enteredToday);

  let onTimeCount = 0;
  let lateArrivals = 0;
  let veryLateArrivals = 0;
  let earlyExits = 0;
  let missingExits = 0;
  let normalExits = 0;

  todayRecords.forEach(rec => {
    const classification = classifyRecord(rec, rules, true, currentTimeStr);
    if (classification.entryClass.status === 'On Time') onTimeCount++;
    if (classification.entryClass.status === 'Late') lateArrivals++;
    if (classification.entryClass.status === 'Very Late') veryLateArrivals++;

    if (classification.exitClass.status === 'Early Exit') earlyExits++;
    if (classification.exitClass.status === 'Missing Exit') missingExits++;
    if (classification.exitClass.status === 'Exit Recorded') normalExits++;
  });

  const totalLate = lateArrivals + veryLateArrivals;
  const punctualityPercent = enteredToday > 0 
    ? Math.round((onTimeCount / enteredToday) * 100) 
    : 0;

  return {
    totalDayScholars,
    expectedToday,
    enteredToday,
    notYetEntered,
    onTimeCount,
    lateArrivals,
    veryLateArrivals,
    totalLate,
    earlyExits,
    missingExits,
    normalExits,
    punctualityPercent,
    currentTimeStr
  };
}

/**
 * Computes Arrival Distribution for Today (or specified records)
 */
export function calculateArrivalDistribution(records, rules) {
  const bins = [
    { label: 'Before 08:00 AM', slot: '< 08:00', startMin: 0, endMin: 480, count: 0, isLate: false, color: '#0ea5e9' },
    { label: '08:00 - 08:15 AM', slot: '08:00 - 08:15', startMin: 480, endMin: 495, count: 0, isLate: false, color: '#10b981' },
    { label: '08:15 - 08:30 AM', slot: '08:15 - 08:30', startMin: 495, endMin: 510, count: 0, isLate: false, color: '#059669', isPeakCandidate: true },
    { label: '08:30 - 08:45 AM', slot: '08:30 - 08:45', startMin: 510, endMin: 525, count: 0, isLate: true, color: '#f59e0b' },
    { label: '08:45 - 09:00 AM', slot: '08:45 - 09:00', startMin: 525, endMin: 540, count: 0, isLate: true, color: '#d97706' },
    { label: 'After 09:00 AM', slot: '> 09:00', startMin: 540, endMin: 1440, count: 0, isLate: true, color: '#ef4444' }
  ];

  let totalEntryMinutes = 0;
  let validCount = 0;
  let earliestMin = Infinity;
  let latestMin = -Infinity;

  records.forEach(rec => {
    if (!rec.entryTime) return;
    const min = timeToMinutes(rec.entryTime);
    if (min == null) return;

    validCount++;
    totalEntryMinutes += min;
    if (min < earliestMin) earliestMin = min;
    if (min > latestMin) latestMin = min;

    for (let b of bins) {
      if (min >= b.startMin && min < b.endMin) {
        b.count++;
        break;
      }
    }
  });

  // Find peak bin
  let peakBin = bins[0];
  bins.forEach(b => {
    if (b.count > peakBin.count) peakBin = b;
  });

  const avgMin = validCount > 0 ? Math.round(totalEntryMinutes / validCount) : null;

  return {
    bins: bins.map(b => ({
      ...b,
      percentage: validCount > 0 ? Math.round((b.count / validCount) * 100) : 0
    })),
    totalCount: validCount,
    avgArrival: avgMin != null ? minutesToTime(avgMin) : '--:--',
    earliestArrival: earliestMin !== Infinity ? minutesToTime(earliestMin) : '--:--',
    latestArrival: latestMin !== -Infinity ? minutesToTime(latestMin) : '--:--',
    peakArrivalPeriod: peakBin.count > 0 ? `${peakBin.slot} (${peakBin.count} students)` : 'N/A',
    peakBin
  };
}

/**
 * Late Arrival Leaderboard & Punctuality Rankings
 */
export function calculatePunctualityLeaderboards(allStudents, filteredRecords, rules) {
  const studentMap = {};

  allStudents.forEach(s => {
    studentMap[s.id] = {
      student: s,
      totalRecordedDays: 0,
      onTimeDays: 0,
      lateDays: 0,
      veryLateDays: 0,
      earlyExits: 0,
      missingExits: 0,
      lastRecordedDate: null,
      lastEntryTime: null,
      lastStatus: null,
      history: []
    };
  });

  filteredRecords.forEach(rec => {
    const entry = studentMap[rec.studentId];
    if (!entry) return;

    entry.totalRecordedDays++;
    entry.history.push(rec);

    const isToday = rec.date === TODAY_DATE;
    const classification = classifyRecord(rec, rules, isToday);

    if (classification.entryClass.status === 'On Time') entry.onTimeDays++;
    if (classification.entryClass.status === 'Late') entry.lateDays++;
    if (classification.entryClass.status === 'Very Late') entry.veryLateDays++;
    if (classification.exitClass.status === 'Early Exit') entry.earlyExits++;
    if (classification.exitClass.status === 'Missing Exit') entry.missingExits++;

    if (!entry.lastRecordedDate || rec.date > entry.lastRecordedDate) {
      entry.lastRecordedDate = rec.date;
      entry.lastEntryTime = rec.entryTime;
      entry.lastStatus = classification.label;
    }
  });

  const studentList = Object.values(studentMap)
    .filter(item => item.totalRecordedDays > 0)
    .map(item => {
      const totalLate = item.lateDays + item.veryLateDays;
      const punctualityScore = item.totalRecordedDays > 0 
        ? Math.round((item.onTimeDays / item.totalRecordedDays) * 100) 
        : 100;

      return {
        ...item,
        totalLate,
        punctualityScore
      };
    });

  // Late Arrival Leaderboard: highest late arrivals first
  const lateLeaderboard = [...studentList]
    .sort((a, b) => b.totalLate - a.totalLate || a.punctualityScore - b.punctualityScore);

  // Honor Roll: highest punctuality first
  const honorRoll = [...studentList]
    .sort((a, b) => b.punctualityScore - a.punctualityScore || b.onTimeDays - a.onTimeDays);

  return {
    lateLeaderboard,
    honorRoll,
    totalAssessed: studentList.length
  };
}

/**
 * Department Comparison Analytics
 */
export function calculateDepartmentAnalytics(allStudents, filteredRecords, rules) {
  const deptMap = {};

  allStudents.forEach(s => {
    if (!deptMap[s.department]) {
      deptMap[s.department] = {
        department: s.department,
        totalStudents: 0,
        totalEntries: 0,
        onTimeEntries: 0,
        lateEntries: 0,
        veryLateEntries: 0,
        earlyExits: 0,
        missingExits: 0,
        sumEntryMinutes: 0,
        sumExitMinutes: 0,
        exitCount: 0
      };
    }
    deptMap[s.department].totalStudents++;
  });

  filteredRecords.forEach(rec => {
    const dept = deptMap[rec.department];
    if (!dept) return;

    if (rec.entryTime) {
      dept.totalEntries++;
      const min = timeToMinutes(rec.entryTime);
      if (min != null) dept.sumEntryMinutes += min;

      const isToday = rec.date === TODAY_DATE;
      const c = classifyRecord(rec, rules, isToday);

      if (c.entryClass.status === 'On Time') dept.onTimeEntries++;
      if (c.entryClass.status === 'Late') dept.lateEntries++;
      if (c.entryClass.status === 'Very Late') dept.veryLateEntries++;
      if (c.exitClass.status === 'Early Exit') dept.earlyExits++;
      if (c.exitClass.status === 'Missing Exit') dept.missingExits++;
    }

    if (rec.exitTime) {
      const exitMin = timeToMinutes(rec.exitTime);
      if (exitMin != null) {
        dept.sumExitMinutes += exitMin;
        dept.exitCount++;
      }
    }
  });

  return Object.values(deptMap).map(d => {
    const totalLate = d.lateEntries + d.veryLateEntries;
    const punctuality = d.totalEntries > 0 ? Math.round((d.onTimeEntries / d.totalEntries) * 100) : 0;
    const lateRate = d.totalEntries > 0 ? Math.round((totalLate / d.totalEntries) * 100) : 0;
    const avgEntryMin = d.totalEntries > 0 ? Math.round(d.sumEntryMinutes / d.totalEntries) : null;
    const avgExitMin = d.exitCount > 0 ? Math.round(d.sumExitMinutes / d.exitCount) : null;

    return {
      department: d.department,
      totalStudents: d.totalStudents,
      totalEntries: d.totalEntries,
      onTimeEntries: d.onTimeEntries,
      lateEntries: d.lateEntries,
      veryLateEntries: d.veryLateEntries,
      totalLate,
      earlyExits: d.earlyExits,
      missingExits: d.missingExits,
      punctualityPercent: punctuality,
      lateRatePercent: lateRate,
      avgEntryTime: avgEntryMin != null ? minutesToTime(avgEntryMin) : '--:--',
      avgExitTime: avgExitMin != null ? minutesToTime(avgExitMin) : '--:--'
    };
  }).sort((a, b) => b.punctualityPercent - a.punctualityPercent);
}

/**
 * Historical Trends over Time (Daily breakdown)
 */
export function calculateDailyTrends(records, rules) {
  const dateMap = {};

  records.forEach(rec => {
    if (!dateMap[rec.date]) {
      dateMap[rec.date] = {
        date: rec.date,
        totalEntered: 0,
        onTimeCount: 0,
        lateCount: 0,
        veryLateCount: 0,
        earlyExitCount: 0,
        exitCount: 0,
        missingExitCount: 0,
        sumEntryMinutes: 0
      };
    }

    const d = dateMap[rec.date];
    if (rec.entryTime) {
      d.totalEntered++;
      const min = timeToMinutes(rec.entryTime);
      if (min != null) d.sumEntryMinutes += min;

      const isToday = rec.date === TODAY_DATE;
      const c = classifyRecord(rec, rules, isToday);

      if (c.entryClass.status === 'On Time') d.onTimeCount++;
      if (c.entryClass.status === 'Late') d.lateCount++;
      if (c.entryClass.status === 'Very Late') d.veryLateCount++;
      if (c.exitClass.status === 'Early Exit') d.earlyExitCount++;
      if (c.exitClass.status === 'Missing Exit') d.missingExitCount++;
    }

    if (rec.exitTime) {
      d.exitCount++;
    }
  });

  return Object.values(dateMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => {
      const totalLate = d.lateCount + d.veryLateCount;
      const punctualityPercent = d.totalEntered > 0 ? Math.round((d.onTimeCount / d.totalEntered) * 100) : 0;
      const avgEntryMin = d.totalEntered > 0 ? Math.round(d.sumEntryMinutes / d.totalEntered) : null;

      // Format readable date like "Oct 05"
      const dateObj = new Date(d.date + 'T12:00:00');
      const shortDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      return {
        ...d,
        totalLate,
        punctualityPercent,
        shortDate,
        dayName,
        avgEntryTime: avgEntryMin != null ? minutesToTime(avgEntryMin) : '--:--',
        avgEntryMinutes: avgEntryMin
      };
    });
}

/**
 * Detailed Student Profile Statistics & History
 */
export function calculateStudentProfile(studentId, allStudents, allRecords, rules) {
  const student = allStudents.find(s => s.id === studentId || s.regNo === studentId);
  if (!student) return null;

  const studentRecords = allRecords
    .filter(r => r.studentId === student.id || r.regNo === student.regNo)
    .sort((a, b) => b.date.localeCompare(a.date)); // Recent first

  let onTimeDays = 0;
  let lateArrivals = 0;
  let veryLateArrivals = 0;
  let earlyExits = 0;
  let missingExits = 0;
  let sumEntryMin = 0;
  let sumExitMin = 0;
  let validExitCount = 0;

  const historyWithClassification = studentRecords.map(rec => {
    const isToday = rec.date === TODAY_DATE;
    const classification = classifyRecord(rec, rules, isToday);

    if (classification.entryClass.status === 'On Time') onTimeDays++;
    if (classification.entryClass.status === 'Late') lateArrivals++;
    if (classification.entryClass.status === 'Very Late') veryLateArrivals++;
    if (classification.exitClass.status === 'Early Exit') earlyExits++;
    if (classification.exitClass.status === 'Missing Exit') missingExits++;

    if (rec.entryTime) {
      const eMin = timeToMinutes(rec.entryTime);
      if (eMin != null) sumEntryMin += eMin;
    }
    if (rec.exitTime) {
      const xMin = timeToMinutes(rec.exitTime);
      if (xMin != null) {
        sumExitMin += xMin;
        validExitCount++;
      }
    }

    return {
      ...rec,
      classification,
      statusLabel: classification.label,
      statusBadge: classification.badgeClass
    };
  });

  const totalRecordedDays = studentRecords.length;
  const totalLate = lateArrivals + veryLateArrivals;
  const punctualityScore = totalRecordedDays > 0 
    ? Math.round((onTimeDays / totalRecordedDays) * 100) 
    : 100;

  const avgEntryMin = totalRecordedDays > 0 ? Math.round(sumEntryMin / totalRecordedDays) : null;
  const avgExitMin = validExitCount > 0 ? Math.round(sumExitMin / validExitCount) : null;

  // Trend data for student's arrival time (oldest to newest)
  const arrivalTrend = [...studentRecords]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(rec => {
      const eMin = timeToMinutes(rec.entryTime);
      const dateObj = new Date(rec.date + 'T12:00:00');
      return {
        date: rec.date,
        shortDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        entryTime: rec.entryTime,
        entryMinutes: eMin,
        lateThreshold: 510, // 08:30 = 510 mins
        isLate: eMin > 510
      };
    });

  // Calculate current streak
  let currentStreak = 0;
  for (let rec of studentRecords) {
    const isToday = rec.date === TODAY_DATE;
    const c = classifyRecord(rec, rules, isToday);
    if (c.entryClass.status === 'On Time') {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    student,
    totalRecordedDays,
    onTimeDays,
    lateArrivals,
    veryLateArrivals,
    totalLate,
    earlyExits,
    missingExits,
    punctualityScore,
    currentStreak,
    avgEntryTime: avgEntryMin != null ? minutesToTime(avgEntryMin) : '--:--',
    avgExitTime: avgExitMin != null ? minutesToTime(avgExitMin) : '--:--',
    history: historyWithClassification,
    arrivalTrend
  };
}

/**
 * Intelligent System Alerts
 */
export function generateSystemAlerts(allStudents, allRecords, rules) {
  const kpis = calculateTodayKPIs(allStudents, allRecords, rules);
  const alerts = [];

  // Alert 1: Missing Exit records
  if (kpis.missingExits > 0) {
    alerts.push({
      id: 'ALT-MISSING-EXIT',
      type: 'warning',
      priority: 'high',
      icon: 'AlertTriangle',
      title: 'Missing Exit Records Detected',
      message: `${kpis.missingExits} day scholars have recorded morning entry but no evening exit.`,
      stat: `${kpis.missingExits} students`,
      actionLabel: 'Investigate Discrepancies',
      actionType: 'NAV_MISSING_EXITS',
      timestamp: 'Today, 05:15 PM'
    });
  }

  // Alert 2: Today's Late Arrivals
  if (kpis.totalLate > 0) {
    alerts.push({
      id: 'ALT-LATE-TODAY',
      type: 'info',
      priority: 'medium',
      icon: 'Clock',
      title: 'Daily Late Arrival Influx',
      message: `${kpis.totalLate} students arrived past the ${rules.lateAfterTime} AM threshold today (${kpis.veryLateArrivals} classified as Very Late).`,
      stat: `${kpis.totalLate} late`,
      actionLabel: 'View Late Leaderboard',
      actionType: 'NAV_PUNCTUALITY',
      timestamp: 'Today, 09:30 AM'
    });
  }

  // Alert 3: Praveen S or frequent late offender
  const leaderboards = calculatePunctualityLeaderboards(
    allStudents, 
    filterRecords(allRecords, { dateFilter: 'this_week' }), 
    rules
  );
  const repeatOffender = leaderboards.lateLeaderboard.find(item => item.totalLate >= 4);
  if (repeatOffender) {
    alerts.push({
      id: `ALT-REPEAT-${repeatOffender.student.regNo}`,
      type: 'warning',
      priority: 'high',
      icon: 'UserX',
      title: `Frequent Late Arrival Alert: ${repeatOffender.student.name}`,
      message: `Student ${repeatOffender.student.regNo} (${repeatOffender.student.name}, ${repeatOffender.student.department}) has been late ${repeatOffender.totalLate} times this week.`,
      stat: `${repeatOffender.totalLate}x this week`,
      studentId: repeatOffender.student.id,
      actionLabel: 'Open Student Profile',
      actionType: 'VIEW_STUDENT',
      timestamp: 'Active this week'
    });
  }

  // Alert 4: Department comparative spike
  const deptStats = calculateDepartmentAnalytics(allStudents, allRecords, rules);
  const itDept = deptStats.find(d => d.department === 'IT');
  if (itDept && itDept.lateRatePercent > 10) {
    alerts.push({
      id: 'ALT-DEPT-SPIKE',
      type: 'info',
      priority: 'medium',
      icon: 'TrendingUp',
      title: 'Department Late Rate Pattern',
      message: `Department ${itDept.department} shows a ${itDept.lateRatePercent}% late rate over the period (${itDept.totalLate} incidents). Bus Route 14 traffic delays reported.`,
      stat: `${itDept.lateRatePercent}% late rate`,
      actionLabel: 'Compare Departments',
      actionType: 'NAV_ANALYTICS',
      timestamp: 'Periodic aggregation'
    });
  }

  return alerts;
}
