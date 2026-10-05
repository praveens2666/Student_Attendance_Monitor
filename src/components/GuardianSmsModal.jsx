import React, { useState } from 'react';
import { X, Send, Phone, MessageSquare, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function GuardianSmsModal({ student, todayRecord, rules, onClose }) {
  const [channel, setChannel] = useState('SMS'); // 'SMS' | 'WHATSAPP'
  const [sent, setSent] = useState(false);

  if (!student) return null;

  const isLate = todayRecord?.entryTime && todayRecord.entryTime > rules.lateAfterTime;
  const isMissing = !todayRecord?.exitTime && todayRecord?.entryTime;

  let defaultMessage = '';
  if (isLate) {
    defaultMessage = `Official College Notice: Dear Parent, Day Scholar ${student.name} (${student.regNo}), ${student.department} IV Year arrived late at Campus South Gate today at ${todayRecord.entryTime} AM (Threshold: ${rules.lateAfterTime} AM). Please ensure punctual departure. - Dean Student Affairs, ${rules.campusName}`;
  } else if (isMissing) {
    defaultMessage = `Security Check: Dear Parent, Day Scholar ${student.name} (${student.regNo}) entered campus at ${todayRecord.entryTime} AM, but has not logged departure at Gate 02 after ${rules.normalExitTime} PM dismissal. Please confirm safe transit. - Security Control, ${rules.campusName}`;
  } else {
    defaultMessage = `Attendance Confirmation: Dear Parent, Day Scholar ${student.name} (${student.regNo}) logged morning entry at ${todayRecord?.entryTime || '08:24'} AM via ${todayRecord?.entrySource || 'RFID'}. - ${rules.campusName}`;
  }

  const [messageText, setMessageText] = useState(defaultMessage);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(15, 23, 42, 0.9))' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-warning">
                <MessageSquare size={12} /> OFFICIAL DISPATCH
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                Notify Parent / Guardian
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Student: <strong>{student.name} ({student.regNo})</strong> • Parent: <strong>{student.parentContact}</strong>
            </p>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {sent ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', animation: 'fadeIn 0.2s ease' }}>
              <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                Dispatch Dispatched Successfully!
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Transmission sent to <strong>{student.parentContact}</strong> via College Integrated Telecom Gateway.
              </p>
            </div>
          ) : (
            <div>
              {/* Channel Selector */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${channel === 'SMS' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setChannel('SMS')}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Phone size={13} /> SMS Carrier Gateway
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${channel === 'WHATSAPP' ? 'btn-teal' : 'btn-secondary'}`}
                  onClick={() => setChannel('WHATSAPP')}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <MessageSquare size={13} /> Official WhatsApp
                </button>
              </div>

              {/* Message Box */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Live Message Dispatch Preview:
                </label>
                <textarea
                  className="filter-input"
                  rows="5"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem', lineHeight: 1.5, resize: 'vertical' }}
                />
              </div>

              {/* Student Metadata snippet */}
              <div style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <div>Transit Route: <strong>{student.transportMode}</strong></div>
                <div>Status Today: <strong>{todayRecord?.entryTime ? `Entered ${todayRecord.entryTime} AM` : 'Not Entered'}</strong></div>
              </div>
            </div>
          )}
        </div>

        {!sent && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSend}>
              <Send size={14} /> Send Dispatch Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
