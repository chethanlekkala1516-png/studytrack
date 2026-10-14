import React from 'react';
import { X, Printer, CheckCircle2, AlertTriangle, Clock, Wallet, Calendar, Tag, FileText } from 'lucide-react';
import { getBillStatusInfo } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currency';

export default function ReceiptModal({ isOpen, onClose, bill }) {
  if (!isOpen || !bill) return null;

  const statusInfo = getBillStatusInfo(bill);
  const receiptNo = `REC-${new Date().getFullYear()}-${String(bill.id).padStart(4, '0')}`;
  const printedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    document.body.classList.add('printing-receipt');
    window.print();
    // Remove class after print dialog closes
    setTimeout(() => {
      document.body.classList.remove('printing-receipt');
    }, 1000);
  };

  return (
    <div className="modal-backdrop-modern" onClick={onClose}>
      <div 
        className="modal-container-modern receipt-modal-box" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Modal Controls (Hidden when printed) */}
        <div className="receipt-modal-actions no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Printer size={18} color="#2563eb" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              Bill Payment Receipt Preview
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={16} />
              Print Receipt
            </button>
            <button className="btn-icon" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Voucher Container */}
        <div className="print-receipt-container">
          <div className="receipt-voucher-inner">
            {/* Receipt Header */}
            <div className="receipt-header">
              <div className="receipt-brand">
                <div className="receipt-logo">
                  <Wallet size={24} color="#ffffff" />
                </div>
                <div>
                  <h2 className="receipt-title">SMARTBILL HOUSEHOLD RECEIPT</h2>
                  <p className="receipt-subtitle">Personal Expense & Payment Voucher</p>
                </div>
              </div>
              <div className="receipt-meta">
                <div className="receipt-no">{receiptNo}</div>
                <div className="receipt-date">Date: {printedDate}</div>
              </div>
            </div>

            <div className="receipt-divider" />

            {/* Status Stamp Banner */}
            <div className={`receipt-stamp-banner stamp-${statusInfo.variant}`}>
              <div className="stamp-left">
                {statusInfo.type === 'paid' ? (
                  <CheckCircle2 size={22} />
                ) : statusInfo.type === 'overdue' ? (
                  <AlertTriangle size={22} />
                ) : (
                  <Clock size={22} />
                )}
                <div>
                  <div className="stamp-headline">STATUS: {statusInfo.label}</div>
                  <div className="stamp-subtext">{statusInfo.sublabel}</div>
                </div>
              </div>
              <div className="stamp-amount-highlight">
                {formatCurrency(bill.amount)}
              </div>
            </div>

            {/* Bill Details Grid */}
            <div className="receipt-grid">
              <div className="receipt-field">
                <span className="receipt-label">Bill / Provider Title</span>
                <strong className="receipt-value">{bill.title}</strong>
              </div>

              <div className="receipt-field">
                <span className="receipt-label">Expense Category</span>
                <span className="receipt-value">{bill.category}</span>
              </div>

              <div className="receipt-field">
                <span className="receipt-label">Scheduled Due Date</span>
                <span className="receipt-value">{bill.due_date}</span>
              </div>

              <div className="receipt-field">
                <span className="receipt-label">Settlement Date</span>
                <span className="receipt-value">
                  {bill.paid_date ? bill.paid_date : 'Pending payment'}
                </span>
              </div>

              <div className="receipt-field full-width">
                <span className="receipt-label">Reference Notes & Account #</span>
                <span className="receipt-value notes-val">
                  {bill.notes ? bill.notes : 'No specific reference notes entered.'}
                </span>
              </div>
            </div>

            {/* Financial Ledger Table */}
            <table className="receipt-ledger-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Due Date</th>
                  <th style={{ textAlign: 'right' }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>{bill.title}</strong>
                    {bill.notes && <div className="table-sub-note">{bill.notes}</div>}
                  </td>
                  <td>{bill.category}</td>
                  <td>{bill.due_date}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.05rem' }}>
                    {formatCurrency(bill.amount)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: 700 }}>
                    Total {bill.is_paid ? 'Amount Settled' : 'Amount Due'}:
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.15rem' }}>
                    {formatCurrency(bill.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Receipt Footer */}
            <div className="receipt-footer">
              <div className="receipt-footer-left">
                <p>This document is an electronic expense voucher generated by Smart Bill Manager.</p>
                <p>Record ID #{bill.id} • SQLite Database Verified</p>
              </div>
              <div className="receipt-signature-box">
                <div className="signature-line" />
                <span className="signature-label">Household Payer Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
