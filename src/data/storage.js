import { INITIAL_STUDENTS } from './mockStudents';
import { generateAllHistoricalRecords } from './mockRecords';
import { DEFAULT_RULES } from './initialRules';

const STORAGE_KEYS = {
  STUDENTS: 'campusflow_students_v1',
  RECORDS: 'campusflow_records_v1',
  RULES: 'campusflow_rules_v1',
  AUDIT_LOGS: 'campusflow_audit_logs_v1'
};

export function getStoredStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading students from storage', e);
  }
  const initial = INITIAL_STUDENTS;
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initial));
  return initial;
}

export function getStoredRules() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RULES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading rules from storage', e);
  }
  const initial = DEFAULT_RULES;
  localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(initial));
  return initial;
}

export function saveStoredRules(rules) {
  localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
}

export function getStoredRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading records from storage', e);
  }
  const initial = generateAllHistoricalRecords();
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(initial));
  return initial;
}

export function saveStoredRecords(records) {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

export function getStoredAuditLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading audit logs', e);
  }
  const initial = [
    { id: 'LOG-001', timestamp: '2026-10-05 08:30:15', actor: 'System Gatekeeper', action: 'Daily Gate Entry Terminal Initialized', detail: 'South Gate 02 online with 4 RFID lanes.' },
    { id: 'LOG-002', timestamp: '2026-10-05 09:05:00', actor: 'Admin (Dean Affairs)', action: 'Rule Verification Check', detail: 'Normal entry threshold locked at 08:30 AM.' }
  ];
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initial));
  return initial;
}

export function addAuditLog(action, detail, actor = 'Gate Staff R. Murugan') {
  const logs = getStoredAuditLogs();
  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const newLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp,
    actor,
    action,
    detail
  };
  const updated = [newLog, ...logs.slice(0, 49)];
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  return updated;
}

export function resetAllDataToDefault() {
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.RECORDS);
  localStorage.removeItem(STORAGE_KEYS.RULES);
  localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);

  const students = INITIAL_STUDENTS;
  const records = generateAllHistoricalRecords();
  const rules = DEFAULT_RULES;

  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));

  return { students, records, rules };
}
