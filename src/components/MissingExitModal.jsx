import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Clock, Search, Phone, FileEdit } from 'lucide-react';
import { classifyRecord } from '../services/classificationEngine';

export default function MissingExitModal({ allStudents, allRecords, rules, onClose, onResolveMissingExit, onOpenStudentProfile }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [manualExitTime, setManualExitTime] = useState('17:15');
  const [resolutionReason, setResolutionReason] = useState('Forgot to tap card on departure');

  // Find all missing exit records for today
  const todayDate = '2026-10-05';
  const missingRecords = allRecords.filter(rec => {
    if (rec.date !== todayDate) return false;
    const c = classifyRecord(rec, rules, true);
    return c.exitClass.status === 'Missing Exit';
  });

  const filtered = missingRecords.filter(rec => {
    const q = searchTerm.toLowerCase();
    return rec.studentName.toLowerCase().includes(q) ||
           rec.regNo.toLowerCase().includes(q) ||
           rec.department.toLowerCase().includes(q);
  });

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    onResolveMissingExit(selectedRecord.id, manualExitTime, resolutionReason);
    setSelectedRecord(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(244, 63, 94, 0.25)', background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(15, 23, 42, 0.9))' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-rose">
                <AlertTriangle size={12} /> ACTION REQUIRED
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                Missing Exit Investigation Drawer
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {missingRecords.length} day scholars recorded morning entry but have no exit recorded past normal departure ({rules.normalExitTime} PM).
            </p>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px', borderRadius: '6px' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Search box */}
          <div style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search missing exit students by name, register number..."
                className="filter-input"
                style={{ width: '100%', paddingLeft: '36px' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Form for manual resolution when a record is selected */}
          {selectedRecord && (
            <div style={{ 
              background: 'rgba(30, 41, 59, 0.7)', 
              border: '1px solid #3b82f6', 
              borderRadius: 'var(--radius-lg)', 
              padding: '16px 20px', 
              marginBottom: '20px',
              animation: 'fadeIn 0.2s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileEdit size={16} /> Resolve Missing Exit for {selectedRecord.studentName} ({selectedRecord.regNo})
                </h4>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedRecord(null)}>Cancel</button>
              </div>

              <form onSubmit={handleResolveSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Exit Timestamp
                  </label>
                  <input
                    type="time"
                    className="filter-input"
                    value={manualExitTime}
                    onChange={e => setManualExitTime(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Audit Verification Reason
                  </label>
                  <select 
                    className="filter-select"
                    value={resolutionReason}
                    onChange={e => setResolutionReason(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Forgot to tap card on departure">Forgot to tap card on departure (Verified on CCTV)</option>
                    <option value="Stayed in Central Library for late study">Stayed in Central Library for late study</option>
                    <option value="Project lab work with department HOD approval">Project lab work with HOD approval</option>
                    <option value="Sports practice / Physical education duty">Sports practice / PE duty</option>
                    <option value="Medical clinic rest then left accompanied">Medical clinic rest / accompanied departure</option>
                  </select>
                </div>

                <div>
                  <button type="submit" className="btn btn-primary">
                    <CheckCircle size={15} /> Save & Correct Record
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Missing records table */}
          <div className="table-container" style={{ maxHeight: '380px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Department / Year</th>
                  <th>Entry Time</th>
                  <th>Current Status</th>
                  <th>Contact Info</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No missing exit records matching criteria. All day scholars account for their evening exits.
                    </td>
                  </tr>
                ) : (
                  filtered.map(rec => {
                    const studentObj = allStudents.find(s => s.id === rec.studentId || s.regNo === rec.regNo);
                    return (
                      <tr key={rec.id}>
                        <td>
                          <div 
                            style={{ fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}
                            onClick={() => onOpenStudentProfile(rec.studentId)}
                          >
                            {rec.studentName}
                          </div>
                          <div className="mono" style={{ fontSize: '0.74rem', color: '#60a5fa' }}>{rec.regNo}</div>
                        </td>

                        <td>
                          <div>{rec.department}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{rec.year}</div>
                        </td>

                        <td className="mono" style={{ color: '#10b981', fontWeight: 600 }}>
                          {rec.entryTime ? `${rec.entryTime} AM` : '—'}
                        </td>

                        <td>
                          <span className="badge badge-rose">
                            <span className="badge-dot" /> Missing Exit
                          </span>
                        </td>

                        <td style={{ fontSize: '0.76rem' }}>
                          <div>P: {studentObj ? studentObj.contact : 'N/A'}</div>
                          <div style={{ color: 'var(--text-muted)' }}>G: {studentObj ? studentObj.parentContact : 'N/A'}</div>
                        </td>

                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedRecord(rec)}
                            style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: '#93c5fd' }}
                          >
                            <FileEdit size={13} /> Correct Record
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
