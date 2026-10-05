/**
 * Rules-based entry/exit and punctuality classification engine
 */

export function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  // Handle formats like "08:30", "8:30 AM", "17:15", "05:15 PM"
  let clean = timeStr.trim();
  let isPM = /PM/i.test(clean);
  let isAM = /AM/i.test(clean);
  clean = clean.replace(/\s*(AM|PM)/i, '');
  const parts = clean.split(':').map(Number);
  let hours = parts[0];
  const minutes = parts[1] || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function minutesToTime(minutes, format24 = false) {
  if (minutes == null || isNaN(minutes)) return '--:--';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const pad = (n) => String(n).padStart(2, '0');

  if (format24) {
    return `${pad(hours)}:${pad(mins)}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${pad(displayHours)}:${pad(mins)} ${period}`;
}

export function classifyEntry(entryTime, rules) {
  if (!entryTime) return { status: 'Not Entered', badgeClass: 'badge-neutral', label: 'Not Entered' };
  
  const entryMin = timeToMinutes(entryTime);
  const lateMin = timeToMinutes(rules.lateAfterTime);
  const veryLateMin = timeToMinutes(rules.veryLateAfterTime);
  const grace = rules.gracePeriodMinutes || 0;

  if (entryMin > veryLateMin) {
    return {
      status: 'Very Late',
      badgeClass: 'badge-danger',
      label: 'Very Late',
      diffMinutes: entryMin - lateMin
    };
  } else if (entryMin > lateMin + grace) {
    return {
      status: 'Late',
      badgeClass: 'badge-warning',
      label: 'Late',
      diffMinutes: entryMin - lateMin
    };
  } else {
    return {
      status: 'On Time',
      badgeClass: 'badge-success',
      label: 'On Time',
      diffMinutes: 0
    };
  }
}

export function classifyExit(exitTime, entryTime, isToday, rules, currentTimeStr = '17:30') {
  if (!exitTime) {
    if (!entryTime) {
      return { status: 'Not Entered', badgeClass: 'badge-neutral', label: 'Not Entered' };
    }
    // Entered, but no exit
    if (!isToday) {
      // Past day with no exit is a Missing Exit
      return { status: 'Missing Exit', badgeClass: 'badge-rose', label: 'Missing Exit' };
    }
    // Today
    const currentMin = timeToMinutes(currentTimeStr);
    const normalExitMin = timeToMinutes(rules.normalExitTime);
    if (currentMin >= normalExitMin) {
      return { status: 'Missing Exit', badgeClass: 'badge-rose', label: 'Missing Exit' };
    }
    return { status: 'On Campus', badgeClass: 'badge-info', label: 'Active on Campus' };
  }

  const exitMin = timeToMinutes(exitTime);
  const earlyExitMin = timeToMinutes(rules.earlyExitBeforeTime);

  if (exitMin < earlyExitMin) {
    return {
      status: 'Early Exit',
      badgeClass: 'badge-orange',
      label: 'Early Exit',
      diffMinutes: earlyExitMin - exitMin
    };
  }

  return {
    status: 'Exit Recorded',
    badgeClass: 'badge-teal',
    label: 'Normal Exit',
    diffMinutes: 0
  };
}

/**
 * Returns overall movement status for record
 */
export function classifyRecord(record, rules, isToday = false, currentTimeStr = '17:30') {
  if (!record.entryTime) {
    return {
      status: 'Not Entered',
      badgeClass: 'badge-neutral',
      color: '#64748b',
      label: 'Not Entered'
    };
  }

  const entryClass = classifyEntry(record.entryTime, rules);
  const exitClass = classifyExit(record.exitTime, record.entryTime, isToday, rules, currentTimeStr);

  // If exit is missing
  if (exitClass.status === 'Missing Exit') {
    return {
      status: 'Missing Exit',
      badgeClass: 'badge-rose',
      color: '#e11d48',
      label: 'Missing Exit',
      entryClass,
      exitClass
    };
  }

  // If early exit
  if (exitClass.status === 'Early Exit') {
    return {
      status: 'Early Exit',
      badgeClass: 'badge-orange',
      color: '#ea580c',
      label: 'Early Exit',
      entryClass,
      exitClass
    };
  }

  // If entry was very late
  if (entryClass.status === 'Very Late') {
    return {
      status: 'Very Late',
      badgeClass: 'badge-danger',
      color: '#dc2626',
      label: 'Very Late',
      entryClass,
      exitClass
    };
  }

  // If entry was late
  if (entryClass.status === 'Late') {
    return {
      status: 'Late',
      badgeClass: 'badge-warning',
      color: '#d97706',
      label: 'Late Arrival',
      entryClass,
      exitClass
    };
  }

  // If exit recorded normally
  if (exitClass.status === 'Exit Recorded') {
    return {
      status: 'Exit Recorded',
      badgeClass: 'badge-teal',
      color: '#0d9488',
      label: 'Exit Recorded',
      entryClass,
      exitClass
    };
  }

  // If on campus and entry was on time
  return {
    status: 'On Time',
    badgeClass: 'badge-success',
    color: '#16a34a',
    label: 'On Time',
    entryClass,
    exitClass
  };
}
