// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: "github-light",
    },
  },
  site: "https://emmanueldemey.dev/",
  integrations: [mdx(), sitemap()],
});
