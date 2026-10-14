import React, { useState } from 'react';
import { Wallet, Mail, Phone, User, Lock, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { loginUser } from '../services/api';

export default function AuthScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

    if (!cleanEmail) {
      setError('Please enter your Gmail / Email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid Gmail / Email address (e.g. name@gmail.com).');
      return;
    }

    if (!cleanMobile || cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({
        email: cleanEmail,
        mobile: cleanMobile,
        name: name.trim() || undefined,
        password: password.trim() || undefined
      });
      if (res && res.user) {
        onLogin(res.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('rahul.sharma@gmail.com');
    setMobile('9876543210');
    setName('Rahul Sharma');
    setPassword('1234');
    setError('');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-modern">
        {/* Brand header */}
        <div className="auth-brand-header">
          <div className="auth-logo-badge">
            <Wallet size={30} color="#ffffff" />
          </div>
          <h1 className="auth-brand-title">SmartBill Manager</h1>
          <p className="auth-brand-subtitle">
            Personal & Household Expense Management • India
          </p>
        </div>

        {/* Highlight feature pills */}
        <div className="auth-feature-pills">
          <span className="auth-pill">
            <CheckCircle2 size={13} color="#10b981" />
            ₹ Indian Rupee
          </span>
          <span className="auth-pill">
            <CheckCircle2 size={13} color="#10b981" />
            Due Reminders
          </span>
          <span className="auth-pill">
            <CheckCircle2 size={13} color="#10b981" />
            Print Statements
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div className="auth-error-banner">
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Gmail / Email */}
          <div className="modern-form-group">
            <label className="modern-form-label">
              <Mail size={13} style={{ marginRight: 4 }} />
              Gmail / Email Address <span className="req-star">*</span>
            </label>
            <input
              type="email"
              className="modern-form-input"
              placeholder="e.g. rahul.sharma@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Mobile Number */}
          <div className="modern-form-group">
            <label className="modern-form-label">
              <Phone size={13} style={{ marginRight: 4 }} />
              Mobile Number (10 Digits) <span className="req-star">*</span>
            </label>
            <div className="input-with-adornment">
              <span className="input-prefix" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                className="modern-form-input input-has-prefix"
                placeholder="98765 43210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
              />
            </div>
          </div>

          {/* Optional Name */}
          <div className="modern-form-group">
            <label className="modern-form-label">
              <User size={13} style={{ marginRight: 4 }} />
              Household / User Name (Optional)
            </label>
            <input
              type="text"
              className="modern-form-input"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Optional Password / PIN */}
          <div className="modern-form-group">
            <label className="modern-form-label">
              <Lock size={13} style={{ marginRight: 4 }} />
              Security PIN / Password (Optional)
            </label>
            <input
              type="password"
              className="modern-form-input"
              placeholder="4-digit PIN or password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight size={16} />
          </button>

          {/* Quick Demo Credentials Autofill */}
          <div className="auth-demo-hint-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                Testing or Demo?
              </span>
              <button
                type="button"
                className="btn-link-demo"
                onClick={handleDemoLogin}
              >
                <Sparkles size={13} style={{ marginRight: 4 }} />
                Fill Sample Credentials
              </button>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 4 }}>
              Sample: <code>rahul.sharma@gmail.com</code> • Mobile: <code>9876543210</code>
            </div>
          </div>
        </form>

        <div className="auth-footer-note">
          <ShieldCheck size={14} color="#10b981" style={{ marginRight: 4, verticalAlign: 'middle' }} />
          <span>Local SQLite database persistence • Secure Session</span>
        </div>
      </div>
    </div>
  );
}
