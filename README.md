# Analytics Dashboard (React)

This is a Vite + React scaffold for the JarrettFord dashboard migration.

Reference spec: `dashboard/dashboard_spec.md` in the original workspace.
Design reference: https://sayaniw.github.io/ai-dashboard/index.html

Quick start

1. cd analytics-dashboard
2. npm install
3. npm run dev

Project structure

- src/
  - components/ (reusable UI pieces)
  - pages/ (route components)
  - context/ (AuthContext)
  - constants/ (api endpoints)
  - styles/ (global css)

Notes

- This scaffold includes Tailwind + Vite. Run `npm install` to fetch dependencies.
- The API tokens in the spec are not embedded here; `src/constants/api.js` has placeholders copied from the spec for development use.
