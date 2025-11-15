const eleventySass = require("@11tyrocks/eleventy-plugin-sass-lightningcss");
const pluginDate = require("eleventy-plugin-date");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItAttrs = require("markdown-it-attrs");
const Image = require("@11ty/eleventy-img");
const { promisify } = require('util');
const { readFile } = require('fs');
const { imageSize } = require('image-size');
const { JSDOM } = require('jsdom');


module.exports = function (eleventyConfig) {
  if (eleventyConfig === null || eleventyConfig === undefined) {
    throw new Error("Eleventy configuration is null or undefined.");
  }

  try {
    let markdownItOptions = {
    html: true
    }
    eleventyConfig.setLibrary("md", markdownIt(markdownItOptions).use(markdownItAnchor).use(markdownItAttrs))
    eleventyConfig.addPlugin(eleventySass);
    eleventyConfig.addPlugin(pluginDate);
    eleventyConfig.addPlugin(pluginRss);

    // Blog categories collection - extracts all unique categories from blog posts
    eleventyConfig.addCollection("blogCategories", function(collectionApi) {
      let categories = new Set();
      let posts = collectionApi.getFilteredByTag('blog');
      posts.forEach(p => {
        if (p.data.categories) {
          p.data.categories.forEach(c => categories.add(c));
        }
      });
      return Array.from(categories).sort();
    });

    // Passthrough copy for static assets
    eleventyConfig.addPassthroughCopy("fonts");
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("src/robots.txt");

    // Add split filter for Nunjucks
    eleventyConfig.addFilter("split", function(str, separator) {
      return str.split(separator);
    });

    // Add limit filter for Nunjucks
    eleventyConfig.addFilter("limit", function(array, limit) {
      return array.slice(0, limit);
    });

    // Filter blog posts by category
    eleventyConfig.addFilter("filterByCategory", function(posts, cat) {
      if (!cat) return posts;
      cat = cat.toLowerCase();
      return posts.filter(p => {
        if (!p.data.categories) return false;
        let cats = p.data.categories.map(s => s.toLowerCase());
        return cats.includes(cat);
      });
    });

    // Slugify filter for URL-safe strings
    eleventyConfig.addFilter("slugify", function(str) {
      return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    });

    // Check if image source is a remote URL
    eleventyConfig.addFilter("isRemoteUrl", function(src) {
      return src && (src.startsWith('http://') || src.startsWith('https://'));
    });

    // Check if local image file exists
    const fs = require('fs');
    const path = require('path');
    eleventyConfig.addFilter("localImageExists", function(imageName, ext) {
      const webpPath = path.join('./assets/images', `${imageName}.webp`);
      const fallbackPath = path.join('./assets/images', `${imageName}.${ext}`);
      return fs.existsSync(webpPath) || fs.existsSync(fallbackPath);
    });

    // Excerpt shortcode
    eleventyConfig.addShortcode('teaser', post => extractExcerpt(post));

    // Image optimization shortcode
    eleventyConfig.addNunjucksAsyncShortcode("image", async function(src, alt, sizes = "100vw") {
      try {
        let metadata = await Image(src, {
          widths: [400, 800, 1200],
          formats: ["webp", "jpeg"],
          outputDir: "./public/img/",
          urlPath: "/img/",
          cacheOptions: {
            duration: "1d",
            directory: ".cache",
            removeUrlQueryParams: false,
          },
          sharpWebpOptions: {
            quality: 80,
          },
          sharpJpegOptions: {
            quality: 80,
          }
        });

        let imageAttributes = {
          alt,
          sizes,
          loading: "lazy",
          decoding: "async",
        };

        return Image.generateHTML(metadata, imageAttributes);
      } catch (error) {
        console.error(`Error processing image ${src}:`, error);
        // Fallback to regular img tag
        return `<img src="${src}" alt="${alt}" loading="lazy">`;
      }
    });

    // Playground project image handler
    eleventyConfig.addNunjucksAsyncShortcode("playgroundImage", async function(src, alt) {
      const fs = require('fs');
      const path = require('path');

      const isRemote = src && (src.startsWith('http://') || src.startsWith('https://'));
      const imageName = src.split('/').pop().split('.').slice(0, -1).join('.');
      const imageExt = src.split('.').pop().toLowerCase();
      const fallbackFormat = imageExt === 'png' ? 'png' : 'jpeg';

      // Check if image exists locally in assets/images
      const webpPath = path.join('./assets/images', `${imageName}.webp`);
      const fallbackPath = path.join('./assets/images', `${imageName}.${fallbackFormat}`);
      const localExists = fs.existsSync(webpPath) || fs.existsSync(fallbackPath);

      // If remote and doesn't exist locally, process it with the image shortcode
      if (isRemote && !localExists) {
        try {
          let metadata = await Image(src, {
            widths: [400, 800, 1200],
            formats: ["webp", "jpeg"],
            outputDir: "./public/img/",
            urlPath: "/img/",
            cacheOptions: {
              duration: "1d",
              directory: ".cache",
              removeUrlQueryParams: false,
            },
            sharpWebpOptions: {
              quality: 80,
            },
            sharpJpegOptions: {
              quality: 80,
            }
          });

          let imageAttributes = {
            alt,
            sizes: "100vw",
            loading: "lazy",
            decoding: "async",
          };

          return Image.generateHTML(metadata, imageAttributes);
        } catch (error) {
          console.error(`Error processing remote image ${src}:`, error);
          // Fallback to regular img tag
          return `<img src="${src}" alt="${alt}" loading="lazy">`;
        }
      } else {
        // Use existing local images
        return `<picture>
          <source type="image/webp" srcset="/assets/images/${imageName}.webp">
          <img src="/assets/images/${imageName}.${fallbackFormat}" alt="${alt}" loading="lazy" decoding="async">
        </picture>`;
      }
    });

    // Add image dimensions transform
    eleventyConfig.addTransform("img-dimensions", async function (content, outputPath) {
      if (!outputPath || !outputPath.endsWith(".html")) return content;

      const dom = new JSDOM(content);
      const imgs = dom.window.document.querySelectorAll(
        "img[src]:not([width]):not([height])"
      );

      if (imgs.length === 0) return content;

      for (const img of imgs) {
        try {
          let src = img.getAttribute("src");

          // Skip remote images - only process local images
          if (src.startsWith("http://") || src.startsWith("https://")) continue;

          let imgPath = src.replace(/^\//, "");
          let filePath = `./public/${imgPath}`;
          let buffer = await promisify(readFile)(filePath);
          let dimensions = imageSize(buffer);

          if (dimensions.width && dimensions.height) {
            img.setAttribute("width", dimensions.width);
            img.setAttribute("height", dimensions.height);
          }
        } catch (e) {
          console.log(`Error processing image ${img.getAttribute("src")}: ${e.message}`);
        }
      }

      return dom.serialize();
    });

    return {
      dir: {
        input: "src",
        output: "public",
      },
    };
  } catch (error) {
    console.error("Error configuring Eleventy:", error);
    throw error;
  }
};
