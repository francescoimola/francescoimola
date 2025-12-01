# Architecture Overview
This document serves as a critical, living template designed to equip agents with a rapid and comprehensive understanding of the codebase's architecture, enabling efficient navigation and effective contribution from day one. Update this document as the codebase evolves.

## 1. Project Structure
This section provides a high-level overview of the project's directory and file structure, categorized by architectural layer or major functional area. It is essential for quickly navigating the codebase, locating relevant files, and understanding the overall organization and separation of concerns.

```
atlantic-pet/                  # Portfolio website for Francesco Imola
├── src/                       # Source files processed by Eleventy
│   ├── _data/                 # Global data files (JSON/JS)
│   │   ├── site.js            # Site metadata (URL, name, description)
│   │   └── blog.js            # Blog-specific metadata and RSS config
│   ├── _includes/             # Reusable Nunjucks templates and partials
│   │   ├── _icons/            # SVG icon components
│   │   ├── _base.njk          # Base HTML layout template
│   │   ├── _head.njk          # HTML head with meta tags
│   │   ├── _header.njk        # Site header/navigation
│   │   ├── _footer.njk        # Site footer
│   │   ├── _post-base.njk     # Blog post layout
│   │   └── [various].njk      # Component partials (cards, CTAs, etc.)
│   ├── css/                   # SCSS stylesheets (compiled by plugin)
│   │   ├── style.scss         # Main stylesheet entry point
│   │   ├── _variables.scss    # Design tokens (colors, spacing, etc.)
│   │   ├── _base.scss         # Base styles, typography, resets
│   │   ├── _layout.scss       # Layout utilities and grid systems
│   │   ├── _components.scss   # Component-specific styles
│   │   └── css.json           # Eleventy data file for CSS processing
│   ├── blog/                  # Blog posts and blog page templates
│   │   ├── *.md               # Individual blog posts in Markdown
│   │   ├── blog.njk           # Blog listing page template
│   │   ├── blog.11tydata.js   # Directory-specific data cascade
│   │   ├── category-pages.njk # Category archive pages
│   │   └── feed.njk           # RSS/Atom feed template
│   ├── playground/            # Portfolio/experimental projects
│   │   ├── *.md               # Project case studies
│   │   └── playground.njk     # Playground listing page
│   ├── index.njk              # Homepage
│   ├── portfolio.njk          # Portfolio showcase page
│   ├── services.njk           # Services page
│   ├── contact.njk            # Contact page
│   ├── consultations.njk      # Consultations booking page
│   ├── web-design.njk         # Web design service page
│   ├── how-i-work.njk         # Process/methodology page
│   ├── colophon.md            # Site credits and technologies
│   ├── faqs.md                # Frequently asked questions
│   ├── thank-you.njk          # Form submission thank you page
│   ├── 404.njk                # Custom 404 error page
│   ├── sitemap.njk            # XML sitemap template
│   ├── robots.njk             # Robots.txt template
│   └── robots.txt             # Static robots.txt
├── assets/                    # Client-side JavaScript (copied to public/)
│   ├── app-core.js            # Universal JS: email copy, dynamic imports
│   ├── app-carousel.js        # Testimonial carousel functionality
│   ├── app-tooltips.js        # Tooltip interactions
│   ├── fonts/                 # Web fonts (Ronzino family)
│   ├── favicon/               # Favicon variants and manifest
│   └── images/                # Project images and photography
├── public/                    # Build output (generated, not in git)
│   ├── assets/                # Minified JS, fonts, images
│   ├── css/                   # Compiled CSS
│   └── [pages]/               # Generated HTML pages
├── eleventy.config.js         # Eleventy configuration and plugins
├── netlify.toml               # Netlify deployment and redirect rules
├── package.json               # Node dependencies and build scripts
├── AGENTS.md                  # Agent guidelines for AI assistants
└── ARCHITECTURE.md            # This document
```

## 2. High-Level System Diagram
This is a static site generator (SSG) architecture with no backend services. The build process transforms templates and content into static HTML, CSS, and JavaScript files.

```
[Content Authors] --> [Markdown/Nunjucks Files]
                              |
                              v
                      [Eleventy Build Process]
                       (eleventy.config.js)
                              |
        +---------------------+---------------------+
        |                     |                     |
        v                     v                     v
[SCSS Compilation]    [Markdown Rendering]   [Image Optimization]
(LightningCSS)        (markdown-it)          (eleventy-img)
        |                     |                     |
        +---------------------+---------------------+
                              |
                              v
                        [Static HTML/CSS/JS]
                          (public/ dir)
                              |
                              v
                    [Netlify CDN Deployment]
                              |
                              v
                          [End Users]
```

## 3. Core Components

### 3.1. Static Site Generator (Eleventy)

**Name:** Eleventy (11ty)

**Description:** Core build system that transforms Nunjucks templates, Markdown content, and data files into static HTML pages. Handles template inheritance, data cascading, collections, filters, and shortcodes.

**Technologies:** Node.js, Eleventy 3.1.2, Nunjucks templating, Markdown (markdown-it + markdown-it-attrs)

**Build Command:** `npm start` (dev server) or `npm run build` (production build)

**Key Features:**
- Data cascade system (directory data files, front matter)
- Collections API (blog posts, categories)
- Custom filters (readableDate, slugify, urlencode, filterByCategory)
- Image optimization plugin (eleventy-img)
- RSS feed generation

### 3.2. Styling System

**Name:** SCSS with LightningCSS

**Description:** Modular SCSS architecture compiled via `@11tyrocks/eleventy-plugin-sass-lightningcss`. Uses modern CSS features with automatic vendor prefixing and minification.

**Technologies:** SCSS, LightningCSS (PostCSS alternative), CSS custom properties

**Structure:**
- `_variables.scss`: Design tokens (colors, spacing, typography scales)
- `_base.scss`: Reset, typography, global base styles
- `_layout.scss`: Layout utilities, grid systems, responsive breakpoints
- `_components.scss`: Component-specific styles (cards, buttons, carousels)

**Compilation:** Automatic during Eleventy build process

### 3.3. Client-Side JavaScript

**Name:** Vanilla JavaScript Modules

**Description:** Progressive enhancement approach with dynamic imports for feature-specific code. Core functionality loads on all pages; advanced features (carousel, tooltips) load conditionally.

**Technologies:** ES6+ JavaScript, dynamic imports, no frameworks

**Modules:**
- `app-core.js`: Universal features (email copy-to-clipboard, feature detection)
- `app-carousel.js`: Testimonial carousel with keyboard navigation and accessibility
- `app-tooltips.js`: Tooltip interactions

**Build Process:** `app-core.js` minified via Terser during production build

**Loading Strategy:**
- Core JS loads synchronously on all pages
- Feature modules load dynamically when DOM elements detected (e.g., `.testimonial-carousel`)

## 4. Data Stores

### 4.1. Flat File Content

**Type:** Markdown files with YAML front matter

**Purpose:** Blog posts, portfolio projects, and static page content

**Location:** 
- Blog posts: `src/blog/*.md`
- Playground projects: `src/playground/*.md`
- Static pages: `src/*.md`, `src/*.njk`

**Key Fields:**
- `title`: Page/post title
- `description`: Meta description for SEO
- `layout`: Template to use
- `date`: Publication date
- `categories`: Taxonomy for blog posts
- `permalink`: Custom URL structure

### 4.2. Global Data Files

**Type:** JavaScript/JSON modules

**Purpose:** Site-wide configuration and metadata

**Files:**
- `src/_data/site.js`: Site URL, name, description, logo
- `src/_data/blog.js`: Blog metadata, RSS feed config

**Access:** Available in all templates via `{{ site.name }}`, `{{ blog.title }}`, etc.

### 4.3. Static Assets

**Type:** Images, fonts, icons (file system)

**Purpose:** Visual assets for portfolio and content

**Location:**
- Images: `assets/images/` (optimized to `public/assets/images/optimised/`)
- Fonts: `assets/fonts/` (Ronzino typeface family)
- Icons: `src/_includes/_icons/` (inline SVGs)
- Favicon: `assets/favicon/`

**Processing:** Images optimized via eleventy-img plugin (WebP + JPEG fallback)

## 5. External Integrations / APIs

**Cal.com:** Appointment booking for consultations  
**Purpose:** "Book an intro call" functionality  
**Integration Method:** Direct link to hosted booking page

**Cloudinary:** Image CDN and optimization  
**Purpose:** Profile photos and large images  
**Integration Method:** Direct image URLs in templates

**RSS Feed:** Self-hosted XML feed  
**Purpose:** Blog syndication  
**Integration Method:** Generated at `/blog/feed.xml` via `@11ty/eleventy-plugin-rss`

## 6. Deployment & Infrastructure

**Hosting Provider:** Netlify

**Build Command:** `npm run build`

**Publish Directory:** `public/`

**Build Process:**
1. Eleventy compiles templates and content
2. SCSS compiled to CSS via LightningCSS
3. JavaScript minified via Terser
4. Images optimized to WebP/JPEG
5. Static files copied to `public/`

**CI/CD Pipeline:** Netlify automatic deployments on git push

**Domain Management:** 
- Primary domain: `francescoimola.com`
- Previous domain: `nevernotready.club` (redirects configured in `netlify.toml`)

**Redirects:** Managed in `netlify.toml`:
- Domain normalization (www → non-www)
- Legacy domain redirects
- Internal URL restructuring

**Performance Optimizations:**
- CSS minification via LightningCSS
- JS minification via Terser
- Image optimization (WebP, lazy loading)
- View transitions API for smooth navigation

**Monitoring & Analytics:** Not configured in codebase (likely client-side tracking if implemented)

## 7. Security Considerations

**Authentication:** None (static site, no user accounts)

**Authorization:** None (publicly accessible content)

**Data Encryption:** HTTPS enforced via Netlify (TLS 1.2+)

**Content Security:**
- No user-generated content
- No form processing on-site (Cal.com handles bookings)
- Email obfuscation via JavaScript (prevents scraping)

**Build Security:**
- Dependencies managed via npm
- No sensitive environment variables in codebase
- Netlify build isolation

**Key Security Practices:**
- Regular dependency updates
- No inline JavaScript in templates
- External links use `rel="noopener noreferrer"`
- robots.txt controls crawler access

## 8. Development & Testing Environment

**Local Setup Instructions:**
1. Clone repository: `git clone [repo-url]`
2. Install dependencies: `npm install`
3. Start dev server: `npm start` (runs Eleventy with hot reload)
4. Build for production: `npm run build`

**Development Server:** Eleventy built-in dev server (`--serve` flag)  
**Port:** Default (likely 8080)  
**Hot Reload:** Enabled via Eleventy watch mode

**Testing Strategy:**
- No automated tests configured
- Manual verification via dev server
- Visual regression testing (manual)
- Cross-browser testing (manual)

**Code Quality Tools:**
- **Linting:** Not configured
- **Formatting:** Not configured
- **Type Checking:** None (vanilla JavaScript)

**Browser Support:** Defined in `package.json` `browserslist`:
- `>0.14%` market share
- Not dead browsers

**Recommended Testing:**
1. Start dev server (`npm start`)
2. Verify page rendering
3. Test interactive features (carousel, tooltips, email copy)
4. Check responsive layouts
5. Validate HTML/CSS

## 9. Future Considerations / Roadmap

**Known Technical Debt:**
- No automated testing suite
- No code linting/formatting configuration
- Manual cross-browser testing

**Potential Enhancements:**
- Implement search functionality for blog
- Add dark mode theme
- Progressive Web App (PWA) features
- Content preview for drafts
- Automated accessibility testing
- Performance monitoring integration

**Architecture Considerations:**
- Consider moving to Eleventy serverless for dynamic features
- Evaluate headless CMS integration for non-technical content updates
- Implement automated visual regression testing

## 10. Project Identification

**Project Name:** Francesco Imola Portfolio & Blog (atlantic-pet repo)

**Live URL:** https://francescoimola.com

**Repository URL:** https://github.com/[username]/atlantic-pet

**Primary Contact:** Francesco Imola (hi@francescoimola.com)

**Project Type:** Portfolio website + blog for web designer & creative marketer

**Tech Stack Summary:** Eleventy, Nunjucks, SCSS, Vanilla JavaScript, Netlify

**Date of Last Update:** 2025-12-01

## 11. Glossary / Acronyms

**11ty / Eleventy:** Static site generator used to build the site

**SSG:** Static Site Generator - builds HTML files at build time rather than on request

**Nunjucks:** Templating language for HTML (`.njk` files)

**SCSS:** Sassy CSS - CSS preprocessor with variables and nesting

**LightningCSS:** Modern CSS compiler (alternative to PostCSS)

**Passthrough Copy:** Files copied directly to output without processing

**Data Cascade:** Eleventy's system for merging data from multiple sources

**Collection:** Grouped content in Eleventy (e.g., all blog posts)

**Filter:** Template function to transform data (e.g., format dates)

**Shortcode:** Reusable template snippet callable from Markdown/templates

**Front Matter:** YAML metadata at the top of Markdown files

**CDN:** Content Delivery Network (Netlify, Cloudinary)

**Terser:** JavaScript minification tool

**View Transitions:** Native browser API for smooth page transitions

**WebP:** Modern image format with better compression than JPEG
