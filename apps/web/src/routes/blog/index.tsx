import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { allTags, publishedPosts } from "@/lib/blog";

const BlogIndex = () => {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = publishedPosts.filter((post) => {
    if (activeTag !== null && !post.tags.includes(activeTag)) {
      return false;
    }
    if (search === "") {
      return true;
    }
    const query = search.toLowerCase();
    if (post.title.toLowerCase().includes(query)) {
      return true;
    }
    return post.description.toLowerCase().includes(query);
  });

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Blog</h1>
      <p className="text-muted-foreground mb-8">
        Thoughts, guides, and updates.
      </p>

      <div className="mb-6 space-y-4">
        <input
          type="search"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          className="border-input bg-background ring-ring/20 focus-visible:ring-ring w-full rounded-lg border px-4 py-2 text-sm outline-none focus-visible:ring-2"
          aria-label="Search blog posts"
        />

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTag(null);
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200 ease ${
                activeTag === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setActiveTag(activeTag === tag ? null : tag);
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200 ease ${
                  activeTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">
          No posts found.
        </p>
      ) : (
        <div className="space-y-6">
          {filtered.map((post) => (
            <article key={post.slug} className="group">
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="block rounded-lg border p-5 transition-colors duration-200 ease hover:border-foreground/20"
              >
                <div className="mb-2 flex items-center gap-2">
                  {post.featured && (
                    <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
                      Featured
                    </span>
                  )}
                  <time
                    dateTime={post.publishedAt}
                    className="text-muted-foreground text-xs"
                  >
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <span className="text-muted-foreground text-xs">
                    &middot; {post.readingTime} min read
                  </span>
                </div>
                <h2 className="mb-1 text-xl font-semibold">{post.title}</h2>
                <p className="text-muted-foreground text-sm">
                  {post.description}
                </p>
                {post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: "Blog | Ultimate TS Starter" },
      {
        content:
          "Thoughts, guides, and updates from the Ultimate TS Starter team.",
        name: "description",
      },
      { content: "Blog | Ultimate TS Starter", property: "og:title" },
      {
        content:
          "Thoughts, guides, and updates from the Ultimate TS Starter team.",
        property: "og:description",
      },
      { content: "website", property: "og:type" },
    ],
  }),
});
