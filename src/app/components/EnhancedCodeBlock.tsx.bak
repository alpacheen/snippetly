// src/app/components/EnhancedCodeBlock.tsx
"use client";

import React, { useState } from "react";
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
  Code
} from "lucide-react";
import { toast } from "sonner";

interface EnhancedCodeBlockProps {
  code: string;
  language: string;
  title?: string;
  fileName?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
}

export default function EnhancedCodeBlock({
  code,
  language,
  title,
  fileName,
  showLineNumbers = true,
  maxHeight = "500px",
  className = ""
}: EnhancedCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copied to clipboard!");
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        toast.error("Failed to copy code");
      } finally {
        document.body.removeChild(textArea);
      }
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

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
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
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded"
            title={showRaw ? "Show highlighted" : "Show raw"}
          >
            {showRaw ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <RotateCcw className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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
              copied 
                ? 'text-green-400 bg-green-400/10' 
                : 'text-gray-400 hover:text-white'
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
      </div>

      {/* Stats footer */}
      <div className="px-4 py-2 bg-gray-800 text-xs text-gray-400 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span>{code.length} characters</span>
          <span>
            {code.split(/\s+/).filter(word => word.length > 0).length} words
          </span>
        </div>
      </div>
    </div>
  );
}