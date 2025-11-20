# Agent Guidelines

## Commands
- **Dev:** `npm start` (runs Eleventy dev server)
- **Build:** `npm run build` (generates site + minifies JS)
- **Test:** No automated tests. Verify changes manually via dev server.

## Code Style & Conventions
- **Stack:** 11ty (SSG), Nunjucks templates (`.njk`), SCSS (`src/css`), Vanilla JS.
- **Formatting:** Indent with 2 spaces. Follow existing Nunjucks/HTML nesting.
- **Naming:** Use kebab-case for files (e.g., `app-core.js`, `_project-card.njk`).
- **Assets:** JS in `assets/` (minified to `public/`), CSS in `src/css/` (compiled via plugin).
- **Imports:** Use relative paths. Partial templates go in `src/_includes/`.
- **Content:** Markdown files in `src/` or `src/blog/` for pages/posts.
