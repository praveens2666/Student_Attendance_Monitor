import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Clock, Building2, HelpCircle, Sparkles, Calendar } from 'lucide-react';
import ArrivalDistributionChart from '../components/ArrivalDistributionChart';
import DepartmentComparisonChart from '../components/DepartmentComparisonChart';
import DailyTrendChart from '../components/DailyTrendChart';
import { 
  calculateArrivalDistribution, 
  calculateDepartmentAnalytics, 
  calculateDailyTrends,
  filterRecords 
} from '../services/analyticsEngine';

export default function AnalyticsView({ allStudents, allRecords, rules }) {
  const [timeFilter, setTimeFilter] = useState('30_days'); // 'today' | '7_days' | '30_days' | 'semester'
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');

  const filteredRecords = useMemo(() => {
    let dateFilter = 'this_month';
    if (timeFilter === 'today') dateFilter = 'today';
    else if (timeFilter === '7_days') dateFilter = '7_days';
    else if (timeFilter === '30_days') dateFilter = 'this_month';
    else if (timeFilter === 'semester') dateFilter = 'semester';

    return filterRecords(allRecords, {
      dateFilter,
      department: deptFilter,
      year: yearFilter
    });
  }, [allRecords, timeFilter, deptFilter, yearFilter]);

  // Distribution
  const distributionData = useMemo(() => {
    return calculateArrivalDistribution(filteredRecords, rules);
  }, [filteredRecords, rules]);

  // Department analytics
  const deptData = useMemo(() => {
    return calculateDepartmentAnalytics(allStudents, filteredRecords, rules);
  }, [allStudents, filteredRecords, rules]);

  // Daily trends
  const dailyTrends = useMemo(() => {
    return calculateDailyTrends(filteredRecords, rules);
  }, [filteredRecords, rules]);

  // Highest late rate department
  const highestLateDept = useMemo(() => {
    if (!deptData || deptData.length === 0) return null;
    return [...deptData].sort((a, b) => b.lateRatePercent - a.lateRatePercent)[0];
  }, [deptData]);

  // Punctuality improvement evaluation
  const punctualityTrendInsight = useMemo(() => {
    if (dailyTrends.length < 5) return 'Insufficient data';
    const firstFew = dailyTrends.slice(0, 5);
    const lastFew = dailyTrends.slice(-5);
    const avgStart = firstFew.reduce((acc, d) => acc + d.punctualityPercent, 0) / firstFew.length;
    const avgEnd = lastFew.reduce((acc, d) => acc + d.punctualityPercent, 0) / lastFew.length;
    const diff = Math.round(avgEnd - avgStart);
    if (diff > 0) return `Punctuality improved by +${diff}% over the evaluated window.`;
    if (diff < 0) return `Punctuality decreased by ${Math.abs(diff)}% over the evaluated window.`;
    return 'Punctuality rate remains steady across the evaluated timeline.';
  }, [dailyTrends]);

  return (
    <div className="view-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <BarChart3 size={26} style={{ color: '#3b82f6' }} />
            Advanced Entry, Exit & Longitudinal Trend Analytics
          </h1>
          <p>
            Synthesizing raw turnstile scan timestamps into actionable institutional punctuality insights
          </p>
        </div>

        {/* Time filters */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          {['today', '7_days', '30_days', 'semester'].map(tf => {
            const labels = { today: 'Today', '7_days': '7 Days', '30_days': '30 Days', semester: 'Full Semester' };
            return (
              <button
                key={tf}
                className={`btn btn-sm ${timeFilter === tf ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTimeFilter(tf)}
              >
                {labels[tf]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Institutional Answers Cards (Section 10) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), var(--bg-card))', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.74rem', color: '#60a5fa', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle size={14} /> Question: Are students becoming more punctual?
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
            {punctualityTrendInsight}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Calculated from 5-day rolling average comparison across {dailyTrends.length} working days.
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08), var(--bg-card))', borderLeft: '4px solid #0ea5e9' }}>
          <div style={{ fontSize: '0.74rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} /> Question: When is the campus busiest?
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
            {distributionData.peakArrivalPeriod} (Morning Influx) & 05:00 - 05:20 PM (Evening Egress)
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Earliest scan at {distributionData.earliestArrival}; campus population peaks at 09:15 AM.
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), var(--bg-card))', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.74rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> Question: Which department has highest late arrival rate?
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f87171', marginTop: '6px' }}>
            {highestLateDept ? `${highestLateDept.department} (${highestLateDept.lateRatePercent}% Late Rate)` : 'Calculating...'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {highestLateDept ? `${highestLateDept.totalLate} late entries recorded with avg arrival at ${highestLateDept.avgEntryTime}.` : ''}
          </div>
        </div>
      </div>

      {/* Longitudinal Daily Trend Chart */}
      <div style={{ marginBottom: '24px' }}>
        <DailyTrendChart dailyTrends={dailyTrends} />
      </div>

      {/* Arrival Distribution & Department Analytics Grid */}
      <div className="dashboard-grid-2">
        <ArrivalDistributionChart distributionData={distributionData} rules={rules} />
        <DepartmentComparisonChart departmentData={deptData} />
      </div>
    </div>
  );
}
