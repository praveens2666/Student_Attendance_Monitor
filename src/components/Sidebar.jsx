import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ArrowLeftRight, 
  BarChart3, 
  Trophy, 
  BellRing, 
  FileText, 
  Sliders, 
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function Sidebar({ currentView, onViewChange, missingExitCount, alertCount }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'entry-exit', label: 'Entry / Exit', icon: ArrowLeftRight, badge: missingExitCount > 0 ? `${missingExitCount} Missing` : null, badgeClass: 'badge-rose' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'punctuality', label: 'Punctuality', icon: Trophy },
    { id: 'alerts', label: 'Alerts', icon: BellRing, badge: alertCount > 0 ? String(alertCount) : null, badgeClass: 'sidebar-count-badge' },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Sliders }
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Zap size={20} />
        </div>
        <div>
          <div className="sidebar-brand-title">CampusFlow</div>
          <div className="sidebar-brand-badge">Punctuality Intelligence</div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <div className="sidebar-item-left">
                <Icon size={17} style={{ color: isActive ? '#3b82f6' : 'inherit' }} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={item.badgeClass || 'badge'} style={{ fontSize: '0.68rem' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Footer */}
      <div className="sidebar-footer">
        <div className="user-profile-widget">
          <div className="user-avatar">
            DR
          </div>
          <div className="user-info">
            <span className="user-name" title="Dr. S. Ramanathan, Dean of Student Affairs">
              Dr. S. Ramanathan
            </span>
            <span className="user-role-label">
              Role: Administrator
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
