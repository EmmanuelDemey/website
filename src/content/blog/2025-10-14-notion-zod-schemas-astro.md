---
title: "Generate Your Zod Schemas from Notion for Astro, No Magic"
description: "Create a strict Zod schema from Notion for Astro. Typing, validation, and automated integration with @duocrafters/notion-database-zod."
keywords: "notion, zod, astro, typescript, validation, content-collections"
pubDate: "10/14/2025"
canonical: "https://www.vaduoconsulting.com/blog/articles/gnrez-vos-schmas-zod-depuis-notion-pour-astro-sans-magie/"
---

For developers working with **Astro** and **Notion**, integrating content from a Notion database into an Astro site often means sacrificing type safety. While Astro's Content Collections provide excellent validation for markdown files through Zod schemas, remote data sources typically lack these protective guardrails.

The **@duocrafters/notion-database-zod** library bridges this gap by automatically generating strict Zod schemas directly from your Notion database structure, restoring type safety and validation to your build pipeline.

### The Problem: Type Safety with Remote Data

Astro's Content Collections work beautifully with Zod schemas when dealing with local markdown content. However, when you start pulling data from external sources like Notion, you lose the crucial type safety that catches errors during development and builds.

Without proper validation, structural changes in your Notion database can silently break your application. A renamed field, a changed property type, or a removed column might not surface until runtime—or worse, in production.

### The Solution: Schema Generation from Notion

The **@duocrafters/notion-database-zod** library takes a different approach: instead of manually maintaining schemas, it interrogates your Notion database and automatically infers a strict Zod schema that matches your database structure.

This approach provides several benefits:

- **Automatic type inference** via `z.infer<typeof PageSchema>`
- **Build-time validation** that fails fast when structures change
- **Enriched error messages** propagated from Notion field descriptions
- **Zero manual schema maintenance**

### How It Works

The library provides a `generateDatabaseSchema(database_id, options)` function that:

1. Instantiates a Notion Client
2. Retrieves your database definition
3. Maps each Notion property to the corresponding Zod sub-schema
4. Returns a `ZodObject` reflecting your live database structure

The generated schema includes both:

- A base page schema covering standard Notion metadata
- Custom property schemas for your specific database fields

### Installation and Setup

First, install the required dependencies:

```bash
npm i @duocrafters/notion-database-zod zod @notionhq/client
```

Then use it in your Astro project:

```typescript
import { Client } from "@notionhq/client";
import { generateDatabaseSchema } from "@duocrafters/notion-database-zod";

// Initialize the Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Generate the schema for your database
const PageSchema = await generateDatabaseSchema("your-database-id", {
  client: notion,
});

// Fetch pages from your database
const response = await notion.databases.query({
  database_id: "your-database-id",
});

// Validate each page against the generated schema
const validatedPages = response.results
  .map((page) => {
    const result = PageSchema.safeParse(page);
    if (!result.success) {
      console.error("Validation failed:", result.error);
      return null;
    }
    return result.data;
  })
  .filter(Boolean);

// Now you have fully typed, validated data
type Page = z.infer<typeof PageSchema>;
```

### Key Features

#### Automatic Type Safety

Once you generate the schema, TypeScript automatically infers the correct types for your Notion data:

```typescript
type Page = z.infer<typeof PageSchema>;

// TypeScript knows exactly what fields are available
const title = page.properties.Title.title;
const status = page.properties.Status.status;
```

#### Fail-Fast Validation

If your Notion database structure changes—a field is renamed, a type is modified, or a required property is removed—the validation will fail immediately during your next build. This intentional "fail-fast" approach ensures you're always aware of structural mismatches.

#### Rich Error Messages

Field descriptions from your Notion database are propagated into the Zod schema, providing helpful context when validation fails.

#### Integration with Astro Content Collections

While you can use the library standalone, it's designed to integrate seamlessly with Astro's Content Collections. This allows you to treat Notion content with the same level of type safety as your local markdown files.

### Current Limitations and Future Plans

The library currently focuses on commonly-used Notion property types. More advanced Rich Text variants and specialized property types are planned for future releases.

The development roadmap includes an **Astro-specific Notion loader** that will handle:

- Schema generation
- Page fetching
- Automatic validation
- Direct Content Collections integration

This loader will make it even easier to use Notion as a content source for Astro sites with zero configuration.

### Conclusion

The **@duocrafters/notion-database-zod** library solves a real problem for developers building Astro sites with Notion as a content source. By automatically generating Zod schemas from your Notion database structure, it restores the type safety and validation that make Astro's Content Collections so powerful.

No more manual schema maintenance. No more silent runtime failures. Just strong typing, clear validation errors, and the confidence that your Notion content matches your application's expectations.

Try it out in your next Astro project and experience the peace of mind that comes with proper type safety—even for remote data sources.

---

**Authors:** Emmanuel Demey, Florian Etrillard
**Library:** [@duocrafters/notion-database-zod](https://www.npmjs.com/package/@duocrafters/notion-database-zod)
