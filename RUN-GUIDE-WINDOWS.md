# Run Pocketwise on Windows (VS Code)

## 1. Install prerequisites

- Install Node.js LTS from <https://nodejs.org/>.
- Install VS Code from <https://code.visualstudio.com/>.
- Restart VS Code after installing Node.js.

In VS Code, open **Terminal → New Terminal** and confirm these commands display version numbers:

```powershell
node -v
npm -v
```

## 2. Extract and open the project

1. Extract `broke-but-functional-updated.zip` with **Right-click → Extract All**.
2. Open VS Code and choose **File → Open Folder**.
3. Select the extracted `broke-but-functional` folder—the folder containing `package.json`.
4. Choose **Terminal → New Terminal**. Make sure the terminal's current folder is the project folder.

## 3. Install dependencies and run

Run each command separately and wait for it to finish:

```powershell
npm install
```

Then:

```powershell
npm run dev
```

Open the local address printed by Vite (usually `http://localhost:5173`) in Chrome. Keep the terminal open while you use the app.

## 4. Test the finance logic and production build

Stop the development server with **Ctrl+C** first if needed, then run:

```powershell
npm test
npm run build
```

`npm test` should report 5 passing finance-domain tests. `npm run build` should create a `dist` folder. If either command reports an error, resolve it before deploying.

To preview the production version locally:

```powershell
npm run preview
```

## 5. Deploy the updated code

If you already connected this repository to GitHub and Vercel, replace the local project files with these updated files, then use:

```powershell
git add .
git commit -m "Improve budget simulator and quality checks"
git push
```

Vercel normally starts a new deployment after the push. Open the Vercel deployment link and verify the actual public website.

If the project is not connected yet:

1. Create a public GitHub repository at <https://github.com/new>.
2. Push this project using the repository URL provided by GitHub.
3. Import that repository at <https://vercel.com/new>.
4. Set the build command to `npm run build` and output directory to `dist` if Vercel does not detect them.
5. Deploy and copy the public `https://...vercel.app` URL into the hackathon **Deployed Live Link** field.

## Troubleshooting

- **`node` or `npm` is not recognized:** install Node.js LTS and restart VS Code.
- **`npm install` fails:** check your internet connection, then retry from the folder containing `package.json`.
- **`npm run dev` says missing script:** you are probably in the wrong directory; run `dir` and confirm `package.json` is present.
- **Vercel shows an old version:** confirm the new code was committed and pushed to the same GitHub branch Vercel deploys; check the latest deployment logs.
- **Data does not remain after refresh:** browser privacy settings may block localStorage. The app displays a message when saving is unavailable.
