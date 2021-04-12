const htmlmin = require("html-minifier");
const CleanCSS = require("clean-css");
const cacheBuster = require("@mightyplow/eleventy-plugin-cache-buster");

const pluginRss = require("@11ty/eleventy-plugin-rss");


module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);

  const cacheBusterOptions = {};
  eleventyConfig.addPlugin(cacheBuster(cacheBusterOptions));

  eleventyConfig.setTemplateFormats([
    "png",
    "md",
    "html",
    "rss",
    "njk",
    "svg",
    "woff",
    "woff2",
  ]);

  eleventyConfig.addPassthroughCopy("css/*.*");
  eleventyConfig.addPassthroughCopy("javascript/*.*");
  eleventyConfig.addPassthroughCopy("sw.js");

  eleventyConfig.addTransform("cssmin",function (content, outputPath) {
    console.log("lo", outputPath)
    if (outputPath.indexOf(".css") > 0) {
      return new CleanCSS({}).minify(content).styles;
    }
    return content;
  });

  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    if (outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }

    return content;
  });

  eleventyConfig.addLiquidShortcode("year", function() {
    return new Date().getFullYear();
  });

  eleventyConfig.addCollection("last", function(collectionApi) {
    console.log(collectionApi.getFilteredByTag("post"))
    return [collectionApi.getFilteredByTag("post")[0]]
  });
};
