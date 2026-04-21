import { cn } from "@ultimate-ts-starter/ui/lib/utils";
import { Image } from "@unpic/react";
import type { ComponentPropsWithoutRef } from "react";

const INFO_VARIANTS = {
  error: {
    container: "border-red-500/30 bg-red-500/5 dark:bg-red-500/10",
    icon: "x",
    title: "text-red-700 dark:text-red-400",
  },
  info: {
    container: "border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10",
    icon: "i",
    title: "text-blue-700 dark:text-blue-400",
  },
  success: {
    container: "border-green-500/30 bg-green-500/5 dark:bg-green-500/10",
    icon: "\u2713",
    title: "text-green-700 dark:text-green-400",
  },
  warning: {
    container: "border-yellow-500/30 bg-yellow-500/5 dark:bg-yellow-500/10",
    icon: "!",
    title: "text-yellow-700 dark:text-yellow-400",
  },
} as const;

type CalloutVariant = keyof typeof INFO_VARIANTS;

export const Callout = ({
  variant = "info",
  title,
  children,
}: {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
}) => {
  const styles = INFO_VARIANTS[variant];
  return (
    <div
      className={cn("my-6 rounded-lg border p-4", styles.container)}
      role="note"
    >
      {title !== undefined && title !== "" && (
        <p className={cn("mb-1 font-semibold", styles.title)}>
          <span className="me-2 inline-flex size-5 items-center justify-center rounded-full border text-xs font-bold">
            {styles.icon}
          </span>
          {title}
        </p>
      )}
      <div className="text-sm [&>p]:m-0">{children}</div>
    </div>
  );
};

export const Step = ({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="relative my-6 ps-10">
    <span className="bg-primary text-primary-foreground absolute start-0 top-0 flex size-7 items-center justify-center rounded-full text-sm font-bold">
      {number}
    </span>
    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
    <div className="text-muted-foreground text-sm">{children}</div>
  </div>
);

const MdxTable = (props: ComponentPropsWithoutRef<"table">) => (
  <div className="my-6 overflow-x-auto rounded-lg border">
    <table className="w-full text-sm" {...props} />
  </div>
);

const MdxThead = (props: ComponentPropsWithoutRef<"thead">) => (
  <thead className="bg-muted/50 border-b" {...props} />
);

const MdxTh = (props: ComponentPropsWithoutRef<"th">) => (
  <th
    className="px-4 py-2 text-start text-xs font-semibold uppercase tracking-wider"
    {...props}
  />
);

const MdxTd = (props: ComponentPropsWithoutRef<"td">) => (
  <td className="px-4 py-2" {...props} />
);

const MdxTr = (props: ComponentPropsWithoutRef<"tr">) => (
  <tr className="border-b last:border-b-0" {...props} />
);

/** All custom components available inside MDX files */
export const mdxComponents = {
  Callout,
  Step,
  a: ({ children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a
      className="text-primary underline underline-offset-4 hover:opacity-80"
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="border-primary/40 text-muted-foreground my-6 border-s-4 ps-4 italic"
      {...props}
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="bg-muted rounded px-1.5 py-0.5 text-sm before:content-none after:content-none"
      {...props}
    />
  ),
  h1: ({ children, ...props }: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="mt-10 mb-4 text-3xl font-bold" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mt-8 mb-3 text-2xl font-semibold" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-6 mb-2 text-xl font-semibold" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: ComponentPropsWithoutRef<"h4">) => (
    <h4 className="mt-4 mb-2 text-lg font-medium" {...props}>
      {children}
    </h4>
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-8 border-border" {...props} />
  ),
  img: ({ src, alt, ...props }: ComponentPropsWithoutRef<"img">) => (
    <Image
      src={src ?? ""}
      alt={alt ?? ""}
      layout="fullWidth"
      className="my-6 rounded-lg"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-relaxed" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-4 list-decimal space-y-1 ps-6" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="my-4 leading-relaxed" {...props} />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="bg-muted my-6 overflow-x-auto rounded-lg p-4 text-sm"
      {...props}
    />
  ),
  table: MdxTable,
  td: MdxTd,
  th: MdxTh,
  thead: MdxThead,
  tr: MdxTr,
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-4 list-disc space-y-1 ps-6" {...props} />
  ),
};
