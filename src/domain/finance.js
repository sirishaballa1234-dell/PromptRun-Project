export function calculateRisk({
  forecastBalance,
  dailyAllowance,
  daysRemaining,
}) {
  if (forecastBalance < 0) {
    return { risk: 'Critical', riskTone: 'bad' };
  }

  if (forecastBalance < 1000) {
    return { risk: 'High risk', riskTone: 'bad' };
  }

  if (
    forecastBalance < 2500 ||
    (daysRemaining > 0 && dailyAllowance < 100)
  ) {
    return { risk: 'Watch closely', riskTone: 'warning' };
  }

  return { risk: 'Healthy', riskTone: 'good' };
}

export function calculateHealthScore({
  forecastBalance,
  totalFunds,
  available,
  reserveTotal,
}) {
  const score =
    100 * (forecastBalance / Math.max(totalFunds, 1)) +
    (available >= 0 ? 16 : 0) -
    Math.max(
      0,
      (reserveTotal / Math.max(totalFunds, 1)) * 10,
    );

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateFinancialSummary(
  data,
  { dayNumber, daysRemaining },
) {
  const totalIncome = data.incomes.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  const totalExpenses = data.expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  const goalSavings = data.goals.reduce(
    (sum, goal) => sum + Number(goal.saved || 0),
    0,
  );

  const unpaidCommitments = data.commitments
    .filter((item) => !item.paid)
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

  const activeSubscriptions = data.subscriptions
    .filter((item) => item.active)
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

  const totalFunds = Number(data.startingBudget || 0) + totalIncome;
  const cashBalance = totalFunds - totalExpenses - goalSavings;
  const reserveTotal = unpaidCommitments + activeSubscriptions;
  const available = cashBalance - reserveTotal;

  const elapsedDays = Math.max(
    1,
    Math.min(30, Number(dayNumber) || 1),
  );

  const remainingDays = Math.max(
    0,
    Number(daysRemaining) || 0,
  );

  const averageDailySpend = totalExpenses / elapsedDays;
  const projectedVariableSpend =
    averageDailySpend * remainingDays;

  const forecastBalance =
    available - projectedVariableSpend;

  const dailyAllowance =
    remainingDays > 0
      ? Math.max(0, available / remainingDays)
      : Math.max(0, available);

  const { risk, riskTone } = calculateRisk({
    forecastBalance,
    dailyAllowance,
    daysRemaining: remainingDays,
  });

  const health = calculateHealthScore({
    forecastBalance,
    totalFunds,
    available,
    reserveTotal,
  });

  return {
    totalIncome,
    totalExpenses,
    goalSavings,
    unpaidCommitments,
    activeSubscriptions,
    totalFunds,
    cashBalance,
    reserveTotal,
    available,
    averageDailySpend,
    projectedVariableSpend,
    forecastBalance,
    dailyAllowance,
    risk,
    riskTone,
    health,
  };
}

export function simulateExpenseImpact(
  summary,
  amount,
  daysRemaining,
) {
  const safeAmount = Number.isFinite(Number(amount))
    ? Math.max(0, Number(amount))
    : 0;

  const available = summary.available - safeAmount;
  const forecastBalance =
    summary.forecastBalance - safeAmount;

  const dailyAllowance =
    daysRemaining > 0
      ? Math.max(0, available / daysRemaining)
      : Math.max(0, available);

  const { risk, riskTone } = calculateRisk({
    forecastBalance,
    dailyAllowance,
    daysRemaining,
  });

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
    contributionRoomChange:
      Math.max(0, summary.available) -
      Math.max(0, available),
  };
}
