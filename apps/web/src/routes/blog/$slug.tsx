import { MDXContent } from "@content-collections/mdx/react";
import { createFileRoute } from "@tanstack/react-router";

import { mdxComponents } from "@/components/blog/mdx-components";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { findPost } from "@/lib/blog";

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const BlogPost = () => {
  const { slug } = Route.useParams();
  const post = findPost(slug);

  if (post === undefined) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="mb-2 text-2xl font-bold">Post not found</h1>
        <p className="text-muted-foreground">
          The post you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  const publishedDate = formatDate(post.publishedAt);
  const updatedDate =
    post.updatedAt === undefined ? null : formatDate(post.updatedAt);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    author: { "@type": "Person", name: post.author },
    dateModified: post.updatedAt ?? post.publishedAt,
    datePublished: post.publishedAt,
    description: post.description,
    headline: post.title,
    keywords: post.tags.join(", "),
    wordCount: post.wordCount,
  };

  return (
    <>
      <ReadingProgress />
      <article className="container mx-auto max-w-3xl px-4 py-8">
        <header className="mb-8">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">{post.title}</h1>
          <p className="text-muted-foreground mb-4 text-lg">
            {post.description}
          </p>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span>{post.author}</span>
            <span>&middot;</span>
            <time dateTime={post.publishedAt}>{publishedDate}</time>
            {updatedDate !== null && (
              <>
                <span>&middot;</span>
                <span>Updated {updatedDate}</span>
              </>
            )}
            <span>&middot;</span>
            <span>{post.readingTime} min read</span>
          </div>
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose-custom">
          <MDXContent code={post.mdx} components={mdxComponents} />
        </div>

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </article>
    </>
  );
};

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
  head: ({ params }) => {
    const post = findPost(params.slug);
    if (post === undefined) {
      return { meta: [{ title: "Post Not Found | Ultimate TS Starter" }] };
    }
    return {
      meta: [
        { title: `${post.title} | Ultimate TS Starter` },
        { content: post.description, name: "description" },
        { content: post.title, property: "og:title" },
        { content: post.description, property: "og:description" },
        { content: "article", property: "og:type" },
        { content: post.publishedAt, property: "article:published_time" },
        ...(post.updatedAt === undefined
          ? []
          : [{ content: post.updatedAt, property: "article:modified_time" }]),
        ...post.tags.map((tag) => ({ content: tag, property: "article:tag" })),
        { content: post.author, name: "author" },
      ],
    };
  },
});
