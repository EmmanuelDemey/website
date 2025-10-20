import { defineCollection, z } from "astro:content";

const events = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    type: z.string(),
    image: z.string().optional(),
    fullPage: z.boolean().optional(),
    spotify: z.string().optional(),
    youtube: z.string().optional(),
    date: z.coerce.date(),
  }),
});

const blog = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.string(),
    pubDate: z.coerce.date(),
    canonical: z.string().url().optional(),
  }),
});

const trainings = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    image: z.string(),
    company: z.string(),
    companyUrl: z.string(),
    description: z.string(),
    keywords: z.string(),
    complementary: z.array(z.string()).optional(),
  }),
});

export const collections = { blog, trainings, events };
