import React, { useState } from 'react';
import { Sliders, Save, RotateCcw, Shield, Clock, AlertTriangle, CheckCircle, Bell } from 'lucide-react';

export default function SettingsView({ rules, onSaveRules, onResetData, auditLogs = [] }) {
  const [formRules, setFormRules] = useState({ ...rules });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveRules(formRules);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleReset = () => {
    if (window.confirm('Reset attendance rules to initial college defaults?')) {
      const defaultRules = {
        campusName: 'National Institute of Engineering & Technology',
        campusCode: 'NIET-CAMPUS-01',
        activeGate: 'Gate 02 - South Day Scholar Portal',
        academicTerm: 'Autumn Semester 2026',
        normalEntryTime: '08:30',
        lateAfterTime: '08:30',
        veryLateAfterTime: '09:00',
        normalExitTime: '17:00',
        earlyExitBeforeTime: '17:00',
        gracePeriodMinutes: 5,
        maxAllowedLatePerMonth: 3,
        autoFlagMissingExitHours: 1.5,
        notifyParentsOnVeryLate: true,
        notifyHODOnConsecutiveLate: true,
        strictGateCheckEnabled: true
      };
      setFormRules(defaultRules);
      onSaveRules(defaultRules);
    }
  };

  return (
    <div className="view-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Sliders size={26} style={{ color: '#3b82f6' }} />
            Configurable College Rules & Operational Policies
          </h1>
          <p>
            Institutional gate thresholds dynamically drive real-time classification across all student records
          </p>
        </div>

        <div className="page-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>
            <RotateCcw size={14} /> Reset Rule Defaults
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#34d399',
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle size={18} />
          <div>
            <strong>Rules updated successfully!</strong> The classification engine has dynamically re-evaluated all student records against the new criteria.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="dashboard-grid-2">
          {/* Card 1: Entry & Late Arrival Timing Rules */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Clock size={18} style={{ color: '#3b82f6' }} />
                Morning Entry & Late Arrival Rules
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Normal Entry Time (Target)
                </label>
                <input
                  type="time"
                  className="filter-input"
                  style={{ width: '100%', fontSize: '1rem', padding: '8px 12px' }}
                  value={formRules.normalEntryTime}
                  onChange={e => setFormRules({ ...formRules, normalEntryTime: e.target.value })}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Official campus assembly and first lecture bell</span>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f59e0b', display: 'block', marginBottom: '6px' }}>
                  Late Arrival After (Threshold)
                </label>
                <input
                  type="time"
                  className="filter-input"
                  style={{ width: '100%', fontSize: '1rem', padding: '8px 12px' }}
                  value={formRules.lateAfterTime}
                  onChange={e => setFormRules({ ...formRules, lateAfterTime: e.target.value })}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Entries past this time are classified as Late Arrival</span>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ef4444', display: 'block', marginBottom: '6px' }}>
                  Very Late Arrival After
                </label>
                <input
                  type="time"
                  className="filter-input"
                  style={{ width: '100%', fontSize: '1rem', padding: '8px 12px' }}
                  value={formRules.veryLateAfterTime}
                  onChange={e => setFormRules({ ...formRules, veryLateAfterTime: e.target.value })}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Entries past this time trigger severe attendance disciplinary warning</span>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Buffer Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  className="filter-input"
                  style={{ width: '100%', padding: '8px 12px' }}
                  value={formRules.gracePeriodMinutes}
                  onChange={e => setFormRules({ ...formRules, gracePeriodMinutes: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="30"
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Allowable transit delay before marking late (e.g. 5 minutes)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Evening Exit & Missing Departure Rules */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Clock size={18} style={{ color: '#06b6d4' }} />
                Evening Exit & Departure Rules
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Normal Exit Time (End of Academic Day)
                </label>
                <input
                  type="time"
                  className="filter-input"
                  style={{ width: '100%', fontSize: '1rem', padding: '8px 12px' }}
                  value={formRules.normalExitTime}
                  onChange={e => setFormRules({ ...formRules, normalExitTime: e.target.value })}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Regular evening gate opening for day scholar dismissal</span>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ea580c', display: 'block', marginBottom: '6px' }}>
                  Early Exit Classified Before
                </label>
                <input
                  type="time"
                  className="filter-input"
                  style={{ width: '100%', fontSize: '1rem', padding: '8px 12px' }}
                  value={formRules.earlyExitBeforeTime}
                  onChange={e => setFormRules({ ...formRules, earlyExitBeforeTime: e.target.value })}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Departures prior to this time require approved gate pass or medical permit</span>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f43f5e', display: 'block', marginBottom: '6px' }}>
                  Auto-Flag Missing Exit Threshold (Hours past normal exit)
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="filter-input"
                  style={{ width: '100%', padding: '8px 12px' }}
                  value={formRules.autoFlagMissingExitHours}
                  onChange={e => setFormRules({ ...formRules, autoFlagMissingExitHours: parseFloat(e.target.value) || 1.0 })}
                  min="0.5"
                  max="6"
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Trigger critical security alert if no exit scan after this buffer</span>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Monthly Late Arrival Warning Limit
                </label>
                <input
                  type="number"
                  className="filter-input"
                  style={{ width: '100%', padding: '8px 12px' }}
                  value={formRules.maxAllowedLatePerMonth}
                  onChange={e => setFormRules({ ...formRules, maxAllowedLatePerMonth: parseInt(e.target.value) || 3 })}
                  min="1"
                  max="15"
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Automatic parent notification triggered when late count exceeds this limit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Institutional Metadata & Notifications */}
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Shield size={18} style={{ color: '#10b981' }} />
              Campus Metadata & Automated Administrative Notifications
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Institution Name
              </label>
              <input
                type="text"
                className="filter-input"
                style={{ width: '100%' }}
                value={formRules.campusName}
                onChange={e => setFormRules({ ...formRules, campusName: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Active Gate Portal
              </label>
              <input
                type="text"
                className="filter-input"
                style={{ width: '100%' }}
                value={formRules.activeGate}
                onChange={e => setFormRules({ ...formRules, activeGate: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Academic Term
              </label>
              <input
                type="text"
                className="filter-input"
                style={{ width: '100%' }}
                value={formRules.academicTerm}
                onChange={e => setFormRules({ ...formRules, academicTerm: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={formRules.notifyParentsOnVeryLate}
                onChange={e => setFormRules({ ...formRules, notifyParentsOnVeryLate: e.target.checked })}
              />
              <span>Send automated SMS notice to guardian on <strong>Very Late (&gt; 09:00 AM)</strong></span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={formRules.notifyHODOnConsecutiveLate}
                onChange={e => setFormRules({ ...formRules, notifyHODOnConsecutiveLate: e.target.checked })}
              />
              <span>Flag repeat offenders to Department Head after 3 consecutive late arrivals</span>
            </label>
          </div>
        </div>

        {/* Submit Bar */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="submit" className="btn btn-primary btn-lg">
            <Save size={16} /> Save & Apply Institutional Rules
          </button>
        </div>
      </form>
    </div>
  );
}
