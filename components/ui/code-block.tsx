"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import Prism from "prismjs";
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";

interface CodeBlockProps {
  children: string;
  language?: string;
  fileName?: string;
  className?: string;
}

export function CodeBlock({
  children,
  language = "text",
  fileName,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [children, language]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      className={cn(
        "relative group rounded-xl bg-zinc-900 border border-zinc-700",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-zinc-700">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <FileCode className="h-4 w-4" />
          <span>{fileName || "code"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 capitalize">{language}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
            className="h-7 w-7 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <pre className="line-numbers bg-transparent p-4 !pl-12 text-sm overflow-x-auto">
        <code ref={codeRef} className={`language-${language}`}>
          {children}
        </code>
      </pre>
    </div>
  );
} 