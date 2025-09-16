"use client";

import React, {
  Children,
  isValidElement,
  useState,
  ComponentProps,
} from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  markdown: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
    {}
  );

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Recursively extract text content from React nodes
  const extractCodeContent = (children: React.ReactNode): string => {
    if (typeof children === "string") return children;
    if (Array.isArray(children)) {
      return children.map(extractCodeContent).join("");
    }
    if (
      React.isValidElement(children) &&
      children.props &&
      typeof children.props === "object" &&
      "children" in children.props
    ) {
      return extractCodeContent(children.props.children as React.ReactNode);
    }
    return "";
  };

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

          /** PRE (multiline code block wrapper) */
          pre: (props: ComponentProps<"pre">) => {
            const { children, ...rest } = props;
            const codeChild = Children.toArray(children).find(
              (child) => isValidElement(child) && (child as any).type === "code"
            ) as React.ReactElement | undefined;

            let language = "text";
            let fileName: string | undefined;
            const codeContent = extractCodeContent(children);
            const codeKey = `${language}-${codeContent.slice(0, 50)}`; // Unique key

            if (codeChild && codeChild.props) {
              const codeProps = codeChild.props as {
                className?: string;
                node?: { data?: { meta?: string } };
                children?: React.ReactNode;
              };
              language =
                (codeProps.className || "").replace("language-", "") || "text";
              fileName = codeProps.node?.data?.meta as string | undefined;
            }

            return (
              <div className="relative mb-4 group">
                {(language !== "text" || fileName) && (
                  <div className="flex items-center justify-between bg-muted/80 border border-border border-b-0 rounded-t-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      {fileName && (
                        <span className="text-sm font-medium text-foreground">
                          {fileName}
                        </span>
                      )}
                      {language !== "text" && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded uppercase font-mono">
                          {language}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(codeContent, codeKey)}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground bg-background/50 hover:bg-background border border-border/50 hover:border-border rounded transition-all duration-200"
                      title="Copy code"
                    >
                      {copiedStates[codeKey] ? (
                        <>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                <div className="relative">
                  <pre
                    className={`bg-muted border border-border overflow-x-auto ${
                      language !== "text" || fileName
                        ? "rounded-b-lg rounded-t-none"
                        : "rounded-lg"
                    } p-4`}
                    {...rest}
                  >
                    {children}
                  </pre>
                  {!(language !== "text" || fileName) && (
                    <button
                      onClick={() => copyToClipboard(codeContent, codeKey)}
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground bg-background/90 hover:bg-background border border-border/50 hover:border-border rounded transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="Copy code"
                    >
                      {copiedStates[codeKey] ? (
                        <>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          },

          /** CODE (inline + block content) */
          code: (props: ComponentProps<"code"> & { inline?: boolean }) => {
            const { className, children, inline, ...rest } = props;

            if (inline) {
              return (
                <code
                  {...rest}
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground border border-border/50"
                >
                  {children}
                </code>
              );
            }

            return (
              <code
                {...rest}
                className={`${className || ""} text-sm font-mono leading-relaxed text-foreground`}
              >
                {children}
              </code>
            );
          },

          a: ({ href, children }) => (
            <a
              href={href || "#"}
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
              <table className="w-full border-collapse border border-border rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border last:border-b-0">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="border-r border-border last:border-r-0 px-4 py-3 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-r border-border last:border-r-0 px-4 py-3 text-foreground">
              {children}
            </td>
          ),
          img: ({ src, alt }) => (
            <img
              src={src || ""}
              alt={alt || ""}
              className="max-w-full h-auto rounded-lg border border-border my-4 shadow-sm"
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
