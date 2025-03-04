// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";
import { satoriPlugin } from "./src/plugins/satori";

export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: "github-light",
    },
  },
  site: "https://emmanueldemey.dev/",
  integrations: [mdx(), sitemap(), satoriPlugin()],
});
