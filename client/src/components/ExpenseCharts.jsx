import React, { useState } from 'react';
import { PieChart as PieIcon, BarChart3, Calendar, Layers } from 'lucide-react';
import { formatCurrency, formatCompactCurrency } from '../utils/currency';

const CATEGORY_COLORS = [
  '#3b82f6', // Electric Blue
  '#10b981', // Emerald Green
  '#f59e0b', // Amber Orange
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Bright Orange
  '#64748b'  // Slate Gray
];

export default function ExpenseCharts({ stats }) {
  const [activeChartTab, setActiveChartTab] = useState('category'); // 'category' | 'monthly'
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categoryTotals = stats?.categoryTotals || [];
  const monthlyTotals = stats?.monthlyTotals || [];
  const totalExpense = categoryTotals.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);

  // Prepare Donut slices
  let cumulativeAngle = 0;
  const donutSlices = categoryTotals.map((cat, index) => {
    const amount = Number(cat.totalAmount || 0);
    const fraction = totalExpense > 0 ? amount / totalExpense : 0;
    const angle = fraction * 360;

    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const toRadians = (deg) => (deg - 90) * (Math.PI / 180);
    const rOuter = 82;
    const rInner = 56;
    const cx = 105;
    const cy = 105;

    const x1 = cx + rOuter * Math.cos(toRadians(startAngle));
    const y1 = cy + rOuter * Math.sin(toRadians(startAngle));
    const x2 = cx + rOuter * Math.cos(toRadians(endAngle));
    const y2 = cy + rOuter * Math.sin(toRadians(endAngle));

    const x3 = cx + rInner * Math.cos(toRadians(endAngle));
    const y3 = cy + rInner * Math.sin(toRadians(endAngle));
    const x4 = cx + rInner * Math.cos(toRadians(startAngle));
    const y4 = cy + rInner * Math.sin(toRadians(startAngle));

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = totalExpense > 0 && fraction < 0.999
      ? `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`
      : `M 105 23 A 82 82 0 1 1 104.99 23 L 104.99 49 A 56 56 0 1 0 105 49 Z`;

    return {
      ...cat,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      pathData,
      fraction,
      percentage: (fraction * 100).toFixed(1)
    };
  });

  const maxCategorySpend = Math.max(...categoryTotals.map(c => Number(c.totalAmount || 0)), 1);
  const maxMonthlySpend = Math.max(...monthlyTotals.map(m => Number(m.totalAmount || 0)), 1);

  // Format YYYY-MM into friendly name (e.g. 2026-10 -> Oct 2026)
  const formatMonthName = (mStr) => {
    if (!mStr) return '';
    const [y, m] = mStr.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <section className="analytics-section">
      <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="section-title">Expense & Budget Analytics</h2>
          <p className="section-subtitle">Accurate category-wise and monthly spending allocations</p>
        </div>

        {/* View Switcher: Category vs Monthly */}
        <div className="status-filter-pills">
          <button
            type="button"
            className={`pill-btn ${activeChartTab === 'category' ? 'is-active' : ''}`}
            onClick={() => setActiveChartTab('category')}
          >
            <Layers size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Category View
          </button>
          <button
            type="button"
            className={`pill-btn ${activeChartTab === 'monthly' ? 'is-active' : ''}`}
            onClick={() => setActiveChartTab('monthly')}
          >
            <Calendar size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Monthly Timeline
          </button>
        </div>
      </div>

      {activeChartTab === 'category' ? (
        <div className="charts-grid-modern">
          {/* Card 1: Category Distribution Donut */}
          <div className="chart-card-modern">
            <div className="chart-card-top">
              <div className="chart-title-group">
                <div className="chart-icon-box icon-blue">
                  <PieIcon size={18} />
                </div>
                <div>
                  <h3 className="chart-card-heading">Category Allocation</h3>
                  <span className="chart-card-sub">Share of total {formatCurrency(totalExpense)}</span>
                </div>
              </div>
              <span className="chart-total-badge">
                {categoryTotals.length} Categories
              </span>
            </div>

            {categoryTotals.length === 0 ? (
              <div className="chart-empty-state">No expense records found</div>
            ) : (
              <div className="donut-content-layout">
                {/* SVG Donut */}
                <div className="donut-svg-wrapper">
                  <svg width="210" height="210" viewBox="0 0 210 210" className="donut-svg">
                    {donutSlices.map((slice) => {
                      const isHovered = hoveredCategory === slice.category;
                      return (
                        <path
                          key={slice.category}
                          d={slice.pathData}
                          fill={slice.color}
                          opacity={hoveredCategory === null || isHovered ? 1 : 0.4}
                          style={{
                            transformOrigin: '105px 105px',
                            transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={() => setHoveredCategory(slice.category)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          <title>{`${slice.category}: ${formatCurrency(slice.totalAmount)} (${slice.percentage}%)`}</title>
                        </path>
                      );
                    })}
                  </svg>

                  {/* Donut Center Display */}
                  <div className="donut-center-info">
                    <span className="donut-center-label">
                      {hoveredCategory || 'Total Budget'}
                    </span>
                    <span className="donut-center-value">
                      {hoveredCategory
                        ? formatCompactCurrency(categoryTotals.find(c => c.category === hoveredCategory)?.totalAmount || 0)
                        : formatCompactCurrency(totalExpense)}
                    </span>
                    <span className="donut-center-hint">
                      {hoveredCategory
                        ? `${donutSlices.find(s => s.category === hoveredCategory)?.percentage}% of total`
                        : `${categoryTotals.length} categories`}
                    </span>
                  </div>
                </div>

                {/* Category Legend list */}
                <div className="donut-legend-list">
                  {donutSlices.map((slice) => {
                    const isHovered = hoveredCategory === slice.category;
                    return (
                      <div
                        key={slice.category}
                        className={`legend-item-pill ${isHovered ? 'is-hovered' : ''}`}
                        onMouseEnter={() => setHoveredCategory(slice.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        <div className="legend-left">
                          <span 
                            className="legend-color-dot" 
                            style={{ backgroundColor: slice.color }} 
                          />
                          <span className="legend-name">{slice.category}</span>
                        </div>
                        <div className="legend-right">
                          <span className="legend-amount">{formatCurrency(slice.totalAmount)}</span>
                          <span className="legend-pct">{slice.percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Payment Status Per Category (Bar Chart) */}
          <div className="chart-card-modern">
            <div className="chart-card-top">
              <div className="chart-title-group">
                <div className="chart-icon-box icon-green">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="chart-card-heading">Category Settlement Status</h3>
                  <span className="chart-card-sub">Paid vs pending breakdown</span>
                </div>
              </div>

              <div className="chart-status-legend">
                <span className="status-key-item">
                  <span className="key-dot dot-green" /> Paid
                </span>
                <span className="status-key-item">
                  <span className="key-dot dot-amber" /> Pending
                </span>
              </div>
            </div>

            {categoryTotals.length === 0 ? (
              <div className="chart-empty-state">No payment data available</div>
            ) : (
              <div className="bars-list-container">
                {categoryTotals.map((cat) => {
                  const total = Number(cat.totalAmount || 0);
                  const paid = Number(cat.paidAmount || 0);
                  const pending = Number(cat.pendingAmount || 0);

                  const paidWidth = total > 0 ? (paid / maxCategorySpend) * 100 : 0;
                  const pendingWidth = total > 0 ? (pending / maxCategorySpend) * 100 : 0;

                  return (
                    <div key={cat.category} className="category-bar-row">
                      <div className="bar-row-label">
                        <span className="bar-category-title">{cat.category}</span>
                        <span className="bar-category-total">{formatCurrency(total)}</span>
                      </div>

                      <div className="bar-track">
                        {paid > 0 && (
                          <div
                            className="bar-segment segment-paid"
                            style={{ width: `${paidWidth}%` }}
                            title={`Paid: ${formatCurrency(paid)}`}
                          />
                        )}
                        {pending > 0 && (
                          <div
                            className="bar-segment segment-pending"
                            style={{ width: `${pendingWidth}%` }}
                            title={`Pending: ${formatCurrency(pending)}`}
                          />
                        )}
                      </div>

                      <div className="bar-row-sub">
                        <span>Paid: {formatCurrency(paid)}</span>
                        <span>Pending: {formatCurrency(pending)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Monthly Expense Timeline Card */
        <div className="chart-card-modern" style={{ width: '100%' }}>
          <div className="chart-card-top">
            <div className="chart-title-group">
              <div className="chart-icon-box icon-blue">
                <Calendar size={18} />
              </div>
              <div>
                <h3 className="chart-card-heading">Monthly Expense Timeline</h3>
                <span className="chart-card-sub">Month-by-month spending obligations and payments</span>
              </div>
            </div>

            <div className="chart-status-legend">
              <span className="status-key-item">
                <span className="key-dot dot-green" /> Settled (Paid)
              </span>
              <span className="status-key-item">
                <span className="key-dot dot-amber" /> Open (Pending)
              </span>
            </div>
          </div>

          {monthlyTotals.length === 0 ? (
            <div className="chart-empty-state">No monthly records available</div>
          ) : (
            <div className="bars-list-container">
              {monthlyTotals.map((m) => {
                const total = Number(m.totalAmount || 0);
                const paid = Number(m.paidAmount || 0);
                const pending = Number(m.pendingAmount || 0);
                const paidPct = total > 0 ? (paid / maxMonthlySpend) * 100 : 0;
                const pendingPct = total > 0 ? (pending / maxMonthlySpend) * 100 : 0;

                return (
                  <div key={m.month} className="category-bar-row">
                    <div className="bar-row-label">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="bar-category-title" style={{ fontSize: '0.95rem' }}>
                          {formatMonthName(m.month)}
                        </span>
                        <span className="category-tag-modern cat-other" style={{ fontSize: '0.7rem' }}>
                          {m.count} bill{m.count > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                          {formatCurrency(total)}
                        </strong>
                      </div>
                    </div>

                    <div className="bar-track" style={{ height: 16 }}>
                      {paid > 0 && (
                        <div
                          className="bar-segment segment-paid"
                          style={{ width: `${paidPct}%` }}
                          title={`Paid in ${formatMonthName(m.month)}: ${formatCurrency(paid)}`}
                        />
                      )}
                      {pending > 0 && (
                        <div
                          className="bar-segment segment-pending"
                          style={{ width: `${pendingPct}%` }}
                          title={`Pending in ${formatMonthName(m.month)}: ${formatCurrency(pending)}`}
                        />
                      )}
                    </div>

                    <div className="bar-row-sub" style={{ fontSize: '0.78rem' }}>
                      <span style={{ color: '#059669', fontWeight: 600 }}>
                        Settled: {formatCurrency(paid)}
                      </span>
                      <span style={{ color: pending > 0 ? '#d97706' : '#64748b', fontWeight: 600 }}>
                        Pending: {formatCurrency(pending)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
