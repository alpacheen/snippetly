"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Copy,
  Check,
  Download,
  Eye,
  EyeOff,
  Maximize2,
  RotateCcw,
  Code,
  Heart,
  Share2,
  Play,
  Zap,
  Sparkles,
  Terminal,
  FileText,
  Loader2,
} from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { explainCode } from "@/lib/ai";

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 bg-gray-800 rounded flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-lightGreen" />
        <span className="ml-2 text-gray-300">
          Loading syntax highlighter...
        </span>
      </div>
    ),
  }
);

interface EnhancedCodeBlockProps {
  code: string;
  language: string;
  title?: string;
  fileName?: string;
  snippetId?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
  showToolbar?: boolean;
  isInteractive?: boolean;
}

export default function EnhancedCodeBlock({
  code,
  language,
  title,
  fileName,
  snippetId,
  showLineNumbers = true,
  maxHeight = "500px",
  className = "",
  showToolbar = true,
  isInteractive = true,
}: EnhancedCodeBlockProps) {
  const { copyToClipboard, copied, copyCount } = useCopyToClipboard();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const [explanation, setExplanation] = useState<string>("");
  const [isExplaining, setIsExplaining] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [highlighterStyle, setHighlighterStyle] = useState<Record<
    string,
    React.CSSProperties
  > | null>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    import("react-syntax-highlighter/dist/esm/styles/prism")
      .then((mod) => {
        setHighlighterStyle(mod.vscDarkPlus);
      })
      .catch(() => {
        console.warn("Failed to load syntax highlighter style");
      });
  }, []);

  const checkFavoriteStatus = useCallback(async () => {
    if (!user || !snippetId) return;

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("snippet_id", snippetId)
        .maybeSingle(); // Use maybeSingle instead of single

      if (error) {
        console.warn("Error checking favorite status:", error);
        return;
      }

      setIsFavorited(!!data);
    } catch (error) {
      console.warn("Error checking favorite status:", error);
    }
  }, [user, snippetId]);

  const getFavoriteCount = useCallback(async () => {
    if (!snippetId) return;

    try {
      const { count, error } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("snippet_id", snippetId);

      if (error) {
        console.warn("Error getting favorite count:", error);
        return;
      }

      setFavoriteCount(count || 0);
    } catch (error) {
      console.warn("Error getting favorite count:", error);
    }
  }, [snippetId]);

  // Check if user has favorited this snippet
  useEffect(() => {
    if (mounted && user && snippetId) {
      checkFavoriteStatus();
      getFavoriteCount();
    }
  }, [mounted, user, snippetId, checkFavoriteStatus, getFavoriteCount]);

  const handleCopy = async () => {
    const success = await copyToClipboard(code, {
      snippetId,
      customMessage: `${language} code copied! 🎉`,
    });

    if (success && copyCount % 5 === 4) {
      toast.success("🔥 You're on fire! Consider favoriting this snippet", {
        action: {
          label: "❤️ Favorite",
          onClick: handleFavorite,
        },
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || `snippet.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Code downloaded! 📥");

    // Track download
    if (snippetId) {
      fetch("/api/analytics/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snippetId, type: "download" }),
      }).catch(() => {});
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast.error("Sign in to favorite snippets");
      return;
    }

    if (!snippetId) return;

    setIsLoading(true);

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("snippet_id", snippetId);

        if (error) throw error;

        setIsFavorited(false);
        setFavoriteCount((prev) => prev - 1);
        toast.success("Removed from favorites");
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          snippet_id: snippetId,
        });

        if (error) throw error;

        setIsFavorited(true);
        setFavoriteCount((prev) => prev + 1);
        toast.success("Added to favorites! ⭐");
      }
    } catch (error) {
      console.error("Favorite error:", error);
      toast.error("Failed to update favorite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!snippetId) {
      // If no snippetId, just copy the code
      await copyToClipboard(code, {
        customMessage: "Code copied! 📋",
        trackAnalytics: false,
      });
      return;
    }

    const shareUrl = `${window.location.origin}/snippets/${snippetId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "Code Snippet",
          text: `Check out this ${language} snippet on Snippetly`,
          url: shareUrl,
        });
        toast.success("Shared successfully! 📤");
      } catch {
        // User cancelled share
      }
    } else {
      await copyToClipboard(shareUrl, {
        customMessage: "Share link copied! 🔗",
        trackAnalytics: false,
      });
    }
  };

  const handleExplainCode = async () => {
    if (!code.trim()) return;

    setIsExplaining(true);

    try {
      const result = await explainCode(code, language);

      const formattedExplanation = `
  **What this code does:**
  ${result.explanation}
  
  **Key Points:**
  ${result.keyPoints.map((point) => `• ${point}`).join("\n")}
  
  **Suggestions for improvement:**
  ${result.suggestions.map((suggestion) => `• ${suggestion}`).join("\n")}
  
  **Complexity Level:** ${result.complexity}
      `.trim();

      setExplanation(formattedExplanation);
      toast.success("AI explanation generated! 🤖");
    } catch (error) {
      console.error("AI explanation error:", error);
      toast.error("Failed to generate explanation. Please try again.");

      // Fallback explanation
      setExplanation(
        `This ${language} code snippet demonstrates programming concepts. Consider adding comments and following best practices for better readability.`
      );
    } finally {
      setIsExplaining(false);
    }
  };

  // Also update the other AI feature buttons:
  // const handleOptimizeCode = async () => {
  //   toast.info("Code optimization coming soon! ⚡");
  //   // TODO: Implement when ready
  // };

  // const handleGenerateTests = async () => {
  //   toast.info("Test generation coming soon! 🧪");
  //   // TODO: Implement when ready
  // };

  const getFileExtension = (languageName: string): string => {
    const extensions: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      cpp: "cpp",
      c: "c",
      csharp: "cs",
      php: "php",
      ruby: "rb",
      go: "go",
      rust: "rs",
      swift: "swift",
      kotlin: "kt",
      dart: "dart",
      html: "html",
      css: "css",
      scss: "scss",
      json: "json",
      yaml: "yml",
      xml: "xml",
      sql: "sql",
      shell: "sh",
      bash: "sh",
    };
    return extensions[languageName.toLowerCase()] || "txt";
  };

  const formatLanguageName = (languageName: string): string => {
    return languageName.charAt(0).toUpperCase() + languageName.slice(1);
  };

  const canRunCode = ["javascript", "typescript", "html", "css"].includes(
    language.toLowerCase()
  );

  // Don't render complex features until mounted
  if (!mounted) {
    return (
      <div
        className={`relative bg-gray-900 rounded-lg overflow-hidden ${className} border border-gray-700`}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-4 h-4 text-lightGreen" />
            <span className="px-2 py-1 bg-lightGreen/20 text-lightGreen rounded text-xs font-medium">
              {formatLanguageName(language)}
            </span>
          </div>
          <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap overflow-auto">
            {code}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-gray-900 rounded-lg overflow-hidden group ${className} border border-gray-700 hover:border-lightGreen/50 transition-all duration-300`}
    >
      {/* Header */}
      {showToolbar && (
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-750 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-lightGreen" />
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
            <div>
              {title && (
                <h3 className="text-sm font-medium text-white">{title}</h3>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="px-2 py-1 bg-lightGreen/20 text-lightGreen rounded text-xs font-medium">
                  {formatLanguageName(language)}
                </span>
                {fileName && <span>• {fileName}</span>}
                <span>• {code.split("\n").length} lines</span>
                {copyCount > 0 && (
                  <span className="text-lightGreen animate-pulse">
                    • Copied {copyCount}x
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* AI Features Button */}
            <button
              onClick={() => setShowAIFeatures(!showAIFeatures)}
              className={`p-2 rounded transition-colors ${
                showAIFeatures
                  ? "text-purple-400 bg-purple-400/20"
                  : "text-gray-400 hover:text-purple-400"
              }`}
              title="AI Features"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Favorite Button */}
            {isInteractive && snippetId && (
              <button
                onClick={handleFavorite}
                disabled={isLoading}
                className={`p-2 rounded transition-colors ${
                  isFavorited
                    ? "text-red-400 hover:text-red-300"
                    : "text-gray-400 hover:text-red-400"
                } disabled:opacity-50`}
                title={
                  isFavorited ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart
                  className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`}
                />
                {favoriteCount > 0 && (
                  <span className="text-xs ml-1">{favoriteCount}</span>
                )}
              </button>
            )}

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded"
              title="Share snippet"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Raw/Highlighted Toggle */}
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded"
              title={showRaw ? "Show highlighted" : "Show raw"}
            >
              {showRaw ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>

            {/* Expand/Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <RotateCcw className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Run Code Button */}
            {canRunCode && (
              <button
                onClick={() => toast.info("Code runner coming soon! 🚀")}
                className="p-2 text-gray-400 hover:text-lightGreen transition-colors rounded"
                title="Run code"
              >
                <Play className="w-4 h-4" />
              </button>
            )}

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className={`p-2 transition-colors rounded ${
                copied
                  ? "text-lightGreen bg-lightGreen/10"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Copy code"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI Features Panel */}
      {showAIFeatures && (
        <div className="px-4 py-3 bg-purple-900/20 border-b border-purple-500/30">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-medium text-purple-300">
              AI Assistant
            </h4>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExplainCode}
              disabled={isExplaining}
              className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm transition-colors disabled:opacity-50"
            >
              {isExplaining ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Terminal className="w-3 h-3" />
                  Explain Code
                </>
              )}
            </button>
            <button
              onClick={() => toast.info("Code optimization coming soon! ⚡")}
              className="flex items-center gap-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-sm transition-colors"
            >
              <Zap className="w-3 h-3" />
              Optimize
            </button>
            <button
              onClick={() => toast.info("Test generation coming soon! 🧪")}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm transition-colors"
            >
              <FileText className="w-3 h-3" />
              Generate Tests
            </button>
          </div>

          {explanation && (
            <div className="mt-3 p-3 bg-purple-800/30 rounded border border-purple-500/30">
              <p className="text-sm text-purple-100">{explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Code Content */}
      <div
        ref={codeRef}
        className="relative"
        style={{
          maxHeight: isExpanded ? "none" : maxHeight,
          overflow: isExpanded ? "visible" : "auto",
        }}
      >
        {showRaw || !highlighterStyle ? (
          <pre className="p-4 text-gray-300 text-sm font-mono whitespace-pre-wrap overflow-auto">
            {code}
          </pre>
        ) : (
          <SyntaxHighlighter
            language={language.toLowerCase()}
            style={highlighterStyle}
            showLineNumbers={showLineNumbers}
            wrapLines={true}
            customStyle={{
              margin: 0,
              padding: "1rem",
              background: "transparent",
              fontSize: "14px",
            }}
            codeTagProps={{
              style: {
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              },
            }}
          >
            {code}
          </SyntaxHighlighter>
        )}

        {/* Fade overlay when collapsed */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
        )}

        {/* Quick copy overlay on hover */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-black/70 backdrop-blur-sm text-white rounded text-xs flex items-center gap-1 hover:bg-black/90 transition-colors border border-gray-600"
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Stats footer */}
      {showToolbar && (
        <div className="px-4 py-2 bg-gray-800 text-xs text-gray-400 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>{code.length.toLocaleString()} characters</span>
              <span>
                {code
                  .split(/\s+/)
                  .filter((word) => word.length > 0)
                  .length.toLocaleString()}{" "}
                words
              </span>
              <span>{Math.ceil(code.length / 80)} estimated lines</span>
            </div>
            <div className="flex items-center gap-4">
              {favoriteCount > 0 && (
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400" />
                  {favoriteCount}
                </span>
              )}
              {copyCount > 0 && (
                <span className="flex items-center gap-1 text-lightGreen">
                  <Copy className="w-3 h-3" />
                  {copyCount} copies
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
