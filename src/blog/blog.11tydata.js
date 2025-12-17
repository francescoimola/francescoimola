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
      // If a custom permalink is already set in frontmatter, use it
      if (typeof data.permalink === 'string') {
        return data.permalink;
      }
      // Otherwise, generate a clean URL from the title
      if (data.title) {
        const slug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        return `/blog/${slug}/`;
      }
      return data.permalink;
    }
  }
};
