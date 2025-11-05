const pkg = require('../../package.json');

module.exports = {
  url: pkg.url,
  name: pkg.name,
  description: pkg.description,
  image: `${pkg.url}/assets/favicon/android-chrome-512x512.png`, // Logo for schema markup
};