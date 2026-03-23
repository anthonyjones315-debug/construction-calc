import Link from "next/link";
import type { Route } from "next";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

type ArticleMarkdownProps = {
  content: string;
};

const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="mt-8 mb-3 font-display text-2xl font-bold text-[--color-ink]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 font-display text-lg font-bold text-[--color-ink]">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-3 text-[--color-ink-mid] leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-4 list-disc space-y-2 pl-6 text-[--color-ink-mid]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 list-decimal space-y-2 pl-6 text-[--color-ink-mid]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-5 rounded-2xl border border-[--color-blue-brand]/20 bg-[--color-blue-soft]/35 px-5 py-4 text-[--color-ink-mid]">
      {children}
    </blockquote>
  ),
  a: ({ href = "", children }) => {
    const className =
      "font-medium text-[--color-blue-brand] underline decoration-[--color-blue-brand]/35 underline-offset-4 transition-colors hover:text-[--color-blue-dark]";

    if (href.startsWith("/")) {
      return (
        <Link href={href as Route} className={className}>
          {children}
        </Link>
      );
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  },
  strong: ({ children }) => (
    <strong className="font-semibold text-[--color-ink]">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-[--color-ink]">{children}</em>
  ),
  hr: () => <hr className="my-8 border-[--color-border]" />,
};

export function ArticleMarkdown({ content }: ArticleMarkdownProps) {
  return <ReactMarkdown components={markdownComponents}>{content.trim()}</ReactMarkdown>;
}
