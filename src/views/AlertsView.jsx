import React, { useState, useMemo } from 'react';
import { BellRing, AlertTriangle, Clock, UserX, TrendingUp, CheckCircle, ShieldAlert, ArrowRight, Eye, Check } from 'lucide-react';
import { generateSystemAlerts } from '../services/analyticsEngine';

export default function AlertsView({
  allStudents,
  allRecords,
  rules,
  onOpenStudentProfile,
  onOpenMissingExits,
  onNavigateToView
}) {
  const [filterType, setFilterType] = useState('ALL');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState([]);

  const alerts = useMemo(() => {
    return generateSystemAlerts(allStudents, allRecords, rules);
  }, [allStudents, allRecords, rules]);

  const handleAcknowledge = (alertId) => {
    setAcknowledgedAlerts(prev => [...prev, alertId]);
  };

  const filteredAlerts = alerts.filter(a => {
    if (acknowledgedAlerts.includes(a.id)) return false;
    if (filterType !== 'ALL' && a.priority !== filterType) return false;
    return true;
  });

  return (
    <div className="view-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <BellRing size={26} style={{ color: '#ef4444' }} />
            Institutional Punctuality Alerts & Anomaly Feed
          </h1>
          <p>
            Real-time threshold triggers for gate irregularities, missing departures, and chronic tardiness
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn btn-sm ${filterType === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('ALL')}
          >
            All Alerts ({alerts.length - acknowledgedAlerts.length})
          </button>
          <button 
            className={`btn btn-sm ${filterType === 'high' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('high')}
          >
            High Priority
          </button>
          <button 
            className={`btn btn-sm ${filterType === 'medium' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('medium')}
          >
            Medium Priority
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAlerts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <CheckCircle size={36} style={{ color: '#10b981', margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              All Institutional Alerts Acknowledged
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              No unresolved movement discrepancies or threshold anomalies at this moment.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isHigh = alert.priority === 'high';
            const borderColor = isHigh ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)';
            const bgGradient = isHigh 
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), var(--bg-card))' 
              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), var(--bg-card))';

            return (
              <div 
                key={alert.id}
                className="card"
                style={{
                  background: bgGradient,
                  border: `1px solid ${borderColor}`,
                  borderLeft: `5px solid ${isHigh ? '#ef4444' : '#f59e0b'}`,
                  padding: '18px 22px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      background: isHigh ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: isHigh ? '#ef4444' : '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <AlertTriangle size={20} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className={`badge ${isHigh ? 'badge-danger' : 'badge-warning'}`}>
                          {alert.priority} PRIORITY
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {alert.timestamp}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {alert.title}
                      </h3>

                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '800px' }}>
                        {alert.message}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <div className="mono" style={{ fontSize: '1rem', fontWeight: 800, color: isHigh ? '#f87171' : '#fbbf24' }}>
                      {alert.stat}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {alert.actionType === 'NAV_MISSING_EXITS' && (
                        <button className="btn btn-primary btn-sm" onClick={onOpenMissingExits}>
                          {alert.actionLabel} <ArrowRight size={13} />
                        </button>
                      )}

                      {alert.actionType === 'VIEW_STUDENT' && alert.studentId && (
                        <button className="btn btn-primary btn-sm" onClick={() => onOpenStudentProfile(alert.studentId)}>
                          <Eye size={13} /> {alert.actionLabel}
                        </button>
                      )}

                      {alert.actionType === 'NAV_PUNCTUALITY' && (
                        <button className="btn btn-primary btn-sm" onClick={() => onNavigateToView('punctuality')}>
                          {alert.actionLabel} <ArrowRight size={13} />
                        </button>
                      )}

                      {alert.actionType === 'NAV_ANALYTICS' && (
                        <button className="btn btn-primary btn-sm" onClick={() => onNavigateToView('analytics')}>
                          {alert.actionLabel} <ArrowRight size={13} />
                        </button>
                      )}

                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAcknowledge(alert.id)}
                        title="Mark as reviewed"
                      >
                        <Check size={13} /> Acknowledge
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
