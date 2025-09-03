"use client";

import { useState, useCallback, useMemo } from "react";
import { Copy, Check, Download, Eye, EyeOff } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import dynamic from "next/dynamic";

// Lazy load syntax highlighter only when needed
const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  {
    ssr: false,
    loading: () => (
      <pre className="p-4 bg-gray-900 rounded text-gray-300 text-sm font-mono whitespace-pre-wrap overflow-auto">
        Loading syntax highlighter...
      </pre>
    ),
  }
);

interface OptimizedCodeBlockProps {
  code: string;
  language: string;
  title?: string;
  fileName?: string;
  snippetId?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
}

export default function OptimizedCodeBlock({
  code,
  language,
  title,
  fileName,
  snippetId,
  showLineNumbers = true,
  maxHeight = "400px",
  className = "",
}: OptimizedCodeBlockProps) {
  const { copyToClipboard, copied } = useCopyToClipboard();
  const [showHighlighter, setShowHighlighter] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(code, {
      snippetId,
      customMessage: `${language} code copied! 🎉`,
    });
  }, [copyToClipboard, code, snippetId, language]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || `snippet.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, fileName, language]);

  const formattedLanguageName = useMemo(() => 
    language.charAt(0).toUpperCase() + language.slice(1)
  , [language]);

  const codeStats = useMemo(() => ({
    lines: code.split("\n").length,
    characters: code.length,
    words: code.split(/\s+/).filter(word => word.length > 0).length,
  }), [code]);

  const getFileExtension = (languageName: string): string => {
    const extensions: Record<string, string> = {
      javascript: "js", typescript: "ts", python: "py", java: "java",
      cpp: "cpp", c: "c", csharp: "cs", php: "php", ruby: "rb",
      go: "go", rust: "rs", swift: "swift", kotlin: "kt", dart: "dart",
      html: "html", css: "css", scss: "scss", json: "json", yaml: "yml",
      xml: "xml", sql: "sql", shell: "sh", bash: "sh",
    };
    return extensions[languageName.toLowerCase()] || "txt";
  };

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-lightGreen/50 transition-colors ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div>
            {title && <h3 className="text-sm font-medium text-white">{title}</h3>}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="px-2 py-1 bg-lightGreen/20 text-lightGreen rounded">
                {formattedLanguageName}
              </span>
              {fileName && <span>• {fileName}</span>}
              <span>• {codeStats.lines} lines</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHighlighter(!showHighlighter)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded"
            title={showHighlighter ? "Show plain text" : "Show syntax highlighting"}
          >
            {showHighlighter ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? "−" : "+"}
          </button>

          <button
            onClick={handleDownload}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            className={`p-2 transition-colors rounded ${
              copied ? "text-lightGreen bg-lightGreen/10" : "text-gray-400 hover:text-white"
            }`}
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div 
        className="relative"
        style={{
          maxHeight: isExpanded ? "none" : maxHeight,
          overflow: isExpanded ? "visible" : "auto",
        }}
      >
        {showHighlighter ? (
          <SyntaxHighlighter
            language={language.toLowerCase()}
            showLineNumbers={showLineNumbers}
            wrapLines
            customStyle={{
              margin: 0,
              padding: "1rem",
              background: "transparent",
              fontSize: "14px",
            }}
          >
            {code}
          </SyntaxHighlighter>
        ) : (
          <pre className="p-4 text-gray-300 text-sm font-mono whitespace-pre-wrap overflow-auto">
            {code}
          </pre>
        )}

        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-2 bg-gray-800 text-xs text-gray-400 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>{codeStats.characters.toLocaleString()} characters</span>
            <span>{codeStats.words.toLocaleString()} words</span>
            <span>{codeStats.lines} lines</span>
          </div>
          {copied && (
            <span className="text-lightGreen animate-pulse">
              ✓ Copied!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
