"use client";
import React from "react";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

type Props = {
  code: string;
  language: string;
};

export default function SnippetCodeBlock({ code, language }: Props) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard!");
  };

  return (
    <div>
      <button
        onClick={handleCopy}
        className="mb-4 px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition"
      >
        Copy Code
      </button>

      <SyntaxHighlighter language={language.toLowerCase()} style={vscDarkPlus}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
