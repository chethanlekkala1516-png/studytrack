import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  Edit3, 
  DollarSign, 
  Calendar, 
  Tag, 
  FileText, 
  CheckCircle, 
  Check 
} from 'lucide-react';

const CATEGORIES = [
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

export default function BillModal({ isOpen, onClose, onSave, initialBill }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Utilities');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialBill) {
      setTitle(initialBill.title || '');
      setCategory(initialBill.category || 'Utilities');
      setAmount(initialBill.amount !== undefined ? initialBill.amount : '');
      setDueDate(initialBill.due_date || '');
      setIsPaid(Boolean(initialBill.is_paid));
      setNotes(initialBill.notes || '');
    } else {
      setTitle('');
      setCategory('Utilities');
      setAmount('');
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setDueDate(defaultDate.toISOString().split('T')[0]);
      setIsPaid(false);
      setNotes('');
    }
    setError('');
  }, [initialBill, isOpen]);

  if (!isOpen) return null;

  // Date helper buttons
  const setQuickDate = (daysFromToday) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a bill title.');
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Please provide a valid bill amount greater than ₹0.');
      return;
    }
    if (!dueDate) {
      setError('Please specify a due date.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        title: title.trim(),
        category,
        amount: parseFloat(amount),
        due_date: dueDate,
        is_paid: isPaid ? 1 : 0,
        notes: notes.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Error saving bill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop-modern" onClick={onClose}>
      <div 
        className="modal-container-modern" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="modal-top-bar">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              {initialBill ? <Edit3 size={18} /> : <PlusCircle size={18} />}
            </div>
            <div>
              <h3 className="modal-heading-text">
                {initialBill ? 'Edit Bill Details' : 'Add Household Bill'}
              </h3>
              <p className="modal-subheading-text">
                {initialBill 
                  ? 'Update payment terms or notes for this bill' 
                  : 'Record a new expense to track due dates and payments'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="modal-close-icon-btn" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-form-wrapper">
          <div className="modal-form-content">
            {error && (
              <div className="form-alert-error">
                {error}
              </div>
            )}

            {/* Bill Title */}
            <div className="modern-form-group">
              <label className="modern-form-label">
                Bill Title / Service Provider <span className="req-star">*</span>
              </label>
              <input
                type="text"
                className="modern-form-input"
                placeholder="e.g. Electric Power Utility, Fiber Internet, Rent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Category selection */}
            <div className="modern-form-group">
              <label className="modern-form-label">
                <Tag size={13} style={{ marginRight: 4 }} />
                Expense Category <span className="req-star">*</span>
              </label>
              {/* Quick clickable pill selectors */}
              <div className="category-pills-selector">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`cat-pill-option ${category === cat ? 'selected' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {category === cat && <Check size={12} style={{ marginRight: 4 }} />}
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount and Due Date side by side */}
            <div className="form-row-two-col">
              {/* Amount */}
              <div className="modern-form-group">
                <label className="modern-form-label">
                  Amount Due <span className="req-star">*</span>
                </label>
                <div className="input-with-adornment">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="modern-form-input input-has-prefix"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Due Date */}
              <div className="modern-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="modern-form-label">
                    <Calendar size={13} style={{ marginRight: 4 }} />
                    Due Date <span className="req-star">*</span>
                  </label>
                  <div className="quick-date-helpers">
                    <button type="button" onClick={() => setQuickDate(0)} className="quick-date-btn">Today</button>
                    <button type="button" onClick={() => setQuickDate(7)} className="quick-date-btn">+7d</button>
                    <button type="button" onClick={() => setQuickDate(30)} className="quick-date-btn">+30d</button>
                  </div>
                </div>
                <input
                  type="date"
                  className="modern-form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Payment Status Switch */}
            <div className="payment-status-toggle-card">
              <div className="toggle-info-text">
                <span className="toggle-title">Payment Status</span>
                <span className="toggle-desc">
                  {isPaid ? 'Marked as Paid (settled)' : 'Unpaid (will appear in pending reminders)'}
                </span>
              </div>
              <label className="modern-switch-label">
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="modern-switch-checkbox"
                />
                <span className="modern-switch-slider" />
              </label>
            </div>

            {/* Notes & Reference info */}
            <div className="modern-form-group">
              <label className="modern-form-label">
                <FileText size={13} style={{ marginRight: 4 }} />
                Notes & Account Number (Optional)
              </label>
              <textarea
                className="modern-form-textarea"
                rows="2"
                placeholder="e.g. Account #9821, payment auto-pay link, confirmation info..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-bottom-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : initialBill ? 'Update Bill' : 'Save Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
