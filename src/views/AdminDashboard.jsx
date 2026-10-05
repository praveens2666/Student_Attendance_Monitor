import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Percent, 
  ArrowRight, 
  Filter,
  Eye,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  Search
} from 'lucide-react';
import KpiCard from '../components/KpiCard';
import ArrivalDistributionChart from '../components/ArrivalDistributionChart';
import DepartmentComparisonChart from '../components/DepartmentComparisonChart';
import LiveSimulationBar from '../components/LiveSimulationBar';
import HardwareSourceBadge from '../components/HardwareSourceBadge';
import { 
  calculateTodayKPIs, 
  calculateArrivalDistribution, 
  calculatePunctualityLeaderboards, 
  calculateDepartmentAnalytics,
  filterRecords 
} from '../services/analyticsEngine';
import { classifyRecord, timeToMinutes } from '../services/classificationEngine';

export default function AdminDashboard({
  allStudents,
  allRecords,
  rules,
  onOpenStudentProfile,
  onOpenMissingExits,
  onNavigateToView,
  isSimulating,
  onToggleSimulation,
  onSimulateSingleTap,
  lastSimulatedStudentId
}) {
  const [leaderboardFilter, setLeaderboardFilter] = useState('this_week'); // 'today' | 'this_week' | 'this_month'
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSlot, setSelectedSlot] = useState(null); // Filter by 15-min arrival slot
  const [sortField, setSortField] = useState('entryTime');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTableQuery, setSearchTableQuery] = useState('');

  // Today's KPIs dynamically calculated
  const kpis = useMemo(() => {
    return calculateTodayKPIs(allStudents, allRecords, rules);
  }, [allStudents, allRecords, rules]);

  // Arrival distribution for today
  const distributionData = useMemo(() => {
    const todayRecords = allRecords.filter(r => r.date === '2026-10-05');
    return calculateArrivalDistribution(todayRecords, rules);
  }, [allRecords, rules]);

  // Late arrival leaderboard
  const leaderboards = useMemo(() => {
    const filtered = filterRecords(allRecords, { 
      dateFilter: leaderboardFilter,
      department: selectedDept
    });
    return calculatePunctualityLeaderboards(allStudents, filtered, rules);
  }, [allStudents, allRecords, rules, leaderboardFilter, selectedDept]);

  // Department comparison analytics
  const departmentData = useMemo(() => {
    return calculateDepartmentAnalytics(allStudents, allRecords, rules);
  }, [allStudents, allRecords, rules]);

  // Slot bounds helper
  const isTimeInSlot = (timeStr, slotStr) => {
    if (!timeStr || !slotStr) return true;
    const min = timeToMinutes(timeStr);
    if (slotStr === '< 08:00') return min < 480;
    if (slotStr === '08:00 - 08:15') return min >= 480 && min < 495;
    if (slotStr === '08:15 - 08:30') return min >= 495 && min < 510;
    if (slotStr === '08:30 - 08:45') return min >= 510 && min < 525;
    if (slotStr === '08:45 - 09:00') return min >= 525 && min < 540;
    if (slotStr === '> 09:00') return min >= 540;
    return true;
  };

  // Today's recent student movement stream with sorting and slot filter
  const processedMovements = useMemo(() => {
    let todayRecords = allRecords
      .filter(r => r.date === '2026-10-05')
      .map(rec => ({
        ...rec,
        classification: classifyRecord(rec, rules, true)
      }));

    // Filter by slot if selected
    if (selectedSlot) {
      todayRecords = todayRecords.filter(r => isTimeInSlot(r.entryTime, selectedSlot));
    }

    // Filter by search query
    if (searchTableQuery.trim()) {
      const q = searchTableQuery.toLowerCase();
      todayRecords = todayRecords.filter(r => 
        r.studentName.toLowerCase().includes(q) ||
        r.regNo.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    }

    // Sort
    todayRecords.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (sortField === 'status') {
        valA = a.classification?.label || '';
        valB = b.classification?.label || '';
      }
      return sortDirection === 'asc' 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });

    return todayRecords;
  }, [allRecords, rules, selectedSlot, searchTableQuery, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Good Morning, Administrator</h1>
          <p>
            Campus Day Scholar Entry, Exit & Real-Time Punctuality Intelligence • <strong>October 05, 2026</strong>
          </p>
        </div>

        <div className="page-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigateToView('entry-exit')}
          >
            Live Monitor View
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onNavigateToView('reports')}
          >
            Generate Attendance Report
          </button>
        </div>
      </div>

      {/* Live Turnstile Simulation Bar */}
      <LiveSimulationBar
        isSimulating={isSimulating}
        onToggleSimulation={onToggleSimulation}
        onSimulateSingleTap={onSimulateSingleTap}
        allStudents={allStudents}
        allRecords={allRecords}
        rules={rules}
      />

      {/* KPI Cards Row (Section 3) */}
      <div className="kpi-grid">
        <KpiCard
          label="Total Day Scholars"
          value={kpis.totalDayScholars}
          sublabel="Enrolled on campus roster"
          icon={Users}
          iconColor="#3b82f6"
          iconBg="rgba(59, 130, 246, 0.12)"
        />

        <KpiCard
          label="Expected Today"
          value={kpis.expectedToday}
          sublabel="All scheduled academic sessions"
          icon={Users}
          iconColor="#60a5fa"
          iconBg="rgba(96, 165, 250, 0.12)"
        />

        <KpiCard
          label="Entered Today"
          value={kpis.enteredToday}
          sublabel={`${Math.round((kpis.enteredToday / kpis.expectedToday) * 100)}% campus attendance`}
          icon={UserCheck}
          iconColor="#10b981"
          iconBg="rgba(16, 185, 129, 0.12)"
          variant="success"
        />

        <KpiCard
          label="Not Yet Entered"
          value={kpis.notYetEntered}
          sublabel="Absent or on approved OD"
          icon={UserX}
          iconColor="#94a3b8"
          iconBg="rgba(148, 163, 184, 0.12)"
        />

        <KpiCard
          label="Late Arrivals"
          value={kpis.totalLate}
          sublabel={`Cutoff > ${rules.lateAfterTime} AM (${kpis.veryLateArrivals} Very Late)`}
          icon={Clock}
          iconColor="#f59e0b"
          iconBg="rgba(245, 158, 11, 0.12)"
          variant="warning"
        />

        <KpiCard
          label="Early Exits"
          value={kpis.earlyExits}
          sublabel={`Departure before ${rules.earlyExitBeforeTime} PM`}
          icon={AlertTriangle}
          iconColor="#ea580c"
          iconBg="rgba(234, 88, 12, 0.12)"
        />

        <KpiCard
          label="Missing Exit Records"
          value={kpis.missingExits}
          sublabel="Click to investigate & correct"
          icon={ShieldAlert}
          iconColor="#f43f5e"
          iconBg="rgba(244, 63, 94, 0.15)"
          variant="rose"
          onClick={onOpenMissingExits}
          badgeText="Action"
        />

        <KpiCard
          label="Overall Punctuality"
          value={`${kpis.punctualityPercent}%`}
          sublabel="On-time arrivals / Total entered"
          icon={Percent}
          iconColor="#10b981"
          iconBg="rgba(16, 185, 129, 0.12)"
          variant="success"
        />
      </div>

      {/* Arrival Distribution & Temporal Congestion Profile (Section 8) */}
      <div style={{ marginBottom: '24px' }}>
        <ArrivalDistributionChart 
          distributionData={distributionData} 
          rules={rules} 
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
        />
      </div>

      {/* Grid: Late Arrival Leaderboard & Department Punctuality (Section 5 & 9) */}
      <div className="dashboard-grid-2">
        {/* Late Arrival Leaderboard */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 className="card-title">
                <Clock size={18} style={{ color: '#f59e0b' }} />
                Late Arrival Leaderboard
              </h3>
              <p className="card-subtitle">
                Students ranked by frequency of late arrivals for administrative intervention
              </p>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <select 
                className="filter-select"
                value={leaderboardFilter}
                onChange={e => setLeaderboardFilter(e.target.value)}
                style={{ fontSize: '0.76rem', padding: '4px 8px' }}
              >
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </select>

              <select 
                className="filter-select"
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                style={{ fontSize: '0.76rem', padding: '4px 8px' }}
              >
                <option value="ALL">All Depts</option>
                <option value="IT">IT</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="AIDS">AIDS</option>
                <option value="MECH">MECH</option>
              </select>
            </div>
          </div>

          <div className="table-container" style={{ maxHeight: '340px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Department / Year</th>
                  <th>Late Count</th>
                  <th>Punctuality</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaderboards.lateLeaderboard.slice(0, 6).map((item, index) => {
                  return (
                    <tr key={item.student.id} className="clickable-row" onClick={() => onOpenStudentProfile(item.student.id)}>
                      <td style={{ fontWeight: 700, color: index === 0 ? '#ef4444' : 'var(--text-muted)' }}>
                        #{index + 1}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.student.name}
                        </div>
                        <div className="mono" style={{ fontSize: '0.74rem', color: '#60a5fa' }}>
                          {item.student.regNo}
                        </div>
                      </td>
                      <td>
                        <div>{item.student.department}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.student.year}</div>
                      </td>
                      <td>
                        <span className="badge badge-warning">
                          {item.totalLate} late
                        </span>
                      </td>
                      <td>
                        <span className="mono" style={{ fontWeight: 700, color: item.punctualityScore < 75 ? '#ef4444' : '#f59e0b' }}>
                          {item.punctualityScore}%
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenStudentProfile(item.student.id);
                          }}
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '12px', textAlign: 'right' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateToView('punctuality')}
              style={{ fontSize: '0.78rem' }}
            >
              View Full Punctuality Rankings & Honor Roll <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Department Comparison Chart */}
        <DepartmentComparisonChart departmentData={departmentData} />
      </div>

      {/* Recent Activity: Today's Student Movement Stream (Section 4 & 21) */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 className="card-title">
              <Sparkles size={18} style={{ color: '#10b981' }} />
              Live Student Movement Stream (Today)
              {selectedSlot && (
                <span className="badge badge-teal" style={{ marginLeft: '10px' }}>
                  Filtered: {selectedSlot}
                </span>
              )}
            </h3>
            <p className="card-subtitle">
              Real-time gate ingress and egress verification timestamps and classified movement status
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search movements..."
                className="filter-input"
                style={{ paddingLeft: '30px', fontSize: '0.78rem', width: '180px' }}
                value={searchTableQuery}
                onChange={e => setSearchTableQuery(e.target.value)}
              />
            </div>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateToView('entry-exit')}
            >
              Full Roster ({kpis.totalDayScholars}) <ArrowRight size={13} />
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('regNo')} style={{ cursor: 'pointer' }}>
                  Register No <ArrowUpDown size={12} style={{ verticalAlign: 'middle' }} />
                </th>
                <th onClick={() => handleSort('studentName')} style={{ cursor: 'pointer' }}>
                  Student Name <ArrowUpDown size={12} style={{ verticalAlign: 'middle' }} />
                </th>
                <th onClick={() => handleSort('department')} style={{ cursor: 'pointer' }}>
                  Department <ArrowUpDown size={12} style={{ verticalAlign: 'middle' }} />
                </th>
                <th>Year</th>
                <th onClick={() => handleSort('entryTime')} style={{ cursor: 'pointer' }}>
                  Morning Entry <ArrowUpDown size={12} style={{ verticalAlign: 'middle' }} />
                </th>
                <th onClick={() => handleSort('exitTime')} style={{ cursor: 'pointer' }}>
                  Evening Exit <ArrowUpDown size={12} style={{ verticalAlign: 'middle' }} />
                </th>
                <th>Source</th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  Current Status <ArrowUpDown size={12} style={{ verticalAlign: 'middle' }} />
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {processedMovements.slice(0, 12).map(rec => {
                const isJustSimulated = rec.studentId === lastSimulatedStudentId;

                return (
                  <tr 
                    key={rec.id} 
                    className={`clickable-row ${isJustSimulated ? 'live-flash-row' : ''}`}
                    onClick={() => onOpenStudentProfile(rec.studentId)}
                  >
                    <td className="mono" style={{ fontWeight: 700, color: '#60a5fa' }}>
                      {rec.regNo}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {rec.studentName}
                    </td>
                    <td>{rec.department}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{rec.year}</td>
                    <td className="mono" style={{ fontWeight: 600, color: rec.classification.entryClass.status === 'On Time' ? '#10b981' : '#f59e0b' }}>
                      {rec.entryTime ? `${rec.entryTime} AM` : '—'}
                    </td>
                    <td className="mono">
                      {rec.exitTime ? `${rec.exitTime} PM` : (rec.classification.exitClass.status === 'Missing Exit' ? <span style={{ color: '#f43f5e' }}>Missing</span> : '—')}
                    </td>
                    <td>
                      <HardwareSourceBadge source={rec.entrySource} />
                    </td>
                    <td>
                      <span className={`badge ${rec.classification.badgeClass}`}>
                        <span className="badge-dot" />
                        {rec.classification.label}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenStudentProfile(rec.studentId);
                        }}
                      >
                        Profile
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
