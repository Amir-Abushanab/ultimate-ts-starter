/* eslint-disable typescript/no-unsafe-assignment, typescript/no-unsafe-call, typescript/no-unsafe-member-access, typescript/no-unsafe-return, typescript/no-unsafe-argument, typescript/no-unsafe-type-assertion, typescript/strict-boolean-expressions -- content-collections path alias not resolvable by linter; this module re-exports with explicit types */
import { allPosts as rawPosts } from "content-collections";

export interface BlogPost {
  author: string;
  content: string;
  coverImage?: string;
  description: string;
  draft: boolean;
  featured: boolean;
  mdx: string;
  publishedAt: string;
  readingTime: number;
  slug: string;
  tags: string[];
  title: string;
  updatedAt?: string;
  wordCount: number;
}

export const allPosts: BlogPost[] = rawPosts as BlogPost[];

export const publishedPosts: BlogPost[] = allPosts
  .filter((p) => !p.draft)
  .toSorted((a, b) => {
    if (a.featured && !b.featured) {
      return -1;
    }
    if (!a.featured && b.featured) {
      return 1;
    }
    return (
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });

export const allTags: string[] = [
  ...new Set(publishedPosts.flatMap((p) => p.tags)),
].toSorted((a, b) => a.localeCompare(b));

export const findPost = (slug: string): BlogPost | undefined =>
  allPosts.find((p) => p.slug === slug && !p.draft);
