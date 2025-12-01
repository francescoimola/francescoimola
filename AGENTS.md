# Agent Guidelines

## Architecture Reference
For comprehensive architecture details including:
- Complete project structure and file organization
- Build pipeline and deployment flow
- Component architecture (Eleventy, SCSS, JavaScript modules)
- Data stores and content management
- External integrations and deployment configuration

**See ARCHITECTURE.md** in the project root.

## Commands
- **Dev:** `npm start` (runs Eleventy dev server with hot reload at http://localhost:8080)
- **Build:** `npm run build` (generates site + minifies JS to `public/`)
- **Minify JS:** `npm run minify:js` (minifies `app-core.js` via Terser)
- **Test:** No automated tests. Verify changes manually via dev server.
- **Deploy:** Push to main branch (Netlify auto-deploys)

## Code Style & Conventions
- **Stack:** 11ty (SSG), Nunjucks templates (`.njk`), SCSS (`src/css`), Vanilla JS.
- **Formatting:** Indent with 2 spaces. Follow existing Nunjucks/HTML nesting.
- **Naming:** Use kebab-case for files (e.g., `app-core.js`, `_project-card.njk`).
- **Assets:** JS in `assets/` (minified to `public/`), CSS in `src/css/` (compiled via plugin).
- **Imports:** Use relative paths. Partial templates go in `src/_includes/`.
- **Content:** Markdown files in `src/` or `src/blog/` for pages/posts.

## Key Directories
- **`src/`** - Source files processed by Eleventy (input dir)
- **`public/`** - Build output (output dir, git-ignored)
- **`src/_includes/`** - Reusable Nunjucks partials & layouts
- **`src/_data/`** - Global data files (available in all templates)
- **`src/css/`** - SCSS files (compiled automatically)
- **`assets/`** - Static assets (fonts, images, JS - copied to `public/`)

## Important Files
- **`eleventy.config.js`** - Eleventy configuration, plugins, filters, collections
- **`netlify.toml`** - Deployment config & redirect rules
- **`package.json`** - Dependencies & build scripts
- **`src/_data/site.js`** - Global site metadata (URL, name, description)

## Working with Templates
- **Layouts:** Base templates in `src/_includes/` (e.g., `_base.njk`, `_post-base.njk`)
- **Partials:** Reusable components use Nunjucks macros (e.g., `_project-card.njk`)
- **Data Cascade:** Front matter → directory data (`.11tydata.js`) → global data (`_data/`)
- **Collections:** Blog posts tagged with `blog`, accessed via `collections.blog`

## Working with Styles
- **Entry Point:** `src/css/style.scss` imports all partials
- **Partials:** `_variables.scss`, `_base.scss`, `_layout.scss`, `_components.scss`
- **Compilation:** Automatic via `@11tyrocks/eleventy-plugin-sass-lightningcss`
- **Output:** Compiled to `public/css/style.css` (minified)

## Working with JavaScript
- **Core JS:** `assets/app-core.js` loads on all pages (email copy, dynamic imports)
- **Feature Modules:** `app-carousel.js`, `app-tooltips.js` (loaded dynamically)
- **Build:** Core JS minified during `npm run build` via Terser
- **Pattern:** Use vanilla JS with progressive enhancement

## Content Guidelines
- **Blog Posts:** Create `.md` files in `src/blog/` with YAML front matter
- **Required Front Matter:** `title`, `description`, `date`, `layout: _post-base.njk`
- **Optional:** `categories` (array), `permalink` (custom URL)
- **Images:** Store in `assets/images/` or use Cloudinary URLs
- **Optimization:** Local images auto-optimized to WebP/JPEG via eleventy-img

## Common Tasks

### Add a New Blog Post
1. Create `src/blog/my-post-title.md`
2. Add front matter (title, description, date, layout)
3. Write content in Markdown
4. Run `npm start` to preview
5. Commit and push to deploy

### Add a New Page
1. Create `src/my-page.njk` (or `.md`)
2. Add front matter (title, description, layout, permalink)
3. Write content using Nunjucks/Markdown
4. Run `npm start` to preview

### Modify Styles
1. Edit relevant SCSS file in `src/css/`
2. Changes auto-compile in dev mode
3. No need to restart dev server

### Add a Component
1. Create `src/_includes/_my-component.njk`
2. Use Nunjucks macro pattern if reusable
3. Import in target template: `{% include "_my-component.njk" %}`

## Don't Touch
- **`public/`** - Auto-generated, git-ignored
- **`node_modules/`** - Managed by npm
- **`.cache/`** - Eleventy cache, rebuilds automatically

## Deployment
- **Host:** Netlify
- **Branch:** `main` triggers automatic deployment
- **Build Command:** `npm run build` (defined in `netlify.toml`)
- **Publish Directory:** `public/`
- **Domain:** https://francescoimola.com
- **Redirects:** Managed in `netlify.toml`

## Troubleshooting
- **Build fails:** Check `eleventy.config.js` for syntax errors
- **Styles not updating:** Clear `.cache/` folder and restart dev server
- **Images not optimizing:** Ensure images are in `assets/images/` or use remote URLs
- **404s after deployment:** Check `netlify.toml` redirects and permalink front matter
