import { localISO, offsetDate } from '../utils/formatters.js';

export const STARTING_BUDGET = 10000;

export function createDemoData() {
  const now = new Date();

  const dateAt = (daysAgo) =>
    localISO(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysAgo,
        12,
        0,
        0,
      ),
    );

  const challengeStartDate = dateAt(8);

  return {
    startingBudget: STARTING_BUDGET,
    monthLength: 30,
    challengeStartDate,

    expenses: [
      {
        id: 'e1',
        title: 'Weekly groceries',
        amount: 680,
        category: 'Food',
        date: dateAt(8),
        note: 'Essentials',
      },
      {
        id: 'e2',
        title: 'Metro & auto',
        amount: 240,
        category: 'Transport',
        date: dateAt(7),
        note: '',
      },
      {
        id: 'e3',
        title: 'Coffee with friends',
        amount: 185,
        category: 'Food',
        date: dateAt(6),
        note: '',
      },
      {
        id: 'e4',
        title: 'Phone recharge',
        amount: 299,
        category: 'Bills',
        date: dateAt(5),
        note: '',
      },
      {
        id: 'e5',
        title: 'Notebook & pens',
        amount: 165,
        category: 'Learning',
        date: dateAt(4),
        note: 'College',
      },
      {
        id: 'e6',
        title: 'Lunch',
        amount: 210,
        category: 'Food',
        date: dateAt(3),
        note: '',
      },
      {
        id: 'e7',
        title: 'Movie night',
        amount: 420,
        category: 'Lifestyle',
        date: dateAt(2),
        note: '',
      },
      {
        id: 'e8',
        title: 'Bus pass top-up',
        amount: 350,
        category: 'Transport',
        date: dateAt(1),
        note: '',
      },
    ],

    incomes: [],

    goals: [
      {
        id: 'g1',
        name: 'Emergency buffer',
        target: 3000,
        saved: 650,
        emoji: '🛟',
        color: '#c2f970',
      },
      {
        id: 'g2',
        name: 'New headphones',
        target: 2500,
        saved: 350,
        emoji: '🎧',
        color: '#a99aff',
      },
      {
        id: 'g3',
        name: 'Weekend plans',
        target: 1200,
        saved: 0,
        emoji: '🌴',
        color: '#ffb38a',
      },
    ],

    commitments: [
      {
        id: 'c1',
        title: 'College fee instalment',
        amount: 900,
        dueDate: offsetDate(3),
        category: 'Education',
        paid: false,
      },
      {
        id: 'c2',
        title: 'Mobile recharge',
        amount: 299,
        dueDate: offsetDate(5),
        category: 'Utilities',
        paid: false,
      },
      {
        id: 'c3',
        title: 'Electricity share',
        amount: 450,
        dueDate: offsetDate(7),
        category: 'Utilities',
        paid: false,
      },
    ],

    subscriptions: [
      {
        id: 's1',
        name: 'Spotify Student',
        amount: 59,
        renewalDate: offsetDate(2),
        active: true,
        icon: '♫',
      },
      {
        id: 's2',
        name: 'Cloud storage',
        amount: 89,
        renewalDate: offsetDate(6),
        active: true,
        icon: '☁',
      },
      {
        id: 's3',
        name: 'Streaming app',
        amount: 149,
        renewalDate: offsetDate(10),
        active: false,
        icon: '▶',
      },
    ],
  };
}
