import React from 'react';

export default function KpiCard({
  label,
  value,
  sublabel,
  icon: Icon,
  variant = 'default',
  iconColor = '#3b82f6',
  iconBg = 'rgba(59, 130, 246, 0.12)',
  onClick,
  badgeText
}) {
  const highlightClass = variant !== 'default' ? `highlight-${variant}` : '';

  return (
    <div 
      className={`kpi-card ${highlightClass}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      title={onClick ? 'Click to inspect details' : undefined}
    >
      <div className="kpi-header">
        <span className="kpi-label">{label}</span>
        {Icon && (
          <div className="kpi-icon-wrap" style={{ background: iconBg, color: iconColor }}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="kpi-value mono">
        {value}
        {badgeText && (
          <span style={{ fontSize: '0.72rem', marginLeft: '8px', verticalAlign: 'middle' }} className={`badge badge-${variant}`}>
            {badgeText}
          </span>
        )}
      </div>

      {sublabel && (
        <div className="kpi-footer">
          {sublabel}
        </div>
      )}
    </div>
  );
}
