"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-css";
import { Terminal } from "lucide-react";
import { CopyButton } from "./copy-button";
import { cn } from "../../lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  language?: string;
  value: string;
}

function CodeBlock({ language, value }: CodeBlockProps) {
  const cleanLang = useMemo(() => {
    const raw = (language || "text").toLowerCase().replace(/^language-/, "").trim();
    if (raw === "js") return "javascript";
    if (raw === "ts") return "typescript";
    if (raw === "sh" || raw === "shell" || raw === "zsh") return "bash";
    if (raw === "py") return "python";
    if (raw === "yml") return "yaml";
    if (raw === "md") return "markdown";
    return raw;
  }, [language]);

  const highlightedHtml = useMemo(() => {
    try {
      const grammar =
        Prism.languages[cleanLang] ??
        Prism.languages.javascript ??
        Prism.languages.markup;

      if (!grammar) {
        return value;
      }

      return Prism.highlight(value, grammar, cleanLang);
    } catch {
      return value;
    }
  }, [cleanLang, value]);


  return (
    <div className="my-3 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-md">
      {/* Header bar with detected language badge & copy code button */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/70 px-3.5 py-1.5 text-xs select-none">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            {cleanLang}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <CopyButton
            text={value}
            size="icon-sm"
            className="h-6 w-6 text-zinc-400 hover:text-white"
          />
        </div>
      </div>

      {/* Syntax highlighted code block */}
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-zinc-200 selection:bg-zinc-800">
        <code
          className={`language-${cleanLang}`}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </pre>
    </div>
  );
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn("markdown-content leading-relaxed text-sm", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children }) {
            return <>{children}</>;
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const rawContent = String(children).replace(/\n$/, "");
            const isMultiline = rawContent.includes("\n");

            if (match || isMultiline) {
              return (
                <CodeBlock
                  language={match ? match[1] : undefined}
                  value={rawContent}
                />
              );
            }

            return (
              <code
                className="rounded-md border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 font-mono text-[12px] font-medium text-blue-300"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1({ children }) {
            return (
              <h1 className="mt-4 mb-2 text-lg font-bold text-white tracking-tight border-b border-zinc-800/80 pb-1">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="mt-3.5 mb-1.5 text-base font-bold text-white tracking-tight">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="mt-3 mb-1 text-sm font-semibold text-zinc-100">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="mt-2.5 mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                {children}
              </h4>
            );
          },
          p({ children }) {
            return (
              <p className="my-1.5 leading-relaxed text-zinc-200 last:mb-0 first:mt-0">
                {children}
              </p>
            );
          },
          ul({ children }) {
            return (
              <ul className="my-2 ml-5 list-disc space-y-1 text-zinc-200 marker:text-zinc-500">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="my-2 ml-5 list-decimal space-y-1 text-zinc-200 marker:text-zinc-500">
                {children}
              </ol>
            );
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-2.5 border-l-2 border-blue-500/60 bg-zinc-950/50 py-2 px-3.5 rounded-r-lg text-zinc-300 italic">
                {children}
              </blockquote>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors"
              >
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="my-3 overflow-x-auto rounded-lg border border-zinc-800">
                <table className="w-full text-left text-xs divide-y divide-zinc-800">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-zinc-950 text-zinc-300 font-semibold">
                {children}
              </thead>
            );
          },
          tbody({ children }) {
            return (
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40">
                {children}
              </tbody>
            );
          },
          tr({ children }) {
            return (
              <tr className="transition-colors hover:bg-zinc-800/30">
                {children}
              </tr>
            );
          },
          th({ children }) {
            return (
              <th className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                {children}
              </th>
            );
          },
          td({ children }) {
            return <td className="px-3.5 py-2 text-xs text-zinc-200">{children}</td>;
          },
          hr() {
            return <hr className="my-3 border-zinc-800" />;
          },
          strong({ children }) {
            return <strong className="font-semibold text-white">{children}</strong>;
          },
          em({ children }) {
            return <em className="italic text-zinc-200">{children}</em>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
