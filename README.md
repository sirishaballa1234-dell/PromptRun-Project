# Pocketwise — Broke But Functional: Survive the Month

A responsive, React-based finance experience for the Prompt Run 2026 challenge. It helps a user manage a ₹10,000 budget across a 30-day plan and preview the consequences of financial decisions before applying them.

## Challenge-aligned features

- **Budget and balance:** ₹10,000 starting budget, income, spending, spendable cash and daily allowance.
- **Transactions:** add/delete, search, category filter, transaction history and CSV export.
- **Savings goals:** create goals, add contributions and watch progress; savings are reflected in spendable cash.
- **Bills and commitments:** add bills, reserve unpaid commitments and record a bill as an expense when paid.
- **Subscriptions:** pause/activate recurring subscriptions and see the reservation change.
- **Unexpected-expense simulator:** model an emergency cost without changing saved data; apply it only when ready.
- **Decision Lab:** compare before/after spendable balance, daily allowance, month-end forecast, savings contribution room, financial risk and wellness score.
- **Forecast and money check-in:** rule-based risk levels, financial-health score, and a short suggested next action.
- **Persistence:** browser localStorage where permitted, with an in-app warning if browser storage is unavailable.
- **Responsive/accessibility work:** semantic navigation and forms, keyboard focus indicators, skip link, accessible chart labels, reduced-motion support and mobile breakpoints.

See [`docs/FEATURE-MAP.md`](docs/FEATURE-MAP.md) for a direct requirement-to-feature map and [`docs/QUALITY-CHECKLIST.md`](docs/QUALITY-CHECKLIST.md) for the manual validation plan.

## Technology stack

- React 18
- Vite 6
- Recharts
- Lucide React icons
- Browser localStorage
- Node's built-in test runner for the finance-domain tests

## Project structure

```text
broke-but-functional/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── docs/
│   ├── FEATURE-MAP.md
│   └── QUALITY-CHECKLIST.md
├── tests/
│   └── finance.test.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    ├── data/
    │   └── demoData.js
    ├── domain/
    │   ├── finance.js
    │   └── storage.js
    ├── hooks/
    │   └── useFinanceData.js
    └── utils/
        └── formatters.js
```

## Requirements

Install Node.js 20 LTS (Node 18.18 or newer also satisfies the Vite requirement) and VS Code. Get Node.js at <https://nodejs.org/>.

## Run in VS Code on Windows

1. Download and extract the ZIP file.
2. In VS Code, select **File → Open Folder** and open the extracted `broke-but-functional` folder—the one containing `package.json`.
3. Select **Terminal → New Terminal**.
4. Check the installations:

   ```powershell
   node -v
   npm -v
   ```

5. Install dependencies:

   ```powershell
   npm install
   ```

6. Run the development server:

   ```powershell
   npm run dev
   ```

7. Open the local URL displayed in the terminal, normally `http://localhost:5173`.
8. Keep the terminal running while testing. Press `Ctrl+C` in the terminal to stop the server.

## Test and production build

```powershell
npm test          # run four finance calculation tests
npm run build     # create a production build in dist/
npm run preview   # preview dist/ locally
npm run check     # run tests, then run the production build
```

## GitHub and Vercel deployment

1. Create a **public** GitHub repository at <https://github.com/new>.
2. Open the VS Code terminal in this project folder and run the commands below, replacing the placeholders with your repository details:

   ```powershell
   git init
   git add .
   git commit -m "Improve Pocketwise finance challenge app"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

3. Open <https://vercel.com/new>, sign in with GitHub and import that repository.
4. Use `npm run build` as the build command and `dist` as the output directory if those values are not detected automatically.
5. Deploy and test the generated public HTTPS URL. Submit the actual GitHub and deployed links to Prompt Run.

## Notes and limitations

- This is a frontend demo. It does not connect to a bank, use a backend, or sync data between devices.
- Initial transactions, goals, bills and subscriptions are demo examples.
- The month-end forecast is a simple rule-based estimate; it is not a guarantee, financial advice or a predictive model.
- The application uses system fonts to avoid a runtime dependency on a remote font service.
- `npm test` can run without installing UI dependencies; `npm run build` requires `npm install` to have completed successfully.
