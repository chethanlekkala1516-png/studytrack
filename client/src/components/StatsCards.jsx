import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Wallet 
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function StatsCards({ stats, onSelectFilter }) {
  const summary = stats?.summary || {};
  const totalAmount = Number(summary.totalAmount || 0);
  const paidAmount = Number(summary.paidAmount || 0);
  const pendingAmount = Number(summary.pendingAmount || 0);
  const overdueAmount = Number(summary.overdueAmount || 0);

  const totalCount = Number(summary.totalCount || 0);
  const paidCount = Number(summary.paidCount || 0);
  const pendingCount = Number(summary.pendingCount || 0);
  const overdueCount = Number(summary.overdueCount || 0);

  const paidPercentage = totalAmount > 0 
    ? Math.round((paidAmount / totalAmount) * 100) 
    : 0;

  return (
    <section className="stats-cards-grid">
      {/* 1. Total Household Expenses Card */}
      <div 
        className="kpi-card kpi-total"
        onClick={() => onSelectFilter && onSelectFilter('all')}
        title="View all bills"
      >
        <div className="kpi-header">
          <span className="kpi-label">Total Monthly Budget</span>
          <div className="kpi-icon-wrap icon-blue">
            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹</span>
          </div>
        </div>
        <div className="kpi-amount">
          {formatCurrency(totalAmount)}
        </div>
        <div className="kpi-footer">
          <span className="kpi-tag tag-blue">
            <TrendingUp size={12} style={{ marginRight: 3 }} />
            {totalCount} total bills
          </span>
          <span className="kpi-subtext">Overall recorded</span>
        </div>
      </div>

      {/* 2. Paid Bills Card */}
      <div 
        className="kpi-card kpi-paid"
        onClick={() => onSelectFilter && onSelectFilter('paid')}
        title="Filter by paid bills"
      >
        <div className="kpi-header">
          <span className="kpi-label">Total Settled (Paid)</span>
          <div className="kpi-icon-wrap icon-green">
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div className="kpi-amount text-success">
          {formatCurrency(paidAmount)}
        </div>
        <div className="kpi-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-tag tag-green">
              {paidPercentage}% completed
            </span>
            <span className="kpi-subtext">{paidCount} of {totalCount} bills</span>
          </div>
          <div className="kpi-progress-bar">
            <div 
              className="kpi-progress-fill" 
              style={{ width: `${paidPercentage}%` }} 
            />
          </div>
        </div>
      </div>

      {/* 3. Pending Bills Card */}
      <div 
        className="kpi-card kpi-pending"
        onClick={() => onSelectFilter && onSelectFilter('unpaid')}
        title="Filter by pending bills"
      >
        <div className="kpi-header">
          <span className="kpi-label">Pending Payments</span>
          <div className="kpi-icon-wrap icon-amber">
            <Clock size={20} />
          </div>
        </div>
        <div className="kpi-amount text-amber">
          {formatCurrency(pendingAmount)}
        </div>
        <div className="kpi-footer">
          <span className="kpi-tag tag-amber">
            {pendingCount} open bills
          </span>
          <span className="kpi-subtext">Awaiting payment</span>
        </div>
      </div>

      {/* 4. Overdue Alert Card */}
      <div 
        className={`kpi-card kpi-overdue ${overdueCount > 0 ? 'is-active-overdue' : ''}`}
        onClick={() => onSelectFilter && onSelectFilter('overdue')}
        title="Filter by overdue bills"
      >
        <div className="kpi-header">
          <span className={`kpi-label ${overdueCount > 0 ? 'text-danger-label' : ''}`}>
            Overdue Balance
          </span>
          <div className={`kpi-icon-wrap ${overdueCount > 0 ? 'icon-red-pulse' : 'icon-gray'}`}>
            <AlertTriangle size={20} />
          </div>
        </div>
        <div className={`kpi-amount ${overdueCount > 0 ? 'text-danger' : 'text-muted'}`}>
          {formatCurrency(overdueAmount)}
        </div>
        <div className="kpi-footer">
          {overdueCount > 0 ? (
            <span className="kpi-tag tag-red">
              <AlertTriangle size={12} style={{ marginRight: 3 }} />
              {overdueCount} bill{overdueCount > 1 ? 's' : ''} overdue
            </span>
          ) : (
            <span className="kpi-tag tag-neutral">
              All up to date
            </span>
          )}
          <span className="kpi-subtext">
            {overdueCount > 0 ? 'Immediate action' : 'No late fees'}
          </span>
        </div>
      </div>
    </section>
  );
}
