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
      return data.permalink;
    }
  }
};
