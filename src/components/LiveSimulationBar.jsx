import React, { useState, useEffect } from 'react';
import { Play, Pause, FastForward, Radio, Volume2, VolumeX, Sparkles, Clock, Zap, ShieldCheck } from 'lucide-react';
import { playScanSuccess, playLateWarning, toggleSound, isSoundEnabled } from '../services/soundEffects';

export default function LiveSimulationBar({
  isSimulating,
  onToggleSimulation,
  onSimulateSingleTap,
  allStudents,
  allRecords,
  rules,
  simulatedCampusTime,
  onTimeScrub
}) {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [lanes, setLanes] = useState([
    { id: 1, name: 'Turnstile A (East)', status: 'active', count: 48, lastReg: '22IT045' },
    { id: 2, name: 'Turnstile B (Main)', status: 'busy', count: 39, lastReg: '22CS031' },
    { id: 3, name: 'Turnstile C (West)', status: 'active', count: 31, lastReg: '21EC012' },
    { id: 4, name: 'Turnstile D (QR/Mobile)', status: 'active', count: 24, lastReg: '23AD008' }
  ]);

  const handleToggleSound = () => {
    const next = !soundOn;
    toggleSound(next);
    setSoundOn(next);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(11, 15, 25, 0.98))',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 20px',
      marginBottom: '22px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative top accent glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: isSimulating 
          ? 'linear-gradient(90deg, #10b981, #06b6d4, #3b82f6, #10b981)' 
          : 'rgba(255, 255, 255, 0.1)',
        backgroundSize: '200% 100%',
        animation: isSimulating ? 'shimmerBar 2s linear infinite' : 'none'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        {/* Left Side: Live Indicator & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isSimulating ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: isSimulating ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isSimulating ? '#10b981' : '#94a3b8',
              boxShadow: isSimulating ? '0 0 10px #10b981' : 'none',
              animation: isSimulating ? 'pulseDot 1.5s infinite' : 'none'
            }} />
            <span style={{ fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.04em', color: isSimulating ? '#34d399' : '#94a3b8' }}>
              {isSimulating ? 'LIVE TURNSTILE STREAM ACTIVE' : 'STREAM STANDBY'}
            </span>
          </div>

          {/* Toggle Live Stream Button */}
          <button
            className={`btn btn-sm ${isSimulating ? 'btn-primary' : 'btn-secondary'}`}
            onClick={onToggleSimulation}
            style={{ fontWeight: 700 }}
          >
            {isSimulating ? (
              <>
                <Pause size={13} /> Pause Live Stream
              </>
            ) : (
              <>
                <Play size={13} /> Start Live Stream
              </>
            )}
          </button>

          {/* Manual Immediate Tap Simulation */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onSimulateSingleTap}
            title="Simulate an instant card scan at Gate 02 Turnstile"
            style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: '#93c5fd' }}
          >
            <Zap size={13} style={{ color: '#38bdf8' }} /> Simulate Card Tap
          </button>

          {/* Audio toggle */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleToggleSound}
            title={soundOn ? 'Turnstile Hardware Audio: Muted' : 'Turnstile Hardware Audio: Unmuted'}
            style={{ padding: '6px 8px' }}
          >
            {soundOn ? <Volume2 size={14} style={{ color: '#10b981' }} /> : <VolumeX size={14} style={{ color: 'var(--text-muted)' }} />}
          </button>
        </div>

        {/* Turnstile Lanes Ingress Telemetry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Gate 02 Turnstiles:
          </span>
          {lanes.map(lane => (
            <div
              key={lane.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 8px',
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: lane.status === 'busy' ? '#f59e0b' : '#10b981'
              }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{lane.name.split(' ')[0]}</span>
              <span className="mono" style={{ color: 'var(--text-muted)' }}>{lane.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
