import React, { useMemo } from 'react';
import { X, User, Phone, Mail, Bus, Clock, Calendar, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight, Award, ShieldAlert } from 'lucide-react';
import StudentArrivalTrendChart from './StudentArrivalTrendChart';
import HardwareSourceBadge from './HardwareSourceBadge';
import { calculateStudentProfile } from '../services/analyticsEngine';

export default function StudentProfileModal({ studentId, allStudents, allRecords, rules, onClose, onSwitchToStudentRole }) {
  const profile = useMemo(() => {
    if (!studentId) return null;
    return calculateStudentProfile(studentId, allStudents, allRecords, rules);
  }, [studentId, allStudents, allRecords, rules]);

  if (!profile) return null;

  const { student, totalRecordedDays, onTimeDays, lateArrivals, veryLateArrivals, totalLate, earlyExits, missingExits, punctualityScore, currentStreak, avgEntryTime, avgExitTime, history, arrivalTrend } = profile;

  // Score color
  let scoreColor = '#10b981';
  let scoreBadge = 'High Punctuality';
  if (punctualityScore < 75) {
    scoreColor = '#ef4444';
    scoreBadge = 'Critical Attention';
  } else if (punctualityScore < 85) {
    scoreColor = '#f59e0b';
    scoreBadge = 'Moderate Late Rate';
  } else if (punctualityScore < 95) {
    scoreColor = '#38bdf8';
    scoreBadge = 'Standard Compliance';
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.25rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
            }}>
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#60a5fa', background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  {student.regNo}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  STUDENT PROFILE
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                {student.name}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {student.department === 'IT' ? 'Information Technology' : student.department} — {student.year} (Sec {student.section})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onSwitchToStudentRole(student)}
              title="Preview Student Portal Experience"
            >
              <User size={14} /> Open As Student
            </button>
            <button 
              onClick={onClose} 
              style={{ color: 'var(--text-muted)', padding: '6px', borderRadius: '6px' }}
              className="btn-secondary"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Metadata chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Phone size={14} style={{ color: '#38bdf8' }} /> Student: {student.contact}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Phone size={14} style={{ color: '#f59e0b' }} /> Guardian: {student.parentContact}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Bus size={14} style={{ color: '#a855f7' }} /> Transit: {student.transportMode} ({student.busStop})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
              <Award size={14} style={{ color: '#10b981' }} /> Current Streak: <strong style={{ color: '#10b981' }}>{currentStreak} days</strong>
            </span>
          </div>

          {/* Statistical Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {/* Punctuality Score Card */}
            <div style={{ 
              gridColumn: 'span 2', 
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.8))', 
              padding: '14px 18px', 
              borderRadius: 'var(--radius-lg)', 
              border: `1px solid ${scoreColor}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Punctuality Score
                </div>
                <div className="mono" style={{ fontSize: '2.2rem', fontWeight: 800, color: scoreColor, lineHeight: 1.1 }}>
                  {punctualityScore}%
                </div>
                <div style={{ fontSize: '0.74rem', color: scoreColor, fontWeight: 600, marginTop: '2px' }}>
                  {scoreBadge}
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div>Formula:</div>
                <code style={{ color: '#93c5fa', fontSize: '0.74rem' }}>On-Time / Total × 100</code>
                <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>{onTimeDays} / {totalRecordedDays} days</div>
              </div>
            </div>

            <div className="kpi-card" style={{ padding: '12px 14px' }}>
              <span className="kpi-label">Recorded Days</span>
              <span className="kpi-value mono" style={{ fontSize: '1.4rem' }}>{totalRecordedDays}</span>
              <span className="kpi-footer">Active Semester</span>
            </div>

            <div className="kpi-card" style={{ padding: '12px 14px', borderLeft: '3px solid #10b981' }}>
              <span className="kpi-label">On-Time Days</span>
              <span className="kpi-value mono" style={{ fontSize: '1.4rem', color: '#10b981' }}>{onTimeDays}</span>
              <span className="kpi-footer">Normal Entries</span>
            </div>

            <div className="kpi-card" style={{ padding: '12px 14px', borderLeft: '3px solid #f59e0b' }}>
              <span className="kpi-label">Late Arrivals</span>
              <span className="kpi-value mono" style={{ fontSize: '1.4rem', color: '#f59e0b' }}>{lateArrivals}</span>
              <span className="kpi-footer">&gt; {rules.lateAfterTime} AM</span>
            </div>

            <div className="kpi-card" style={{ padding: '12px 14px', borderLeft: '3px solid #ef4444' }}>
              <span className="kpi-label">Very Late</span>
              <span className="kpi-value mono" style={{ fontSize: '1.4rem', color: '#ef4444' }}>{veryLateArrivals}</span>
              <span className="kpi-footer">&gt; {rules.veryLateAfterTime} AM</span>
            </div>

            <div className="kpi-card" style={{ padding: '12px 14px', borderLeft: '3px solid #ea580c' }}>
              <span className="kpi-label">Early Exits</span>
              <span className="kpi-value mono" style={{ fontSize: '1.4rem', color: '#ea580c' }}>{earlyExits}</span>
              <span className="kpi-footer">&lt; {rules.earlyExitBeforeTime} PM</span>
            </div>

            <div className="kpi-card" style={{ padding: '12px 14px', borderLeft: '3px solid #f43f5e' }}>
              <span className="kpi-label">Missing Exits</span>
              <span className="kpi-value mono" style={{ fontSize: '1.4rem', color: '#f43f5e' }}>{missingExits}</span>
              <span className="kpi-footer">Unrecorded exit</span>
            </div>

            <div className="kpi-card" style={{ padding: '12px 14px' }}>
              <span className="kpi-label">Avg Entry</span>
              <span className="kpi-value mono" style={{ fontSize: '1.3rem' }}>{avgEntryTime}</span>
              <span className="kpi-footer">Arrival Mean</span>
            </div>

            <div className="kpi-card" style={{ padding: '12px 14px' }}>
              <span className="kpi-label">Avg Exit</span>
              <span className="kpi-value mono" style={{ fontSize: '1.3rem' }}>{avgExitTime}</span>
              <span className="kpi-footer">Departure Mean</span>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="card" style={{ marginBottom: '22px' }}>
            <StudentArrivalTrendChart arrivalTrend={arrivalTrend} />
          </div>

          {/* Historical Table */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Historical Entry & Exit Log (Last 30 Days)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Showing {history.length} recorded entries
              </span>
            </div>

            <div className="table-container" style={{ maxHeight: '280px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Morning Entry</th>
                    <th>Evening Exit</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Notes / Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(rec => {
                    const dateObj = new Date(rec.date + 'T12:00:00');
                    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });

                    return (
                      <tr key={rec.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {formattedDate}
                        </td>
                        <td className="mono" style={{ color: rec.classification.entryClass.status === 'On Time' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                          {rec.entryTime ? `${rec.entryTime} AM` : '—'}
                        </td>
                        <td className="mono">
                          {rec.exitTime ? `${rec.exitTime} PM` : (rec.classification.exitClass.status === 'Missing Exit' ? <span style={{ color: '#f43f5e' }}>Missing</span> : '—')}
                        </td>
                        <td>
                          <HardwareSourceBadge source={rec.entrySource} />
                        </td>
                        <td>
                          <span className={`badge ${rec.statusBadge}`}>
                            <span className="badge-dot" />
                            {rec.statusLabel}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {rec.earlyExitReason || rec.adminNote || (rec.classification.entryClass.diffMinutes > 0 ? `Late by +${rec.classification.entryClass.diffMinutes} mins` : 'Normal verification')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={() => alert(`Guardian Notice sent to parent of ${student.name} (${student.parentContact}) via College SMS Gateway.`)}
          >
            <Mail size={14} /> Send Guardian Notice
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
