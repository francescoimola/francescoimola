const site = require('./site.js');

module.exports = {
  title: "Blog",
  description: "Tutorials, articles and reflections on what good, simple design and marketing can do for you",
  url: `${site.url}/blog`,
  feedUrl: `${site.url}/blog/feed.xml`,
  author: {
    name: site.name,
    email: "hi@francescoimola.com"
  }
};
