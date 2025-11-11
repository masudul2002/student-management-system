# student-management-system

Simple **Student Management System** built with vanilla HTML, CSS and JavaScript.

## Features
- Add / Edit / Delete students
- Search, filter by class, sort by name/roll
- Import / Export CSV
- Data saved in `localStorage` (no backend)
- Responsive layout

## How to use
1. Clone this repo or download the files.
2. Open `index.html` in your browser.
3. Use Add Student button to start adding students.
4. Export CSV to download data, or Import CSV (with headers) to add many students.

## Files
- `index.html` — main UI
- `styles.css` — styles
- `app.js` — app logic
- `README.md` — this file
- `.gitignore` — recommended ignores
- `LICENSE` — MIT license

## License
MIT


## Continuous Integration (GitHub Actions)

A simple GitHub Actions workflow is included at `.github/workflows/ci.yml` that runs on `push` and `pull_request` to:

- Check JavaScript syntax using `node --check`.
- Validate HTML files using `html-validate` (via `npx`).
- Run an optional basic accessibility check using `pa11y` (via `npx`).

To enable CI: push this repo to GitHub (to `main` or `master`) — the workflow will run automatically.
