export const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const shortMoney = (value) => {
  const n = Number(value) || 0;

  if (Math.abs(n) >= 100000) {
    return `₹${(n / 100000).toFixed(1)}L`;
  }

  if (Math.abs(n) >= 1000) {
    return `₹${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  }

  return money(n);
};

export const localISO = (date = new Date()) => {
  const adjusted = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  );

  return adjusted.toISOString().slice(0, 10);
};

export const offsetDate = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return localISO(date);
};

export const formatDate = (date) => {
  if (!date) return 'Today';

  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  const today = localISO(new Date());

  if (date === today) return 'Today';
  if (date === offsetDate(-1)) return 'Yesterday';

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

export const makeId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
