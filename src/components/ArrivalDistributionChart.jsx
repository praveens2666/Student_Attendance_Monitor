import React, { useState } from 'react';
import { Clock, TrendingUp, AlertCircle, Sparkles, Filter } from 'lucide-react';

export default function ArrivalDistributionChart({ distributionData, rules, selectedSlot, onSelectSlot }) {
  const [hoveredBin, setHoveredBin] = useState(null);

  if (!distributionData || !distributionData.bins) {
    return <div className="card">Loading arrival distribution...</div>;
  }

  const { bins, totalCount, avgArrival, earliestArrival, latestArrival, peakArrivalPeriod } = distributionData;
  const maxCount = Math.max(...bins.map(b => b.count), 1);

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 className="card-title">
            <Clock size={18} style={{ color: '#3b82f6' }} />
            Today's Arrival Distribution & Congestion Profile
          </h3>
          <p className="card-subtitle">
            Temporal distribution of {totalCount} student gate entries across 15-minute intervals • Click any bar to isolate time cohort
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {selectedSlot && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onSelectSlot && onSelectSlot(null)}
              style={{ fontSize: '0.72rem', borderColor: '#3b82f6', color: '#93c5fd' }}
            >
              <Filter size={11} /> Clear Slot Filter ({selectedSlot})
            </button>
          )}

          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            Cutoff: {rules.lateAfterTime} AM
          </span>
          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
            Peak: {peakArrivalPeriod}
          </span>
        </div>
      </div>

      {/* SVG Bar Chart with Click Interaction */}
      <div style={{ position: 'relative', margin: '20px 0 10px 0', height: '180px' }}>
        <svg width="100%" height="100%" viewBox="0 0 700 170" preserveAspectRatio="none">
          {/* Horizontal grid lines */}
          <line x1="40" y1="20" x2="680" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="40" y1="70" x2="680" y2="70" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="40" y1="120" x2="680" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          
          {/* Y Axis Baseline */}
          <line x1="40" y1="140" x2="680" y2="140" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

          {/* 08:30 Late Cutoff Threshold Vertical Marker between bin 2 and 3 */}
          <line x1="360" y1="10" x2="360" y2="140" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
          <text x="365" y="24" fill="#f59e0b" fontSize="10" fontWeight="700">LATE CUTOFF ({rules.lateAfterTime})</text>

          {/* Bars */}
          {bins.map((b, idx) => {
            const barWidth = 75;
            const x = 60 + idx * 102;
            const barHeight = maxCount > 0 ? (b.count / maxCount) * 115 : 0;
            const y = 140 - barHeight;
            const isHovered = hoveredBin === idx;
            const isSelected = selectedSlot === b.slot;
            const isPeak = b.count === maxCount && maxCount > 0;

            let fill = b.isLate ? '#f59e0b' : '#10b981';
            if (b.slot.includes('> 09:00')) fill = '#ef4444';
            if (isPeak) fill = '#0ea5e9';
            if (isSelected) fill = '#3b82f6';

            return (
              <g 
                key={b.slot} 
                onClick={() => onSelectSlot && onSelectSlot(isSelected ? null : b.slot)}
                onMouseEnter={() => setHoveredBin(idx)}
                onMouseLeave={() => setHoveredBin(null)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="5"
                  fill={fill}
                  opacity={isSelected ? 1 : (isHovered ? 0.95 : 0.82)}
                  stroke={isSelected ? '#fff' : (isHovered ? 'rgba(255,255,255,0.5)' : 'none')}
                  strokeWidth={isSelected ? '2' : '1'}
                  filter={isSelected || isPeak ? 'drop-shadow(0px 0px 8px rgba(14, 165, 233, 0.6))' : undefined}
                />

                {/* Count text on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={Math.max(y - 6, 16)}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {b.count}
                </text>

                {/* Percentage text inside bar if tall enough */}
                {barHeight > 30 && (
                  <text
                    x={x + barWidth / 2}
                    y={y + 18}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.9)"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {b.percentage}%
                  </text>
                )}

                {/* X axis slot label */}
                <text
                  x={x + barWidth / 2}
                  y="156"
                  textAnchor="middle"
                  fill={isSelected ? '#60a5fa' : (isHovered ? '#f8fafc' : '#94a3b8')}
                  fontSize="10"
                  fontWeight={isSelected || isPeak ? '700' : '500'}
                >
                  {b.slot}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Summary KPI Pills */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '12px',
        paddingTop: '14px',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: '10px'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Avg Arrival Time</div>
          <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {avgArrival}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Earliest Entry</div>
          <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
            {earliestArrival}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Latest Entry</div>
          <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f87171', marginTop: '2px' }}>
            {latestArrival}
          </div>
        </div>

        <div style={{ background: 'rgba(14, 165, 233, 0.08)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(14, 165, 233, 0.25)' }}>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} /> Peak Influx Window
          </div>
          <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#e0f2fe', marginTop: '2px' }}>
            {peakArrivalPeriod}
          </div>
        </div>
      </div>
    </div>
  );
}
