import { defineCollection, z } from "astro:content";

const events = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    type: z.string(),
    image: z.string(),
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
    pubDate: z.coerce.date(),
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
  }),
});

export const collections = { blog, trainings, events };
