const htmlmin = require("html-minifier");

const pluginRss = require("@11ty/eleventy-plugin-rss");


module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addPassthroughCopy("sw.js");
  eleventyConfig.addPassthroughCopy("javascript/*.*");
  eleventyConfig.addPassthroughCopy("img/*.*");
  eleventyConfig.addPassthroughCopy("slides/*.*");
  eleventyConfig.addPassthroughCopy("images/*.*");
  eleventyConfig.addPassthroughCopy("css/*.woff");
  eleventyConfig.addPassthroughCopy("css/*.woff2");

  eleventyConfig.setTemplateFormats(["md", "html", "rss", "njk"]);

  
  eleventyConfig.addTemplateFormats("css");

  const CleanCSS = require("clean-css");
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile: async (inputContent) => {
      return async () => {
        return new Promise(resolve => {
          new CleanCSS({ inline: ['remote']}).minify(inputContent, (_, data) => {
            resolve(data.styles)
          });
        });
      };
    }
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
    return [collectionApi.getFilteredByTag("post")[0]]
  });
};
