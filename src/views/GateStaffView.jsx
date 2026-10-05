import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ScanLine, 
  Radio, 
  QrCode, 
  Keyboard, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  ArrowRight,
  ShieldCheck,
  Search,
  Check,
  Sparkles
} from 'lucide-react';
import HardwareSourceBadge from '../components/HardwareSourceBadge';
import { classifyRecord, classifyEntry, classifyExit } from '../services/classificationEngine';

export default function GateStaffView({
  allStudents,
  allRecords,
  rules,
  onRecordEntry,
  onRecordExit,
  onOpenStudentProfile
}) {
  const [studentInput, setStudentInput] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [hardwareSource, setHardwareSource] = useState('RFID'); // 'RFID' | 'QR' | 'MANUAL' | 'API'
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [earlyExitReason, setEarlyExitReason] = useState('Approved On-Duty / Medical Permit');
  const [simulatedTime, setSimulatedTime] = useState('08:42'); // Allows testing morning or evening recording easily
  const [timeMode, setTimeMode] = useState('morning'); // 'morning' (08:42 AM) | 'evening' (17:21 PM)

  const inputRef = useRef(null);
  const todayDate = '2026-10-05';

  // Set default student as Praveen S (22IT045) on load for instant demonstration
  useEffect(() => {
    const praveen = allStudents.find(s => s.regNo === '22IT045');
    if (praveen) setSelectedStudent(praveen);
  }, [allStudents]);

  // Today's record for selected student
  const todayRecord = useMemo(() => {
    if (!selectedStudent) return null;
    return allRecords.find(r => r.date === todayDate && (r.studentId === selectedStudent.id || r.regNo === selectedStudent.regNo));
  }, [selectedStudent, allRecords]);

  // Live transaction feed at gate today
  const recentTransactions = useMemo(() => {
    return allRecords
      .filter(r => r.date === todayDate && (r.entryTime || r.exitTime))
      .sort((a, b) => (b.exitTime || b.entryTime || '').localeCompare(a.exitTime || a.entryTime || ''))
      .slice(0, 8);
  }, [allRecords]);

  // Search logic on input
  const handleInputChange = (val) => {
    setStudentInput(val);
    const cleaned = val.trim().toLowerCase();
    if (!cleaned) return;

    const match = allStudents.find(s => 
      s.regNo.toLowerCase() === cleaned || 
      s.name.toLowerCase() === cleaned ||
      s.id.toLowerCase() === cleaned
    );

    if (match) {
      setSelectedStudent(match);
      setFeedbackMessage({ type: 'info', text: `Student found: ${match.name} (${match.regNo})` });
    }
  };

  const handleSelectQuickStudent = (student) => {
    setSelectedStudent(student);
    setStudentInput(student.regNo);
    setFeedbackMessage(null);
  };

  // Record Entry
  const handleRecordEntry = () => {
    if (!selectedStudent) return;
    if (todayRecord && todayRecord.entryTime) {
      setFeedbackMessage({
        type: 'warning',
        text: `Duplicate blocked: Entry already recorded for ${selectedStudent.name} at ${todayRecord.entryTime} AM.`
      });
      return;
    }

    const entryTime = timeMode === 'morning' ? simulatedTime : '08:42';
    onRecordEntry(selectedStudent.id, entryTime, hardwareSource);
    setFeedbackMessage({
      type: 'success',
      text: `✓ Morning Entry Recorded: ${selectedStudent.name} at ${entryTime} AM via ${hardwareSource}`
    });
  };

  // Record Exit
  const handleRecordExit = () => {
    if (!selectedStudent) return;
    if (todayRecord && todayRecord.exitTime) {
      setFeedbackMessage({
        type: 'warning',
        text: `Duplicate blocked: Exit already recorded for ${selectedStudent.name} at ${todayRecord.exitTime} PM.`
      });
      return;
    }

    const exitTime = timeMode === 'evening' ? simulatedTime : '17:21';
    onRecordExit(selectedStudent.id, exitTime, hardwareSource, earlyExitReason);
    setFeedbackMessage({
      type: 'success',
      text: `✓ Evening Exit Recorded: ${selectedStudent.name} at ${exitTime} PM via ${hardwareSource}`
    });
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ScanLine size={26} style={{ color: '#0d9488' }} />
            Gate Staff Entry & Exit Scanner Terminal
          </h1>
          <p>
            High-throughput turnstile operational portal • Active Gate: <strong>{rules.activeGate}</strong>
          </p>
        </div>

        {/* Hardware Source Abstraction Selector (Section 16) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Capture Mode:
          </span>
          {[
            { id: 'RFID', label: 'RFID Tap', icon: Radio },
            { id: 'QR', label: 'QR Scan', icon: QrCode },
            { id: 'MANUAL', label: 'Manual Keypad', icon: Keyboard },
            { id: 'API', label: 'Turnstile API', icon: Cpu }
          ].map(source => {
            const Icon = source.icon;
            const isActive = hardwareSource === source.id;
            return (
              <button
                key={source.id}
                className={`btn btn-sm ${isActive ? 'btn-teal' : 'btn-secondary'}`}
                onClick={() => setHardwareSource(source.id)}
                style={{ fontSize: '0.74rem' }}
              >
                <Icon size={12} /> {source.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="dashboard-grid-3">
        {/* Left Side: Scan & Action Card */}
        <div>
          {/* Big Input Hero (Section 15) */}
          <div className="scanner-hero">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd' }}>
                SCAN / ENTER STUDENT ID
              </div>

              {/* Time Simulator switch to test 08:42 AM or 05:21 PM */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Simulated Scan Time:</span>
                <input
                  type="time"
                  className="filter-input mono"
                  style={{ width: '105px', padding: '4px 8px', fontSize: '0.85rem' }}
                  value={simulatedTime}
                  onChange={e => setSimulatedTime(e.target.value)}
                />
                <button
                  className={`btn btn-sm ${timeMode === 'morning' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setTimeMode('morning');
                    setSimulatedTime('08:42');
                  }}
                  title="Simulate morning arrival at 08:42 AM (Late)"
                >
                  Morning (08:42)
                </button>
                <button
                  className={`btn btn-sm ${timeMode === 'evening' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setTimeMode('evening');
                    setSimulatedTime('17:21');
                  }}
                  title="Simulate evening departure at 05:21 PM"
                >
                  Evening (17:21)
                </button>
              </div>
            </div>

            <div className="scanner-input-box">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type or scan student ID (e.g. 22IT045)..."
                className="scan-input"
                value={studentInput}
                onChange={e => handleInputChange(e.target.value)}
                autoFocus
              />
              <button 
                className="btn btn-teal btn-lg"
                onClick={() => {
                  if (selectedStudent) {
                    if (!todayRecord || !todayRecord.entryTime) handleRecordEntry();
                    else if (!todayRecord.exitTime) handleRecordExit();
                  }
                }}
              >
                <ScanLine size={20} /> Process Tap
              </button>
            </div>

            {/* Quick Demonstration Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Demo Students:
              </span>
              {[
                { regNo: '22IT045', name: 'Praveen S (IT)' },
                { regNo: '22CS031', name: 'Praveen K (CSE)' },
                { regNo: '21EC012', name: 'Vigneshwaran K (ECE)' },
                { regNo: '23AD008', name: 'Aarav Patel (AIDS)' },
                { regNo: '21ME015', name: 'Arunmozhi V (MECH)' }
              ].map(chip => (
                <button
                  key={chip.regNo}
                  className="btn btn-secondary btn-sm"
                  style={{
                    background: selectedStudent?.regNo === chip.regNo ? 'rgba(37, 99, 235, 0.3)' : 'rgba(255,255,255,0.04)',
                    borderColor: selectedStudent?.regNo === chip.regNo ? '#3b82f6' : 'var(--border-subtle)',
                    fontSize: '0.74rem'
                  }}
                  onClick={() => handleSelectQuickStudent(allStudents.find(s => s.regNo === chip.regNo))}
                >
                  {chip.name}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Banner */}
          {feedbackMessage && (
            <div style={{
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              background: feedbackMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : (feedbackMessage.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)'),
              border: `1px solid ${feedbackMessage.type === 'success' ? '#10b981' : (feedbackMessage.type === 'warning' ? '#f59e0b' : '#3b82f6')}`,
              color: feedbackMessage.type === 'success' ? '#34d399' : (feedbackMessage.type === 'warning' ? '#fbbf24' : '#60a5fa'),
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {feedbackMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Selected Student Found Card (Section 15) */}
          {selectedStudent && (
            <div className="card" style={{ border: '1px solid #2563eb', boxShadow: '0 0 24px rgba(37, 99, 235, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.15rem',
                    fontWeight: 800
                  }}>
                    {selectedStudent.name[0]}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#60a5fa' }}>
                        {selectedStudent.regNo}
                      </span>
                      <span className="badge badge-teal">Verified Scholar</span>
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                      {selectedStudent.name}
                    </h2>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {selectedStudent.department} — {selectedStudent.year} • Sec {selectedStudent.section}
                    </div>
                  </div>
                </div>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => onOpenStudentProfile(selectedStudent.id)}
                >
                  View Profile
                </button>
              </div>

              {/* Today's Movement Status Box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Morning Entry Status */}
                <div style={{
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    Morning Entry Status
                  </div>

                  {todayRecord?.entryTime ? (
                    <div>
                      <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                        ✓ {todayRecord.entryTime} AM
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <HardwareSourceBadge source={todayRecord.entrySource} />
                        <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>
                          {todayRecord.entryTime > rules.lateAfterTime ? 'Late Arrival' : 'On Time'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        Not Recorded
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                        Awaiting morning ingress scan
                      </div>
                    </div>
                  )}
                </div>

                {/* Evening Exit Status */}
                <div style={{
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    Evening Exit Status
                  </div>

                  {todayRecord?.exitTime ? (
                    <div>
                      <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#06b6d4' }}>
                        ✓ {todayRecord.exitTime} PM
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <HardwareSourceBadge source={todayRecord.exitSource} />
                        <span className="badge badge-teal" style={{ fontSize: '0.68rem' }}>
                          Exit Recorded
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: todayRecord?.entryTime ? '#f43f5e' : 'var(--text-muted)' }}>
                        {todayRecord?.entryTime ? 'Active / Missing' : 'Not Recorded'}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                        {todayRecord?.entryTime ? 'Currently on campus premises' : 'Awaiting entry record first'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons (Section 15) */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={handleRecordEntry}
                  disabled={Boolean(todayRecord?.entryTime)}
                >
                  {todayRecord?.entryTime ? (
                    <>
                      <Check size={18} /> Entry Recorded ({todayRecord.entryTime} AM)
                    </>
                  ) : (
                    <>
                      <UserCheck size={18} /> RECORD MORNING ENTRY
                    </>
                  )}
                </button>

                <button
                  className="btn btn-teal btn-lg"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={handleRecordExit}
                  disabled={Boolean(todayRecord?.exitTime)}
                >
                  {todayRecord?.exitTime ? (
                    <>
                      <Check size={18} /> Exit Recorded ({todayRecord.exitTime} PM)
                    </>
                  ) : (
                    <>
                      <ArrowRight size={18} /> RECORD EVENING EXIT
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Live Gate Feed & Hardware Connectivity */}
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ fontSize: '0.88rem' }}>
                <Clock size={16} style={{ color: '#06b6d4' }} />
                Gate Transaction Stream (Today)
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentTransactions.map(rec => (
                <div
                  key={rec.id}
                  onClick={() => onOpenStudentProfile(rec.studentId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    fontSize: '0.78rem'
                  }}
                  className="search-item-hover"
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {rec.studentName}
                    </div>
                    <div className="mono" style={{ fontSize: '0.7rem', color: '#60a5fa' }}>
                      {rec.regNo} • {rec.department}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontWeight: 700, color: rec.exitTime ? '#06b6d4' : '#10b981' }}>
                      {rec.exitTime ? `Exit: ${rec.exitTime} PM` : `Entry: ${rec.entryTime} AM`}
                    </div>
                    <div>
                      <HardwareSourceBadge source={rec.exitSource || rec.entrySource} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hardware Status Card (Section 16) */}
          <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Gate Hardware Abstraction Layer
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Ready for production integration with:
              <ul style={{ paddingLeft: '16px', marginTop: '6px', color: 'var(--text-muted)' }}>
                <li>13.56MHz Mifare / UHF Long-Range RFID</li>
                <li>Dynamic QR Code Token on Student App</li>
                <li>Turnstile Wiegand Relay API Controller</li>
                <li>College ERP Database Webhook Sync</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
