import React, { useState, useMemo } from 'react';
import { FileText, Download, Printer, Filter, Calendar, Search } from 'lucide-react';
import HardwareSourceBadge from '../components/HardwareSourceBadge';
import { filterRecords, calculatePunctualityLeaderboards } from '../services/analyticsEngine';
import { exportRecordsToCSV, exportPunctualityReportToCSV } from '../services/exportUtils';
import { classifyRecord } from '../services/classificationEngine';

export default function ReportsView({ allStudents, allRecords, rules, onOpenStudentProfile }) {
  const [reportType, setReportType] = useState('daily_entry'); // 'daily_entry' | 'daily_exit' | 'late_arrival' | 'early_exit' | 'missing_exit' | 'punctuality_summary'
  const [dateFilter, setDateFilter] = useState('this_month');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter base records
  const baseRecords = useMemo(() => {
    return filterRecords(allRecords, {
      dateFilter,
      department: deptFilter,
      year: yearFilter
    });
  }, [allRecords, dateFilter, deptFilter, yearFilter]);

  // Classify and filter according to reportType
  const processedRecords = useMemo(() => {
    if (reportType === 'punctuality_summary') {
      return calculatePunctualityLeaderboards(allStudents, baseRecords, rules).honorRoll;
    }

    const classified = baseRecords.map(rec => {
      const isToday = rec.date === '2026-10-05';
      const c = classifyRecord(rec, rules, isToday);
      return {
        ...rec,
        classification: c,
        statusLabel: c.label,
        statusBadge: c.badgeClass
      };
    });

    if (reportType === 'daily_entry') {
      return classified.filter(r => Boolean(r.entryTime));
    } else if (reportType === 'daily_exit') {
      return classified.filter(r => Boolean(r.exitTime));
    } else if (reportType === 'late_arrival') {
      return classified.filter(r => r.classification.entryClass.status === 'Late' || r.classification.entryClass.status === 'Very Late');
    } else if (reportType === 'early_exit') {
      return classified.filter(r => r.classification.exitClass.status === 'Early Exit');
    } else if (reportType === 'missing_exit') {
      return classified.filter(r => r.classification.exitClass.status === 'Missing Exit');
    }

    return classified;
  }, [baseRecords, reportType, allStudents, rules]);

  // Apply search query
  const displayRecords = useMemo(() => {
    if (!searchQuery.trim()) return processedRecords;
    const q = searchQuery.toLowerCase();

    if (reportType === 'punctuality_summary') {
      return processedRecords.filter(item => {
        return item.student.name.toLowerCase().includes(q) ||
               item.student.regNo.toLowerCase().includes(q) ||
               item.student.department.toLowerCase().includes(q);
      });
    }

    return processedRecords.filter(r => {
      return r.studentName.toLowerCase().includes(q) ||
             r.regNo.toLowerCase().includes(q) ||
             r.department.toLowerCase().includes(q);
    });
  }, [processedRecords, searchQuery, reportType]);

  const handleExportCSV = () => {
    if (reportType === 'punctuality_summary') {
      exportPunctualityReportToCSV(processedRecords, `CampusFlow_Punctuality_Summary_${deptFilter}`);
    } else {
      exportRecordsToCSV(processedRecords, `CampusFlow_${reportType}_Report_${deptFilter}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="view-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <FileText size={26} style={{ color: '#3b82f6' }} />
            Administrative Reports & Official Attendance Exports
          </h1>
          <p>
            Generate, audit and export institutional movement summaries for academic councils and parent communication
          </p>
        </div>

        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={14} /> Print / Save as PDF
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleExportCSV}>
            <Download size={14} /> Export to CSV ({displayRecords.length} rows)
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        {[
          { id: 'daily_entry', label: 'Daily Entry Report' },
          { id: 'daily_exit', label: 'Daily Exit Report' },
          { id: 'late_arrival', label: 'Late Arrival Report' },
          { id: 'early_exit', label: 'Early Exit Report' },
          { id: 'missing_exit', label: 'Missing Exit Report' },
          { id: 'punctuality_summary', label: 'Punctuality Summary' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`btn btn-sm ${reportType === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setReportType(tab.id)}
            style={{ whiteSpace: 'nowrap' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="filter-bar">
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search within report results..."
            className="filter-input"
            style={{ width: '100%', paddingLeft: '36px' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <span className="filter-label">Range:</span>
          <select 
            className="filter-select"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
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

        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Found <strong>{displayRecords.length}</strong> matching entries
        </div>
      </div>

      {/* Reports Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ maxHeight: '600px' }}>
          {reportType === 'punctuality_summary' ? (
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
                  <th>Early Exits</th>
                  <th>Missing Exits</th>
                  <th>Punctuality Score</th>
                </tr>
              </thead>
              <tbody>
                {displayRecords.map((item, idx) => (
                  <tr key={item.student.id} className="clickable-row" onClick={() => onOpenStudentProfile(item.student.id)}>
                    <td style={{ fontWeight: 700 }}>#{idx + 1}</td>
                    <td className="mono" style={{ color: '#60a5fa', fontWeight: 700 }}>{item.student.regNo}</td>
                    <td style={{ fontWeight: 600 }}>{item.student.name}</td>
                    <td>{item.student.department} — {item.student.year}</td>
                    <td className="mono">{item.totalRecordedDays}</td>
                    <td className="mono" style={{ color: '#10b981' }}>{item.onTimeDays}</td>
                    <td className="mono" style={{ color: '#f59e0b' }}>{item.lateDays}</td>
                    <td className="mono" style={{ color: '#ef4444' }}>{item.veryLateDays}</td>
                    <td className="mono" style={{ color: '#ea580c' }}>{item.earlyExits}</td>
                    <td className="mono" style={{ color: '#f43f5e' }}>{item.missingExits}</td>
                    <td className="mono" style={{ fontWeight: 800, color: item.punctualityScore >= 90 ? '#10b981' : '#f59e0b' }}>
                      {item.punctualityScore}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Date</th>
                  <th>Register No</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Morning Entry</th>
                  <th>Evening Exit</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayRecords.map(rec => (
                  <tr key={rec.id} className="clickable-row" onClick={() => onOpenStudentProfile(rec.studentId)}>
                    <td className="mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{rec.id}</td>
                    <td style={{ fontWeight: 600 }}>{rec.date}</td>
                    <td className="mono" style={{ color: '#60a5fa', fontWeight: 700 }}>{rec.regNo}</td>
                    <td style={{ fontWeight: 600 }}>{rec.studentName}</td>
                    <td>{rec.department}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{rec.year}</td>
                    <td className="mono" style={{ fontWeight: 600, color: rec.classification?.entryClass.status === 'On Time' ? '#10b981' : '#f59e0b' }}>
                      {rec.entryTime ? `${rec.entryTime} AM` : '—'}
                    </td>
                    <td className="mono">
                      {rec.exitTime ? `${rec.exitTime} PM` : (rec.classification?.exitClass.status === 'Missing Exit' ? <span style={{ color: '#f43f5e' }}>Missing</span> : '—')}
                    </td>
                    <td><HardwareSourceBadge source={rec.entrySource} /></td>
                    <td>
                      <span className={`badge ${rec.statusBadge}`}>
                        <span className="badge-dot" /> {rec.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
