---
title: "Writing a Plugin for Vite: Introduction to I18NMerge"
description: "Writing a Plugin for Vite: Introduction to I18NMerge"
keywords: "vite, plugin, tool"
pubDate: "05/30/2024"
---

In the world of modern web development, **Vite** has become an essential tool for building fast and efficient front-end applications. Developers appreciate Vite for its simplicity, speed, and powerful features that make development easier. One of its most interesting features is the ability to create custom plugins to extend its capabilities. Today, we’ll explore how to create a Vite plugin to manage translation files using a concrete example: **I18NMerge**.

When building a multilingual application, it’s common to have separate translation files for each language. Managing and merging these files can quickly become tedious, especially when translations are spread across multiple modules or components. That’s where the **I18NMerge plugin** comes in, automating the merging of translation files.

Let’s dive into the code of the I18NMerge plugin. This plugin searches, merges, and serves translation files for your application.

A Vite plugin is essentially a function that returns an object with specific hooks. Here’s how our plugin begins:

```typescript
import { defineConfig, type Plugin } from 'vite';
import { glob } from 'glob';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';

const I18NMerge = (): Plugin = {
// Utility functions here...
return {
  name: 'i18n-merge',
  // Plugin hooks here...
  };
};
```

We use the **glob** library to search for all JSON translation files in the project. The `getFiles` function returns the list of files for a given language:

```typescript
const getFiles = (lang: string) => {
  return glob(`**/locales/${lang}.json`, {
    ignore: ["node_modules/**"],
  });
};
```

The `computeTranslationsFiles` function reads and merges translation files for a given language:

```typescript
const computeTranslationsFiles = async (lang: string): Promise<any> => {
  const files = await getFiles(lang);

  return files.reduce((acc: Record<string, any>, file: string) => {
    const content = JSON.parse(readFileSync(`${file}`).toString());
    return {
      ...acc,
      ...content,
    };
  }, {});
};
```

The plugin must handle two contexts: **build** and **development server**.

- **Build**: merge and write translation files to the output directory.
- **Server**: serve translation files dynamically during development.

```typescript
import { defineConfig, type Plugin } from "vite";
import { glob } from "glob";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

const I18NMerge = (): Plugin => {
  return {
    name: "i18n-merge",
    configResolved(config) {
      outDir = config.build.outDir;
      isBuild = config.mode !== "development";
    },
    async buildEnd() {
      if (!isBuild) {
        return;
      }
      const localesOutDir = join(__dirname, outDir, "locales");
      if (existsSync(localesOutDir)) {
        rmSync(localesOutDir, { recursive: true });
      }

      const allFiles = await getFiles("*");
      const result: Record<string, any> = {};
      allFiles.forEach((file) => {
        const content = JSON.parse(readFileSync(`${file}`).toString());
        result[getLangFromFilePath(file)] = {
          ...(result[getLangFromFilePath(file)] ?? {}),
          ...content,
        };
      });

      try {
        mkdirSync(localesOutDir);
        Object.entries(result).forEach(([lang, dictionary]) => {
          const file = join(localesOutDir, `${lang}.json`);
          writeFileSync(file, JSON.stringify(dictionary, null, 2));
        });
      } catch (e) {
        console.error(e);
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (
          req.originalUrl.includes("locales/") &&
          req.originalUrl.endsWith(".json")
        ) {
          const lang = getLangFromFilePath(req.originalUrl);

          if (!translations[lang]) {
            translations[lang] = await computeTranslationsFiles(lang);
          }
          return res
            .setHeader("Content-Type", "application/json")
            .end(JSON.stringify(translations[lang]));
        }
        next();
      });
    },
  };
};
```

To use the I18NMerge plugin, simply add it to the plugin list in your Vite configuration file:

```typescript
export default defineConfig({
  // Other configurations...
  plugins: [
    I18NMerge(),
    // Other plugins...
  ],
  // Other configurations...
});
```

---

Creating a plugin for Vite might seem intimidating at first, but with a methodical approach and a clear understanding of the needs, it becomes very achievable. The **I18NMerge plugin** demonstrates how you can automate translation file management in a multilingual application, making the development process smoother and more efficient.

Feel free to experiment and adapt this plugin to your own needs. The Vite plugin ecosystem is vast and full of possibilities to enhance your development workflows.
