import React, { useState } from 'react';
import { X, Printer, Calendar, Wallet, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { getBillStatusInfo } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currency';

export default function MonthlyStatementModal({ isOpen, onClose, bills = [] }) {
  // Extract distinct months from bills
  const availableMonths = Array.from(
    new Set((bills || []).map(b => (b.due_date ? b.due_date.substring(0, 7) : '')))
  ).filter(Boolean).sort().reverse();

  // Default to current month or first available
  const [selectedMonth, setSelectedMonth] = useState(
    availableMonths[0] || 'all'
  );

  if (!isOpen) return null;

  // Filter bills by selected month
  const filteredBills = selectedMonth === 'all'
    ? bills
    : bills.filter(b => b.due_date && b.due_date.startsWith(selectedMonth));

  // Calculate monthly metrics
  const totalAmount = filteredBills.reduce((s, b) => s + Number(b.amount || 0), 0);
  const paidAmount = filteredBills.filter(b => b.is_paid).reduce((s, b) => s + Number(b.amount || 0), 0);
  const pendingAmount = filteredBills.filter(b => !b.is_paid).reduce((s, b) => s + Number(b.amount || 0), 0);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueAmount = filteredBills
    .filter(b => !b.is_paid && b.due_date < todayStr)
    .reduce((s, b) => s + Number(b.amount || 0), 0);

  // Calculate Category-wise breakdown for selected month
  const categoryMap = {};
  filteredBills.forEach(b => {
    if (!categoryMap[b.category]) {
      categoryMap[b.category] = { count: 0, total: 0, paid: 0, pending: 0 };
    }
    categoryMap[b.category].count += 1;
    categoryMap[b.category].total += Number(b.amount || 0);
    if (b.is_paid) categoryMap[b.category].paid += Number(b.amount || 0);
    else categoryMap[b.category].pending += Number(b.amount || 0);
  });

  const categoryList = Object.entries(categoryMap).map(([cat, data]) => ({
    category: cat,
    ...data,
    percentage: totalAmount > 0 ? ((data.total / totalAmount) * 100).toFixed(1) : 0
  })).sort((a, b) => b.total - a.total);

  // Format month for display (e.g. "2026-10" -> "October 2026")
  const formatMonthTitle = (monthStr) => {
    if (monthStr === 'all') return 'All Recorded Months';
    const [y, m] = monthStr.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handlePrint = () => {
    document.body.classList.add('printing-statement');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-statement');
    }, 1000);
  };

  return (
    <div className="modal-backdrop-modern" onClick={onClose}>
      <div 
        className="modal-container-modern statement-modal-box" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Controls bar (Hidden during print) */}
        <div className="statement-controls-bar no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Calendar size={18} color="#2563eb" />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
              Print Monthly Financial Statement
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Select Period:</label>
              <select
                className="modern-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ padding: '4px 10px' }}
              >
                <option value="all">All Months Combined</option>
                {availableMonths.map(m => (
                  <option key={m} value={m}>{formatMonthTitle(m)}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={16} />
              Print Statement
            </button>
            <button className="btn-icon" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Monthly Statement Document */}
        <div className="print-monthly-statement-container">
          <div className="statement-document-inner">
            {/* Statement Header */}
            <div className="statement-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="receipt-logo">
                  <Wallet size={24} color="#ffffff" />
                </div>
                <div>
                  <h1 className="statement-main-title">SMARTBILL HOUSEHOLD STATEMENT</h1>
                  <p className="statement-period-text">
                    Period: <strong>{formatMonthTitle(selectedMonth)}</strong>
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Statement Issued</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="statement-kpi-row">
              <div className="statement-kpi-box">
                <span className="kpi-box-label">TOTAL EXPENSES</span>
                <span className="kpi-box-val">{formatCurrency(totalAmount)}</span>
                <span className="kpi-box-sub">{filteredBills.length} household bills</span>
              </div>
              <div className="statement-kpi-box">
                <span className="kpi-box-label">SETTLED (PAID)</span>
                <span className="kpi-box-val" style={{ color: '#059669' }}>{formatCurrency(paidAmount)}</span>
                <span className="kpi-box-sub">
                  {totalAmount > 0 ? `${Math.round((paidAmount / totalAmount) * 100)}% of total` : '0%'}
                </span>
              </div>
              <div className="statement-kpi-box">
                <span className="kpi-box-label">PENDING BALANCE</span>
                <span className="kpi-box-val" style={{ color: '#d97706' }}>{formatCurrency(pendingAmount)}</span>
                <span className="kpi-box-sub">Awaiting settlement</span>
              </div>
              <div className="statement-kpi-box">
                <span className="kpi-box-label">OVERDUE AMOUNT</span>
                <span className="kpi-box-val" style={{ color: overdueAmount > 0 ? '#dc2626' : '#64748b' }}>
                  {formatCurrency(overdueAmount)}
                </span>
                <span className="kpi-box-sub">
                  {overdueAmount > 0 ? 'Requires attention' : 'None overdue'}
                </span>
              </div>
            </div>

            {/* Category-Wise Spending Table */}
            <div className="statement-section">
              <h3 className="statement-section-heading">1. Category-Wise Spending Breakdown</h3>
              <table className="statement-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style={{ textAlign: 'center' }}>Bills Count</th>
                    <th style={{ textAlign: 'right' }}>Total Expense</th>
                    <th style={{ textAlign: 'center' }}>% of Budget</th>
                    <th style={{ textAlign: 'right' }}>Paid</th>
                    <th style={{ textAlign: 'right' }}>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryList.map(cat => (
                    <tr key={cat.category}>
                      <td><strong>{cat.category}</strong></td>
                      <td style={{ textAlign: 'center' }}>{cat.count}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(cat.total)}</td>
                      <td style={{ textAlign: 'center' }}>{cat.percentage}%</td>
                      <td style={{ textAlign: 'right', color: '#059669' }}>{formatCurrency(cat.paid)}</td>
                      <td style={{ textAlign: 'right', color: cat.pending > 0 ? '#d97706' : '#64748b' }}>
                        {formatCurrency(cat.pending)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 800, background: '#f8fafc' }}>
                    <td>Total</td>
                    <td style={{ textAlign: 'center' }}>{filteredBills.length}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(totalAmount)}</td>
                    <td style={{ textAlign: 'center' }}>100%</td>
                    <td style={{ textAlign: 'right', color: '#059669' }}>{formatCurrency(paidAmount)}</td>
                    <td style={{ textAlign: 'right', color: '#d97706' }}>{formatCurrency(pendingAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Itemized Bill Register */}
            <div className="statement-section">
              <h3 className="statement-section-heading">2. Itemized Bills Register</h3>
              <table className="statement-table">
                <thead>
                  <tr>
                    <th>Bill Title</th>
                    <th>Category</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map(bill => {
                    const statusInfo = getBillStatusInfo(bill);
                    return (
                      <tr key={bill.id}>
                        <td>
                          <strong>{bill.title}</strong>
                          {bill.notes && <div className="table-sub-note">{bill.notes}</div>}
                        </td>
                        <td>{bill.category}</td>
                        <td>{bill.due_date}</td>
                        <td>
                          <span className={`status-badge badge-${statusInfo.variant}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                          {formatCurrency(bill.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Statement Sign-off */}
            <div className="statement-footer">
              <div>
                <p>Generated by Smart Bill Manager • SQLite Financial Record</p>
                <p>Report Date: {new Date().toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p>Household Financial Administration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
