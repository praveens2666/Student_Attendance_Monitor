import React, { useState, useMemo } from 'react';
import { Users, Search, Filter, Eye, Phone, Mail, Award, CheckCircle, Clock } from 'lucide-react';
import { calculateStudentProfile } from '../services/analyticsEngine';

export default function StudentDirectory({
  allStudents,
  allRecords,
  rules,
  onOpenStudentProfile
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');

  // Compute punctuality score for each student
  const studentProfiles = useMemo(() => {
    return allStudents.map(student => {
      const prof = calculateStudentProfile(student.id, allStudents, allRecords, rules);
      return {
        ...student,
        punctualityScore: prof.punctualityScore,
        totalDays: prof.totalRecordedDays,
        lateArrivals: prof.lateArrivals,
        avgEntryTime: prof.avgEntryTime
      };
    });
  }, [allStudents, allRecords, rules]);

  const filtered = useMemo(() => {
    return studentProfiles.filter(student => {
      if (selectedDept !== 'ALL' && student.department !== selectedDept) return false;
      if (selectedYear !== 'ALL' && student.year !== selectedYear) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return student.name.toLowerCase().includes(q) ||
               student.regNo.toLowerCase().includes(q) ||
               student.department.toLowerCase().includes(q) ||
               student.transportMode.toLowerCase().includes(q);
      }

      return true;
    });
  }, [studentProfiles, selectedDept, selectedYear, searchQuery]);

  return (
    <div className="view-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Users size={26} style={{ color: '#3b82f6' }} />
            Day Scholar Student Directory
          </h1>
          <p>
            Complete registry of all {allStudents.length} day scholars with calculated punctuality indices and transport profiles
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by student name (e.g. Praveen), register no (22IT045), bus route..."
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
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="IT">IT (Information Technology)</option>
            <option value="CSE">CSE (Computer Science)</option>
            <option value="ECE">ECE (Electronics & Comm)</option>
            <option value="AIDS">AIDS (AI & Data Science)</option>
            <option value="MECH">MECH (Mechanical Engg)</option>
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-label">Year:</span>
          <select 
            className="filter-select"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
          >
            <option value="ALL">All Academic Years</option>
            <option value="I Year">I Year</option>
            <option value="II Year">II Year</option>
            <option value="III Year">III Year</option>
            <option value="IV Year">IV Year</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filtered.length}</strong> students
        </div>
      </div>

      {/* Students Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Register No</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Year & Sec</th>
                <th>Transit Mode</th>
                <th>Avg Arrival</th>
                <th>Punctuality Score</th>
                <th>Late Incidents</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(student => {
                let scoreColor = '#10b981';
                if (student.punctualityScore < 75) scoreColor = '#ef4444';
                else if (student.punctualityScore < 85) scoreColor = '#f59e0b';
                else if (student.punctualityScore < 95) scoreColor = '#38bdf8';

                return (
                  <tr 
                    key={student.id} 
                    className="clickable-row"
                    onClick={() => onOpenStudentProfile(student.id)}
                  >
                    <td className="mono" style={{ fontWeight: 700, color: '#60a5fa' }}>
                      {student.regNo}
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {student.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {student.contact}
                      </div>
                    </td>

                    <td>{student.department}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{student.year} (Sec {student.section})</td>

                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                        {student.transportMode}
                      </span>
                    </td>

                    <td className="mono" style={{ fontSize: '0.84rem' }}>
                      {student.avgEntryTime}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="mono" style={{ fontWeight: 800, fontSize: '0.95rem', color: scoreColor }}>
                          {student.punctualityScore}%
                        </span>
                        <div style={{ 
                          width: '45px', 
                          height: '5px', 
                          background: 'rgba(255,255,255,0.08)', 
                          borderRadius: 'var(--radius-full)', 
                          overflow: 'hidden' 
                        }}>
                          <div style={{ width: `${student.punctualityScore}%`, height: '100%', background: scoreColor }} />
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>
                        {student.lateArrivals} late
                      </span>
                    </td>

                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenStudentProfile(student.id);
                        }}
                      >
                        <Eye size={13} /> View Profile
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
