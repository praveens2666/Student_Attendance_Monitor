export const DEFAULT_RULES = {
  campusName: 'National Institute of Engineering & Technology',
  campusCode: 'NIET-CAMPUS-01',
  activeGate: 'Gate 02 - South Day Scholar Portal',
  academicTerm: 'Autumn Semester 2026',
  
  // Timing rules (24-hour format HH:mm)
  normalEntryTime: '08:30',      // 08:30 AM
  lateAfterTime: '08:30',        // After 08:30 AM is Late
  veryLateAfterTime: '09:00',    // After 09:00 AM is Very Late
  normalExitTime: '17:00',       // 05:00 PM
  earlyExitBeforeTime: '17:00',  // Before 05:00 PM is Early Exit
  
  gracePeriodMinutes: 5,         // 5 minutes grace buffer
  maxAllowedLatePerMonth: 3,     // Alert threshold
  autoFlagMissingExitHours: 1.5, // Flag missing exit 1.5 hours after normal exit
  
  // Notification toggles
  notifyParentsOnVeryLate: true,
  notifyHODOnConsecutiveLate: true,
  strictGateCheckEnabled: true
};
