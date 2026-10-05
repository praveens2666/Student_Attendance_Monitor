import { INITIAL_STUDENTS } from './mockStudents';

/**
 * Deterministic pseudo-random number generator for consistent realistic data
 */
function pseudoRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate working dates for the last 35 days (excluding weekends) up to 2026-10-05
export function getWorkingDates(numDays = 26) {
  const dates = [];
  const baseDate = new Date('2026-10-05T12:00:00'); // Today is Monday Oct 5, 2026
  let current = new Date(baseDate);

  while (dates.length < numDays) {
    const dayOfWeek = current.getDay();
    // 0 is Sunday, 6 is Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    current.setDate(current.getDate() - 1);
  }

  // Reverse so chronological (oldest to newest, ending today)
  return dates.reverse();
}

/**
 * Generates entry time based on habitProfile and seed
 */
function generateEntryTime(habit, seed, isToday = false) {
  const rand = pseudoRandom(seed);
  const rand2 = pseudoRandom(seed + 101);

  if (habit === 'highly_punctual') {
    // 95% on time: 08:05 to 08:28
    if (rand < 0.95) {
      const min = 8 * 60 + 5 + Math.floor(rand2 * 23); // 8:05 to 8:28
      const h = Math.floor(min / 60);
      const m = min % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    } else {
      // 5% slightly late: 08:31 to 08:36
      const min = 8 * 60 + 31 + Math.floor(rand2 * 6);
      return `08:${String(min % 60).padStart(2, '0')}`;
    }
  } else if (habit === 'habitual_late') {
    // 70% late or very late
    if (rand < 0.25) {
      // Very late: 09:02 to 09:22
      const min = 9 * 60 + 2 + Math.floor(rand2 * 20);
      return `09:${String(min % 60).padStart(2, '0')}`;
    } else if (rand < 0.75) {
      // Late: 08:32 to 08:55
      const min = 8 * 60 + 32 + Math.floor(rand2 * 23);
      return `08:${String(min % 60).padStart(2, '0')}`;
    } else {
      // On time: 08:24 to 08:29
      const min = 8 * 60 + 24 + Math.floor(rand2 * 6);
      return `08:${String(min % 60).padStart(2, '0')}`;
    }
  } else if (habit === 'occasional_late') {
    // 25% late
    if (rand < 0.25) {
      const min = 8 * 60 + 32 + Math.floor(rand2 * 18); // 8:32 to 8:50
      return `08:${String(min % 60).padStart(2, '0')}`;
    } else {
      const min = 8 * 60 + 12 + Math.floor(rand2 * 17); // 8:12 to 8:29
      return `08:${String(min % 60).padStart(2, '0')}`;
    }
  } else {
    // Moderate: 12% late
    if (rand < 0.12) {
      const min = 8 * 60 + 31 + Math.floor(rand2 * 14); // 8:31 to 8:45
      return `08:${String(min % 60).padStart(2, '0')}`;
    } else {
      const min = 8 * 60 + 10 + Math.floor(rand2 * 19); // 8:10 to 8:29
      return `08:${String(min % 60).padStart(2, '0')}`;
    }
  }
}

/**
 * Generates exit time
 */
function generateExitTime(habit, seed, isToday = false) {
  const rand = pseudoRandom(seed + 500);
  const rand2 = pseudoRandom(seed + 700);

  if (isToday) {
    // Today is ~17:15 (5:15 PM)
    // 55% have scanned exit, 40% haven't exited yet (Missing / Still in campus), 5% early exit
    if (rand < 0.08) {
      // Early exit around 15:45 - 16:45
      const min = 15 * 60 + 45 + Math.floor(rand2 * 60);
      const h = Math.floor(min / 60);
      const m = min % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    } else if (rand < 0.65) {
      // Normal exit just recorded (17:02 - 17:15)
      const min = 17 * 60 + 2 + Math.floor(rand2 * 13);
      return `17:${String(min % 60).padStart(2, '0')}`;
    } else {
      // Not yet exited! (Missing exit or still studying in lab/library)
      return null;
    }
  }

  // Past days:
  // 92% normal exit: 17:02 to 17:35
  // 5% early exit: 15:30 to 16:45
  // 3% missing exit (forgot to tap out)
  if (rand < 0.03) {
    return null; // Missing exit anomaly in past
  } else if (rand < 0.08) {
    const min = 15 * 60 + 30 + Math.floor(rand2 * 75);
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  } else {
    const min = 17 * 60 + 2 + Math.floor(rand2 * 34);
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}

export function generateAllHistoricalRecords() {
  const dates = getWorkingDates(26); // ~5-6 weeks of records
  const records = [];
  const todayDate = '2026-10-05';
  let idCounter = 1000;

  dates.forEach((dateStr, dIdx) => {
    const isToday = dateStr === todayDate;

    INITIAL_STUDENTS.forEach((student, sIdx) => {
      const seed = dIdx * 200 + sIdx * 7;
      const attendanceChance = pseudoRandom(seed);

      // Student attendance probability (92% present on any given day)
      // For today, make exactly 96 out of 105 students present
      let isPresent = attendanceChance > 0.07;
      if (isToday) {
        // Specific 9 absent students today for realistic dashboard numbers
        const absentIndices = [8, 19, 31, 45, 59, 72, 85, 93, 102];
        isPresent = !absentIndices.includes(sIdx);
      }

      if (isPresent) {
        let entryTime = generateEntryTime(student.habitProfile, seed, isToday);
        let exitTime = generateExitTime(student.habitProfile, seed, isToday);

        // Specific tuning for Praveen S (22IT045)
        if (student.regNo === '22IT045') {
          // Exactly late today at 08:42 AM and exited at 17:21 PM (or not exited yet depending on scenario)
          if (isToday) {
            entryTime = '08:42';
            exitTime = '17:21'; // matching prompt: "22IT045 | Praveen S | IT | IV Year | 08:42 AM | 05:21 PM | Late"
          } else if (dIdx >= dates.length - 5) {
            // Late every day this week to trigger alert "Student 22IT045 has been late 5 times this week"
            entryTime = ['08:46', '08:39', '08:52', '08:41', '08:38'][dIdx % 5];
          }
        }

        // Specific tuning for Praveen K (22CS031)
        if (student.regNo === '22CS031' && isToday) {
          entryTime = '08:24';
          exitTime = null; // Active on campus / missing exit
        }

        const sourceOptions = ['RFID', 'RFID', 'RFID', 'QR', 'Manual'];
        const entrySource = sourceOptions[Math.floor(pseudoRandom(seed + 90) * sourceOptions.length)];
        const exitSource = exitTime ? sourceOptions[Math.floor(pseudoRandom(seed + 95) * sourceOptions.length)] : null;

        records.push({
          id: `REC-${idCounter++}`,
          studentId: student.id,
          regNo: student.regNo,
          studentName: student.name,
          department: student.department,
          year: student.year,
          date: dateStr,
          entryTime,
          exitTime,
          entrySource,
          exitSource,
          gate: 'Gate 02 - South Day Scholar Portal',
          verifiedBy: 'Gate Officer R. Murugan (EMP-4102)',
          earlyExitReason: exitTime && parseInt(exitTime.split(':')[0]) < 17 ? 'Approved Medical / On-Duty Permit' : null,
          adminNote: null
        });
      }
    });
  });

  return records;
}
