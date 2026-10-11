# Pocketwise — Complete code, file by file

This file contains the source for the updated project. To run the project, use the steps in [`RUN-GUIDE-WINDOWS.md`](RUN-GUIDE-WINDOWS.md).

**Preferred:** download and extract [`broke-but-functional-updated.zip`](../broke-but-functional-updated.zip) to preserve the folder structure.


---

## `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#111610" />
    <meta name="description" content="Broke But Functional — plan a ₹10,000 budget for 30 days, track spending and savings, manage commitments, and simulate unexpected expenses." />
    <title>Broke But Functional — Survive the Month | Pocketwise</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```


---

## `package.json`

```json
{
  "name": "broke-but-functional",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "node --test",
    "check": "npm run test && npm run build"
  },
  "dependencies": {
    "lucide-react": "^0.468.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.13.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.5"
  }
}
```


---

## `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0' },
});
```


---

## `src/main.jsx`

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```


---

## `src/App.jsx`

```jsx
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { calculateFinancialSummary, simulateExpenseImpact } from './domain/finance.js';
import { useFinanceData } from './hooks/useFinanceData.js';
import { formatDate, localISO, makeId, money, offsetDate } from './utils/formatters.js';
import {
  Activity, ArrowDownLeft, ArrowDownRight, ArrowRight, ArrowUpRight,
  Bell, CalendarDays, Check, ChevronDown, Coffee, CreditCard,
  Download, Ellipsis, Goal, HeartPulse, Home, IndianRupee, Lightbulb,
  Menu, Plus, ReceiptText, RotateCcw, Search, ShieldAlert, ShieldCheck,
  ShoppingBag, Sparkles, Target, TrendingDown, Wallet, X,
  Zap,
} from 'lucide-react';

const CATEGORY_META = {
  Food: { color: '#c2f970', icon: Coffee },
  Transport: { color: '#8eafff', icon: ArrowRight },
  Shopping: { color: '#ffb38a', icon: ShoppingBag },
  Bills: { color: '#c4a1ff', icon: Home },
  Health: { color: '#7de1c3', icon: HeartPulse },
  Learning: { color: '#f8d977', icon: Target },
  Lifestyle: { color: '#f59fc7', icon: Sparkles },
  Emergency: { color: '#ff988b', icon: ShieldAlert },
  Other: { color: '#b6c1b0', icon: ReceiptText },
  Income: { color: '#7de1c3', icon: ArrowDownLeft },
};
const CATEGORIES = Object.keys(CATEGORY_META).filter((name) => name !== 'Income');
const FinanceCharts = lazy(() => import('./components/FinanceCharts.jsx'));

function IconButton({ label, onClick, children, className = '' }) {
  return <button type="button" className={`icon-button ${className}`} aria-label={label} title={label} onClick={onClick}>{children}</button>;
}

function SectionHeading({ eyebrow, title, action, onAction }) {
  return <div className="section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action && <button className="text-action" onClick={onAction}>{action}<ArrowRight size={15} /></button>}</div>;
}

function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const listener = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [onClose]);
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-heading"><div><h2 id="modal-title">{title}</h2>{subtitle && <p>{subtitle}</p>}</div><IconButton label="Close dialog" onClick={onClose}><X size={19} /></IconButton></div>
      {children}
    </section>
  </div>;
}

function Field({ label, children, hint }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function ExpenseModal({ onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(localISO(new Date()));
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!title.trim()) return setError('Add a short description first.');
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > 10000000) return setError('Enter an amount greater than ₹0.');
    onSave({ id: makeId(), title: title.trim().slice(0, 70), amount: Math.round(parsedAmount * 100) / 100, category, date, note: note.trim().slice(0, 120) });
    onClose();
  };
  return <Modal title="Add an expense" subtitle="Every rupee gets a place." onClose={onClose}>
    <form className="form-grid" onSubmit={submit}>
      <Field label="What did you spend on?"><input autoFocus maxLength={70} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lunch with friends" /></Field>
      <div className="form-two"><Field label="Amount (₹)"><div className="input-with-icon"><IndianRupee size={16} /><input type="number" inputMode="decimal" min="1" max="10000000" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="250" /></div></Field><Field label="Category"><select value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field></div>
      <Field label="Date"><input type="date" value={date} max={localISO(new Date())} onChange={(e) => setDate(e.target.value)} /></Field>
      <Field label="Note (optional)"><input maxLength={120} value={note} onChange={(e) => setNote(e.target.value)} placeholder="A little context" /></Field>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><button className="button button-quiet" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit"><Plus size={16} /> Save expense</button></div>
    </form>
  </Modal>;
}

function IncomeModal({ onClose, onSave }) {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const value = Number(amount);
    if (!source.trim()) return setError('Enter where the money came from.');
    if (!Number.isFinite(value) || value <= 0 || value > 10000000) return setError('Enter a valid amount.');
    onSave({ id: makeId(), title: source.trim().slice(0, 70), amount: Math.round(value * 100) / 100, date: localISO(new Date()) });
    onClose();
  };
  return <Modal title="Add money in" subtitle="Stipend, allowance, freelance gig — count it all." onClose={onClose}>
    <form className="form-grid" onSubmit={submit}>
      <Field label="Income source"><input autoFocus maxLength={70} value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Monthly allowance" /></Field>
      <Field label="Amount (₹)"><div className="input-with-icon"><IndianRupee size={16} /><input type="number" min="1" max="10000000" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1500" /></div></Field>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><button className="button button-quiet" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit"><Plus size={16} /> Add income</button></div>
    </form>
  </Modal>;
}

function GoalModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [emoji, setEmoji] = useState('✨');
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const value = Number(target);
    if (!name.trim()) return setError('Give your goal a name.');
    if (!Number.isFinite(value) || value <= 0 || value > 10000000) return setError('Enter a valid target amount.');
    onSave({ id: makeId(), name: name.trim().slice(0, 50), target: Math.round(value), saved: 0, emoji, color: '#a99aff' });
    onClose();
  };
  return <Modal title="Create a savings goal" subtitle="Tiny moves still move you forward." onClose={onClose}>
    <form className="form-grid" onSubmit={submit}>
      <Field label="Goal name"><input autoFocus maxLength={50} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Goa trip" /></Field>
      <div className="form-two"><Field label="Target amount (₹)"><input type="number" min="1" max="10000000" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="3000" /></Field><Field label="Pick a vibe"><select value={emoji} onChange={(e) => setEmoji(e.target.value)}><option>✨</option><option>🎧</option><option>🛟</option><option>🌴</option><option>📚</option><option>💻</option><option>✈️</option></select></Field></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><button className="button button-quiet" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit"><Target size={16} /> Create goal</button></div>
    </form>
  </Modal>;
}

function CommitmentModal({ onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(offsetDate(5));
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const value = Number(amount);
    if (!title.trim()) return setError('Add a name for this commitment.');
    if (!Number.isFinite(value) || value <= 0) return setError('Enter a valid amount.');
    onSave({ id: makeId(), title: title.trim().slice(0, 70), amount: Math.round(value), dueDate, category: 'Other', paid: false });
    onClose();
  };
  return <Modal title="Plan a commitment" subtitle="Reserve the money before it surprises you." onClose={onClose}>
    <form className="form-grid" onSubmit={submit}>
      <Field label="Bill or commitment"><input autoFocus maxLength={70} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Hostel electricity share" /></Field>
      <Field label="Amount (₹)"><input type="number" min="1" max="10000000" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500" /></Field>
      <Field label="Due date"><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><button className="button button-quiet" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit"><Plus size={16} /> Save commitment</button></div>
    </form>
  </Modal>;
}

function App() {
  const { data, setData, resetData: resetFinanceData, storageAvailable } = useFinanceData();
  const [page, setPage] = useState('overview');
  const [modal, setModal] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [simTitle, setSimTitle] = useState('That little impulse buy');
  const [simAmount, setSimAmount] = useState(650);
  const [simCategory, setSimCategory] = useState('Shopping');
  const [simType, setSimType] = useState('planned');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const today = new Date();
  const challengeStart = new Date(`${data.challengeStartDate || localISO(today)}T12:00:00`);
  const todayLocal = new Date(`${localISO(today)}T12:00:00`);
  const elapsedValue = Math.floor((todayLocal.getTime() - challengeStart.getTime()) / 86400000);
  const elapsedChallengeDays = Number.isFinite(elapsedValue) ? elapsedValue : 0;
  const dayNumber = Math.min(data.monthLength || 30, Math.max(1, elapsedChallengeDays + 1));
  const daysRemaining = Math.max(0, (data.monthLength || 30) - dayNumber);
  const monthLabel = today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const derived = useMemo(
    () => calculateFinancialSummary(data, { dayNumber, daysRemaining }),
    [data, dayNumber, daysRemaining],
  );
  const scenarioAmount = Number(simAmount);
  const scenarioImpact = useMemo(
    () => simulateExpenseImpact(derived, Number.isFinite(scenarioAmount) ? scenarioAmount : 0, daysRemaining),
    [derived, scenarioAmount, daysRemaining],
  );

  const filteredExpenses = useMemo(() => data.expenses.filter((expense) => {
    const matchesText = `${expense.title} ${expense.category} ${expense.note || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter;
    return matchesText && matchesCategory;
  }).sort((a, b) => b.date.localeCompare(a.date)), [data.expenses, searchTerm, categoryFilter]);

  const categoryData = useMemo(() => CATEGORIES.map((category) => ({
    name: category,
    value: data.expenses.filter((expense) => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0),
    color: CATEGORY_META[category].color,
  })).filter((item) => item.value > 0).sort((a, b) => b.value - a.value), [data.expenses]);

  const trendData = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, i) => offsetDate(i - 6));
    const allInDates = data.expenses.reduce((acc, expense) => {
      acc[expense.date] = (acc[expense.date] || 0) + expense.amount;
      return acc;
    }, {});
    const sortedDates = [...dates].sort();
    const firstDate = sortedDates[0];
    let runningBalance = derived.totalFunds - derived.goalSavings - data.expenses
      .filter((expense) => expense.date < firstDate)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const chart = [];
    sortedDates.forEach((date) => {
      runningBalance -= allInDates[date] || 0;
      chart.push({ date, label: new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short' }), spend: allInDates[date] || 0, remaining: Math.max(0, runningBalance) });
    });
    return chart;
  }, [data.expenses, derived.totalFunds, derived.goalSavings]);

  const addExpense = (expense) => setData((prev) => ({ ...prev, expenses: [expense, ...prev.expenses] }));
  const addIncome = (income) => setData((prev) => ({ ...prev, incomes: [income, ...prev.incomes] }));
  const deleteExpense = (id) => setData((prev) => ({ ...prev, expenses: prev.expenses.filter((expense) => expense.id !== id) }));
  const addGoal = (goal) => setData((prev) => ({ ...prev, goals: [...prev.goals, goal] }));
  const addCommitment = (commitment) => setData((prev) => ({ ...prev, commitments: [...prev.commitments, commitment] }));
  const contributeToGoal = (id, amount) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const amountToAdd = Math.round(amount);
    const goal = data.goals.find((item) => item.id === id);
    if (!goal) return;
    if (amountToAdd > Math.max(0, derived.available)) return;
    setData((prev) => ({ ...prev, goals: prev.goals.map((item) => item.id === id ? { ...item, saved: Math.min(item.target, item.saved + amountToAdd) } : item) }));
  };
  const payCommitment = (commitment) => {
    if (commitment.paid) return;
    setData((prev) => ({
      ...prev,
      commitments: prev.commitments.map((item) => item.id === commitment.id ? { ...item, paid: true } : item),
      expenses: [{ id: makeId(), title: commitment.title, amount: commitment.amount, category: 'Bills', date: localISO(new Date()), note: 'Commitment paid' }, ...prev.expenses],
    }));
  };
  const toggleSubscription = (id) => setData((prev) => ({ ...prev, subscriptions: prev.subscriptions.map((item) => item.id === id ? { ...item, active: !item.active } : item) }));
  const applySimulation = () => {
    const amount = Number(simAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000 || !simTitle.trim()) return;
    addExpense({
      id: makeId(),
      title: simTitle.trim().slice(0, 70),
      amount: Math.round(amount * 100) / 100,
      category: simType === 'unexpected' ? 'Emergency' : simCategory,
      date: localISO(new Date()),
      note: simType === 'unexpected' ? 'Unexpected expense scenario' : 'Planned purchase from Decision Lab',
    });
    setSimTitle('That little impulse buy');
    setSimAmount(650);
    setSimCategory('Shopping');
    setSimType('planned');
    setPage('overview');
  };
  const resetDemo = () => {
    resetFinanceData();
    setSearchTerm('');
    setCategoryFilter('All');
    setShowResetConfirm(false);
    setSimType('planned');
    setSimTitle('That little impulse buy');
    setSimAmount(650);
    setSimCategory('Shopping');
  };
  const exportCsv = () => {
    const rows = [['Date', 'Description', 'Category', 'Amount (INR)', 'Note'], ...data.expenses.map((e) => [e.date, e.title, e.category, e.amount, e.note || ''])];
    const escapeCell = (cell) => {
      const raw = String(cell ?? '');
      // Prefix formula-leading characters so user-entered text cannot execute as a spreadsheet formula.
      const safe = /^[\s]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
      return `"${safe.replaceAll('"', '""')}"`;
    };
    const csv = rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'pocketwise-transactions.csv'; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText, count: data.expenses.length },
    { id: 'goals', label: 'Savings goals', icon: Goal },
    { id: 'commitments', label: 'Bills & subs', icon: CreditCard },
  ];
  const navigate = (id) => { setPage(id); setMobileNavOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const pageTitles = { overview: 'Your money, in the open.', transactions: 'Every rupee has a story.', goals: 'Little wins add up.', commitments: 'Future you says thanks.' };
  const pageSubtitles = { overview: 'A little clarity goes a long way. Let’s make this month count.', transactions: 'Track what went out, spot patterns, and keep the receipts.', goals: 'Make space for the things you actually care about.', commitments: 'See what is coming up before it catches you off guard.' };

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
      <div className="brand-row"><div className="brand-mark"><Wallet size={21} strokeWidth={2.2} /></div><div className="brand-name">pocketwise<span>.</span><small>YOUR MONEY SIDEKICK</small></div><IconButton className="mobile-close" label="Close navigation" onClick={() => setMobileNavOpen(false)}><X size={18} /></IconButton></div>
      <div className="sidebar-section-label">YOUR SPACE</div>
      <nav className="side-nav" aria-label="Main navigation">{navItems.map(({ id, label, icon: Icon, count }) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => navigate(id)} aria-current={page === id ? 'page' : undefined}><Icon size={18} strokeWidth={1.9} /><span>{label}</span>{count !== undefined && <span className="nav-count">{count}</span>}{page === id && <span className="nav-active-dot" />}</button>)}</nav>
      <div className="sidebar-budget-card"><div className="budget-card-top"><span className="mini-orb"><IndianRupee size={15} /></span><span className="live-dot">LIVE PLAN</span></div><p>Your 30-day mission</p><h3>Make ₹10k <em>last.</em></h3><div className="budget-line"><span>Budget used</span><b>{Math.min(100, Math.round((derived.totalExpenses / Math.max(derived.totalFunds, 1)) * 100))}%</b></div><div className="progress-track"><span style={{ width: `${Math.min(100, (derived.totalExpenses / Math.max(derived.totalFunds, 1)) * 100)}%` }} /></div><div className="budget-card-foot"><span>{money(derived.totalFunds - derived.totalExpenses)} left after spend</span><span>↗</span></div></div>
      <div className="sidebar-bottom"><div className="avatar-row"><div className="avatar">S</div><div className="avatar-text"><strong>Money learner</strong><span>Building better habits</span></div><IconButton label="Reset demo data" onClick={() => setShowResetConfirm(true)}><Ellipsis size={18} /></IconButton></div><div className="sidebar-footer"><span>Made for real life</span><span>✳</span></div></div>
    </aside>

    {mobileNavOpen && <button className="mobile-scrim" aria-label="Close navigation overlay" onClick={() => setMobileNavOpen(false)} />}

    <main className="main-content" id="main-content" tabIndex={-1}>
      <header className="topbar"><div className="topbar-left"><IconButton className="mobile-menu" label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></IconButton><div className="breadcrumbs"><span>My finances</span><span className="crumb-slash">/</span><strong>{navItems.find((item) => item.id === page)?.label || 'Overview'}</strong></div></div><div className="topbar-right"><div className="month-chip"><CalendarDays size={15} /><span>{monthLabel}</span><ChevronDown size={14} /></div><button className="notification-button" aria-label="Open money check-in" title="Open money check-in" onClick={() => setShowInsights(true)}><Bell size={18} /><span /></button><div className="topbar-avatar" aria-hidden="true">S</div></div></header>
      <div className="page-wrap">
        <section className="page-intro"><div><div className="welcome-line"><span className="welcome-spark">✳</span> HEY THERE, MONEY HUMAN</div><h1>{pageTitles[page]}</h1><p>{pageSubtitles[page]}</p></div><div className="intro-actions"><button className="button button-quiet export-button" onClick={exportCsv}><Download size={16} /> Export</button><button className="button button-quiet funds-button" onClick={() => setModal('income')}><ArrowDownLeft size={16} /> Add funds</button><button className="button button-primary" onClick={() => setModal('expense')}><Plus size={17} /> Add expense</button></div></section>

        {page === 'overview' && <>
          <section className="hero-card"><div className="hero-copy"><div className="hero-pill"><span className="hero-pill-dot" /> BROKE BUT FUNCTIONAL · ₹10,000 / 30 DAYS</div><h2>You're not broke.<br /><span>You're becoming</span> <i>money smart.</i></h2><p>Plan a ₹10,000 budget for 30 days. Track income, expenses, savings goals, upcoming bills and subscriptions, then preview planned purchases or unexpected costs before committing.</p><div className="hero-actions"><button className="button button-lime" onClick={() => setPage('transactions')}>View my activity <ArrowUpRight size={16} /></button><span className="hero-footnote"><ShieldCheck size={15} /> Your data stays on this device</span></div></div><div className="hero-art" aria-hidden="true"><div className="art-glow" /><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-spark spark-a">✳</div><div className="art-spark spark-b">✦</div><div className="art-coin coin-back">₹</div><div className="art-coin coin-front"><span>₹</span></div><div className="art-sticker">GOOD<br />VIBES<br /><span>ONLY</span></div><div className="art-bottom-note"><span>↗</span> YOUR MONEY, YOUR RULES</div></div><div className="hero-index">01 <span>/ 04</span></div></section>

          <section className="stats-grid" aria-label="Financial summary">
            <article className="stat-card balance-stat"><div className="stat-top"><span className="stat-icon stat-icon-lime"><Wallet size={18} /></span><span className="stat-tag positive"><span className="dot" /> SPENDABLE</span></div><p className="stat-label">Available balance</p><div className="stat-value">{money(derived.available)}</div><div className="stat-foot"><span>After bills & savings reserves</span><span className="stat-foot-icon"><ArrowDownRight size={16} /></span></div></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon stat-icon-orange"><TrendingDown size={18} /></span><span className="stat-tag neutral">THIS MONTH</span></div><p className="stat-label">Spent so far</p><div className="stat-value">{money(derived.totalExpenses)}</div><div className="stat-foot"><span>{derived.totalExpenses <= derived.totalFunds * 0.5 ? 'Still room to breathe' : 'Time to check your pace'}</span><span className="stat-foot-icon orange"><ArrowUpRight size={16} /></span></div></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon stat-icon-purple"><CalendarDays size={18} /></span><span className="stat-tag neutral">{daysRemaining} DAYS LEFT</span></div><p className="stat-label">Daily allowance</p><div className="stat-value">{money(derived.dailyAllowance)}</div><div className="stat-foot"><span>Based on money not reserved</span><span className="stat-foot-icon purple"><Activity size={16} /></span></div></article>
            <article className="stat-card health-stat"><div className="stat-top"><span className="stat-icon stat-icon-green"><HeartPulse size={18} /></span><span className={`stat-tag ${derived.riskTone === 'good' ? 'positive' : derived.riskTone === 'warning' ? 'caution' : 'negative'}`}>{derived.risk.toUpperCase()}</span></div><p className="stat-label">Money wellness</p><div className="health-value-row"><div className="stat-value">{derived.health}<span className="score-outof">/100</span></div><div className="health-ring" style={{ '--health': `${derived.health * 3.6}deg` }}><span>{derived.health >= 70 ? '✦' : derived.health >= 40 ? '↗' : '!'}</span></div></div><div className="stat-foot"><span>Based on your current forecast</span><span className="stat-foot-icon green"><ShieldCheck size={16} /></span></div></article>
          </section>

          <Suspense fallback={<section className="dashboard-grid" aria-label="Loading financial charts"><div className="panel chart-placeholder" role="status">Loading spending charts…</div></section>}>
            <FinanceCharts trendData={trendData} derived={derived} categoryData={categoryData} onNavigate={navigate} />
          </Suspense>

          <section className="dashboard-grid lower-grid"><div className="panel decision-panel"><div className="decision-title-row"><div><p className="eyebrow">BEFORE YOU BUY</p><h2>Decision lab <span>✳</span></h2><p className="section-description">Try the choice before your wallet feels it.</p></div><span className="decision-chip"><Lightbulb size={14} /> WHAT IF?</span></div><div className="simulator-layout"><div className="sim-form"><Field label="Decision type"><select value={simType} onChange={(e) => { const nextType = e.target.value; setSimType(nextType); if (nextType === 'unexpected') { setSimCategory('Emergency'); if (simTitle === 'That little impulse buy') setSimTitle('Unexpected expense'); } else { if (simCategory === 'Emergency') setSimCategory('Shopping'); if (simTitle === 'Unexpected expense') setSimTitle('That little impulse buy'); } }}><option value="planned">Planned purchase</option><option value="unexpected">Unexpected / emergency expense</option></select></Field><Field label={simType === 'unexpected' ? 'What unexpected cost are you preparing for?' : 'What are you thinking of buying?'}><input maxLength={70} value={simTitle} onChange={(e) => setSimTitle(e.target.value)} placeholder={simType === 'unexpected' ? 'e.g. Urgent medicine' : 'That little impulse buy'} /></Field><div className="sim-input-row"><Field label="Amount (₹)"><div className="input-with-icon"><IndianRupee size={15} /><input aria-label="Simulation amount in rupees" type="number" inputMode="decimal" min="1" max="10000000" step="1" value={simAmount} onChange={(e) => setSimAmount(e.target.value)} /></div></Field><Field label="Category"><select value={simCategory} disabled={simType === 'unexpected'} onChange={(e) => setSimCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field></div><div className="quick-amounts"><span>QUICK TRY</span>{[150, 350, 650, 1200].map((amount) => <button type="button" key={amount} className={Number(simAmount) === amount ? 'selected' : ''} onClick={() => setSimAmount(amount)}>₹{amount}</button>)}</div></div><div className="sim-preview" aria-live="polite"><div className="preview-orb"><Zap size={19} /></div><p className="eyebrow">AFTER THIS {simType === 'unexpected' ? 'EMERGENCY' : 'DECISION'}</p><div className="preview-balance">{money(scenarioImpact.available)}</div><span className="preview-caption">estimated spendable balance</span><div className="preview-divider" /><div className="scenario-impact-list"><div className="scenario-impact-item"><span>Daily allowance</span><strong>{money(scenarioImpact.dailyAllowance)}</strong><small>was {money(derived.dailyAllowance)}</small></div><div className="scenario-impact-item"><span>Month-end forecast</span><strong className={scenarioImpact.forecastBalance < 0 ? 'scenario-negative' : ''}>{money(scenarioImpact.forecastBalance)}</strong><small>was {money(derived.forecastBalance)}</small></div><div className="scenario-impact-item"><span>Goal contribution room</span><strong>{money(scenarioImpact.goalContributionRoom)}</strong><small>{scenarioImpact.contributionRoomChange > 0 ? `${money(scenarioImpact.contributionRoomChange)} less available` : 'Savings goals remain intact'}</small></div><div className="scenario-impact-item"><span>Money wellness</span><strong>{scenarioImpact.health}/100</strong><small>currently {derived.health}/100</small></div></div><div className={`scenario-status ${scenarioImpact.riskTone}`}><span className="scenario-status-dot" /><span><strong>{scenarioImpact.risk}</strong> · {scenarioImpact.forecastBalance < 0 ? 'This could leave a shortfall by month end.' : scenarioImpact.forecastBalance < 1500 ? 'Your buffer may be tight after this decision.' : 'This decision fits within the current forecast.'}</span></div><button className="button button-dark apply-button" onClick={applySimulation} disabled={!simTitle.trim() || !Number.isFinite(Number(simAmount)) || Number(simAmount) <= 0 || Number(simAmount) > 10000000}>{simType === 'unexpected' ? 'Record emergency cost' : 'Apply purchase to budget'} <ArrowRight size={16} /></button></div></div><p className="simulation-disclaimer"><ShieldCheck size={14} /> Preview only: your balance, forecast, risk and goal contribution room change only when you apply the decision.</p></div>

            <div className="panel goals-preview-panel"><SectionHeading eyebrow="FUTURE YOU" title="Savings goals" action="All goals" onAction={() => navigate('goals')} /><div className="goals-mini-list">{data.goals.slice(0, 3).map((goal) => { const progress = Math.min(100, goal.target ? goal.saved / goal.target * 100 : 0); return <div className="goal-mini" key={goal.id}><div className="goal-mini-top"><span className="goal-emoji">{goal.emoji}</span><div className="goal-mini-name"><strong>{goal.name}</strong><span>{money(goal.saved)} of {money(goal.target)}</span></div><b>{Math.round(progress)}%</b></div><div className="progress-track goal-track"><span style={{ width: `${progress}%`, background: goal.color }} /></div></div>; })}{data.goals.length === 0 && <p className="empty-small">Your first savings goal starts here.</p>}</div><button className="button button-outline goal-add-button" onClick={() => setModal('goal')}><Plus size={16} /> Create a savings goal</button></div></section>

          <section className="bottom-split"><div className="panel recent-panel"><SectionHeading eyebrow="THE LATEST" title="Recent activity" action="See all" onAction={() => navigate('transactions')} /><TransactionList expenses={data.expenses.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)} onDelete={deleteExpense} /></div><div className="forecast-card"><div className="forecast-top"><span className="forecast-icon"><Activity size={19} /></span><span className={`forecast-tag ${derived.riskTone}`}>{derived.risk}</span></div><p className="eyebrow">END-OF-MONTH ESTIMATE</p><h2>{money(derived.forecastBalance)}</h2><p className="forecast-copy">That's your projected money after expected spending, bills and active subscriptions.</p><div className="forecast-divider" /><div className="forecast-row"><span>Expected variable spend</span><strong>{money(derived.projectedVariableSpend)}</strong></div><div className="forecast-row"><span>Upcoming commitments</span><strong>{money(derived.reserveTotal)}</strong></div><div className="forecast-insight"><Sparkles size={15} /><span>{derived.forecastBalance < 0 ? 'Try pausing non-essentials and reviewing your bills.' : derived.forecastBalance < 1500 ? 'Keep non-essentials light until the month wraps.' : 'A little buffer can make a big difference.'}</span></div></div></section>
        </>}

        {page === 'transactions' && <section className="panel page-panel transactions-page"><div className="page-panel-heading"><div><p className="eyebrow">YOUR MONEY TRAIL</p><h2>Transaction history</h2><p className="section-description">{data.expenses.length} expenses logged · {money(derived.totalExpenses)} spent this month</p></div><button className="button button-primary" onClick={() => setModal('expense')}><Plus size={16} /> Add transaction</button></div><div className="filter-row"><div className="search-field"><Search size={17} /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search description or category" aria-label="Search transactions" /><kbd>⌕</kbd></div><label className="filter-select"><span>Category</span><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option>All</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label><button className="button button-quiet filter-reset" onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}><RotateCcw size={15} /> Reset</button></div><div className="table-scroll"><table className="transactions-table"><thead><tr><th>DESCRIPTION</th><th>CATEGORY</th><th>DATE</th><th className="align-right">AMOUNT</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filteredExpenses.map((expense) => <TransactionRow key={expense.id} expense={expense} onDelete={deleteExpense} />)}</tbody></table>{filteredExpenses.length === 0 && <div className="empty-state"><span>🪴</span><strong>No transactions found</strong><p>Try another search or add your first expense.</p><button className="button button-primary" onClick={() => setModal('expense')}><Plus size={16} /> Add expense</button></div>}</div><div className="table-footer"><span>Showing <strong>{filteredExpenses.length}</strong> of <strong>{data.expenses.length}</strong> transactions</span><span>Stored locally on your device <ShieldCheck size={14} /></span></div></section>}

        {page === 'goals' && <section className="goals-page"><div className="page-panel-heading goals-page-heading"><div><p className="eyebrow">SAVE WITH A REASON</p><h2>Your goals, your pace.</h2><p className="section-description">Saved money is accounted for in your spendable balance.</p></div><button className="button button-primary" onClick={() => setModal('goal')}><Plus size={16} /> New goal</button></div><div className="goals-grid">{data.goals.map((goal) => { const progress = Math.min(100, goal.target ? goal.saved / goal.target * 100 : 0); const remaining = Math.max(0, goal.target - goal.saved); return <GoalCard key={goal.id} goal={goal} progress={progress} remaining={remaining} canContribute={derived.available} onContribute={(amount) => contributeToGoal(goal.id, amount)} onDelete={() => setData((prev) => ({ ...prev, goals: prev.goals.filter((item) => item.id !== goal.id) }))} />; })}{data.goals.length === 0 && <div className="empty-state goal-empty"><span>🎯</span><strong>Give your money a mission</strong><p>Create a goal and watch the progress grow.</p><button className="button button-primary" onClick={() => setModal('goal')}><Plus size={16} /> Create a savings goal</button></div>}<button className="new-goal-card" onClick={() => setModal('goal')}><span><Plus size={20} /></span><strong>Give a new dream a name</strong><small>Start a fresh savings goal</small></button></div><div className="goals-footnote"><ShieldCheck size={16} /><p>Contributing to a goal moves money out of your spendable balance, so your daily allowance updates automatically.</p></div></section>}

        {page === 'commitments' && <section className="commitments-page"><div className="commitment-summary-row"><div className="commitment-total-card"><span className="commitment-summary-icon"><CreditCard size={19} /></span><p>Upcoming bills & subscriptions</p><strong>{money(derived.reserveTotal)}</strong><small>Money to keep aside this month</small></div><div className="commitment-total-card"><span className="commitment-summary-icon sub-icon"><Zap size={19} /></span><p>Active subscriptions</p><strong>{data.subscriptions.filter((s) => s.active).length}</strong><small>{money(derived.activeSubscriptions)} per month</small></div><div className="commitment-total-card"><span className="commitment-summary-icon due-icon"><CalendarDays size={19} /></span><p>Pending commitments</p><strong>{data.commitments.filter((c) => !c.paid).length}</strong><small>Mark a bill paid to log it as an expense</small></div></div><div className="commitments-layout"><div className="panel commitments-panel"><div className="page-panel-heading"><div><p className="eyebrow">PLAN AHEAD</p><h2>Upcoming commitments</h2><p className="section-description">These are deducted from your spendable balance until you mark them paid.</p></div><button className="button button-primary" onClick={() => setModal('commitment')}><Plus size={16} /> Add bill</button></div><div className="commitment-list">{data.commitments.map((commitment) => <div className={`commitment-row ${commitment.paid ? 'commitment-paid' : ''}`} key={commitment.id}><div className="commitment-row-icon"><ReceiptText size={18} /></div><div className="commitment-info"><strong>{commitment.title}</strong><span>{commitment.paid ? 'Paid' : `Due ${formatDate(commitment.dueDate)}`} · {commitment.category}</span></div><div className="commitment-amount"><strong>{money(commitment.amount)}</strong><span className={commitment.paid ? 'paid-label' : 'pending-label'}>{commitment.paid ? 'PAID' : 'PLANNED'}</span></div>{!commitment.paid && <button className="button button-quiet mark-paid" onClick={() => payCommitment(commitment)}><Check size={15} /> Mark paid</button>}{commitment.paid && <span className="paid-check"><Check size={17} /></span>}</div>)}{data.commitments.length === 0 && <div className="empty-state"><span>🧾</span><strong>Nothing on the calendar</strong><p>Add a bill when you know it's coming.</p><button className="button button-primary" onClick={() => setModal('commitment')}><Plus size={15} /> Add a bill</button></div>}</div></div>
            <div className="panel subscriptions-panel"><SectionHeading eyebrow="RECURRING MONEY" title="Subscriptions" /><p className="section-description">Switch off what you don't need. Your reserve changes instantly.</p><div className="subscription-list">{data.subscriptions.map((sub) => <div className={`subscription-row ${!sub.active ? 'subscription-off' : ''}`} key={sub.id}><div className="subscription-logo">{sub.icon}</div><div className="subscription-copy"><strong>{sub.name}</strong><span>{sub.active ? `Renews ${formatDate(sub.renewalDate)}` : 'Paused for this month'}</span></div><strong className="subscription-price">{money(sub.amount)}<small>/mo</small></strong><button className={`toggle ${sub.active ? 'toggle-on' : ''}`} role="switch" aria-checked={sub.active} aria-label={`${sub.active ? 'Pause' : 'Activate'} ${sub.name}`} onClick={() => toggleSubscription(sub.id)}><span /></button></div>)}{data.subscriptions.length === 0 && <p className="empty-small">No subscriptions added yet.</p>}</div><div className="subscription-total"><span>Active monthly total</span><strong>{money(derived.activeSubscriptions)}</strong></div></div></div></section>}

        {!storageAvailable && <p className="storage-warning" role="status">Browser storage is unavailable. Your changes will remain only while this tab stays open.</p>}
        <footer className="app-footer"><span>✳ pocketwise <span className="footer-muted">— small steps, less money stress.</span></span><span className="footer-secure"><ShieldCheck size={14} /> Your data is saved locally <span className="footer-separator">·</span> No bank connection needed</span></footer>
      </div>
    </main>

    {modal === 'expense' && <ExpenseModal onClose={() => setModal(null)} onSave={addExpense} />}
    {modal === 'income' && <IncomeModal onClose={() => setModal(null)} onSave={addIncome} />}
    {modal === 'goal' && <GoalModal onClose={() => setModal(null)} onSave={addGoal} />}
    {modal === 'commitment' && <CommitmentModal onClose={() => setModal(null)} onSave={addCommitment} />}
    {showInsights && <Modal title="Your money check-in" subtitle={`Day ${dayNumber} of your 30-day money plan`} onClose={() => setShowInsights(false)}><div className="checkin-summary"><p className="checkin-risk">Current financial risk <strong className={`forecast-tag ${derived.riskTone}`}>{derived.risk}</strong></p><div className="checkin-metric"><span>Spendable balance</span><strong>{money(derived.available)}</strong></div><div className="checkin-metric"><span>Estimated month-end balance</span><strong>{money(derived.forecastBalance)}</strong></div><div className="checkin-metric"><span>Money wellness</span><strong>{derived.health}/100</strong></div><p className="checkin-advice">{derived.forecastBalance < 0 ? 'Your current plan forecasts a shortfall. Review upcoming commitments and pause optional subscriptions where possible.' : derived.forecastBalance < 1500 ? 'Your estimated buffer is tight. Keep optional spending low and check upcoming bills before buying.' : 'Your forecast has some room. Keep tracking daily spending and protect savings goals.'}</p></div><div className="form-actions"><button className="button button-quiet" type="button" onClick={() => setShowInsights(false)}>Close</button><button className="button button-primary" type="button" onClick={() => { setShowInsights(false); navigate('commitments'); }}>Review bills & subscriptions <ArrowRight size={15} /></button></div></Modal>}
    {showResetConfirm && <Modal title="Start fresh?" subtitle="This resets expenses, goals, bills and subscriptions to the demo data." onClose={() => setShowResetConfirm(false)}><div className="reset-warning"><ShieldAlert size={21} /><p>This action replaces your locally saved data. Export your transactions first if you want a copy.</p></div><div className="form-actions"><button className="button button-quiet" onClick={() => setShowResetConfirm(false)}>Keep my data</button><button className="button button-danger" onClick={resetDemo}><RotateCcw size={15} /> Reset demo</button></div></Modal>}
  </div>;
}

function TransactionList({ expenses, onDelete }) {
  if (!expenses.length) return <div className="empty-small">Nothing here yet. Add your first expense.</div>;
  return <div className="transaction-list">{expenses.map((expense) => { const meta = CATEGORY_META[expense.category] || CATEGORY_META.Other; const Icon = meta.icon; return <div className="transaction-row" key={expense.id}><div className="transaction-icon" style={{ '--category-color': meta.color }}><Icon size={17} /></div><div className="transaction-description"><strong>{expense.title}</strong><span>{expense.category} <i>·</i> {formatDate(expense.date)}</span></div><div className="transaction-money"><strong>−{money(expense.amount)}</strong><button className="delete-transaction" aria-label={`Delete ${expense.title}`} title="Delete transaction" onClick={() => onDelete(expense.id)}><X size={13} /></button></div></div>; })}</div>;
}

function TransactionRow({ expense, onDelete }) {
  const meta = CATEGORY_META[expense.category] || CATEGORY_META.Other;
  const Icon = meta.icon;
  return <tr><td><div className="table-description"><span className="table-category-icon" style={{ '--category-color': meta.color }}><Icon size={16} /></span><div><strong>{expense.title}</strong>{expense.note && <small>{expense.note}</small>}</div></div></td><td><span className="category-badge"><i style={{ background: meta.color }} />{expense.category}</span></td><td className="date-cell">{formatDate(expense.date)}</td><td className="align-right amount-cell">−{money(expense.amount)}</td><td><button className="row-more" aria-label={`Delete ${expense.title}`} title="Delete transaction" onClick={() => onDelete(expense.id)}><Ellipsis size={17} /></button></td></tr>;
}

function GoalCard({ goal, progress, remaining, canContribute, onContribute, onDelete }) {
  const [contribution, setContribution] = useState('200');
  const [showContribution, setShowContribution] = useState(false);
  const [error, setError] = useState('');
  const addContribution = () => {
    const amount = Number(contribution);
    if (!Number.isFinite(amount) || amount <= 0) return setError('Enter an amount above ₹0.');
    if (amount > canContribute) return setError('Not enough spendable balance for this contribution.');
    if (amount > remaining) return setError(`Only ${money(remaining)} needed to reach this goal.`);
    onContribute(amount); setShowContribution(false); setError('');
  };
  return <article className="goal-card"><div className="goal-card-top"><span className="goal-card-emoji" style={{ background: `${goal.color}35` }}>{goal.emoji}</span><button className="row-more" aria-label={`Remove ${goal.name}`} title="Remove goal" onClick={onDelete}><Ellipsis size={18} /></button></div><p className="eyebrow">SAVINGS GOAL</p><h3>{goal.name}</h3><div className="goal-amount-row"><strong>{money(goal.saved)}</strong><span>of {money(goal.target)}</span></div><div className="progress-track goal-card-track"><span style={{ width: `${progress}%`, background: goal.color }} /></div><div className="goal-progress-foot"><span>{remaining > 0 ? `${money(remaining)} to go` : 'Goal unlocked!'}</span><strong>{Math.round(progress)}%</strong></div><div className="goal-card-divider" />{showContribution ? <div className="contribution-form"><label htmlFor={`contribution-${goal.id}`}>Add to this goal</label><div className="contribution-controls"><div className="input-with-icon"><IndianRupee size={14} /><input id={`contribution-${goal.id}`} type="number" min="1" max={Math.min(canContribute, remaining)} value={contribution} onChange={(e) => setContribution(e.target.value)} /></div><button className="button button-primary" onClick={addContribution} disabled={remaining <= 0 || canContribute <= 0}>Save</button></div>{error && <small className="form-error">{error}</small>}<button className="cancel-contribution" onClick={() => { setShowContribution(false); setError(''); }}>Cancel</button></div> : <button className="button button-outline goal-contribute" disabled={remaining <= 0 || canContribute <= 0} onClick={() => setShowContribution(true)}>{remaining <= 0 ? <><Check size={15} /> Goal reached</> : <><Plus size={15} /> Add savings</>}</button>}</article>;
}

export default App;
```


---

## `src/components/FinanceCharts.jsx`

```jsx
import { ArrowRight } from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { money, shortMoney } from '../utils/formatters.js';

function SectionHeading({ eyebrow, title, action, onAction }) {
  return <div className="section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action && <button className="text-action" onClick={onAction}>{action}<ArrowRight size={15} /></button>}</div>;
}

/** Charts are isolated from the main bundle and loaded only when the overview is rendered. */
export default function FinanceCharts({ trendData, derived, categoryData, onNavigate }) {
  return <>      <section className="dashboard-grid"><div className="panel spending-panel"><div className="panel-head"><SectionHeading eyebrow="THE BIG PICTURE" title="Spending rhythm" /><div className="legend-pill"><span /> Balance trend</div></div><div className="chart-summary"><div><span className="chart-summary-label">Tracked balance</span><strong>{money(Math.max(0, derived.totalFunds - derived.totalExpenses - derived.goalSavings))}</strong></div><span className="chart-summary-note"><span className="note-dot" /> Last 7 days</span></div><div className="balance-chart" role="img" aria-label="Area chart showing tracked balance for the last seven days"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{ top: 12, right: 4, left: -22, bottom: 0 }}><defs><linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c2f970" stopOpacity={0.24} /><stop offset="100%" stopColor="#c2f970" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid stroke="#e7ebe4" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="label" tick={{ fill: '#92998f', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} /><YAxis tick={{ fill: '#92998f', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} /><Tooltip formatter={(value) => [money(value), 'Tracked balance']} labelFormatter={(label) => `Day: ${label}`} contentStyle={{ border: '1px solid #e4e8df', borderRadius: 12, boxShadow: '0 12px 30px #20291b14', fontSize: 12 }} /><Area type="monotone" dataKey="remaining" stroke="#7ba946" strokeWidth={2.5} fill="url(#balanceFill)" activeDot={{ r: 5, strokeWidth: 0, fill: '#7ba946' }} /></AreaChart></ResponsiveContainer></div><div className="chart-bottom"><span><i className="chart-dot lime-dot" /> Tracked balance</span><span><i className="chart-dot grey-dot" /> Transactions update this view</span></div></div>

            <div className="panel category-panel"><SectionHeading eyebrow="WHERE IT GOES" title="Spending mix" action="All transactions" onAction={() => onNavigate('transactions')} /><div className="donut-wrap"><div className="donut-chart" role="img" aria-label="Donut chart showing spending by category"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData.length ? categoryData : [{ name: 'No spend', value: 1, color: '#edf0e9' }]} dataKey="value" nameKey="name" innerRadius={65} outerRadius={88} paddingAngle={categoryData.length ? 4 : 0} stroke="none" cornerRadius={4}>{(categoryData.length ? categoryData : [{ color: '#edf0e9' }]).map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => money(value)} contentStyle={{ border: '1px solid #e4e8df', borderRadius: 10, fontSize: 12 }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{shortMoney(derived.totalExpenses)}</strong><span>TOTAL SPENT</span></div></div></div><div className="category-list">{categoryData.slice(0, 4).map((item) => <div className="category-row" key={item.name}><span className="category-key" style={{ background: item.color }} /><span className="category-name">{item.name}</span><div className="category-track"><span style={{ width: `${derived.totalExpenses ? (item.value / derived.totalExpenses) * 100 : 0}%`, background: item.color }} /></div><strong>{Math.round((item.value / Math.max(derived.totalExpenses, 1)) * 100)}%</strong></div>)}{categoryData.length === 0 && <p className="empty-small">Your spending mix will appear here.</p>}</div><div className="category-bottom"><span><span className="tiny-star">✳</span> Know your patterns, own your plan.</span></div></div></section></>;
}
```


---

## `src/styles.css`

```css
:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1e281c;
  background: #f6f8f3;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  --ink: #1e281c;
  --muted: #858d81;
  --line: #e8ece4;
  --paper: #fff;
  --lime: #c2f970;
  --green: #6d9838;
  --deep: #192317;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
}
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; min-height: 100vh; }
button, input, select { font: inherit; }
button { cursor: pointer; }
button:focus-visible, input:focus-visible, select:focus-visible { outline: 3px solid #9acb55; outline-offset: 2px; }
button:disabled { opacity: .48; cursor: not-allowed; }
button, select { -webkit-tap-highlight-color: transparent; }
::selection { background: #d8f5ac; color: #192317; }
.app-shell { min-height: 100vh; }
.sidebar { width: 250px; background: #fff; border-right: 1px solid #e7ebe3; position: fixed; inset: 0 auto 0 0; z-index: 20; display: flex; flex-direction: column; padding: 27px 17px 14px; }
.brand-row { display: flex; align-items: center; gap: 10px; padding: 0 8px 31px; }
.brand-mark { width: 40px; height: 40px; flex: 0 0 40px; display: grid; place-items: center; border-radius: 13px; color: #1d2a17; background: var(--lime); transform: rotate(-4deg); }
.brand-name { font-family: Inter, ui-sans-serif, system-ui, sans-serif; font-weight: 800; letter-spacing: -1.1px; line-height: 1.05; font-size: 21px; }
.brand-name > span { color: #84ac46; }
.brand-name small { display: block; margin-top: 7px; font-family: var(--mono); font-size: 8px; letter-spacing: 1.15px; color: #8d9688; font-weight: 500; }
.sidebar-section-label { margin: 0 11px 11px; color: #a0a79b; font: 500 9px var(--mono); letter-spacing: 1.45px; }
.side-nav { display: grid; gap: 5px; }
.nav-item { height: 46px; display: flex; position: relative; align-items: center; gap: 13px; border: 0; border-radius: 10px; padding: 0 12px; color: #687164; background: transparent; text-align: left; font-size: 12.5px; font-weight: 600; transition: background .18s, color .18s; }
.nav-item:hover { background: #f7f9f3; color: #293725; }
.nav-item.active { background: #f0f8e8; color: #304b21; }
.nav-item.active > svg { color: #5c8b2e; }
.nav-count { margin-left: auto; min-width: 23px; height: 21px; border-radius: 6px; background: #edf0e9; display: grid; place-items: center; font: 10px var(--mono); color: #808779; }
.nav-active-dot { margin-left: auto; height: 5px; width: 5px; border-radius: 50%; background: #79a83d; }
.sidebar-budget-card { margin: 36px 3px 0; padding: 17px 14px 15px; border-radius: 14px; color: #f4f7ef; background: #202a1d; overflow: hidden; position: relative; }
.sidebar-budget-card::after { content: ''; position: absolute; width: 120px; height: 120px; border: 1px solid #ffffff0f; border-radius: 50%; right: -42px; top: -33px; box-shadow: 0 0 0 14px #ffffff06, 0 0 0 29px #ffffff04; pointer-events: none; }
.budget-card-top { display: flex; align-items: center; justify-content: space-between; }
.mini-orb { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 9px; background: #c2f970; color: #25331d; }
.live-dot { font: 8px var(--mono); color: #b7e786; letter-spacing: .7px; }
.live-dot::before { content: ''; display: inline-block; width: 5px; height: 5px; background: #c2f970; border-radius: 50%; margin: 0 6px 1px 0; }
.sidebar-budget-card p { margin: 15px 0 5px; color: #b7c0b0; font-size: 10px; }
.sidebar-budget-card h3 { margin: 0; font: 800 19px Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: -.75px; }
.sidebar-budget-card h3 em { color: var(--lime); font-style: normal; }
.budget-line { display: flex; justify-content: space-between; margin-top: 19px; color: #c4ccbd; font-size: 10px; }
.budget-line b { color: #f0f4eb; font-family: var(--mono); font-size: 10px; }
.progress-track { overflow: hidden; height: 6px; border-radius: 99px; background: #eef1e9; }
.sidebar-budget-card .progress-track { height: 5px; margin-top: 8px; background: #4a5345; }
.progress-track > span { display: block; height: 100%; border-radius: inherit; transition: width .3s ease; }
.sidebar-budget-card .progress-track > span { background: var(--lime); }
.budget-card-foot { margin-top: 11px; display: flex; justify-content: space-between; gap: 8px; font-size: 9px; color: #b7c0b0; }
.sidebar-bottom { margin-top: auto; }
.avatar-row { padding: 12px 3px 16px; border-top: 1px solid #edf0e9; display: flex; align-items: center; gap: 9px; }
.avatar { height: 32px; width: 32px; border-radius: 50%; display: grid; place-items: center; background: #fce5ce; color: #9a5c35; font: 800 13px Inter, ui-sans-serif, system-ui, sans-serif; }
.avatar-text { min-width: 0; display: grid; gap: 3px; flex: 1; }
.avatar-text strong { font-size: 10px; }
.avatar-text span { color: #8c9488; font-size: 9px; }
.icon-button { height: 34px; width: 34px; display: inline-grid; place-items: center; border: 0; border-radius: 9px; background: transparent; color: #7d8677; }
.icon-button:hover { background: #f0f4eb; color: #25351e; }
.sidebar-footer { color: #a4aa9f; font-size: 9px; padding: 12px 5px 0; border-top: 1px solid #edf0e9; display: flex; justify-content: space-between; }
.sidebar-footer span:last-child { color: #7ca845; font-size: 13px; }
.mobile-close, .mobile-menu, .mobile-scrim { display: none; }
.main-content { min-height: 100vh; margin-left: 250px; }
.topbar { height: 69px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e8ece4; background: #f9faf7; padding: 0 clamp(22px, 3vw, 49px); }
.topbar-left, .topbar-right { display: flex; align-items: center; gap: 16px; }
.breadcrumbs { display: flex; gap: 10px; align-items: center; color: #989f93; font-size: 11px; }
.breadcrumbs strong { color: #3a4635; font-weight: 600; }
.crumb-slash { color: #c6ccc1; }
.month-chip { height: 33px; display: flex; align-items: center; gap: 8px; background: #fff; padding: 0 11px; border: 1px solid #e8ece5; border-radius: 8px; color: #616b59; font-size: 10px; }
.month-chip svg:last-child { margin-left: 3px; color: #9ba395; }
.notification-button { width: 33px; height: 33px; display: grid; place-items: center; position: relative; border: 1px solid #e8ece5; border-radius: 50%; color: #656f5e; background: #fff; }
.notification-button > span { position: absolute; width: 5px; height: 5px; background: #eaa37a; border-radius: 50%; top: 6px; right: 6px; border: 1px solid white; }
.topbar-avatar { display: grid; place-items: center; width: 33px; height: 33px; border: 0; border-radius: 50%; background: #d9edc1; color: #476b2e; font: 800 11px Inter, ui-sans-serif, system-ui, sans-serif; }
.page-wrap { max-width: 1480px; margin: 0 auto; padding: 35px clamp(22px, 3vw, 49px) 25px; }
.page-intro { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: 23px; }
.welcome-line { display: flex; align-items: center; gap: 7px; color: #7b8e67; font: 500 9px var(--mono); letter-spacing: 1.3px; }
.welcome-spark { color: #86ae4e; font-size: 15px; }
.page-intro h1 { font: 800 clamp(26px, 2.3vw, 32px) Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: -1.35px; margin: 9px 0 6px; color: #20291c; }
.page-intro > div > p { margin: 0; color: #838b7e; font-size: 12px; line-height: 1.6; }
.intro-actions { display: flex; align-items: center; gap: 9px; flex-shrink: 0; }
.button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid transparent; border-radius: 9px; padding: 0 15px; min-height: 39px; font-size: 11px; font-weight: 700; white-space: nowrap; transition: background .18s, border .18s, transform .18s; }
.button:active { transform: translateY(1px); }
.button-primary { color: #1e2918; background: var(--lime); border-color: var(--lime); }
.button-primary:hover { background: #b4ec5c; border-color: #b4ec5c; }
.button-quiet { color: #596453; background: #fff; border-color: #e2e7dd; }
.button-quiet:hover { background: #f8faf5; border-color: #cdd6c5; }
.button-outline { color: #495744; background: #fff; border-color: #dce3d5; }
.button-outline:hover { border-color: #afbd9f; background: #f8faf4; }
.button-dark { background: #253321; color: #fff; border-color: #253321; }
.button-dark:hover { background: #34462d; }
.button-danger { background: #fff0ed; border-color: #ffe0da; color: #b34e3b; }
.hero-card { min-height: 272px; border-radius: 17px; overflow: hidden; color: #f4f8ed; background: #202a1d; display: flex; position: relative; isolation: isolate; padding: 26px 29px 25px; }
.hero-copy { width: 62%; max-width: 590px; position: relative; z-index: 2; }
.hero-pill { height: 24px; display: inline-flex; align-items: center; gap: 7px; padding: 0 9px; color: #d5dfcd; border: 1px solid #495444; border-radius: 6px; font: 9px var(--mono); letter-spacing: .6px; }
.hero-pill-dot { height: 6px; width: 6px; border-radius: 50%; background: var(--lime); box-shadow: 0 0 8px #c2f97066; }
.hero-copy h2 { margin: 14px 0 8px; font: 800 clamp(25px, 2.35vw, 33px)/1.14 Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: -1.15px; }
.hero-copy h2 span { color: #e9f3dd; }
.hero-copy h2 i { color: var(--lime); font-style: normal; }
.hero-copy > p { max-width: 395px; margin: 0; color: #b4beb0; font-size: 11px; line-height: 1.7; }
.hero-actions { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; margin-top: 18px; }
.button-lime { min-height: 36px; background: var(--lime); color: #23301d; border-color: var(--lime); }
.button-lime:hover { background: #d0ff8e; }
.hero-footnote { display: flex; align-items: center; gap: 6px; color: #aab7a1; font-size: 9px; }
.hero-footnote svg { color: #c0e698; }
.hero-art { width: 41%; position: absolute; right: 0; top: 0; bottom: 0; overflow: hidden; }
.art-glow { position: absolute; right: 14%; top: 7%; width: 240px; height: 240px; background: #6c8b4d28; filter: blur(30px); border-radius: 50%; }
.art-ring { border: 1px solid #ffffff12; border-radius: 50%; position: absolute; }
.ring-one { width: 320px; height: 320px; top: -35px; right: 4px; }
.ring-two { width: 253px; height: 253px; top: -1px; right: 37px; }
.art-coin { position: absolute; display: grid; place-items: center; border-radius: 50%; font: 800 65px Inter, ui-sans-serif, system-ui, sans-serif; }
.coin-back { width: 139px; height: 139px; top: 61px; right: 103px; background: #a1ca5a; border: 9px solid #8bb34e; color: #567d2b; box-shadow: inset 0 0 0 3px #bfe77e; transform: rotate(8deg); }
.coin-front { width: 143px; height: 143px; top: 72px; right: 74px; color: #314724; background: linear-gradient(135deg, #d8ffa2, #b2e568 76%); border: 7px solid #c5f47d; box-shadow: 0 16px 45px #0d160d55, inset 0 0 0 1px #efffd6; transform: rotate(-12deg); }
.coin-front span { filter: drop-shadow(1px 2px 0 #94bf4c); }
.art-spark { position: absolute; color: var(--lime); font-size: 28px; }
.spark-a { right: 62px; top: 47px; transform: rotate(15deg); }
.spark-b { right: 252px; top: 167px; font-size: 19px; color: #f6d27c; }
.art-sticker { position: absolute; top: 36px; right: 21px; padding: 9px 10px; background: #f3d47b; color: #25321d; border-radius: 4px; font: 800 9px/1.3 var(--mono); letter-spacing: .5px; transform: rotate(7deg); box-shadow: 0 4px 0 #9e884c; }
.art-sticker span { font-size: 7px; }
.art-bottom-note { position: absolute; bottom: 22px; right: 27px; display: flex; align-items: center; gap: 7px; font: 9px var(--mono); color: #9da997; letter-spacing: .7px; }
.art-bottom-note span { display: grid; place-items: center; height: 19px; width: 19px; border-radius: 50%; background: #c2f970; color: #22321b; font-size: 12px; }
.hero-index { position: absolute; bottom: 18px; left: 29px; color: #c2f970; font: 10px var(--mono); }
.hero-index span { color: #82917a; }
.stats-grid { margin-top: 16px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px; }
.stat-card { background: #fff; border: 1px solid #e9ede5; border-radius: 13px; min-width: 0; padding: 15px 15px 13px; }
.stat-top { display: flex; align-items: center; justify-content: space-between; gap: 7px; }
.stat-icon { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9px; }
.stat-icon-lime { color: #507b2a; background: #eef8df; }
.stat-icon-orange { color: #bc6b40; background: #fff0e6; }
.stat-icon-purple { color: #7663b1; background: #f0edff; }
.stat-icon-green { color: #548c70; background: #e7f7ee; }
.stat-tag { display: inline-flex; align-items: center; gap: 5px; padding: 5px 7px; border-radius: 5px; font: 8px var(--mono); letter-spacing: .2px; white-space: nowrap; }
.stat-tag.positive { background: #f0f8e7; color: #668f40; }
.stat-tag.neutral { background: #f5f6f3; color: #92998e; }
.stat-tag.caution { background: #fff5df; color: #ae7f23; }
.stat-tag.negative { background: #fff0ed; color: #c35b48; }
.stat-tag .dot { width: 5px; height: 5px; border-radius: 50%; background: #82b54a; }
.stat-label { margin: 16px 0 4px; font-size: 10px; font-weight: 600; color: #7d8678; }
.stat-value { font: 800 clamp(21px, 1.7vw, 27px) Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: -1.1px; color: #263122; white-space: nowrap; }
.stat-foot { border-top: 1px solid #f0f2ec; margin-top: 14px; padding-top: 11px; display: flex; align-items: center; justify-content: space-between; gap: 6px; color: #939a8f; font-size: 9px; }
.stat-foot-icon { color: #7ea64d; display: flex; }
.stat-foot-icon.orange { color: #ce8d65; }
.stat-foot-icon.purple { color: #9280ce; }
.stat-foot-icon.green { color: #74ad90; }
.health-value-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.score-outof { margin-left: 2px; color: #9da598; font-size: 12px; font-weight: 500; letter-spacing: 0; }
.health-ring { width: 35px; height: 35px; border-radius: 50%; display: grid; place-items: center; background: conic-gradient(#79ba94 var(--health), #eaf3ec 0); position: relative; flex: 0 0 auto; }
.health-ring::before { content: ''; position: absolute; inset: 4px; background: #fff; border-radius: 50%; }
.health-ring span { position: relative; color: #67a680; font-size: 16px; }
.dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.68fr) minmax(280px, 1fr); gap: 14px; margin-top: 16px; }
.panel { background: #fff; border: 1px solid #e8ece4; border-radius: 13px; padding: 19px 20px; min-width: 0; }
.panel-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.eyebrow { margin: 0 0 7px; color: #8c9b7e; font: 500 8.5px var(--mono); letter-spacing: 1.15px; }
.section-heading h2, .panel h2 { font: 800 17px Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: -.55px; margin: 0; color: #263022; }
.text-action { display: inline-flex; align-items: center; gap: 6px; border: 0; background: transparent; color: #628643; font-size: 10px; font-weight: 700; white-space: nowrap; padding: 4px 0; }
.text-action:hover { color: #375f1f; }
.legend-pill { height: 25px; padding: 0 8px; border-radius: 6px; background: #f6f8f3; color: #858e7e; display: flex; align-items: center; gap: 6px; font-size: 9px; }
.legend-pill span { width: 6px; height: 6px; border-radius: 50%; background: #a2c86a; }
.chart-summary { margin: 17px 0 4px; display: flex; align-items: flex-end; justify-content: space-between; }
.chart-summary > div { display: grid; gap: 4px; }
.chart-summary-label { color: #8d9588; font-size: 9px; }
.chart-summary strong { font: 800 23px Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: -.8px; }
.chart-summary-note { color: #a0a79b; display: flex; align-items: center; gap: 6px; font-size: 9px; }
.note-dot { height: 6px; width: 6px; border-radius: 50%; background: #b8d994; }
.balance-chart { height: 184px; width: 100%; }
.chart-bottom { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 12px; border-top: 1px solid #f0f2ed; color: #949c90; font-size: 9px; }
.chart-bottom > span { display: flex; align-items: center; gap: 6px; }
.chart-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.lime-dot { background: #9ecb65; }
.grey-dot { background: #cbd2c5; }
.category-panel { padding-bottom: 13px; }
.donut-wrap { margin: 1px 0 -4px; display: flex; justify-content: center; }
.donut-chart { width: 180px; max-width: 100%; height: 166px; position: relative; }
.donut-center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; pointer-events: none; padding-top: 1px; }
.donut-center strong { font: 800 20px Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: -.6px; }
.donut-center span { margin-top: 3px; font: 8px var(--mono); letter-spacing: .6px; color: #92998e; }
.category-list { display: grid; gap: 11px; margin-top: 3px; }
.category-row { display: grid; grid-template-columns: 7px 70px minmax(30px, 1fr) 29px; align-items: center; gap: 8px; }
.category-key { width: 6px; height: 6px; border-radius: 2px; }
.category-name { font-size: 10px; color: #697362; }
.category-track { height: 4px; border-radius: 99px; background: #f1f3ee; overflow: hidden; }
.category-track > span { height: 100%; display: block; border-radius: inherit; }
.category-row > strong { text-align: right; font: 10px var(--mono); color: #596352; }
.category-bottom { border-top: 1px solid #f0f2ed; margin-top: 15px; padding-top: 11px; font-size: 9px; color: #969e91; }
.tiny-star { color: #87b24d; margin-right: 5px; }
.empty-small { color: #939b8f; font-size: 11px; padding: 10px 0; }
.lower-grid { margin-top: 14px; }
.decision-panel { padding: 19px 20px 12px; }
.decision-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.decision-title-row h2 span { color: #8db75a; font-size: 18px; margin-left: 3px; }
.section-description { color: #8b9387; font-size: 10px; line-height: 1.6; margin: 7px 0 0; }
.decision-chip { display: flex; align-items: center; gap: 5px; padding: 6px 8px; background: #fff7df; border: 1px solid #f7e9bb; border-radius: 6px; color: #a87c22; font: 8px var(--mono); white-space: nowrap; }
.simulator-layout { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(190px, .82fr); gap: 15px; margin-top: 20px; }
.sim-form { display: flex; flex-direction: column; gap: 13px; }
.field { display: flex; flex-direction: column; gap: 7px; min-width: 0; color: #687362; font-size: 10px; font-weight: 700; }
.field > span { font-size: 10px; }
.field input, .field select, .input-with-icon { width: 100%; min-width: 0; height: 38px; border-radius: 8px; border: 1px solid #e5e9e1; background: #fbfcfa; color: #3c4735; font-size: 11px; }
.field input, .field select { padding: 0 11px; }
.field input::placeholder { color: #b0b6aa; }
.field input:focus, .field select:focus, .search-field input:focus { outline: none; border-color: #a8cb78; box-shadow: 0 0 0 3px #c2f9702e; }
.field small { color: #969e91; font-size: 9px; font-weight: 400; }
.input-with-icon { display: flex; align-items: center; gap: 3px; padding-left: 10px; }
.input-with-icon svg { color: #a1aa98; flex-shrink: 0; }
.input-with-icon input { border: 0; background: transparent; padding-left: 0; height: 100%; outline: none; box-shadow: none !important; }
.form-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.sim-input-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .95fr); gap: 10px; }
.quick-amounts { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.quick-amounts > span { width: 100%; margin-bottom: 1px; color: #9ca395; font: 8px var(--mono); letter-spacing: .8px; }
.quick-amounts button { background: white; border: 1px solid #e2e8dd; color: #687362; border-radius: 6px; padding: 6px 9px; font: 10px var(--mono); }
.quick-amounts button:hover, .quick-amounts button.selected { background: #eff8e4; border-color: #c6e3a4; color: #4a742b; }
.sim-preview { border-radius: 11px; background: #f5f8f0; border: 1px solid #e7eee0; padding: 14px 14px 12px; position: relative; }
.preview-orb { position: absolute; top: 13px; right: 13px; width: 30px; height: 30px; border-radius: 50%; background: #e2efcf; color: #6e963e; display: grid; place-items: center; }
.sim-preview .eyebrow { color: #92a283; margin-bottom: 11px; font-size: 7.5px; }
.preview-balance { font: 800 clamp(20px, 1.8vw, 25px) Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: -.8px; color: #2d3d26; }
.preview-caption { font-size: 9px; color: #879580; display: block; margin-top: 3px; }
.preview-divider { height: 1px; background: #e0e8d8; margin: 15px 0 11px; }
.preview-metric { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 9px; color: #77846e; }
.preview-metric strong { font: 700 11px var(--mono); color: #3d5930; white-space: nowrap; }
.preview-risk { margin-top: 12px; display: flex; align-items: center; gap: 6px; font-size: 8.5px; color: #63874a; line-height: 1.4; }
.preview-risk span { height: 6px; width: 6px; border-radius: 50%; background: #8dc35b; flex-shrink: 0; }
.preview-risk-bad { color: #b45b45; }
.preview-risk-bad span { background: #d97960; }
.apply-button { margin-top: 12px; min-height: 34px; width: 100%; padding: 0 10px; font-size: 10px; }
.simulation-disclaimer { margin: 12px 0 0; padding-top: 11px; display: flex; gap: 6px; align-items: center; color: #929b8b; border-top: 1px solid #f0f2ed; font-size: 9px; }
.simulation-disclaimer svg { flex-shrink: 0; }
.goals-preview-panel { padding-bottom: 14px; }
.goals-mini-list { display: grid; gap: 18px; margin-top: 22px; }
.goal-mini-top { display: flex; align-items: center; gap: 9px; }
.goal-emoji { height: 35px; width: 35px; flex-shrink: 0; border-radius: 10px; background: #f0edff; display: grid; place-items: center; font-size: 17px; }
.goal-mini-name { display: grid; gap: 4px; min-width: 0; flex: 1; }
.goal-mini-name strong { font-size: 10px; color: #4a5544; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.goal-mini-name span { font-size: 9px; color: #939b8d; }
.goal-mini-top > b { font: 10px var(--mono); color: #738767; }
.goal-track { margin-top: 10px; height: 5px; margin-left: 44px; background: #f0f2ec; }
.goal-add-button { margin-top: 20px; width: 100%; }
.bottom-split { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(265px, 1fr); gap: 14px; margin-top: 14px; }
.recent-panel { padding-bottom: 6px; }
.transaction-list { margin-top: 13px; }
.transaction-row { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 11px 0; border-bottom: 1px solid #f0f2ed; }
.transaction-row:last-child { border-bottom: 0; }
.transaction-icon { height: 34px; width: 34px; flex-shrink: 0; border-radius: 10px; color: #475640; background: color-mix(in srgb, var(--category-color) 24%, white); display: grid; place-items: center; }
.transaction-description { display: grid; gap: 4px; flex: 1; min-width: 0; }
.transaction-description strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #424e3b; font-size: 10px; }
.transaction-description span { color: #929a8d; font-size: 9px; }
.transaction-description span i { font-style: normal; margin: 0 3px; color: #c1c7bb; }
.transaction-money { display: grid; justify-items: end; gap: 3px; flex-shrink: 0; }
.transaction-money strong { color: #455040; font: 600 11px var(--mono); }
.delete-transaction { width: 20px; height: 17px; display: grid; place-items: center; padding: 0; background: transparent; border: 0; border-radius: 4px; color: #b3baac; opacity: 0; }
.transaction-row:hover .delete-transaction, .delete-transaction:focus-visible { opacity: 1; }
.delete-transaction:hover { background: #fff0ed; color: #b34e3b; }
.forecast-card { border-radius: 13px; padding: 19px 20px; background: #eaf4dd; border: 1px solid #dfebcf; }
.forecast-top { display: flex; align-items: center; justify-content: space-between; }
.forecast-icon { height: 34px; width: 34px; border-radius: 10px; background: #d9e9c4; color: #668b42; display: grid; place-items: center; }
.forecast-tag { border: 1px solid #d8e6ca; border-radius: 6px; padding: 5px 7px; background: #f4faed; color: #628544; font: 8px var(--mono); }
.forecast-tag.warning { color: #a77b26; background: #fff5dc; border-color: #f5e7b7; }
.forecast-tag.bad { color: #bd5947; background: #fff0ed; border-color: #ffdcd5; }
.forecast-card > .eyebrow { margin-top: 17px; color: #7e9c65; }
.forecast-card h2 { color: #263921; font: 800 30px Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: -1px; }
.forecast-copy { color: #75866a; font-size: 10px; line-height: 1.7; margin: 7px 0 17px; }
.forecast-divider { height: 1px; background: #d7e5c9; margin-bottom: 12px; }
.forecast-row { display: flex; justify-content: space-between; gap: 10px; margin: 10px 0; color: #74866a; font-size: 10px; }
.forecast-row strong { font: 600 10px var(--mono); color: #3c5532; }
.forecast-insight { display: flex; gap: 8px; align-items: flex-start; padding: 11px 10px; border-radius: 8px; margin-top: 16px; background: #dcecc9; color: #597c3d; font-size: 9px; line-height: 1.5; }
.forecast-insight svg { flex-shrink: 0; }
.app-footer { margin-top: 28px; padding: 16px 2px 0; border-top: 1px solid #e7ebe2; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; color: #7b8b6c; font: 600 9px var(--mono); }
.footer-muted { color: #a2aa9a; font-weight: 400; }
.footer-secure { display: flex; align-items: center; gap: 5px; color: #98a091; font: 9px Inter, ui-sans-serif, system-ui, sans-serif; }
.footer-secure svg { color: #89a96a; }
.footer-separator { color: #c6cec0; margin: 0 3px; }

/* Transactions */
.page-panel { margin-top: 0; padding: 22px 23px; }
.page-panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.page-panel-heading h2 { font: 800 20px Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: -.7px; }
.filter-row { display: flex; align-items: center; gap: 10px; padding: 19px 0 14px; margin-top: 18px; border-top: 1px solid #eef1eb; }
.search-field { display: flex; align-items: center; gap: 9px; min-width: 180px; flex: 1; height: 38px; padding: 0 10px; border: 1px solid #e4e9df; border-radius: 8px; background: #fbfcfa; color: #9aa291; }
.search-field input { min-width: 0; width: 100%; padding: 0; height: 100%; color: #46523e; border: 0; outline: 0; background: transparent; font-size: 10px; }
.search-field kbd { border: 1px solid #e3e8df; border-radius: 4px; padding: 2px 5px; color: #a6ad9d; background: #fff; font: 11px Inter, ui-sans-serif, system-ui, sans-serif; }
.filter-select { display: flex; align-items: center; gap: 8px; color: #8f9887; font-size: 10px; }
.filter-select select { height: 38px; border: 1px solid #e4e9df; border-radius: 8px; background: #fbfcfa; padding: 0 9px; color: #57634f; font-size: 10px; }
.filter-reset { min-height: 36px; }
.table-scroll { overflow-x: auto; }
.transactions-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
.transactions-table thead { background: #f7f9f5; }
.transactions-table th { height: 38px; padding: 0 11px; color: #929a8b; text-align: left; font: 500 8px var(--mono); letter-spacing: .6px; }
.transactions-table th:first-child { border-radius: 7px 0 0 7px; }
.transactions-table th:last-child { border-radius: 0 7px 7px 0; }
.transactions-table td { padding: 12px 11px; border-bottom: 1px solid #f0f2ed; color: #586351; font-size: 10px; }
.table-description { display: flex; align-items: center; gap: 9px; min-width: 170px; }
.table-category-icon { width: 31px; height: 31px; display: grid; place-items: center; background: color-mix(in srgb, var(--category-color) 24%, white); color: #53644a; border-radius: 9px; }
.table-description > div { display: grid; gap: 4px; }
.table-description strong { font-size: 10px; font-weight: 700; color: #46513f; }
.table-description small { font-size: 9px; color: #9ca395; }
.category-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 7px; background: #f7f9f5; border-radius: 5px; color: #7a8473; font-size: 9px; }
.category-badge i { width: 6px; height: 6px; border-radius: 2px; }
.date-cell { color: #8b9484 !important; }
.align-right { text-align: right !important; }
.amount-cell { font: 600 10px var(--mono) !important; color: #47533f !important; }
.row-more { border: 0; border-radius: 6px; display: grid; place-items: center; width: 27px; height: 27px; color: #939b8b; background: transparent; }
.row-more:hover { background: #f2f5ee; color: #53634a; }
.transactions-table tbody tr:hover { background: #fcfdfb; }
.table-footer { margin-top: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 7px; color: #9aa293; font-size: 9px; }
.table-footer strong { color: #63705b; font-weight: 700; }
.table-footer span:last-child { display: flex; align-items: center; gap: 5px; }
.table-footer svg { color: #8bb06c; }
.empty-state { min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 22px; }
.empty-state > span { font-size: 30px; margin-bottom: 9px; }
.empty-state > strong { color: #53604d; font: 800 14px Inter, ui-sans-serif, system-ui, sans-serif; }
.empty-state > p { color: #969f90; font-size: 10px; margin: 7px 0 13px; }

/* Goals */
.goals-page { padding: 0; }
.goals-page-heading { margin-bottom: 18px; }
.goals-page-heading h2 { font: 800 22px Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: -.8px; }
.goals-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.goal-card { min-width: 0; padding: 19px; background: #fff; border: 1px solid #e7ece3; border-radius: 14px; }
.goal-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 17px; }
.goal-card-emoji { display: grid; place-items: center; width: 45px; height: 45px; border-radius: 13px; font-size: 23px; }
.goal-card .eyebrow { margin-bottom: 6px; }
.goal-card h3 { margin: 0; color: #2c3826; font: 800 17px Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: -.35px; overflow-wrap: anywhere; }
.goal-amount-row { margin-top: 19px; display: flex; align-items: baseline; gap: 5px; }
.goal-amount-row strong { font: 800 24px Inter, ui-sans-serif, system-ui, sans-serif; color: #2e3a28; letter-spacing: -.8px; }
.goal-amount-row > span { color: #929b8d; font-size: 10px; }
.goal-card-track { height: 7px; margin-top: 12px; }
.goal-progress-foot { display: flex; justify-content: space-between; margin-top: 8px; color: #929a8e; font-size: 9px; }
.goal-progress-foot strong { color: #6a8057; font: 10px var(--mono); }
.goal-card-divider { height: 1px; background: #eff2ec; margin: 19px 0 14px; }
.goal-contribute { width: 100%; min-height: 35px; }
.contribution-form > label { color: #6a7660; font-size: 10px; font-weight: 700; display: block; margin-bottom: 7px; }
.contribution-controls { display: flex; gap: 6px; }
.contribution-controls .input-with-icon { height: 35px; flex: 1; }
.contribution-controls .button { min-height: 35px; }
.cancel-contribution { display: block; background: transparent; border: 0; padding: 8px 0 0; font-size: 9px; color: #8a9581; }
.form-error { margin: 0; color: #b64f3e; font-size: 10px; line-height: 1.45; }
.contribution-form .form-error { display: block; margin-top: 5px; }
.new-goal-card { min-height: 220px; border-radius: 14px; border: 1px dashed #cfd9c5; background: #f9fbf6; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 9px; color: #66795b; }
.new-goal-card:hover { background: #f2f7e9; border-color: #b7cf9d; }
.new-goal-card > span { display: grid; place-items: center; width: 41px; height: 41px; border-radius: 50%; background: #eaf4dd; color: #6b963f; }
.new-goal-card strong { font-size: 11px; }
.new-goal-card small { color: #98a18f; font-size: 9px; }
.goal-empty { grid-column: 1 / -1; }
.goals-footnote { display: flex; gap: 9px; align-items: center; margin-top: 16px; padding: 12px 14px; background: #f0f6e8; border: 1px solid #e4edd9; border-radius: 9px; color: #7e956c; }
.goals-footnote svg { flex-shrink: 0; }
.goals-footnote p { font-size: 10px; margin: 0; line-height: 1.6; }

/* Commitments */
.commitment-summary-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; margin-bottom: 15px; }
.commitment-total-card { border: 1px solid #e8ece4; border-radius: 12px; background: #fff; padding: 15px; min-width: 0; }
.commitment-summary-icon { display: grid; place-items: center; width: 33px; height: 33px; border-radius: 9px; background: #eff7e5; color: #73984b; }
.commitment-summary-icon.sub-icon { background: #f0edff; color: #8c7ac7; }
.commitment-summary-icon.due-icon { background: #fff0e4; color: #c18254; }
.commitment-total-card p { margin: 13px 0 4px; color: #818b79; font-size: 10px; }
.commitment-total-card > strong { display: block; font: 800 22px Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: -.6px; color: #293623; }
.commitment-total-card small { display: block; margin-top: 5px; color: #9aa293; font-size: 9px; line-height: 1.5; }
.commitments-layout { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(300px, .9fr); gap: 14px; }
.commitments-panel { padding: 20px 19px; }
.commitments-panel .page-panel-heading { align-items: flex-start; }
.commitments-panel .page-panel-heading h2 { font: 800 17px Inter, ui-sans-serif, system-ui, sans-serif; }
.commitments-panel .page-panel-heading .button { padding: 0 11px; min-height: 35px; }
.commitment-list { margin-top: 19px; }
.commitment-row { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px solid #eff2ec; }
.commitment-row:last-child { border-bottom: 0; }
.commitment-row-icon { width: 35px; height: 35px; flex-shrink: 0; display: grid; place-items: center; border-radius: 10px; background: #f2f5ee; color: #718364; }
.commitment-info { min-width: 0; flex: 1; display: grid; gap: 5px; }
.commitment-info strong { font-size: 10px; color: #45523e; overflow-wrap: anywhere; }
.commitment-info span { color: #929b8c; font-size: 9px; }
.commitment-amount { text-align: right; display: grid; gap: 4px; }
.commitment-amount strong { color: #46523f; font: 600 10px var(--mono); white-space: nowrap; }
.commitment-amount span { font: 8px var(--mono); }
.pending-label { color: #ba8d3b; }
.paid-label { color: #7da05b; }
.mark-paid { min-height: 29px; padding: 0 8px; font-size: 9px; gap: 4px; }
.paid-check { display: grid; place-items: center; width: 26px; height: 26px; flex-shrink: 0; border-radius: 50%; background: #eaf5df; color: #74a348; }
.commitment-paid .commitment-info strong { color: #8d9787; text-decoration: line-through; }
.subscription-list { margin-top: 14px; }
.subscription-row { display: flex; align-items: center; gap: 9px; padding: 12px 0; border-bottom: 1px solid #eff2ec; }
.subscription-row:last-child { border-bottom: 0; }
.subscription-logo { height: 34px; width: 34px; display: grid; place-items: center; flex-shrink: 0; border-radius: 10px; background: #f0edff; color: #8170be; font-weight: 800; font-size: 17px; }
.subscription-row:nth-child(2) .subscription-logo { background: #e8f6ed; color: #60a17c; }
.subscription-row:nth-child(3) .subscription-logo { background: #fff0e2; color: #c98751; }
.subscription-copy { display: grid; gap: 4px; flex: 1; min-width: 0; }
.subscription-copy strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #475340; font-size: 10px; }
.subscription-copy span { color: #949c8f; font-size: 9px; }
.subscription-price { color: #45523f; font: 600 10px var(--mono); white-space: nowrap; }
.subscription-price small { color: #9da596; font: 9px Inter, ui-sans-serif, system-ui, sans-serif; }
.subscription-off { opacity: .66; }
.toggle { width: 32px; height: 19px; padding: 2px; background: #e2e6de; border: 0; border-radius: 99px; flex-shrink: 0; transition: background .16s; }
.toggle span { display: block; width: 15px; height: 15px; background: #fff; border-radius: 50%; box-shadow: 0 1px 3px #15200d1c; transition: transform .16s; }
.toggle-on { background: #a5d66b; }
.toggle-on span { transform: translateX(13px); }
.subscription-total { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 13px 11px; margin-top: 12px; background: #f4f8ee; border-radius: 8px; color: #73866a; font-size: 10px; }
.subscription-total strong { font: 700 12px var(--mono); color: #455e37; }

/* Forms, modal, accessibility */
.modal-backdrop { position: fixed; inset: 0; z-index: 100; background: #1820158c; display: grid; place-items: center; padding: 18px; backdrop-filter: blur(4px); animation: backdrop-in .16s ease-out; }
.modal { width: min(100%, 450px); max-height: calc(100vh - 36px); overflow-y: auto; padding: 23px; background: #fff; border: 1px solid #e9eee4; border-radius: 16px; box-shadow: 0 24px 80px #15200d40; animation: modal-in .19s ease-out; }
@keyframes backdrop-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes modal-in { from { opacity: 0; transform: translateY(8px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
.modal-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 22px; }
.modal-heading h2 { margin: 0; color: #263221; font: 800 21px Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: -.7px; }
.modal-heading p { margin: 6px 0 0; color: #8f9887; font-size: 10px; line-height: 1.6; }
.form-grid { display: grid; gap: 15px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; padding-top: 14px; border-top: 1px solid #edf0e9; }
.reset-warning { display: flex; align-items: flex-start; gap: 10px; padding: 12px; border-radius: 8px; background: #fff7e8; color: #9f7628; margin-bottom: 15px; }
.reset-warning svg { flex-shrink: 0; }
.reset-warning p { margin: 0; font-size: 10px; line-height: 1.65; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

@media (min-width: 1600px) {
  .sidebar { width: 270px; }
  .main-content { margin-left: 270px; }
  .page-wrap { padding-left: 52px; padding-right: 52px; }
  .hero-card { min-height: 290px; }
  .coin-back { right: 154px; }
  .coin-front { right: 125px; }
}
@media (max-width: 1250px) {
  .sidebar { width: 225px; padding-left: 13px; padding-right: 13px; }
  .main-content { margin-left: 225px; }
  .page-wrap { padding-left: 24px; padding-right: 24px; }
  .topbar { padding-left: 24px; padding-right: 24px; }
  .stat-card { padding: 13px 12px 11px; }
  .stat-tag { font-size: 7px; }
  .stat-foot { font-size: 8px; }
  .dashboard-grid { grid-template-columns: minmax(0, 1.45fr) minmax(260px, 1fr); }
  .hero-copy { width: 65%; }
  .hero-art { width: 40%; }
  .coin-back { right: 75px; }
  .coin-front { right: 48px; }
  .simulator-layout { grid-template-columns: minmax(0, 1fr) minmax(175px, .9fr); }
  .goals-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 1020px) {
  .sidebar { width: 215px; }
  .main-content { margin-left: 215px; }
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dashboard-grid { grid-template-columns: minmax(0, 1.25fr) minmax(255px, .9fr); }
  .hero-card { min-height: 260px; }
  .hero-copy { width: 70%; }
  .hero-copy h2 { font-size: 28px; }
  .hero-art { opacity: .75; width: 36%; }
  .coin-back { right: 20px; top: 70px; width: 115px; height: 115px; }
  .coin-front { right: -5px; top: 82px; width: 120px; height: 120px; font-size: 54px; }
  .art-sticker { right: 8px; }
  .art-bottom-note { display: none; }
  .lower-grid, .bottom-split { grid-template-columns: minmax(0, 1fr); }
  .goals-preview-panel { display: block; }
  .goals-mini-list { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
  .goal-track { margin-left: 0; }
  .commitments-layout { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 760px) {
  .sidebar { transform: translateX(-105%); transition: transform .22s ease; width: 270px; max-width: calc(100vw - 55px); box-shadow: none; z-index: 80; }
  .sidebar.sidebar-open { transform: translateX(0); box-shadow: 12px 0 40px #18201520; }
  .mobile-close { display: inline-grid; margin-left: auto; }
  .mobile-menu { display: inline-grid; height: 32px; width: 32px; margin-left: -7px; }
  .mobile-scrim { display: block; position: fixed; z-index: 70; inset: 0; background: #12190f72; border: 0; }
  .main-content { margin-left: 0; }
  .topbar { height: 59px; padding: 0 17px; }
  .topbar-left { gap: 8px; }
  .breadcrumbs { font-size: 10px; gap: 7px; }
  .topbar-right { gap: 8px; }
  .month-chip { max-width: 139px; padding: 0 8px; gap: 6px; font-size: 9px; }
  .month-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .notification-button { height: 31px; width: 31px; }
  .topbar-avatar { height: 31px; width: 31px; }
  .page-wrap { padding: 25px 16px 20px; }
  .page-intro { align-items: flex-start; flex-direction: column; gap: 14px; margin-bottom: 18px; }
  .page-intro h1 { font-size: 27px; letter-spacing: -1px; }
  .page-intro > div > p { font-size: 11px; }
  .intro-actions { width: 100%; }
  .intro-actions .button { flex: 1; }
  .export-button { flex: 0 0 auto !important; }
  .hero-card { min-height: 270px; padding: 21px 18px; }
  .hero-copy { width: 100%; max-width: 470px; }
  .hero-copy h2 { font-size: clamp(24px, 6vw, 31px); }
  .hero-copy > p { max-width: 335px; font-size: 10px; }
  .hero-art { width: 40%; opacity: .27; }
  .coin-back { right: -30px; }
  .coin-front { right: -52px; }
  .hero-footnote { display: none; }
  .hero-actions { margin-top: 15px; }
  .hero-index { left: auto; right: 16px; bottom: 17px; color: #879e6d; }
  .stats-grid { gap: 9px; margin-top: 11px; }
  .stat-card { padding: 12px 11px 10px; border-radius: 11px; }
  .stat-icon { width: 29px; height: 29px; }
  .stat-tag { font-size: 7px; padding: 4px 5px; }
  .stat-label { margin-top: 12px; font-size: 9px; }
  .stat-value { font-size: clamp(19px, 5vw, 25px); }
  .stat-foot { margin-top: 10px; padding-top: 9px; font-size: 8px; line-height: 1.4; }
  .stat-foot-icon { display: none; }
  .health-ring { width: 29px; height: 29px; }
  .dashboard-grid { grid-template-columns: minmax(0, 1fr); margin-top: 11px; gap: 11px; }
  .panel { padding: 16px; border-radius: 12px; }
  .section-heading h2, .panel h2 { font-size: 16px; }
  .balance-chart { height: 180px; }
  .category-panel .donut-chart { height: 165px; }
  .lower-grid, .bottom-split { margin-top: 11px; gap: 11px; }
  .simulator-layout { grid-template-columns: minmax(0, 1fr); margin-top: 15px; }
  .sim-preview { padding: 14px; }
  .preview-balance { font-size: 25px; }
  .goals-mini-list { grid-template-columns: minmax(0, 1fr); gap: 15px; margin-top: 16px; }
  .goal-track { margin-left: 44px; }
  .forecast-card { padding: 17px; }
  .app-footer { margin-top: 20px; flex-direction: column; align-items: flex-start; }
  .footer-secure { flex-wrap: wrap; }
  .page-panel { padding: 16px 13px; }
  .page-panel-heading { align-items: flex-start; flex-direction: column; }
  .page-panel-heading .button { align-self: stretch; }
  .filter-row { flex-wrap: wrap; gap: 7px; }
  .search-field { flex-basis: 100%; }
  .filter-select { flex: 1; }
  .filter-select select { flex: 1; }
  .transactions-table th, .transactions-table td { padding-left: 8px; padding-right: 8px; }
  .transactions-table th { font-size: 7.5px; }
  .goals-grid { grid-template-columns: minmax(0, 1fr); }
  .new-goal-card { min-height: 145px; }
  .goals-page-heading .button { width: 100%; }
  .commitment-summary-row { grid-template-columns: minmax(0, 1fr); gap: 8px; }
  .commitment-total-card { padding: 12px; display: grid; grid-template-columns: 34px 1fr; align-items: center; column-gap: 10px; }
  .commitment-total-card .commitment-summary-icon { grid-row: span 3; }
  .commitment-total-card p { margin: 0; }
  .commitment-total-card > strong { font-size: 19px; }
  .commitment-total-card small { margin-top: 2px; }
  .commitments-panel .page-panel-heading { gap: 12px; }
  .commitment-row { gap: 7px; flex-wrap: wrap; }
  .commitment-info { flex-basis: calc(100% - 125px); }
  .commitment-amount { min-width: 73px; }
  .mark-paid { margin-left: 42px; }
  .modal { padding: 18px; }
}
@media (max-width: 420px) {
  .topbar-right { gap: 6px; }
  .month-chip { max-width: 115px; }
  .notification-button { display: none; }
  .page-wrap { padding-left: 12px; padding-right: 12px; }
  .hero-card { min-height: 290px; padding: 19px 15px; }
  .hero-pill { font-size: 7.5px; }
  .hero-copy h2 { font-size: 25px; }
  .hero-copy > p { max-width: 280px; }
  .hero-actions .button { min-height: 34px; padding: 0 10px; font-size: 10px; }
  .stats-grid { gap: 7px; }
  .stat-card { padding: 10px 9px 9px; }
  .stat-tag { font-size: 6px; letter-spacing: 0; }
  .stat-value { font-size: 18px; letter-spacing: -.65px; }
  .stat-foot { font-size: 7px; }
  .stat-top { gap: 4px; }
  .stat-icon { width: 27px; height: 27px; }
  .panel { padding: 14px 12px; }
  .panel-head { flex-direction: column; }
  .legend-pill { align-self: flex-start; }
  .form-two { gap: 8px; }
  .page-intro h1 { font-size: 25px; }
  .forecast-card h2 { font-size: 27px; }
  .filter-reset { flex: 0 0 auto; }
  .filter-select { flex-basis: 100%; }
  .table-footer { align-items: flex-start; flex-direction: column; }
  .subscription-row { gap: 7px; }
  .subscription-price { font-size: 9px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}


/* Quality pass: reduce external network dependencies and improve keyboard/mobile usability. */
.skip-link {
  position: fixed;
  z-index: 200;
  top: 10px;
  left: 10px;
  transform: translateY(-160%);
  padding: 10px 14px;
  border-radius: 8px;
  background: #172314;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}
.skip-link:focus { transform: translateY(0); }
.main-content:focus { outline: none; }
.scenario-impact-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 13px;
}
.scenario-impact-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
  padding: 9px;
  border: 1px solid #e3eadb;
  border-radius: 8px;
  background: #fff;
}
.scenario-impact-item > span { color: #687362; font-size: 10px; line-height: 1.35; }
.scenario-impact-item > strong { overflow-wrap: anywhere; color: #314629; font-size: 13px; font-weight: 800; }
.scenario-impact-item > small { color: #697663; font-size: 9px; line-height: 1.4; }
.scenario-impact-item .scenario-negative { color: #a92f20; }
.scenario-status {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  background: #edf6e5;
  color: #355526;
  font-size: 10px;
  line-height: 1.5;
}
.scenario-status.warning { background: #fff5dd; color: #795515; }
.scenario-status.bad { background: #fff0ed; color: #9b382b; }
.scenario-status-dot { width: 7px; height: 7px; flex: 0 0 7px; margin-top: 4px; border-radius: 50%; background: #6f9e40; }
.scenario-status.warning .scenario-status-dot { background: #bd8d30; }
.scenario-status.bad .scenario-status-dot { background: #c14c3a; }
.storage-warning { margin: 18px 0 0; padding: 12px 14px; border-radius: 9px; background: #fff5dd; color: #6b4d13; font-size: 12px; line-height: 1.5; }
button, input, select { max-width: 100%; }
img, svg { flex-shrink: 0; }
:where(button, input, select, a):focus-visible { outline: 3px solid #477b21; outline-offset: 3px; }
@media (max-width: 760px) {
  .button { min-height: 44px; }
  .nav-item { min-height: 44px; }
  .scenario-impact-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .scenario-impact-item > span { font-size: 11px; }
  .scenario-impact-item > small { font-size: 10px; }
  .field input, .field select { min-height: 44px; }
  .icon-button, .notification-button, .topbar-avatar { min-width: 40px; min-height: 40px; }
}
@media (max-width: 420px) {
  .scenario-impact-list { grid-template-columns: minmax(0, 1fr); }
  .scenario-impact-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; }
  .scenario-impact-item > strong { text-align: right; }
  .scenario-impact-item > small { grid-column: 1 / -1; }
  .intro-actions { flex-wrap: wrap; }
  .intro-actions .button { flex: 1 1 auto; }
}

.checkin-summary { display: grid; gap: 12px; }
.checkin-risk { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0; color: #65715e; font-size: 12px; }
.checkin-metric { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 0; border-bottom: 1px solid #edf0e9; color: #65715e; font-size: 12px; }
.checkin-metric strong { color: #263521; font-size: 14px; text-align: right; }
.checkin-advice { margin: 2px 0; padding: 12px; border-radius: 9px; background: #f4f8ee; color: #435a37; font-size: 12px; line-height: 1.6; }
@media (max-width: 420px) {
  .checkin-metric { align-items: flex-start; flex-direction: column; gap: 5px; }
  .checkin-metric strong { text-align: left; }
}
```


---

## `src/data/demoData.js`

```javascript
import { localISO, offsetDate } from '../utils/formatters.js';

export const STARTING_BUDGET = 10000;

/** Demo seed used only on first launch or when the user explicitly resets the demo. */
export function createDemoData() {
  const now = new Date();
  // Seed the demo from the first of eight sample-spend days, not from the calendar month's day number.
  const dateAt = (daysAgo) => localISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, 12, 0, 0));
  const challengeStartDate = dateAt(8);

  return {
    startingBudget: STARTING_BUDGET,
    monthLength: 30,
    challengeStartDate,
    expenses: [
      { id: 'e1', title: 'Weekly groceries', amount: 680, category: 'Food', date: dateAt(8), note: 'Essentials' },
      { id: 'e2', title: 'Metro & auto', amount: 240, category: 'Transport', date: dateAt(7), note: '' },
      { id: 'e3', title: 'Coffee with friends', amount: 185, category: 'Food', date: dateAt(6), note: '' },
      { id: 'e4', title: 'Phone recharge', amount: 299, category: 'Bills', date: dateAt(5), note: '' },
      { id: 'e5', title: 'Notebook & pens', amount: 165, category: 'Learning', date: dateAt(4), note: 'College' },
      { id: 'e6', title: 'Lunch', amount: 210, category: 'Food', date: dateAt(3), note: '' },
      { id: 'e7', title: 'Movie night', amount: 420, category: 'Lifestyle', date: dateAt(2), note: '' },
      { id: 'e8', title: 'Bus pass top-up', amount: 350, category: 'Transport', date: dateAt(1), note: '' },
    ],
    incomes: [],
    goals: [
      { id: 'g1', name: 'Emergency buffer', target: 3000, saved: 650, emoji: '🛟', color: '#c2f970' },
      { id: 'g2', name: 'New headphones', target: 2500, saved: 350, emoji: '🎧', color: '#a99aff' },
      { id: 'g3', name: 'Weekend plans', target: 1200, saved: 0, emoji: '🌴', color: '#ffb38a' },
    ],
    commitments: [
      { id: 'c1', title: 'College fee instalment', amount: 900, dueDate: offsetDate(3), category: 'Education', paid: false },
      { id: 'c2', title: 'Mobile recharge', amount: 299, dueDate: offsetDate(5), category: 'Utilities', paid: false },
      { id: 'c3', title: 'Electricity share', amount: 450, dueDate: offsetDate(7), category: 'Utilities', paid: false },
    ],
    subscriptions: [
      { id: 's1', name: 'Spotify Student', amount: 59, renewalDate: offsetDate(2), active: true, icon: '♫' },
      { id: 's2', name: 'Cloud storage', amount: 89, renewalDate: offsetDate(6), active: true, icon: '☁' },
      { id: 's3', name: 'Streaming app', amount: 149, renewalDate: offsetDate(10), active: false, icon: '▶' },
    ],
  };
}
```


---

## `src/domain/finance.js`

```javascript
/** Pure finance calculations. Keeping business rules outside React makes them testable. */
export function calculateRisk({ forecastBalance, dailyAllowance, daysRemaining }) {
  if (forecastBalance < 0) return { risk: 'Critical', riskTone: 'bad' };
  if (forecastBalance < 1000) return { risk: 'High risk', riskTone: 'bad' };
  if (forecastBalance < 2500 || (daysRemaining > 0 && dailyAllowance < 100)) {
    return { risk: 'Watch closely', riskTone: 'warning' };
  }
  return { risk: 'Healthy', riskTone: 'good' };
}

export function calculateHealthScore({ forecastBalance, totalFunds, available, reserveTotal }) {
  const score = 100 * (forecastBalance / Math.max(totalFunds, 1))
    + (available >= 0 ? 16 : 0)
    - Math.max(0, reserveTotal / Math.max(totalFunds, 1) * 10);
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Derive all connected dashboard metrics from one consistent financial state. */
export function calculateFinancialSummary(data, { dayNumber, daysRemaining }) {
  const totalIncome = data.incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpenses = data.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const goalSavings = data.goals.reduce((sum, goal) => sum + Number(goal.saved || 0), 0);
  const unpaidCommitments = data.commitments
    .filter((item) => !item.paid)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const activeSubscriptions = data.subscriptions
    .filter((item) => item.active)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalFunds = Number(data.startingBudget || 0) + totalIncome;
  const cashBalance = totalFunds - totalExpenses - goalSavings;
  const reserveTotal = unpaidCommitments + activeSubscriptions;
  const available = cashBalance - reserveTotal;
  const elapsedDays = Math.max(1, Math.min(30, Number(dayNumber) || 1));
  const remainingDays = Math.max(0, Number(daysRemaining) || 0);
  const averageDailySpend = totalExpenses / elapsedDays;
  const projectedVariableSpend = averageDailySpend * remainingDays;
  const forecastBalance = available - projectedVariableSpend;
  const dailyAllowance = remainingDays > 0 ? Math.max(0, available / remainingDays) : Math.max(0, available);
  const { risk, riskTone } = calculateRisk({ forecastBalance, dailyAllowance, daysRemaining: remainingDays });
  const health = calculateHealthScore({ forecastBalance, totalFunds, available, reserveTotal });

  return {
    totalIncome, totalExpenses, goalSavings, unpaidCommitments, activeSubscriptions,
    totalFunds, cashBalance, reserveTotal, available, averageDailySpend,
    projectedVariableSpend, forecastBalance, dailyAllowance, risk, riskTone, health,
  };
}

/** Preview a one-off purchase/emergency expense without changing persisted app data. */
export function simulateExpenseImpact(summary, amount, daysRemaining) {
  const safeAmount = Number.isFinite(Number(amount)) ? Math.max(0, Number(amount)) : 0;
  const available = summary.available - safeAmount;
  const forecastBalance = summary.forecastBalance - safeAmount;
  const dailyAllowance = daysRemaining > 0 ? Math.max(0, available / daysRemaining) : Math.max(0, available);
  const { risk, riskTone } = calculateRisk({ forecastBalance, dailyAllowance, daysRemaining });
  const health = calculateHealthScore({
    forecastBalance,
    totalFunds: summary.totalFunds,
    available,
    reserveTotal: summary.reserveTotal,
  });
  return {
    amount: safeAmount,
    available,
    forecastBalance,
    dailyAllowance,
    risk,
    riskTone,
    health,
    goalContributionRoom: Math.max(0, available),
    contributionRoomChange: Math.max(0, summary.available) - Math.max(0, available),
  };
}
```


---

## `src/domain/storage.js`

```javascript
import { createDemoData } from '../data/demoData.js';

export const STORAGE_KEY = 'pocketwise-finance-v2';
const LEGACY_STORAGE_KEY = 'pocketwise-finance-v1';

/** Loads saved user data safely. A corrupt or unavailable store falls back to demo data. */
export function readInitialData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return createDemoData();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.expenses) || !Array.isArray(parsed.goals)) return createDemoData();
    for (const field of ['incomes', 'commitments', 'subscriptions']) {
      if (parsed[field] !== undefined && !Array.isArray(parsed[field])) return createDemoData();
    }
    return { ...createDemoData(), ...parsed };
  } catch {
    return createDemoData();
  }
}

export function saveFinanceData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearFinanceData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // The app remains usable in memory when browser storage is blocked.
  }
}
```


---

## `src/hooks/useFinanceData.js`

```javascript
import { useEffect, useState } from 'react';
import { createDemoData } from '../data/demoData.js';
import { clearFinanceData, readInitialData, saveFinanceData } from '../domain/storage.js';

/** Owns the saved finance state and its browser-storage lifecycle. */
export function useFinanceData() {
  const [data, setData] = useState(readInitialData);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    setStorageAvailable(saveFinanceData(data));
  }, [data]);

  const resetData = () => {
    clearFinanceData();
    const freshData = createDemoData();
    setData(freshData);
    setStorageAvailable(true);
  };

  return { data, setData, resetData, storageAvailable };
}
```


---

## `src/utils/formatters.js`

```javascript
/** Shared, deterministic formatting/date helpers used by the UI and domain modules. */
export const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value) || 0);

export const shortMoney = (value) => {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return money(n);
};

export const localISO = (date = new Date()) => {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
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
  return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
```


---

## `tests/finance.test.js`

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinancialSummary, simulateExpenseImpact } from '../src/domain/finance.js';
import { createDemoData, STARTING_BUDGET } from '../src/data/demoData.js';

const basicData = {
  startingBudget: 10000,
  incomes: [{ amount: 500 }],
  expenses: [{ amount: 1000, date: '2026-10-01' }, { amount: 500, date: '2026-10-02' }],
  goals: [{ saved: 300, target: 1000 }],
  commitments: [{ amount: 900, paid: false }, { amount: 500, paid: true }],
  subscriptions: [{ amount: 100, active: true }, { amount: 200, active: false }],
};

test('calculates spendable balance after expenses, savings, commitments, and subscriptions', () => {
  const summary = calculateFinancialSummary(basicData, { dayNumber: 10, daysRemaining: 20 });
  assert.equal(summary.totalFunds, 10500);
  assert.equal(summary.totalExpenses, 1500);
  assert.equal(summary.goalSavings, 300);
  assert.equal(summary.reserveTotal, 1000);
  assert.equal(summary.available, 7700);
  assert.equal(summary.dailyAllowance, 385);
});

test('calculates a non-negative, bounded financial health score', () => {
  const summary = calculateFinancialSummary(basicData, { dayNumber: 10, daysRemaining: 20 });
  assert.ok(summary.health >= 0 && summary.health <= 100);
  assert.ok(['Healthy', 'Watch closely', 'High risk', 'Critical'].includes(summary.risk));
});

test('simulating an unexpected expense lowers available balance and forecast without mutating data', () => {
  const summary = calculateFinancialSummary(basicData, { dayNumber: 10, daysRemaining: 20 });
  const before = JSON.stringify(basicData);
  const scenario = simulateExpenseImpact(summary, 1200, 20);
  assert.equal(scenario.available, summary.available - 1200);
  assert.equal(scenario.forecastBalance, summary.forecastBalance - 1200);
  assert.equal(scenario.dailyAllowance, (summary.available - 1200) / 20);
  assert.equal(JSON.stringify(basicData), before);
});

test('invalid simulated amounts safely become zero', () => {
  const summary = calculateFinancialSummary(basicData, { dayNumber: 10, daysRemaining: 20 });
  const scenario = simulateExpenseImpact(summary, Number.NaN, 20);
  assert.equal(scenario.amount, 0);
  assert.equal(scenario.available, summary.available);
});


test('demo seed represents the ₹10,000 budget over a 30-day challenge', () => {
  const demo = createDemoData();
  assert.equal(STARTING_BUDGET, 10000);
  assert.equal(demo.startingBudget, 10000);
  assert.equal(demo.monthLength, 30);
  assert.match(demo.challengeStartDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(demo.expenses.every((expense) => expense.date >= demo.challengeStartDate));
});
```
