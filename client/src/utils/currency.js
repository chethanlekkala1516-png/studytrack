// Currency formatting helper for Indian Rupees (₹)

export const CURRENCY_SYMBOL = '₹';

export function formatCurrency(amount) {
  const num = Number(amount || 0);
  return `${CURRENCY_SYMBOL}${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatCompactCurrency(amount) {
  const num = Number(amount || 0);
  return `${CURRENCY_SYMBOL}${Math.round(num).toLocaleString('en-IN')}`;
}
