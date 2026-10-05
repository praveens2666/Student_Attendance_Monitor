import React, { useState } from 'react';
import { minutesToTime } from '../services/classificationEngine';

export default function StudentArrivalTrendChart({ arrivalTrend = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!arrivalTrend || arrivalTrend.length === 0) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No trend data recorded for this student.</div>;
  }

  // Filter valid points with entryMinutes
  const points = arrivalTrend.filter(p => p.entryMinutes != null);
  if (points.length === 0) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No entry timestamps recorded.</div>;
  }

  // Y axis scale: min 480 (8:00 AM) to max 560 (9:20 AM)
  const minY = 480; // 08:00 AM
  const maxY = 560; // 09:20 AM
  const lateThresholdMin = 510; // 08:30 AM

  const chartHeight = 140;
  const chartWidth = 600;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 25;

  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const getY = (min) => {
    const clamped = Math.max(minY, Math.min(maxY, min));
    return padTop + innerH - ((clamped - minY) / (maxY - minY)) * innerH;
  };

  const getX = (index) => {
    if (points.length <= 1) return padLeft + innerW / 2;
    return padLeft + (index / (points.length - 1)) * innerW;
  };

  // Generate SVG path line
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.entryMinutes)}`).join(' ');
  const lateLineY = getY(lateThresholdMin);

  return (
    <div style={{ position: 'relative', width: '100%', marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Historical Morning Arrival Time Tracking
        </span>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> On Time (≤ 08:30)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /> Late (&gt; 08:30)
          </span>
        </div>
      </div>

      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
        {/* Y Axis Guide Lines */}
        <line x1={padLeft} y1={getY(480)} x2={chartWidth - padRight} y2={getY(480)} stroke="rgba(255,255,255,0.06)" />
        <text x={padLeft - 8} y={getY(480) + 3} fill="#64748b" fontSize="9" textAnchor="end">08:00</text>

        <line x1={padLeft} y1={getY(510)} x2={chartWidth - padRight} y2={getY(510)} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x={padLeft - 8} y={getY(510) + 3} fill="#f59e0b" fontSize="9" fontWeight="700" textAnchor="end">08:30</text>

        <line x1={padLeft} y1={getY(540)} x2={chartWidth - padRight} y2={getY(540)} stroke="rgba(255,255,255,0.06)" />
        <text x={padLeft - 8} y={getY(540) + 3} fill="#64748b" fontSize="9" textAnchor="end">09:00</text>

        {/* Path line */}
        <path d={pathD} fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.6" />

        {/* Data points */}
        {points.map((p, idx) => {
          const cx = getX(idx);
          const cy = getY(p.entryMinutes);
          const isLate = p.entryMinutes > lateThresholdMin;
          const isHovered = hoveredPoint === idx;

          return (
            <g key={p.date} onMouseEnter={() => setHoveredPoint(idx)} onMouseLeave={() => setHoveredPoint(null)} style={{ cursor: 'pointer' }}>
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                fill={isLate ? '#f59e0b' : '#10b981'}
                stroke="#0f172a"
                strokeWidth="1.5"
                filter={isHovered ? 'drop-shadow(0 0 6px rgba(255,255,255,0.6))' : undefined}
              />
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredPoint !== null && points[hoveredPoint] && (
        <div style={{
          position: 'absolute',
          top: '30px',
          left: `${(hoveredPoint / (points.length - 1)) * 80 + 10}%`,
          background: '#090d16',
          border: '1px solid var(--border-medium)',
          padding: '6px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.74rem',
          pointerEvents: 'none',
          boxShadow: 'var(--shadow-md)',
          zIndex: 10,
          whiteSpace: 'nowrap'
        }}>
          <div style={{ color: 'var(--text-muted)' }}>{points[hoveredPoint].date}</div>
          <div style={{ fontWeight: 700, color: points[hoveredPoint].entryMinutes > 510 ? '#f59e0b' : '#10b981' }}>
            Entry: {minutesToTime(points[hoveredPoint].entryMinutes)}
            {points[hoveredPoint].entryMinutes > 510 ? ' (Late)' : ' (On Time)'}
          </div>
        </div>
      )}
    </div>
  );
}
