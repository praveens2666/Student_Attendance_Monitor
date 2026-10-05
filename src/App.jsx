import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import StudentProfileModal from './components/StudentProfileModal';
import MissingExitModal from './components/MissingExitModal';
import GlobalSearchModal from './components/GlobalSearchModal';

// Views
import AdminDashboard from './views/AdminDashboard';
import EntryExitMonitoring from './views/EntryExitMonitoring';
import StudentDirectory from './views/StudentDirectory';
import AnalyticsView from './views/AnalyticsView';
import PunctualityView from './views/PunctualityView';
import AlertsView from './views/AlertsView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';
import GateStaffView from './views/GateStaffView';
import StudentPortalView from './views/StudentPortalView';

// Storage & Services
import { 
  getStoredStudents, 
  getStoredRecords, 
  getStoredRules, 
  saveStoredRecords, 
  saveStoredRules, 
  resetAllDataToDefault,
  getStoredAuditLogs,
  addAuditLog
} from './data/storage';
import { generateSystemAlerts, calculateTodayKPIs } from './services/analyticsEngine';
import { playScanSuccess, playLateWarning } from './services/soundEffects';
import './App.css';

export default function App() {
  const [allStudents, setAllStudents] = useState(() => getStoredStudents());
  const [allRecords, setAllRecords] = useState(() => getStoredRecords());
  const [rules, setRules] = useState(() => getStoredRules());
  const [auditLogs, setAuditLogs] = useState(() => getStoredAuditLogs());

  // Role: 'admin' | 'gate' | 'student'
  const [currentRole, setCurrentRole] = useState('admin');
  // Admin View: 'dashboard' | 'students' | 'entry-exit' | 'analytics' | 'punctuality' | 'alerts' | 'reports' | 'settings'
  const [currentView, setCurrentView] = useState('dashboard');

  // Currently inspected or logged-in student (Defaults to Praveen S - 22IT045)
  const [selectedStudent, setSelectedStudent] = useState(() => {
    const students = getStoredStudents();
    return students.find(s => s.regNo === '22IT045') || students[0];
  });

  // Modals & Drawers
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMissingExitsOpen, setIsMissingExitsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Live Turnstile Auto-Stream Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastSimulatedStudentId, setLastSimulatedStudentId] = useState(null);

  // Toast helper
  const addToast = useCallback((text, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for global search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync state to local storage when changed
  const updateRecords = useCallback((newRecords) => {
    setAllRecords(newRecords);
    saveStoredRecords(newRecords);
  }, []);

  const updateRules = useCallback((newRules) => {
    setRules(newRules);
    saveStoredRules(newRules);
    addAuditLog('College Rules Modified', `Normal Entry: ${newRules.normalEntryTime}, Normal Exit: ${newRules.normalExitTime}`, 'Admin Dr. S. Ramanathan');
    addToast('College timing rules saved. Records reclassified.', 'success');
  }, [addToast]);

  // Today's KPIs & Alerts
  const todayKPIs = useMemo(() => {
    return calculateTodayKPIs(allStudents, allRecords, rules);
  }, [allStudents, allRecords, rules]);

  const activeAlerts = useMemo(() => {
    return generateSystemAlerts(allStudents, allRecords, rules);
  }, [allStudents, allRecords, rules]);

  // Record Entry (from Gate Staff or Admin or Simulation)
  const handleRecordEntry = useCallback((studentId, entryTime, source = 'RFID') => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;

    const todayDate = '2026-10-05';
    let recordIndex = allRecords.findIndex(r => r.date === todayDate && r.studentId === studentId);
    let updated;

    if (recordIndex >= 0) {
      updated = [...allRecords];
      updated[recordIndex] = {
        ...updated[recordIndex],
        entryTime,
        entrySource: source,
        verifiedBy: 'Gate Officer R. Murugan (EMP-4102)'
      };
    } else {
      const newRecord = {
        id: `REC-${Date.now().toString().slice(-5)}`,
        studentId: student.id,
        regNo: student.regNo,
        studentName: student.name,
        department: student.department,
        year: student.year,
        date: todayDate,
        entryTime,
        exitTime: null,
        entrySource: source,
        exitSource: null,
        gate: rules.activeGate,
        verifiedBy: 'Gate Officer R. Murugan (EMP-4102)',
        earlyExitReason: null,
        adminNote: null
      };
      updated = [newRecord, ...allRecords];
    }

    setLastSimulatedStudentId(studentId);
    updateRecords(updated);
    addAuditLog('Morning Entry Recorded', `Student ${student.name} (${student.regNo}) at ${entryTime} AM via ${source}`);
    addToast(`⚡ Tap Verified: ${student.name} (${student.regNo}) at ${entryTime} AM`, 'success');
  }, [allStudents, allRecords, rules, updateRecords, addToast]);

  // Record Exit (from Gate Staff or Admin)
  const handleRecordExit = useCallback((studentId, exitTime, source = 'RFID', earlyReason = null) => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;

    const todayDate = '2026-10-05';
    let recordIndex = allRecords.findIndex(r => r.date === todayDate && r.studentId === studentId);
    let updated = [...allRecords];

    if (recordIndex >= 0) {
      updated[recordIndex] = {
        ...updated[recordIndex],
        exitTime,
        exitSource: source,
        earlyExitReason: earlyReason
      };
    } else {
      const newRecord = {
        id: `REC-${Date.now().toString().slice(-5)}`,
        studentId: student.id,
        regNo: student.regNo,
        studentName: student.name,
        department: student.department,
        year: student.year,
        date: todayDate,
        entryTime: '08:30',
        exitTime,
        entrySource: 'Manual',
        exitSource: source,
        gate: rules.activeGate,
        verifiedBy: 'Gate Officer R. Murugan (EMP-4102)',
        earlyExitReason: earlyReason,
        adminNote: 'Exit logged with manual morning adjustment'
      };
      updated = [newRecord, ...allRecords];
    }

    setLastSimulatedStudentId(studentId);
    updateRecords(updated);
    addAuditLog('Evening Exit Recorded', `Student ${student.name} (${student.regNo}) at ${exitTime} PM via ${source}`);
    addToast(`Departure Verified: ${student.name} at ${exitTime} PM`, 'success');
  }, [allStudents, allRecords, rules, updateRecords, addToast]);

  // Single Tap Simulation: Picks an unentered student or unexited student and performs a real-time turnstile tap
  const handleSimulateSingleTap = useCallback(() => {
    const todayDate = '2026-10-05';
    const enteredStudentIds = allRecords
      .filter(r => r.date === todayDate && Boolean(r.entryTime))
      .map(r => r.studentId);

    // Pick an absent/unentered student
    const unentered = allStudents.filter(s => !enteredStudentIds.includes(s.id));

    if (unentered.length > 0) {
      const luckyStudent = unentered[Math.floor(Math.random() * unentered.length)];
      // Generate a late arrival time e.g. 08:36 or 08:44
      const mins = 8 * 60 + 31 + Math.floor(Math.random() * 20);
      const h = String(Math.floor(mins / 60)).padStart(2, '0');
      const m = String(mins % 60).padStart(2, '0');
      const timeStr = `${h}:${m}`;

      if (timeStr > rules.lateAfterTime) {
        playLateWarning();
      } else {
        playScanSuccess();
      }

      handleRecordEntry(luckyStudent.id, timeStr, 'RFID');
    } else {
      // Pick a student without exit and simulate evening exit
      const enteredWithoutExit = allRecords.filter(r => r.date === todayDate && r.entryTime && !r.exitTime);
      if (enteredWithoutExit.length > 0) {
        const rec = enteredWithoutExit[Math.floor(Math.random() * enteredWithoutExit.length)];
        playScanSuccess();
        handleRecordExit(rec.studentId, '17:18', 'RFID');
      } else {
        addToast('All scholars processed for today.', 'info');
      }
    }
  }, [allStudents, allRecords, rules, handleRecordEntry, handleRecordExit, addToast]);

  // Automated Ingress Simulation Interval (every 4.5 seconds when isSimulating is true)
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      handleSimulateSingleTap();
    }, 4500);

    return () => clearInterval(timer);
  }, [isSimulating, handleSimulateSingleTap]);

  // Add Disciplinary / Administrative Note to Student
  const handleAddStudentNote = useCallback((studentId, noteText) => {
    const todayDate = '2026-10-05';
    const updated = allRecords.map(r => {
      if (r.studentId === studentId && r.date === todayDate) {
        return { ...r, adminNote: noteText };
      }
      return r;
    });
    updateRecords(updated);
    addAuditLog('Admin Disciplinary Note Added', `Student ${studentId}: "${noteText}"`, 'Dr. S. Ramanathan');
    addToast('Disciplinary remark recorded in student dossier.', 'success');
  }, [allRecords, updateRecords, addToast]);

  // Resolve missing exit manually
  const handleResolveMissingExit = useCallback((recordId, manualExitTime, reason) => {
    const updated = allRecords.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          exitTime: manualExitTime,
          exitSource: 'Manual',
          adminNote: `Manual Resolution: ${reason}`,
          earlyExitReason: reason
        };
      }
      return r;
    });

    updateRecords(updated);
    addAuditLog('Missing Exit Corrected', `Record ${recordId} resolved with exit ${manualExitTime} PM: ${reason}`, 'Admin Dr. S. Ramanathan');
    addToast('Missing exit record successfully resolved and audited.', 'success');
  }, [allRecords, updateRecords, addToast]);

  // Reset to default
  const handleResetData = useCallback(() => {
    if (window.confirm('Reset CampusFlow data to initial 105 students and 30-day simulated records?')) {
      const { students, records, rules: newRules } = resetAllDataToDefault();
      setAllStudents(students);
      setAllRecords(records);
      setRules(newRules);
      setIsSimulating(false);
      addToast('Prototype data successfully re-initialized.', 'info');
    }
  }, [addToast]);

  // Role switch handler
  const handleRoleChange = useCallback((role) => {
    setCurrentRole(role);
    if (role === 'admin') setCurrentView('dashboard');
  }, []);

  // Switch student profile and transition to student role
  const handleSwitchToStudentRole = useCallback((student) => {
    setSelectedStudent(student);
    setActiveProfileId(null);
    setCurrentRole('student');
  }, []);

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.text}
          </div>
        ))}
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        allStudents={allStudents}
        onSelectStudent={(id) => {
          setActiveProfileId(id);
          setIsSearchOpen(false);
        }}
      />

      {/* Student Profile Modal */}
      {activeProfileId && (
        <StudentProfileModal
          studentId={activeProfileId}
          allStudents={allStudents}
          allRecords={allRecords}
          rules={rules}
          onClose={() => setActiveProfileId(null)}
          onSwitchToStudentRole={handleSwitchToStudentRole}
          onAddStudentNote={handleAddStudentNote}
        />
      )}

      {/* Missing Exit Drawer / Modal */}
      {isMissingExitsOpen && (
        <MissingExitModal
          allStudents={allStudents}
          allRecords={allRecords}
          rules={rules}
          onClose={() => setIsMissingExitsOpen(false)}
          onResolveMissingExit={handleResolveMissingExit}
          onOpenStudentProfile={(id) => {
            setIsMissingExitsOpen(false);
            setActiveProfileId(id);
          }}
        />
      )}

      {/* Sidebar - Only shown in Admin Role */}
      {currentRole === 'admin' && (
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          missingExitCount={todayKPIs.missingExits}
          alertCount={activeAlerts.length}
        />
      )}

      {/* Main Content Area */}
      <div className="app-main">
        {/* Top Navbar */}
        <Navbar
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          activeAlertCount={activeAlerts.length}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAlerts={() => {
            if (currentRole === 'admin') setCurrentView('alerts');
            else handleRoleChange('admin');
          }}
          onResetData={handleResetData}
          rules={rules}
          selectedStudent={selectedStudent}
        />

        {/* View Switcher based on Role and View state */}
        {currentRole === 'gate' && (
          <GateStaffView
            allStudents={allStudents}
            allRecords={allRecords}
            rules={rules}
            onRecordEntry={handleRecordEntry}
            onRecordExit={handleRecordExit}
            onOpenStudentProfile={setActiveProfileId}
          />
        )}

        {currentRole === 'student' && (
          <StudentPortalView
            currentStudent={selectedStudent}
            allStudents={allStudents}
            allRecords={allRecords}
            rules={rules}
            onSwitchStudent={setSelectedStudent}
          />
        )}

        {currentRole === 'admin' && (
          <>
            {currentView === 'dashboard' && (
              <AdminDashboard
                allStudents={allStudents}
                allRecords={allRecords}
                rules={rules}
                onOpenStudentProfile={setActiveProfileId}
                onOpenMissingExits={() => setIsMissingExitsOpen(true)}
                onNavigateToView={setCurrentView}
                isSimulating={isSimulating}
                onToggleSimulation={() => setIsSimulating(prev => !prev)}
                onSimulateSingleTap={handleSimulateSingleTap}
                lastSimulatedStudentId={lastSimulatedStudentId}
              />
            )}

            {currentView === 'students' && (
              <StudentDirectory
                allStudents={allStudents}
                allRecords={allRecords}
                rules={rules}
                onOpenStudentProfile={setActiveProfileId}
              />
            )}

            {currentView === 'entry-exit' && (
              <EntryExitMonitoring
                allStudents={allStudents}
                allRecords={allRecords}
                rules={rules}
                onOpenStudentProfile={setActiveProfileId}
                onOpenMissingExits={() => setIsMissingExitsOpen(true)}
              />
            )}

            {currentView === 'analytics' && (
              <AnalyticsView
                allStudents={allStudents}
                allRecords={allRecords}
                rules={rules}
              />
            )}

            {currentView === 'punctuality' && (
              <PunctualityView
                allStudents={allStudents}
                allRecords={allRecords}
                rules={rules}
                onOpenStudentProfile={setActiveProfileId}
              />
            )}

            {currentView === 'alerts' && (
              <AlertsView
                allStudents={allStudents}
                allRecords={allRecords}
                rules={rules}
                onOpenStudentProfile={setActiveProfileId}
                onOpenMissingExits={() => setIsMissingExitsOpen(true)}
                onNavigateToView={setCurrentView}
              />
            )}

            {currentView === 'reports' && (
              <ReportsView
                allStudents={allStudents}
                allRecords={allRecords}
                rules={rules}
                onOpenStudentProfile={setActiveProfileId}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                rules={rules}
                onSaveRules={updateRules}
                onResetData={handleResetData}
                auditLogs={auditLogs}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
