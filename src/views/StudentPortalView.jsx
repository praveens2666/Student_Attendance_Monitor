import React, { useState, useMemo } from 'react';
import { GraduationCap, Clock, Award, ShieldCheck, Calendar, Bus, Phone, AlertTriangle, CheckCircle2 } from 'lucide-react';
import StudentArrivalTrendChart from '../components/StudentArrivalTrendChart';
import HardwareSourceBadge from '../components/HardwareSourceBadge';
import { calculateStudentProfile } from '../services/analyticsEngine';

export default function StudentPortalView({
  currentStudent,
  allStudents,
  allRecords,
  rules,
  onSwitchStudent
}) {
  const student = currentStudent || allStudents.find(s => s.regNo === '22IT045') || allStudents[0];

  const profile = useMemo(() => {
    return calculateStudentProfile(student.id, allStudents, allRecords, rules);
  }, [student, allStudents, allRecords, rules]);

  // Today's record for this student
  const todayRecord = useMemo(() => {
    return profile.history.find(r => r.date === '2026-10-05');
  }, [profile]);

  let scoreColor = '#10b981';
  let scoreBadge = 'High Punctuality';
  if (profile.punctualityScore < 75) {
    scoreColor = '#ef4444';
    scoreBadge = 'Needs Attendance Attention';
  } else if (profile.punctualityScore < 85) {
    scoreColor = '#f59e0b';
    scoreBadge = 'Moderate Late Rate';
  } else if (profile.punctualityScore < 95) {
    scoreColor = '#38bdf8';
    scoreBadge = 'Standard Compliance';
  }

  return (
    <div className="view-container">
      {/* Student Top Switcher Banner */}
      <div style={{
        background: 'rgba(124, 58, 237, 0.1)',
        border: '1px solid rgba(124, 58, 237, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={18} style={{ color: '#a855f7' }} />
          <span style={{ fontSize: '0.85rem', color: '#e9d5ff' }}>
            <strong>Student View Mode</strong> — Viewing personal movement records for: <strong>{student.name} ({student.regNo})</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Test other student:</span>
          <select
            className="filter-select"
            value={student.id}
            onChange={e => {
              const selected = allStudents.find(s => s.id === e.target.value);
              if (selected) onSwitchStudent(selected);
            }}
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            {allStudents.slice(0, 15).map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.regNo} - {s.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Digital Identity Card */}
      <div className="student-id-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.6rem',
              fontWeight: 800,
              boxShadow: '0 8px 20px rgba(124, 58, 237, 0.4)'
            }}>
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="mono" style={{ fontSize: '0.88rem', fontWeight: 800, color: '#c084fc', background: 'rgba(168, 85, 247, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                  {student.regNo}
                </span>
                <span className="badge badge-teal">Verified Day Scholar</span>
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                {student.name}
              </h1>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {student.department === 'IT' ? 'Information Technology' : student.department} • {student.year} (Section {student.section})
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Campus Transit
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginTop: '2px' }}>
              <Bus size={15} style={{ color: '#a855f7' }} /> {student.transportMode}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Boarding: {student.busStop}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Ingress / Egress Status */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.8))' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Clock size={18} style={{ color: '#38bdf8' }} />
            Today's Movement Status (Monday, October 05, 2026)
          </h3>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
            Threshold: {rules.lateAfterTime} AM
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {/* Morning Entry */}
          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Morning Entry Scan
            </div>
            <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: todayRecord?.entryTime ? '#10b981' : 'var(--text-muted)', marginTop: '4px' }}>
              {todayRecord?.entryTime ? `${todayRecord.entryTime} AM` : 'Not Recorded'}
            </div>
            <div style={{ marginTop: '6px' }}>
              {todayRecord?.entryTime ? (
                <span className={`badge ${todayRecord.classification?.entryClass.badgeClass}`}>
                  {todayRecord.classification?.entryClass.status === 'On Time' ? '✓ Punctual' : '⚠️ Late Arrival'}
                </span>
              ) : (
                <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>Scan pending at South Gate</span>
              )}
            </div>
          </div>

          {/* Evening Exit */}
          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Evening Exit Scan
            </div>
            <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: todayRecord?.exitTime ? '#06b6d4' : (todayRecord?.entryTime ? '#f43f5e' : 'var(--text-muted)'), marginTop: '4px' }}>
              {todayRecord?.exitTime ? `${todayRecord.exitTime} PM` : (todayRecord?.entryTime ? 'Missing Exit' : 'Not Recorded')}
            </div>
            <div style={{ marginTop: '6px' }}>
              {todayRecord?.exitTime ? (
                <span className="badge badge-teal">✓ Exit Recorded</span>
              ) : todayRecord?.entryTime ? (
                <span className="badge badge-rose">⚠️ Tap Exit at Gate</span>
              ) : (
                <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>Awaiting dismissal bell</span>
              )}
            </div>
          </div>

          {/* Current Day Status */}
          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Overall Day Status
            </div>
            <div style={{ marginTop: '6px' }}>
              {todayRecord ? (
                <span className={`badge ${todayRecord.statusBadge}`} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                  <span className="badge-dot" /> {todayRecord.statusLabel}
                </span>
              ) : (
                <span className="badge badge-neutral" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                  Not Entered
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Gate: {rules.activeGate}
            </div>
          </div>
        </div>
      </div>

      {/* Punctuality Statistics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="card" style={{ borderLeft: `4px solid ${scoreColor}` }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Punctuality Score
          </div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: scoreColor, marginTop: '2px' }}>
            {profile.punctualityScore}%
          </div>
          <div style={{ fontSize: '0.72rem', color: scoreColor, fontWeight: 600 }}>{scoreBadge}</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Days
          </div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {profile.totalRecordedDays}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Recorded Days</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            On-Time Days
          </div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
            {profile.onTimeDays}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981' }}>Punctual</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Late Arrivals
          </div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
            {profile.lateArrivals}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#f59e0b' }}>Past 08:30 AM</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Avg Arrival Time
          </div>
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
            {profile.avgEntryTime}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Morning Average</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Avg Exit Time
          </div>
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#06b6d4', marginTop: '2px' }}>
            {profile.avgExitTime}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Evening Average</div>
        </div>
      </div>

      {/* Arrival Trend Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <StudentArrivalTrendChart arrivalTrend={profile.arrivalTrend} />
      </div>

      {/* Personal Attendance History Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className="card-title">
            <Calendar size={18} style={{ color: '#3b82f6' }} />
            Personal Entry & Exit History (Past 30 Days)
          </h3>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Showing {profile.history.length} verified campus records
          </span>
        </div>

        <div className="table-container" style={{ maxHeight: '400px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Morning Entry</th>
                <th>Evening Exit</th>
                <th>Capture Source</th>
                <th>Classified Status</th>
                <th>Official Remark</th>
              </tr>
            </thead>
            <tbody>
              {profile.history.map(rec => {
                const dateObj = new Date(rec.date + 'T12:00:00');
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });

                return (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formattedDate}
                    </td>
                    <td className="mono" style={{ fontWeight: 600, color: rec.classification?.entryClass.status === 'On Time' ? '#10b981' : '#f59e0b' }}>
                      {rec.entryTime ? `${rec.entryTime} AM` : '—'}
                    </td>
                    <td className="mono">
                      {rec.exitTime ? `${rec.exitTime} PM` : (rec.classification?.exitClass.status === 'Missing Exit' ? <span style={{ color: '#f43f5e' }}>Missing Exit</span> : '—')}
                    </td>
                    <td>
                      <HardwareSourceBadge source={rec.entrySource} />
                    </td>
                    <td>
                      <span className={`badge ${rec.statusBadge}`}>
                        <span className="badge-dot" /> {rec.statusLabel}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {rec.earlyExitReason || rec.adminNote || 'Verified Gate Record'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
