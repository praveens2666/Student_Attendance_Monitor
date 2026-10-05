import React from 'react';
import { Building2, Award, ArrowUpRight } from 'lucide-react';

export default function DepartmentComparisonChart({ departmentData, onSelectDepartment }) {
  if (!departmentData || departmentData.length === 0) {
    return <div className="card">No department data available.</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <Building2 size={18} style={{ color: '#06b6d4' }} />
            Department Punctuality & Late Rate Benchmarking
          </h3>
          <p className="card-subtitle">
            Cross-department punctuality index, late incidence percentage and average arrival times
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
        {departmentData.map((d, index) => {
          const isTop = index === 0;
          return (
            <div 
              key={d.department}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                transition: 'all 0.16s ease'
              }}
              className="dept-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ 
                    width: '26px', 
                    height: '26px', 
                    borderRadius: '6px', 
                    background: isTop ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: isTop ? '#10b981' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    {isTop ? <Award size={14} /> : `#${index + 1}`}
                  </span>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc' }}>
                      {d.department}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      ({d.totalStudents} day scholars • {d.totalEntries} entries)
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Entry: </span>
                    <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {d.avgEntryTime}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: '#f87171', textTransform: 'uppercase' }}>Late Rate: </span>
                    <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171' }}>
                      {d.lateRatePercent}%
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '70px' }}>
                    <span className="mono" style={{ 
                      fontSize: '1.15rem', 
                      fontWeight: 800, 
                      color: d.punctualityPercent >= 90 ? '#10b981' : (d.punctualityPercent >= 80 ? '#38bdf8' : '#f59e0b') 
                    }}>
                      {d.punctualityPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Dual Layer (Punctual vs Late) */}
              <div style={{ 
                height: '8px', 
                background: 'rgba(255,255,255,0.06)', 
                borderRadius: 'var(--radius-full)', 
                overflow: 'hidden', 
                display: 'flex' 
              }}>
                <div 
                  style={{ 
                    width: `${d.punctualityPercent}%`, 
                    background: 'linear-gradient(90deg, #10b981, #059669)', 
                    borderRadius: 'var(--radius-full) 0 0 var(--radius-full)',
                    transition: 'width 0.4s ease'
                  }} 
                  title={`Punctual: ${d.punctualityPercent}%`}
                />
                <div 
                  style={{ 
                    width: `${d.lateRatePercent}%`, 
                    background: '#f59e0b',
                    transition: 'width 0.4s ease'
                  }} 
                  title={`Late: ${d.lateRatePercent}%`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
