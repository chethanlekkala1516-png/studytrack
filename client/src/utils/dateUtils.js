// Shared timezone-safe date calculation utilities

export function getTodayLocalDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateString) {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getDaysDifference(dueDateString) {
  if (!dueDateString) return 0;
  const target = parseLocalDate(dueDateString);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getBillStatusInfo(bill) {
  // CRITICAL: Paid bills must NEVER show as overdue or pending!
  if (Boolean(bill.is_paid)) {
    return {
      type: 'paid',
      label: 'PAID',
      sublabel: bill.paid_date ? `on ${bill.paid_date}` : 'Settled',
      variant: 'success',
      isOverdue: false,
      isDueSoon: false
    };
  }

  const daysDiff = getDaysDifference(bill.due_date);

  // Past due date
  if (daysDiff < 0) {
    const daysAgo = Math.abs(daysDiff);
    return {
      type: 'overdue',
      label: 'OVERDUE',
      sublabel: `${daysAgo} day${daysAgo > 1 ? 's' : ''} overdue`,
      daysOverdue: daysAgo,
      variant: 'danger',
      isOverdue: true,
      isDueSoon: false
    };
  }

  // Due today
  if (daysDiff === 0) {
    return {
      type: 'due-today',
      label: 'DUE TODAY',
      sublabel: 'Payment due today',
      daysLeft: 0,
      variant: 'danger',
      isOverdue: false,
      isDueSoon: true
    };
  }

  // Due tomorrow
  if (daysDiff === 1) {
    return {
      type: 'due-tomorrow',
      label: 'DUE TOMORROW',
      sublabel: 'Due in 1 day',
      daysLeft: 1,
      variant: 'warning',
      isOverdue: false,
      isDueSoon: true
    };
  }

  // Due in next 7 days
  if (daysDiff <= 7) {
    return {
      type: 'due-soon',
      label: 'DUE SOON',
      sublabel: `in ${daysDiff} days`,
      daysLeft: daysDiff,
      variant: 'warning',
      isOverdue: false,
      isDueSoon: true
    };
  }

  // Later / Upcoming
  return {
    type: 'upcoming',
    label: 'UPCOMING',
    sublabel: `Due ${bill.due_date}`,
    daysLeft: daysDiff,
    variant: 'neutral',
    isOverdue: false,
    isDueSoon: false
  };
}
