const htmlmin = require("html-minifier");
const CleanCSS = require("clean-css");
const cacheBuster = require("@mightyplow/eleventy-plugin-cache-buster");

module.exports = function (eleventyConfig) {
  const cacheBusterOptions = {};
  eleventyConfig.addPlugin(cacheBuster(cacheBusterOptions));

  eleventyConfig.setTemplateFormats([
    "njk",
    "png",
    "css", // css is not yet a recognized template extension in Eleventy
  ]);

  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
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
};
