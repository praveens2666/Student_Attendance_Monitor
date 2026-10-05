import React, { useState, useMemo } from 'react';
import { Trophy, Award, Clock, AlertTriangle, Filter, Search, Eye, Sparkles, TrendingUp } from 'lucide-react';
import { calculatePunctualityLeaderboards, filterRecords } from '../services/analyticsEngine';

export default function PunctualityView({
  allStudents,
  allRecords,
  rules,
  onOpenStudentProfile
}) {
  const [activeTab, setActiveTab] = useState('late_leaderboard'); // 'late_leaderboard' | 'honor_roll'
  const [timeFilter, setTimeFilter] = useState('this_month'); // 'today' | 'this_week' | 'this_month'
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const leaderboards = useMemo(() => {
    const filtered = filterRecords(allRecords, {
      dateFilter: timeFilter,
      department: deptFilter,
      year: yearFilter
    });
    return calculatePunctualityLeaderboards(allStudents, filtered, rules);
  }, [allStudents, allRecords, rules, timeFilter, deptFilter, yearFilter]);

  // Search filter
  const currentList = activeTab === 'late_leaderboard' ? leaderboards.lateLeaderboard : leaderboards.honorRoll;
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase();
    return currentList.filter(item => {
      return item.student.name.toLowerCase().includes(q) ||
             item.student.regNo.toLowerCase().includes(q) ||
             item.student.department.toLowerCase().includes(q);
    });
  }, [currentList, searchQuery]);

  return (
    <div className="view-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Trophy size={26} style={{ color: '#f59e0b' }} />
            Punctuality Analysis & Institutional Rankings
          </h1>
          <p>
            Objective punctuality scoring based on turnstile verification: <code>On-Time Days / Total Recorded Days × 100</code>
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            className={`btn btn-sm ${activeTab === 'late_leaderboard' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('late_leaderboard')}
          >
            <Clock size={13} /> Late Arrival Leaderboard
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'honor_roll' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('honor_roll')}
          >
            <Award size={13} /> Highest Punctuality (Honor Roll)
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search student by name or register number..."
            className="filter-input"
            style={{ width: '100%', paddingLeft: '36px' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <span className="filter-label">Period:</span>
          <select 
            className="filter-select"
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month (30 Days)</option>
            <option value="semester">Full Semester</option>
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-label">Dept:</span>
          <select 
            className="filter-select"
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="IT">IT</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="AIDS">AIDS</option>
            <option value="MECH">MECH</option>
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-label">Year:</span>
          <select 
            className="filter-select"
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
          >
            <option value="ALL">All Years</option>
            <option value="I Year">I Year</option>
            <option value="II Year">II Year</option>
            <option value="III Year">III Year</option>
            <option value="IV Year">IV Year</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Register No</th>
                <th>Student Name</th>
                <th>Department & Year</th>
                <th>Total Days</th>
                <th>On-Time</th>
                <th>Late Arrivals</th>
                <th>Very Late</th>
                <th>Punctuality Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, index) => {
                const isLateLeaderboard = activeTab === 'late_leaderboard';
                const isTopThree = index < 3;
                let rankColor = 'var(--text-muted)';
                if (isTopThree && !isLateLeaderboard) rankColor = '#10b981';
                if (isTopThree && isLateLeaderboard) rankColor = '#ef4444';

                let scoreColor = '#10b981';
                if (item.punctualityScore < 75) scoreColor = '#ef4444';
                else if (item.punctualityScore < 85) scoreColor = '#f59e0b';
                else if (item.punctualityScore < 95) scoreColor = '#38bdf8';

                return (
                  <tr 
                    key={item.student.id} 
                    className="clickable-row"
                    onClick={() => onOpenStudentProfile(item.student.id)}
                  >
                    <td style={{ fontWeight: 800, fontSize: '0.95rem', color: rankColor }}>
                      #{index + 1}
                    </td>

                    <td className="mono" style={{ fontWeight: 700, color: '#60a5fa' }}>
                      {item.student.regNo}
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.student.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Transit: {item.student.transportMode}
                      </div>
                    </td>

                    <td>
                      <div>{item.student.department}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.student.year}</div>
                    </td>

                    <td className="mono">{item.totalRecordedDays}</td>

                    <td className="mono" style={{ color: '#10b981', fontWeight: 600 }}>
                      {item.onTimeDays}
                    </td>

                    <td className="mono" style={{ color: '#f59e0b', fontWeight: 600 }}>
                      {item.lateDays}
                    </td>

                    <td className="mono" style={{ color: '#ef4444', fontWeight: 600 }}>
                      {item.veryLateDays}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="mono" style={{ fontWeight: 800, fontSize: '1rem', color: scoreColor }}>
                          {item.punctualityScore}%
                        </span>
                        <div style={{ width: '45px', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{ width: `${item.punctualityScore}%`, height: '100%', background: scoreColor }} />
                        </div>
                      </div>
                    </td>

                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenStudentProfile(item.student.id);
                        }}
                      >
                        <Eye size={12} /> View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
