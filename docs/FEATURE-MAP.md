# Challenge-to-feature map

This repository implements **Broke But Functional — Survive the Month**
as a React + Vite personal-finance prototype for a ₹10,000 / 30-day
budget challenge.

| Challenge requirement | Where it appears | Observable behaviour |
|---|---|---|
| Starting budget and balance | Overview + `src/domain/finance.js` | Starting budget is ₹10,000; spendable cash recalculates from income, expenses, savings, bills and subscriptions. |
| Income | Add funds modal in `src/App.jsx` | User enters a source and amount; total funds and spendable balance update. |
| Spending and transactions | Transactions page | Add, search, filter and delete expenses; export expense rows as CSV. |
| Daily allowance | Overview + `calculateFinancialSummary` | Spendable balance is divided across the remaining days in the 30-day view. |
| Savings goals | Savings goals page | Create, contribute to and remove goals; contributions reduce spendable cash and change goal progress. |
| Bills and commitments | Bills & subs page | Add bills; unpaid amounts are reserved; marking one paid logs an expense and releases the reserve. |
| Recurring subscriptions | Bills & subs page | Pause or activate each subscription and see its reservation update. |
| Unexpected expenses | Decision Lab | Preview an unexpected expense, then record it in the Emergency category. |
| Decision simulation | Decision Lab + `simulateExpenseImpact` | Preview balance, daily allowance, forecast, contribution room, risk and wellness without mutating saved data. |
| Forecast, risk and financial health | Overview + Money check-in | Rule-based estimate and risk label are recalculated from the current budget state. |
| Persistent data | `src/hooks/useFinanceData.js`, `src/domain/storage.js` | Browser storage is used when available; a status message appears if persistence is unavailable. |
| Responsive and keyboard access | `src/styles.css`, semantic controls in `src/App.jsx` | Responsive breakpoints, visible keyboard focus, skip link, reduced-motion support and chart labels. |

## Financial calculation notes

- This is a front-end learning/demo app, not a bank connection or
  production financial service.
- Forecasts use a simple average-spending projection; estimates are not
  guaranteed predictions or financial advice.
- Scenario previews model a one-off cost as a one-off reduction from
  the current balance and forecast.
- User entries are stored in the current browser profile using localStorage.
  They do not sync between devices.
- Seed expenses, goals, bills and subscriptions are demo examples.
