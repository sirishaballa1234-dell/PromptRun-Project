import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateFinancialSummary,
  simulateExpenseImpact,
} from '../src/domain/finance.js';

import {
  createDemoData,
  STARTING_BUDGET,
} from '../src/data/demoData.js';

const basicData = {
  startingBudget: 10000,

  incomes: [
    { amount: 500 },
  ],

  expenses: [
    { amount: 1000, date: '2026-10-01' },
    { amount: 500, date: '2026-10-02' },
  ],

  goals: [
    { saved: 300, target: 1000 },
  ],

  commitments: [
    { amount: 900, paid: false },
    { amount: 500, paid: true },
  ],

  subscriptions: [
    { amount: 100, active: true },
    { amount: 200, active: false },
  ],
};

test(
  'calculates balance after expenses, savings, bills and subscriptions',
  () => {
    const summary = calculateFinancialSummary(
      basicData,
      { dayNumber: 10, daysRemaining: 20 },
    );

    assert.equal(summary.totalFunds, 10500);
    assert.equal(summary.totalExpenses, 1500);
    assert.equal(summary.goalSavings, 300);
    assert.equal(summary.reserveTotal, 1000);
    assert.equal(summary.available, 7700);
    assert.equal(summary.dailyAllowance, 385);
  },
);

test(
  'financial health stays within the 0–100 range',
  () => {
    const summary = calculateFinancialSummary(
      basicData,
      { dayNumber: 10, daysRemaining: 20 },
    );

    assert.ok(
      summary.health >= 0 &&
      summary.health <= 100,
    );

    assert.ok([
      'Healthy',
      'Watch closely',
      'High risk',
      'Critical',
    ].includes(summary.risk));
  },
);

test(
  'unexpected expense preview lowers balance and forecast without mutating data',
  () => {
    const summary = calculateFinancialSummary(
      basicData,
      { dayNumber: 10, daysRemaining: 20 },
    );

    const before = JSON.stringify(basicData);

    const scenario = simulateExpenseImpact(
      summary,
      1200,
      20,
    );

    assert.equal(
      scenario.available,
      summary.available - 1200,
    );

    assert.equal(
      scenario.forecastBalance,
      summary.forecastBalance - 1200,
    );

    assert.equal(
      scenario.dailyAllowance,
      (summary.available - 1200) / 20,
    );

    assert.equal(
      JSON.stringify(basicData),
      before,
    );
  },
);

test(
  'invalid simulated amounts safely become zero',
  () => {
    const summary = calculateFinancialSummary(
      basicData,
      { dayNumber: 10, daysRemaining: 20 },
    );

    const scenario = simulateExpenseImpact(
      summary,
      Number.NaN,
      20,
    );

    assert.equal(scenario.amount, 0);
    assert.equal(
      scenario.available,
      summary.available,
    );
  },
);

test(
  'demo data uses ₹10,000 and a 30-day challenge',
  () => {
    const demo = createDemoData();

    assert.equal(STARTING_BUDGET, 10000);
    assert.equal(demo.startingBudget, 10000);
    assert.equal(demo.monthLength, 30);

    assert.match(
      demo.challengeStartDate,
      /^\d{4}-\d{2}-\d{2}$/,
    );

    assert.ok(
      demo.expenses.every(
        (expense) =>
          expense.date >= demo.challengeStartDate,
      ),
    );
  },
);
