---
title: "Load Your Notion Databases Directly into Astro with @duocrafters/notion-database-astro"
description: "Seamlessly integrate Notion databases into Astro Content Collections with automatic validation, type safety, and zero boilerplate using @duocrafters/notion-database-astro."
keywords: "notion, astro, content-collections, loader, typescript, zod, cms, integration"
pubDate: "10/20/2025"
---

Last week, we introduced [`@duocrafters/notion-database-zod`](https://www.npmjs.com/package/@duocrafters/notion-database-zod), a library that **transforms a Notion database schema into a strict Zod schema**.

This week, we're taking the next step: **directly connecting a Notion database to Astro's _Content Collections_**, without writing any glue code.

This is precisely the goal of [`@duocrafters/notion-database-astro`](https://www.npmjs.com/package/@duocrafters/notion-database-astro): a ready-to-use integration that combines Notion, Zod, and Astro.

### The Initial Problem

In Astro, _Content Collections_ provide valuable typing and validation... but only if the source is **local** (Markdown/MDX).

As soon as you want to connect a remote source (in this case, Notion), you fall back into discomfort: no structural guarantees, no clear messages if the Notion schema changes.

`@duocrafters/notion-database-zod` laid the first foundation: **generating a strict Zod schema** directly from Notion.

The second building block, `@duocrafters/notion-database-astro`, builds on top of it to connect this schema to Astro **without boilerplate**.

### The API: `notionLoader`

The library exposes a single entry point:

```tsx
import { notionLoader } from "@duocrafters/notion-database-astro";
```

It's a **loader compatible with Astro's `defineCollection`**.

It takes Notion configuration as parameters (auth, `databaseId`, optional `databaseQuery`), and in return, Astro knows how to load, validate, and expose your pages just like any Markdown collection.

### Concrete Example

```tsx
import { defineCollection } from "astro:content";
import { NOTION_BLOG_POSTS_DATABASE, NOTION_TOKEN } from "astro:env/server";
import { notionLoader } from "@duocrafters/notion-database-astro";
import blogs from "../blog.json";

export const blogPosts = defineCollection({
  loader: notionLoader({
    auth: NOTION_TOKEN,
    databaseId: NOTION_BLOG_POSTS_DATABASE,
    databaseQuery: {
      filter: {
        property: "Date de publication",
        date: {
          is_not_empty: true,
        },
      },
    },
    filter: (page) => {
      return blogs.includes(
        (
          (page.properties.Article as unknown as { title: string })
            .title[0] as unknown as { plain_text: string }
        ).plain_text?.trim(),
      );
    },
  }),
});
```

What happens:

1. **Connection to Notion** via the server token.
2. **Zod schema generation** from the database (`generateDatabaseSchema` from the first library).
3. **Targeted database query** (here: only entries that have a "Date de publication").
4. **Custom project-side filtering** (here: only keep articles listed in a `blog.json` file).
5. Result: An Astro _Content Collection_ named `blogPosts`, with automatic validation and strong typing.

### Content Rendering

Just like with a Markdown collection, you can **render the HTML of a Notion post** via the `render` method.

```tsx
const post = await getEntry("blogPosts", "my-post-id");
const { Content } = await render(post);
```

Then simply use `<Content />` in your Astro components: the Notion content is injected like regular Markdown, while maintaining the strict validation provided by Zod.

### Advantages

- **Zero boilerplate**: no need to manually manipulate the Notion `Client` or map the schema.
- **Integrated validation**: if someone changes the Notion schema, Astro fails at build time with a clear message.
- **Native Astro interop**: the loader is compatible with the _Content Collections_ ecosystem, exactly as if your content came from Markdown frontmatter.
- **Extensible**: you can pass a complete Notion `databaseQuery` and a custom JavaScript `filter`.

### TypeScript Typing

Since the library relies on `zod`, you can infer the type of Notion pages exactly like you would for Markdown:

```tsx
import { z } from "zod";
import { blogPosts } from "../content/config";

type BlogPost = z.infer<(typeof blogPosts)["schema"]>;
```

Astro then guarantees that your components manipulate a `BlogPost` conforming to the Notion schema.

### How It Works Under the Hood

The `notionLoader` performs several key operations during the Astro build process:

1. **Schema Generation**: Automatically generates a Zod schema by introspecting your Notion database structure using `@duocrafters/notion-database-zod`.

2. **Data Fetching**: Queries your Notion database using the official `@notionhq/client`, respecting any filters or queries you've specified.

3. **Validation**: Each page retrieved from Notion is validated against the generated Zod schema, ensuring type safety and catching structural mismatches early.

4. **Content Transformation**: Notion's block-based content is transformed into a format compatible with Astro's rendering pipeline, allowing you to use the familiar `<Content />` component.

5. **Caching**: The loader intelligently caches schema and content data to minimize API calls during development.

### Advanced Configuration

#### Custom Filters

You can apply JavaScript-based filters to further refine which Notion pages are included:

```tsx
export const blogPosts = defineCollection({
  loader: notionLoader({
    auth: NOTION_TOKEN,
    databaseId: NOTION_BLOG_POSTS_DATABASE,
    filter: (page) => {
      // Only include published posts
      const status = page.properties.Status;
      return status?.select?.name === "Published";
    },
  }),
});
```

#### Database Queries

Use Notion's powerful query API to filter, sort, and limit results:

```tsx
export const blogPosts = defineCollection({
  loader: notionLoader({
    auth: NOTION_TOKEN,
    databaseId: NOTION_BLOG_POSTS_DATABASE,
    databaseQuery: {
      filter: {
        and: [
          {
            property: "Status",
            select: {
              equals: "Published",
            },
          },
          {
            property: "Date",
            date: {
              on_or_before: new Date().toISOString(),
            },
          },
        ],
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    },
  }),
});
```

#### Multiple Collections

You can easily define multiple Notion-backed collections in the same Astro project:

```tsx
export const blogPosts = defineCollection({
  loader: notionLoader({
    auth: NOTION_TOKEN,
    databaseId: NOTION_BLOG_DATABASE,
  }),
});

export const projects = defineCollection({
  loader: notionLoader({
    auth: NOTION_TOKEN,
    databaseId: NOTION_PROJECTS_DATABASE,
  }),
});

export const testimonials = defineCollection({
  loader: notionLoader({
    auth: NOTION_TOKEN,
    databaseId: NOTION_TESTIMONIALS_DATABASE,
  }),
});
```

### Real-World Use Cases

#### Marketing Website with Non-Technical Editors

Your marketing team can update blog posts, case studies, and landing pages directly in Notion, using a familiar interface. Developers maintain type safety and validation without manual schema updates.

#### Multi-Language Content

Leverage Notion's database properties to manage translations:

```tsx
export const blogEN = defineCollection({
  loader: notionLoader({
    auth: NOTION_TOKEN,
    databaseId: NOTION_BLOG_DATABASE,
    databaseQuery: {
      filter: {
        property: "Language",
        select: { equals: "English" },
      },
    },
  }),
});

export const blogFR = defineCollection({
  loader: notionLoader({
    auth: NOTION_TOKEN,
    databaseId: NOTION_BLOG_DATABASE,
    databaseQuery: {
      filter: {
        property: "Language",
        select: { equals: "French" },
      },
    },
  }),
});
```

#### Documentation Sites

Create a documentation site where content creators can edit in Notion while developers benefit from static site performance:

```tsx
export const docs = defineCollection({
  loader: notionLoader({
    auth: NOTION_TOKEN,
    databaseId: NOTION_DOCS_DATABASE,
    databaseQuery: {
      sorts: [
        {
          property: "Order",
          direction: "ascending",
        },
      ],
    },
  }),
});
```

### Performance Considerations

#### Build-Time Data Fetching

All Notion content is fetched at **build time**, resulting in a completely static site with no runtime API calls. This provides:

- Fast page loads
- No runtime API quota concerns
- CDN-friendly static assets
- Offline-capable sites

### Incremental Builds

For large Notion databases, consider using Astro's experimental `--experimental-content-layer` flag to enable incremental builds, fetching only changed pages.

#### Development Experience

During development, the loader caches Notion data to avoid hitting rate limits. You can manually refresh by restarting the dev server or using Astro's refresh mechanism.

### Migration from Markdown

Migrating from local Markdown to Notion is straightforward:

**Before (Markdown):**

```tsx
export const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
  }),
});
```

**After (Notion):**

```tsx
export const blog = defineCollection({
  loader: notionLoader({
    auth: NOTION_TOKEN,
    databaseId: NOTION_BLOG_DATABASE,
  }),
});
```

The schema is automatically inferred from Notion, and your existing page queries work unchanged:

```tsx
const posts = await getCollection("blog");
```

### Error Handling

The loader provides clear error messages when issues occur:

- **Schema Mismatches**: If your Notion database structure changes, you'll get specific validation errors pointing to the problematic properties.
- **Missing Properties**: Required fields are validated, and you'll know immediately if data is missing.
- **Connection Issues**: Clear messages if Notion API is unreachable or authentication fails.

Example validation error:

```
Error: Validation failed for page "My Blog Post"
  Property "Status" is required but missing
  Property "Date" expected type "date" but received "undefined"
```

### Comparison with Other Solutions

#### vs. Manual Notion Client

**Manual approach:**

- Write custom fetching logic
- Manually map Notion types to your schema
- Write validation code
- Handle pagination
- Transform Notion blocks to HTML

**With @duocrafters/notion-database-astro:**

- Single `notionLoader` configuration
- Automatic schema generation
- Built-in validation
- Automatic pagination
- Automatic content rendering

#### vs. Other Notion CMSs

Many Notion CMS solutions add runtime overhead or require custom hosting. This loader:

- Generates fully static sites
- No runtime JavaScript for content fetching
- Works with any static hosting (Vercel, Netlify, Cloudflare Pages)
- No vendor lock-in

### Getting Started

Install the package:

```bash
npm install @duocrafters/notion-database-astro
```

Add your Notion credentials to `.env`:

```
NOTION_TOKEN=secret_xxxxx
NOTION_BLOG_DATABASE=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Configure your content collection:

```tsx
// src/content/config.ts
import { defineCollection } from "astro:content";
import { notionLoader } from "@duocrafters/notion-database-astro";

export const blog = defineCollection({
  loader: notionLoader({
    auth: import.meta.env.NOTION_TOKEN,
    databaseId: import.meta.env.NOTION_BLOG_DATABASE,
  }),
});

export const collections = { blog };
```

Use it in your pages:

```astro
---
import { getCollection } from "astro:content";

const posts = await getCollection("blog");
---

<ul>
  {
    posts.map((post) => (
      <li>
        <a href={`/blog/${post.id}`}>{post.data.title}</a>
      </li>
    ))
  }
</ul>
```

### Summary

👉 In summary: `@duocrafters/notion-database-astro` makes Notion a **first-class citizen of Astro Content Collections**, with validation, typing, and `<Content />` rendering identical to Markdown... without sacrificing the flexibility of a remote database.

This integration brings together the best of both worlds:

- **Content creators** get Notion's familiar, powerful interface
- **Developers** get type safety, validation, and static site performance
- **Everyone** benefits from automatic synchronization and zero manual schema maintenance

The library represents a complete solution for teams wanting to use Notion as a CMS while maintaining the developer experience and performance characteristics that make Astro such a compelling framework.

Try it today and experience the power of Notion-backed Content Collections!

---

**Package:** [@duocrafters/notion-database-astro](https://www.npmjs.com/package/@duocrafters/notion-database-astro)
**Companion Library:** [@duocrafters/notion-database-zod](https://www.npmjs.com/package/@duocrafters/notion-database-zod)
**Authors:** Emmanuel Demey, Florian Etrillard
**License:** MIT
