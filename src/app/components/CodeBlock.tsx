"use client";

import React, { useState, useRef, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
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
  HeartIcon,
  Share2,
  Play,
  Zap
} from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
  fileName?: string;
  snippetId?: string;
  authorId?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
  showToolbar?: boolean;
  isInteractive?: boolean;
}

export default function CodeBlock({
  code,
  language,
  title,
  fileName,
  snippetId,
  authorId,
  showLineNumbers = true,
  maxHeight = "500px",
  className = "",
  showToolbar = true,
  isInteractive = true,
}: CodeBlockProps) {
  const { copyToClipboard, copied, copyCount } = useCopyToClipboard();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);

  // Check if user has favorited this snippet
  useEffect(() => {
    if (user && snippetId) {
      checkFavoriteStatus();
      getFavoriteCount();
    }
  }, [user, snippetId]);

  const checkFavoriteStatus = async () => {
    if (!user || !snippetId) return;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('snippet_id', snippetId)
      .single();

    setIsFavorited(!!data);
  };

  const getFavoriteCount = async () => {
    if (!snippetId) return;

    const { count } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('snippet_id', snippetId);

    setFavoriteCount(count || 0);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(code, {
      snippetId,
      customMessage: `${language} code copied!`,
    });
    
    if (success && copyCount % 5 === 4) {
      toast.success("🔥 You're on fire! Consider favoriting this snippet", {
        action: {
          label: "Favorite",
          onClick: handleFavorite,
        },
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `snippet.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Code downloaded!");
    
    // Track download
    if (snippetId) {
      fetch('/api/analytics/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snippetId }),
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
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('snippet_id', snippetId);

        if (error) throw error;
        
        setIsFavorited(false);
        setFavoriteCount(prev => prev - 1);
        toast.success("Removed from favorites");
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            snippet_id: snippetId,
          });

        if (error) throw error;
        
        setIsFavorited(true);
        setFavoriteCount(prev => prev + 1);
        toast.success("Added to favorites!");
      }
    } catch (error) {
      console.error('Favorite error:', error);
      toast.error("Failed to update favorite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!snippetId) return;

    const shareUrl = `${window.location.origin}/snippets/${snippetId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Code Snippet',
          text: `Check out this ${language} snippet on Snippetly`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      await copyToClipboard(shareUrl, {
        customMessage: "Share link copied!",
        trackAnalytics: false,
      });
    }
  };

  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      'javascript': 'js',
      'typescript': 'ts',
      'python': 'py',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'csharp': 'cs',
      'php': 'php',
      'ruby': 'rb',
      'go': 'go',
      'rust': 'rs',
      'swift': 'swift',
      'kotlin': 'kt',
      'dart': 'dart',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'yaml': 'yml',
      'xml': 'xml',
      'sql': 'sql',
      'shell': 'sh',
      'bash': 'sh'
    };
    return extensions[language.toLowerCase()] || 'txt';
  };

  const formatLanguageName = (lang: string): string => {
    return lang.charAt(0).toUpperCase() + lang.slice(1);
  };

  const canRunCode = ['javascript', 'typescript', 'html', 'css'].includes(language.toLowerCase());

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden group ${className}`}>
      {/* Header */}
      {showToolbar && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Code className="w-4 h-4 text-gray-400" />
            <div>
              {title && (
                <h3 className="text-sm font-medium text-white">{title}</h3>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{formatLanguageName(language)}</span>
                {fileName && <span>• {fileName}</span>}
                <span>• {code.split('\n').length} lines</span>
                {copyCount > 0 && (
                  <span className="text-lightGreen">• Copied {copyCount}x</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Favorite Button */}
            {isInteractive && snippetId && (
              <button
                onClick={handleFavorite}
                disabled={isLoading}
                className={`p-2 rounded transition-colors ${
                  isFavorited 
                    ? 'text-red-400 hover:text-red-300' 
                    : 'text-gray-400 hover:text-red-400'
                } disabled:opacity-50`}
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                {favoriteCount > 0 && (
                  <span className="text-xs ml-1">{favoriteCount}</span>
                )}
              </button>
            )}

            {/* Share Button */}
            {isInteractive && snippetId && (
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded"
                title="Share snippet"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            {/* Raw/Highlighted Toggle */}
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded"
              title={showRaw ? "Show highlighted" : "Show raw"}
            >
              {showRaw ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            
            {/* Expand/Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <RotateCcw className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Run Code Button */}
            {canRunCode && (
              <button
                onClick={() => toast.info("Code runner coming soon!")}
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
                  ? 'text-lightGreen bg-lightGreen/10' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Code Content */}
      <div 
        ref={codeRef}
        className="relative"
        style={{ 
          maxHeight: isExpanded ? 'none' : maxHeight,
          overflow: isExpanded ? 'visible' : 'auto'
        }}
      >
        {showRaw ? (
          <pre className="p-4 text-gray-300 text-sm font-mono whitespace-pre-wrap overflow-auto">
            {code}
          </pre>
        ) : (
          <SyntaxHighlighter
            language={language.toLowerCase()}
            style={vscDarkPlus}
            showLineNumbers={showLineNumbers}
            wrapLines={true}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'transparent',
              fontSize: '14px'
            }}
            codeTagProps={{
              style: {
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
              }
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
            className="px-3 py-1 bg-black/70 text-white rounded text-xs flex items-center gap-1 hover:bg-black/90 transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Stats footer */}
      {showToolbar && (
        <div className="px-4 py-2 bg-gray-800 text-xs text-gray-400 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span>{code.length.toLocaleString()} characters</span>
            <div className="flex items-center gap-4">
              <span>
                {code.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()} words
              </span>
              {favoriteCount > 0 && (
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400" />
                  {favoriteCount}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}