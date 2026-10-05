import React, { useState } from 'react';
import { TrendingUp, Users, Clock } from 'lucide-react';

export default function DailyTrendChart({ dailyTrends = [] }) {
  const [metric, setMetric] = useState('late'); // 'late' | 'punctuality' | 'entry'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!dailyTrends || dailyTrends.length === 0) {
    return <div className="card">No trend data available.</div>;
  }

  const chartWidth = 750;
  const chartHeight = 200;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 35;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  // Metric settings
  let values = [];
  let yLabel = '';
  let lineColor = '#f59e0b';
  let isPercentage = false;

  if (metric === 'late') {
    values = dailyTrends.map(d => d.totalLate);
    yLabel = 'Late Arrivals';
    lineColor = '#f59e0b';
  } else if (metric === 'punctuality') {
    values = dailyTrends.map(d => d.punctualityPercent);
    yLabel = 'Punctuality %';
    lineColor = '#10b981';
    isPercentage = true;
  } else {
    values = dailyTrends.map(d => d.totalEntered);
    yLabel = 'Total Entries';
    lineColor = '#3b82f6';
  }

  const maxVal = isPercentage ? 100 : Math.max(...values, 10);
  const minVal = isPercentage ? 60 : 0;

  const getY = (v) => {
    const norm = (v - minVal) / (maxVal - minVal);
    return padTop + innerH - norm * innerH;
  };

  const getX = (idx) => {
    if (dailyTrends.length <= 1) return padLeft + innerW / 2;
    return padLeft + (idx / (dailyTrends.length - 1)) * innerW;
  };

  const pathD = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`).join(' ');
  const areaD = `${pathD} L ${getX(values.length - 1)} ${padTop + innerH} L ${getX(0)} ${padTop + innerH} Z`;

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 className="card-title">
            <TrendingUp size={18} style={{ color: lineColor }} />
            Campus Punctuality & Movement Trend Analysis
          </h3>
          <p className="card-subtitle">
            Longitudinal evaluation answering: Are students becoming more punctual?
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-input)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button 
            className={`btn btn-sm ${metric === 'late' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMetric('late')}
          >
            Late Arrivals
          </button>
          <button 
            className={`btn btn-sm ${metric === 'punctuality' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMetric('punctuality')}
          >
            Punctuality %
          </button>
          <button 
            className={`btn btn-sm ${metric === 'entry' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMetric('entry')}
          >
            Entry Volume
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', height: chartHeight, margin: '10px 0' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={`grad-${metric}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padLeft} y1={getY(minVal)} x2={chartWidth - padRight} y2={getY(minVal)} stroke="rgba(255,255,255,0.08)" />
          <line x1={padLeft} y1={getY((minVal + maxVal) / 2)} x2={chartWidth - padRight} y2={getY((minVal + maxVal) / 2)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1={padLeft} y1={getY(maxVal)} x2={chartWidth - padRight} y2={getY(maxVal)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

          {/* Y Axis Labels */}
          <text x={padLeft - 8} y={getY(minVal) + 4} fill="#64748b" fontSize="9" textAnchor="end">{minVal}{isPercentage ? '%' : ''}</text>
          <text x={padLeft - 8} y={getY((minVal + maxVal) / 2) + 4} fill="#64748b" fontSize="9" textAnchor="end">{Math.round((minVal + maxVal) / 2)}{isPercentage ? '%' : ''}</text>
          <text x={padLeft - 8} y={getY(maxVal) + 4} fill="#64748b" fontSize="9" textAnchor="end">{maxVal}{isPercentage ? '%' : ''}</text>

          {/* Area fill */}
          <path d={areaD} fill={`url(#grad-${metric})`} />

          {/* Main trend line */}
          <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points & X-Labels */}
          {dailyTrends.map((d, idx) => {
            const cx = getX(idx);
            const cy = getY(values[idx]);
            const isHovered = hoveredIndex === idx;
            const showLabel = idx % Math.ceil(dailyTrends.length / 8) === 0 || idx === dailyTrends.length - 1;

            return (
              <g key={d.date} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 3}
                  fill={lineColor}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  filter={isHovered ? 'drop-shadow(0 0 6px rgba(255,255,255,0.7))' : undefined}
                />
                {showLabel && (
                  <text x={cx} y={chartHeight - 12} fill="#64748b" fontSize="9" textAnchor="middle">
                    {d.shortDate}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover info banner */}
        {hoveredIndex !== null && dailyTrends[hoveredIndex] && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '20px',
            background: 'var(--bg-modal)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontSize: '0.78rem',
            boxShadow: 'var(--shadow-md)',
            pointerEvents: 'none'
          }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {dailyTrends[hoveredIndex].shortDate} ({dailyTrends[hoveredIndex].dayName})
            </div>
            <div style={{ color: lineColor, fontWeight: 600 }}>
              {yLabel}: {values[hoveredIndex]}{isPercentage ? '%' : ''}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              Avg Arrival: {dailyTrends[hoveredIndex].avgEntryTime} • Entered: {dailyTrends[hoveredIndex].totalEntered}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
