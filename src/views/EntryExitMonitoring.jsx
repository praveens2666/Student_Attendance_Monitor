import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowLeftRight, Clock, ShieldAlert, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';
import HardwareSourceBadge from '../components/HardwareSourceBadge';
import { classifyRecord } from '../services/classificationEngine';

export default function EntryExitMonitoring({
  allStudents,
  allRecords,
  rules,
  onOpenStudentProfile,
  onOpenMissingExits
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');

  const todayDate = '2026-10-05';

  // Build complete list of all students with today's status (including those who haven't entered)
  const fullTodayRecords = useMemo(() => {
    const todayRecMap = {};
    allRecords
      .filter(r => r.date === todayDate)
      .forEach(r => {
        todayRecMap[r.studentId] = r;
      });

    return allStudents.map(student => {
      const rec = todayRecMap[student.id];
      if (rec) {
        const classification = classifyRecord(rec, rules, true);
        return {
          id: rec.id,
          studentId: student.id,
          regNo: student.regNo,
          name: student.name,
          department: student.department,
          year: student.year,
          entryTime: rec.entryTime,
          exitTime: rec.exitTime,
          entrySource: rec.entrySource,
          exitSource: rec.exitSource,
          classification,
          status: classification.status,
          label: classification.label,
          badgeClass: classification.badgeClass,
          earlyExitReason: rec.earlyExitReason,
          rawRecord: rec
        };
      } else {
        // Not entered today
        return {
          id: `NO-REC-${student.id}`,
          studentId: student.id,
          regNo: student.regNo,
          name: student.name,
          department: student.department,
          year: student.year,
          entryTime: null,
          exitTime: null,
          entrySource: null,
          exitSource: null,
          classification: { status: 'Not Entered', badgeClass: 'badge-neutral', label: 'Not Entered' },
          status: 'Not Entered',
          label: 'Not Entered',
          badgeClass: 'badge-neutral',
          earlyExitReason: null,
          rawRecord: null
        };
      }
    });
  }, [allStudents, allRecords, rules]);

  // Filtering
  const filtered = useMemo(() => {
    return fullTodayRecords.filter(item => {
      if (departmentFilter !== 'ALL' && item.department !== departmentFilter) return false;
      if (yearFilter !== 'ALL' && item.year !== yearFilter) return false;

      if (statusFilter !== 'ALL') {
        if (statusFilter === 'ON_TIME' && item.status !== 'On Time') return false;
        if (statusFilter === 'LATE' && item.status !== 'Late') return false;
        if (statusFilter === 'VERY_LATE' && item.status !== 'Very Late') return false;
        if (statusFilter === 'EXIT_RECORDED' && item.status !== 'Exit Recorded') return false;
        if (statusFilter === 'EARLY_EXIT' && item.status !== 'Early Exit') return false;
        if (statusFilter === 'MISSING_EXIT' && item.status !== 'Missing Exit') return false;
        if (statusFilter === 'NOT_ENTERED' && item.status !== 'Not Entered') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) ||
               item.regNo.toLowerCase().includes(q) ||
               item.department.toLowerCase().includes(q);
      }

      return true;
    });
  }, [fullTodayRecords, departmentFilter, yearFilter, statusFilter, searchQuery]);

  // Summary status counters
  const statusCounts = useMemo(() => {
    const counts = {
      total: fullTodayRecords.length,
      onTime: 0,
      late: 0,
      veryLate: 0,
      exitRecorded: 0,
      earlyExit: 0,
      missingExit: 0,
      notEntered: 0
    };

    fullTodayRecords.forEach(r => {
      if (r.status === 'On Time') counts.onTime++;
      else if (r.status === 'Late') counts.late++;
      else if (r.status === 'Very Late') counts.veryLate++;
      else if (r.status === 'Exit Recorded') counts.exitRecorded++;
      else if (r.status === 'Early Exit') counts.earlyExit++;
      else if (r.status === 'Missing Exit') counts.missingExit++;
      else if (r.status === 'Not Entered') counts.notEntered++;
    });

    return counts;
  }, [fullTodayRecords]);

  return (
    <div className="view-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ArrowLeftRight size={26} style={{ color: '#3b82f6' }} />
            Today's Entry & Exit Movement Monitoring
          </h1>
          <p>
            Real-time movement registry for all {fullTodayRecords.length} day scholars • Status classification active
          </p>
        </div>

        {statusCounts.missingExit > 0 && (
          <button className="btn btn-danger btn-sm" onClick={onOpenMissingExits}>
            <ShieldAlert size={14} /> {statusCounts.missingExit} Missing Exits Detected
          </button>
        )}
      </div>

      {/* Status Filter Tabs / Counter Bar */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
        gap: '10px', 
        marginBottom: '20px' 
      }}>
        <div 
          onClick={() => setStatusFilter('ALL')}
          style={{
            background: statusFilter === 'ALL' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-card)',
            border: statusFilter === 'ALL' ? '1px solid #3b82f6' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>All Scholars</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{statusCounts.total}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('ON_TIME')}
          style={{
            background: statusFilter === 'ON_TIME' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card)',
            border: statusFilter === 'ON_TIME' ? '1px solid #10b981' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 600 }}>On Time</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>{statusCounts.onTime}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('LATE')}
          style={{
            background: statusFilter === 'LATE' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-card)',
            border: statusFilter === 'LATE' ? '1px solid #f59e0b' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 600 }}>Late</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>{statusCounts.late}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('VERY_LATE')}
          style={{
            background: statusFilter === 'VERY_LATE' ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-card)',
            border: statusFilter === 'VERY_LATE' ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 600 }}>Very Late</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>{statusCounts.veryLate}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('EXIT_RECORDED')}
          style={{
            background: statusFilter === 'EXIT_RECORDED' ? 'rgba(13, 148, 136, 0.2)' : 'var(--bg-card)',
            border: statusFilter === 'EXIT_RECORDED' ? '1px solid #0d9488' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#2dd4bf', textTransform: 'uppercase', fontWeight: 600 }}>Exit Recorded</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2dd4bf' }}>{statusCounts.exitRecorded}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('EARLY_EXIT')}
          style={{
            background: statusFilter === 'EARLY_EXIT' ? 'rgba(234, 88, 12, 0.2)' : 'var(--bg-card)',
            border: statusFilter === 'EARLY_EXIT' ? '1px solid #ea580c' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#ea580c', textTransform: 'uppercase', fontWeight: 600 }}>Early Exit</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ea580c' }}>{statusCounts.earlyExit}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('MISSING_EXIT')}
          style={{
            background: statusFilter === 'MISSING_EXIT' ? 'rgba(244, 63, 94, 0.2)' : 'var(--bg-card)',
            border: statusFilter === 'MISSING_EXIT' ? '1px solid #f43f5e' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#f43f5e', textTransform: 'uppercase', fontWeight: 600 }}>Missing Exit</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f43f5e' }}>{statusCounts.missingExit}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('NOT_ENTERED')}
          style={{
            background: statusFilter === 'NOT_ENTERED' ? 'rgba(100, 116, 139, 0.2)' : 'var(--bg-card)',
            border: statusFilter === 'NOT_ENTERED' ? '1px solid #64748b' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Not Entered</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#94a3b8' }}>{statusCounts.notEntered}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by student name or register number (e.g. Praveen S, 22IT045)..."
            className="filter-input"
            style={{ width: '100%', paddingLeft: '36px' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <span className="filter-label">Dept:</span>
          <select 
            className="filter-select" 
            value={departmentFilter} 
            onChange={e => setDepartmentFilter(e.target.value)}
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

        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filtered.length}</strong> of {fullTodayRecords.length} records
        </div>
      </div>

      {/* Movement Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Register No</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Year</th>
                <th>Morning Entry</th>
                <th>Evening Exit</th>
                <th>Source</th>
                <th>Current Status</th>
                <th>Remarks / Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => {
                const isPraveen = row.regNo === '22IT045';
                return (
                  <tr 
                    key={row.id}
                    className="clickable-row"
                    onClick={() => onOpenStudentProfile(row.studentId)}
                    style={isPraveen ? { background: 'rgba(59, 130, 246, 0.05)' } : undefined}
                  >
                    <td className="mono" style={{ fontWeight: 700, color: '#60a5fa' }}>
                      {row.regNo}
                    </td>

                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {row.name}
                    </td>

                    <td>{row.department}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{row.year}</td>

                    <td className="mono" style={{ fontWeight: 600, color: row.classification.entryClass?.status === 'On Time' ? '#10b981' : (row.entryTime ? '#f59e0b' : 'var(--text-muted)') }}>
                      {row.entryTime ? `${row.entryTime} AM` : '—'}
                    </td>

                    <td className="mono">
                      {row.exitTime ? (
                        `${row.exitTime} PM`
                      ) : row.status === 'Missing Exit' ? (
                        <span style={{ color: '#f43f5e', fontWeight: 600 }}>Missing Exit</span>
                      ) : row.status === 'Not Entered' ? (
                        '—'
                      ) : (
                        <span style={{ color: '#38bdf8' }}>On Campus</span>
                      )}
                    </td>

                    <td>
                      {row.entrySource ? (
                        <HardwareSourceBadge source={row.entrySource} />
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>—</span>
                      )}
                    </td>

                    <td>
                      <span className={`badge ${row.badgeClass}`}>
                        <span className="badge-dot" />
                        {row.label}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {row.earlyExitReason && (
                          <span style={{ fontSize: '0.72rem', color: '#ea580c' }} title={row.earlyExitReason}>
                            Permit: OD
                          </span>
                        )}
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenStudentProfile(row.studentId);
                          }}
                        >
                          Profile
                        </button>
                      </div>
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
