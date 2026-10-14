import React from 'react';
import { 
  Search, 
  Check, 
  Clock, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Tag, 
  Calendar,
  X,
  CreditCard,
  Zap,
  Printer
} from 'lucide-react';
import { getBillStatusInfo } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currency';

const CATEGORIES = [
  'All',
  'Utilities',
  'Housing',
  'Internet & Cable',
  'Subscriptions',
  'Insurance',
  'Groceries',
  'Medical',
  'Transportation',
  'Other'
];

export default function BillList({
  bills,
  filters,
  onFilterChange,
  onTogglePaid,
  onEditBill,
  onDeleteBill,
  onPrintReceipt
}) {
  // Helper for clear, unambiguous status badges
  const renderStatusBadge = (bill) => {
    const info = getBillStatusInfo(bill);

    if (info.type === 'paid') {
      return (
        <div className="badge-wrapper">
          <span className="status-badge badge-success">
            <CheckCircle2 size={13} className="badge-icon" />
            <span>PAID</span>
          </span>
          {bill.paid_date && (
            <span className="badge-subtext">Settled on {bill.paid_date}</span>
          )}
        </div>
      );
    }

    if (info.type === 'overdue') {
      return (
        <div className="badge-wrapper">
          <span className="status-badge badge-danger">
            <span className="pulse-danger-dot" />
            <span>OVERDUE</span>
          </span>
          <span className="badge-subtext text-danger-sub">
            {info.sublabel}
          </span>
        </div>
      );
    }

    if (info.type === 'due-today') {
      return (
        <div className="badge-wrapper">
          <span className="status-badge badge-danger" style={{ background: '#fef2f2', borderColor: '#f87171' }}>
            <Zap size={13} className="badge-icon" />
            <span>DUE TODAY</span>
          </span>
          <span className="badge-subtext text-danger-sub">
            Due by midnight!
          </span>
        </div>
      );
    }

    if (info.type === 'due-tomorrow' || info.type === 'due-soon') {
      return (
        <div className="badge-wrapper">
          <span className="status-badge badge-warning">
            <Clock size={13} className="badge-icon" />
            <span>{info.label}</span>
          </span>
          <span className="badge-subtext text-warning-sub">
            {info.sublabel}
          </span>
        </div>
      );
    }

    return (
      <div className="badge-wrapper">
        <span className="status-badge badge-neutral">
          <Clock size={13} className="badge-icon" />
          <span>UPCOMING</span>
        </span>
        <span className="badge-subtext">Due {bill.due_date}</span>
      </div>
    );
  };


  const getCategoryColorClass = (cat) => {
    switch (cat) {
      case 'Housing': return 'cat-housing';
      case 'Utilities': return 'cat-utilities';
      case 'Internet & Cable': return 'cat-internet';
      case 'Subscriptions': return 'cat-subscriptions';
      case 'Insurance': return 'cat-insurance';
      case 'Groceries': return 'cat-groceries';
      default: return 'cat-other';
    }
  };

  return (
    <div className="bills-section-container">
      {/* Toolbar: Search, Filters & Sorting */}
      <div className="bills-toolbar">
        {/* Search input */}
        <div className="search-field-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search bills, notes, providers..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          />
          {filters.search && (
            <button 
              className="clear-search-btn"
              onClick={() => onFilterChange({ ...filters, search: '' })}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="status-filter-pills">
          {[
            { id: 'all', label: 'All' },
            { id: 'unpaid', label: 'Pending' },
            { id: 'paid', label: 'Paid' },
            { id: 'overdue', label: 'Overdue' }
          ].map((pill) => (
            <button
              key={pill.id}
              className={`pill-btn ${filters.status === pill.id ? 'is-active' : ''}`}
              onClick={() => onFilterChange({ ...filters, status: pill.id })}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Category & Sort Dropdowns */}
        <div className="dropdowns-group">
          <select
            className="modern-select"
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            aria-label="Filter by category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <select
            className="modern-select"
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
            aria-label="Sort bills"
          >
            <option value="due-asc">Sort: Due Date (Earliest)</option>
            <option value="amount-desc">Sort: Amount (High to Low)</option>
            <option value="amount-asc">Sort: Amount (Low to High)</option>
            <option value="title-asc">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Bills Presentation */}
      {bills.length === 0 ? (
        <div className="empty-bills-card">
          <div className="empty-icon-wrap">
            <CreditCard size={32} />
          </div>
          <h4 className="empty-title">No bills match your current filter</h4>
          <p className="empty-text">
            Try switching filters or click the "Add Bill" button to record a new household bill.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-wrapper-card hide-on-mobile">
            <table className="modern-bills-table">
              <thead>
                <tr>
                  <th style={{ width: 60, textAlign: 'center' }}>Status</th>
                  <th>Bill Details</th>
                  <th>Category</th>
                  <th>Due Date</th>
                  <th>Payment State</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ width: 110, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => {
                  const statusInfo = getBillStatusInfo(bill);
                  const isOverdue = statusInfo.isOverdue;
                  return (
                    <tr 
                      key={bill.id} 
                      className={`bill-row ${isOverdue ? 'row-overdue' : ''} ${bill.is_paid ? 'row-paid' : ''}`}
                    >
                      {/* Checkbox toggle */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className={`btn-toggle-paid ${bill.is_paid ? 'is-paid' : isOverdue ? 'is-overdue' : ''}`}
                          onClick={() => onTogglePaid(bill.id)}
                          title={bill.is_paid ? 'Mark Unpaid' : 'Mark as Paid'}
                        >
                          {bill.is_paid ? (
                            <Check size={16} strokeWidth={3} />
                          ) : (
                            <span className="unpaid-indicator" />
                          )}
                        </button>
                      </td>

                      {/* Title & Notes */}
                      <td>
                        <div className={`bill-title-text ${bill.is_paid ? 'title-paid' : ''}`}>
                          {bill.title}
                        </div>
                        {bill.notes && (
                          <div className="bill-notes-text">{bill.notes}</div>
                        )}
                      </td>

                      {/* Category */}
                      <td>
                        <span className={`category-tag-modern ${getCategoryColorClass(bill.category)}`}>
                          {bill.category}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td>
                        <div className="due-date-cell">
                          <Calendar size={13} className="cell-icon" />
                          <span className={isOverdue ? 'due-overdue-text' : 'due-normal-text'}>
                            {bill.due_date}
                          </span>
                        </div>
                      </td>

                      {/* Clear Status Badges */}
                      <td>
                        {renderStatusBadge(bill)}
                      </td>

                      {/* Amount */}
                      <td style={{ textAlign: 'right' }}>
                        <span className={`bill-amount-val ${bill.is_paid ? 'amount-paid' : ''}`}>
                          {formatCurrency(bill.amount)}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td>
                        <div className="row-actions-group">
                          <button
                            className="btn-action-icon print-btn"
                            onClick={() => onPrintReceipt && onPrintReceipt(bill)}
                            title="Print Bill Receipt / Voucher"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            className="btn-action-icon edit-btn"
                            onClick={() => onEditBill(bill)}
                            title="Edit Bill Details"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            className="btn-action-icon delete-btn"
                            onClick={() => onDeleteBill(bill)}
                            title="Delete Bill"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Friendly Card List View (Visible on small screens) */}
          <div className="mobile-bills-list show-on-mobile">
            {bills.map((bill) => {
              const statusInfo = getBillStatusInfo(bill);
              const isOverdue = statusInfo.isOverdue;
              return (
                <div 
                  key={bill.id} 
                  className={`mobile-bill-card ${isOverdue ? 'mobile-overdue' : ''} ${bill.is_paid ? 'mobile-paid' : ''}`}
                >
                  <div className="mobile-card-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button
                        type="button"
                        className={`btn-toggle-paid ${bill.is_paid ? 'is-paid' : isOverdue ? 'is-overdue' : ''}`}
                        onClick={() => onTogglePaid(bill.id)}
                      >
                        {bill.is_paid ? <Check size={16} strokeWidth={3} /> : <span className="unpaid-indicator" />}
                      </button>
                      <div>
                        <div className={`bill-title-text ${bill.is_paid ? 'title-paid' : ''}`}>
                          {bill.title}
                        </div>
                        <span className={`category-tag-modern ${getCategoryColorClass(bill.category)}`}>
                          {bill.category}
                        </span>
                      </div>
                    </div>

                    <div className="mobile-card-amount">
                      {formatCurrency(bill.amount)}
                    </div>
                  </div>

                  {bill.notes && (
                    <div className="mobile-card-notes">{bill.notes}</div>
                  )}

                  <div className="mobile-card-bottom">
                    <div>
                      {renderStatusBadge(bill)}
                    </div>

                    <div className="row-actions-group">
                      <button
                        className="btn-action-icon print-btn"
                        onClick={() => onPrintReceipt && onPrintReceipt(bill)}
                        title="Print Receipt"
                      >
                        <Printer size={15} />
                      </button>
                      <button
                        className="btn-action-icon edit-btn"
                        onClick={() => onEditBill(bill)}
                        title="Edit Bill"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        className="btn-action-icon delete-btn"
                        onClick={() => onDeleteBill(bill)}
                        title="Delete Bill"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
