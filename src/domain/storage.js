import { createDemoData } from '../data/demoData.js';

export const STORAGE_KEY = 'pocketwise-finance-v2';
const LEGACY_STORAGE_KEY = 'pocketwise-finance-v1';

export function readInitialData() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem(LEGACY_STORAGE_KEY);

    if (!raw) return createDemoData();

    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      !Array.isArray(parsed.expenses) ||
      !Array.isArray(parsed.goals)
    ) {
      return createDemoData();
    }

    for (const field of [
      'incomes',
      'commitments',
      'subscriptions',
    ]) {
      if (
        parsed[field] !== undefined &&
        !Array.isArray(parsed[field])
      ) {
        return createDemoData();
      }
    }

    return {
      ...createDemoData(),
      ...parsed,
    };
  } catch {
    return createDemoData();
  }
}

export function saveFinanceData(data) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data),
    );
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
    // The app remains usable if browser storage is blocked.
  }
}
