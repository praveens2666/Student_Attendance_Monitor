import React from 'react';
import { Search, Bell, Shield, UserCheck, GraduationCap, RotateCcw, Clock } from 'lucide-react';

export default function Navbar({
  currentRole,
  onRoleChange,
  activeAlertCount,
  onOpenSearch,
  onOpenAlerts,
  onResetData,
  rules,
  selectedStudent
}) {
  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <div className="college-pill">
          <span className="live-indicator-dot" />
          <span className="college-name-text">{rules.campusName}</span>
          <span className="gate-badge-text">• {rules.activeGate}</span>
        </div>

        <button 
          className="navbar-search-btn"
          onClick={onOpenSearch}
          title="Search student by Name, Register No, Department (Ctrl+K)"
        >
          <Search size={14} />
          <span>Search students, register nos...</span>
          <span className="search-kbd">⌘K</span>
        </button>
      </div>

      <div className="navbar-right">
        {/* Clock display */}
        <div className="clock-display mono">
          <Clock size={13} style={{ color: '#38bdf8' }} />
          <span>05:15 PM • Oct 05, 2026</span>
        </div>

        {/* Alerts Bell */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onOpenAlerts}
          style={{ position: 'relative' }}
          title={`${activeAlertCount} Administrative Alerts`}
        >
          <Bell size={15} />
          {activeAlertCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 800,
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--bg-card)'
            }}>
              {activeAlertCount}
            </span>
          )}
        </button>

        {/* Role Switcher */}
        <div className="role-switcher">
          <button
            className={`role-btn ${currentRole === 'admin' ? 'active-admin' : ''}`}
            onClick={() => onRoleChange('admin')}
            title="Administrator: Full administrative analytics, student records & configuration"
          >
            <Shield size={13} />
            <span>Admin</span>
          </button>

          <button
            className={`role-btn ${currentRole === 'gate' ? 'active-gate' : ''}`}
            onClick={() => onRoleChange('gate')}
            title="Gate Staff: Fast entry & exit scanner interface"
          >
            <UserCheck size={13} />
            <span>Gate Staff</span>
          </button>

          <button
            className={`role-btn ${currentRole === 'student' ? 'active-student' : ''}`}
            onClick={() => onRoleChange('student')}
            title="Student Portal: View own movement history, status & punctuality score"
          >
            <GraduationCap size={13} />
            <span>Student</span>
          </button>
        </div>

        {/* Reset Prototype Data */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onResetData}
          title="Reset 105 students and 30 days of records to initial baseline"
          style={{ color: 'var(--text-muted)' }}
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </header>
  );
}
