import React from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle2, X, Zap } from 'lucide-react';
import { getDaysDifference, getBillStatusInfo } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currency';

export default function RemindersPopover({ 
  isOpen, 
  onClose, 
  stats, 
  onTogglePaid 
}) {
  if (!isOpen) return null;

  // Filter out any paid bills just in case
  const overdueBills = (stats?.overdueBills || []).filter(b => !b.is_paid);
  const upcoming7Days = (stats?.upcoming7Days || []).filter(b => !b.is_paid);
  const totalReminders = overdueBills.length + upcoming7Days.length;

  return (
    <div className="reminders-dropdown" onClick={(e) => e.stopPropagation()}>
      <div className="reminders-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={18} color="#2563eb" />
          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
            Payment Reminders ({totalReminders})
          </strong>
        </div>
        <button className="btn-icon" style={{ padding: 4 }} onClick={onClose} aria-label="Close reminders">
          <X size={16} />
        </button>
      </div>

      <div className="reminders-list">
        {totalReminders === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b' }}>
            <CheckCircle2 size={38} color="#10b981" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>All Caught Up!</p>
            <p style={{ fontSize: '0.8rem', marginTop: 4 }}>
              No bills are overdue or due within the next 7 days.
            </p>
          </div>
        ) : (
          <>
            {/* Overdue Section */}
            {overdueBills.length > 0 && (
              <div>
                <div style={{ padding: '8px 16px', background: '#fef2f2', color: '#991b1b', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: '1px solid #fee2e2' }}>
                  Overdue Bills ({overdueBills.length})
                </div>
                {overdueBills.map((bill) => {
                  const daysAgo = Math.abs(getDaysDifference(bill.due_date));
                  return (
                    <div key={bill.id} className="reminder-item" style={{ background: '#fffdfd' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <AlertTriangle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {bill.title}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: 2, fontWeight: 500 }}>
                          Due {bill.due_date} • <strong>{daysAgo === 0 ? 'Due today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} overdue`}</strong>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                          {formatCurrency(bill.amount)}
                        </div>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.72rem', marginTop: 4, borderColor: '#fca5a5', color: '#991b1b', background: '#fff5f5' }}
                          onClick={() => onTogglePaid(bill.id)}
                        >
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upcoming Next 7 Days Section */}
            {upcoming7Days.length > 0 && (
              <div>
                <div style={{ padding: '8px 16px', background: '#fffbeb', color: '#92400e', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: '1px solid #fef3c7' }}>
                  Due in Next 7 Days ({upcoming7Days.length})
                </div>
                {upcoming7Days.map((bill) => {
                  const daysLeft = getDaysDifference(bill.due_date);
                  let dueLabel = `Due in ${daysLeft} days`;
                  let isUrgentToday = false;

                  if (daysLeft === 0) {
                    dueLabel = 'Due today!';
                    isUrgentToday = true;
                  } else if (daysLeft === 1) {
                    dueLabel = 'Due tomorrow!';
                  }

                  return (
                    <div key={bill.id} className="reminder-item">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {isUrgentToday ? (
                            <Zap size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                          ) : (
                            <Clock size={15} color="#d97706" style={{ flexShrink: 0 }} />
                          )}
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {bill.title}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: isUrgentToday ? '#dc2626' : '#d97706', marginTop: 2, fontWeight: 500 }}>
                          {dueLabel} ({bill.due_date})
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                          {formatCurrency(bill.amount)}
                        </div>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.72rem', marginTop: 4 }}
                          onClick={() => onTogglePaid(bill.id)}
                        >
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
