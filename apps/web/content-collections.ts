import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import remarkGfm from "remark-gfm";
import { z } from "zod";

const WORDS_PER_MINUTE = 238;

const posts = defineCollection({
  directory: "content/posts",
  include: "**/*.mdx",
  name: "posts",
  schema: z.object({
    author: z.string(),
    content: z.string(),
    coverImage: z.string().optional(),
    description: z.string(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    publishedAt: z.string(),
    tags: z.array(z.string()).default([]),
    title: z.string(),
    updatedAt: z.string().optional(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      remarkPlugins: [remarkGfm],
    });

    const wordCount = document.content.split(/\s+/g).length;
    const readingTime = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
    const slug = document._meta.path;

    return {
      ...document,
      mdx,
      readingTime,
      slug,
      wordCount,
    };
  },
});

export default defineConfig({
  content: [posts],
});
