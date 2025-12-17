module.exports = {
  layout: "_base.njk",
  tags: "blog",
  eleventyComputed: {
    eleventyExcludeFromCollections: function(data) {
      // If draft is true and we're in production, exclude from collections
      if (data.draft && process.env.NODE_ENV === 'production') {
        return true;
      }
      return data.eleventyExcludeFromCollections || false;
    },
    permalink: function(data) {
      // If draft is true and we're in production, don't generate a page
      if (data.draft && process.env.NODE_ENV === 'production') {
        return false;
      }
      // If a permalink is explicitly set in frontmatter, use it
      if (typeof data.permalink === 'function' || typeof data.permalink === 'string') {
        return data.permalink;
      }
      // Use the file slug (slugified filename) for the URL
      // This keeps URLs stable and based on filename, not title
      if (data.page && data.page.fileSlug) {
        const slug = data.page.fileSlug
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        return `/blog/${slug}/`;
      }
      return undefined;
    }
  }
};
