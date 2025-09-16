"use client";

import React, { Children, isValidElement } from "react";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "../ui/code-block";

interface MarkdownRendererProps {
  markdown: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none mb-12 [&>*]:mb-4 [&>*:last-child]:mb-0">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-foreground border-b border-border pb-2 mb-6">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2 mb-5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold text-foreground mb-3">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-semibold text-foreground mb-3">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-semibold text-foreground mb-3">
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <p className="text-foreground leading-relaxed mb-4">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-foreground mb-4 space-y-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-foreground mb-4 space-y-2">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="text-foreground">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary bg-muted/50 pl-4 py-2 mb-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          pre: (props) => {
            const { node, children, ...rest } = props;
            const codeChild = Children.toArray(children).find(
              (child) =>
                isValidElement(child) && (child as any).type === "code"
            ) as React.ReactElement | undefined;

            if (codeChild && codeChild.props && typeof codeChild.props === "object") {
              const props = codeChild.props as {
                className?: string;
                node?: { data?: { meta?: string } };
                children?: React.ReactNode;
              };
              const language =
                (props.className || "").replace("language-", "") || "text";
              const fileName = props.node?.data?.meta as string | undefined;
              const codeString = props.children;
              return (
                <CodeBlock
                  language={language}
                  fileName={fileName}
                  className="mb-4"
                >
                  {String(codeString).replace(/\n$/, "")}
                </CodeBlock>
              );
            }

            return (
              <pre
                className="bg-muted border border-border rounded-lg p-4 overflow-x-auto mb-4"
                {...rest}
              >
                {children}
              </pre>
            );
          },
          code: (props) => {
            const { className, children, ...rest } = props;
            const inline = (props as any).inline;
            if (inline) {
              return (
                <code
                  {...rest}
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
                >
                  {children}
                </code>
              );
            }
            return <code {...rest} className={className}>{children}</code>;
          },
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">{children}</em>
          ),
          hr: () => <hr className="border-border my-8" />,
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2 text-foreground">
              {children}
            </td>
          ),
          img: ({ src, alt }) => (
            <img
              src={src || ""}
              alt={alt || ""}
              className="max-w-full h-auto rounded-lg border border-border my-4"
            />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
