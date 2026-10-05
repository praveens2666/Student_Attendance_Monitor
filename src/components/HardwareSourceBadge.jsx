import React from 'react';
import { Radio, QrCode, Keyboard, Cpu } from 'lucide-react';

export default function HardwareSourceBadge({ source = 'RFID' }) {
  const s = (source || 'MANUAL').toUpperCase();

  if (s === 'RFID') {
    return (
      <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }} title="Captured via 13.56MHz Contactless RFID Turnstile">
        <Radio size={11} /> RFID Card
      </span>
    );
  }

  if (s === 'QR') {
    return (
      <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }} title="Captured via 2D Mobile QR Code Scanner">
        <QrCode size={11} /> QR Code
      </span>
    );
  }

  if (s === 'API') {
    return (
      <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.3)' }} title="External Gate Turnstile API Relay">
        <Cpu size={11} /> Gate API
      </span>
    );
  }

  return (
    <span className="badge badge-neutral" title="Gate Staff Manual Keypad Entry">
      <Keyboard size={11} /> Manual Entry
    </span>
  );
}
