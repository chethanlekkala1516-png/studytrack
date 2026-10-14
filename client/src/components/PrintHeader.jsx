import React from 'react';
import { formatCurrency } from '../utils/currency';

export default function PrintHeader({ stats }) {
  const summary = stats?.summary || {};
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="print-only-header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #333', paddingBottom: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Household Bill Statement & Summary</h1>
          <p style={{ margin: '4px 0 0', color: '#555', fontSize: '0.9rem' }}>Smart Bill Manager • Household Expense Report</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>Statement Date:</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{currentDate}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, margin: '16px 0', padding: '12px', background: '#f8f8f8', border: '1px solid #ddd' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#666' }}>TOTAL EXPENSES</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{formatCurrency(summary.totalAmount || 0)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#666' }}>TOTAL PAID</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#059669' }}>{formatCurrency(summary.paidAmount || 0)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#666' }}>PENDING UNPAID</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#d97706' }}>{formatCurrency(summary.pendingAmount || 0)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#666' }}>OVERDUE</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#dc2626' }}>{formatCurrency(summary.overdueAmount || 0)}</div>
        </div>
      </div>
    </div>
  );
}
