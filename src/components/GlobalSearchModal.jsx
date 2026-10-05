import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, ChevronRight } from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose, allStudents, onSelectStudent }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();
  const results = trimmed.length === 0 ? [] : allStudents.filter(s => {
    return s.name.toLowerCase().includes(trimmed) ||
           s.regNo.toLowerCase().includes(trimmed) ||
           s.department.toLowerCase().includes(trimmed);
  }).slice(0, 10);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '600px', background: 'var(--bg-modal)', borderRadius: 'var(--radius-xl)' }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={20} style={{ color: '#3b82f6' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type student name, register number (e.g. Praveen, 22IT045)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '1.05rem',
              fontFamily: 'inherit'
            }}
          />
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '12px' }}>
          {trimmed.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <div>Try searching for <strong style={{ color: '#60a5fa', cursor: 'pointer' }} onClick={() => setQuery('Praveen')}>"Praveen"</strong>, <strong style={{ color: '#60a5fa', cursor: 'pointer' }} onClick={() => setQuery('22IT045')}>"22IT045"</strong>, or <strong style={{ color: '#60a5fa', cursor: 'pointer' }} onClick={() => setQuery('IT')}>"IT"</strong></div>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No day scholars found matching "{query}"
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {results.map(student => (
                <div
                  key={student.id}
                  onClick={() => {
                    onSelectStudent(student.id);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="search-item-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem'
                    }}>
                      {student.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {student.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        <span className="mono" style={{ color: '#38bdf8' }}>{student.regNo}</span> • {student.department} — {student.year}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-neutral">{student.transportMode.split(' ')[0]}</span>
                    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
