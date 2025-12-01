const fs = require('fs');
const path = require('path');

console.log('Adding eleventy:ignore to remote images in templates...\n');

// Recursively find template files
function findFiles(dir, extensions, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findFiles(fullPath, extensions, results);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

// Find only Nunjucks and HTML template files (not markdown - handled automatically)
const files = findFiles('src', ['.njk', '.html']);

let totalChanges = 0;
let filesModified = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  // Pattern to match img tags with remote URLs (http/https) that don't already have eleventy:ignore
  content = content.replace(
    /<img\s+([^>]*?)>/gi,
    (match, attrs) => {
      // Check if this image has a remote src
      const srcMatch = attrs.match(/src=["'](https?:\/\/[^"']+)["']/i);
      if (!srcMatch) {
        return match; // No remote src, skip
      }

      // Check if already has eleventy:ignore
      if (match.includes('eleventy:ignore')) {
        return match; // Already has the attribute
      }

      // Add eleventy:ignore before the closing >
      totalChanges++;
      return `<img ${attrs} eleventy:ignore>`;
    }
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ Updated: ${file}`);
    filesModified++;
  }
});

console.log(`\n✓ Done! Added eleventy:ignore to ${totalChanges} remote image(s) in ${filesModified} file(s).`);
console.log('\nNOTE: Markdown files (.md) are handled automatically - no changes needed!');
