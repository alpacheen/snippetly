"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface CopyOptions {
  showToast?: boolean;
  customMessage?: string;
  trackAnalytics?: boolean;
  snippetId?: string;
}

interface CopyState {
  copied: boolean;
  error: string | null;
  copyCount: number;
}

export function useCopyToClipboard() {
  const [state, setState] = useState<CopyState>({
    copied: false,
    error: null,
    copyCount: 0,
  });

  const copyToClipboard = useCallback(
    async (text: string, options: CopyOptions = {}) => {
      const {
        showToast = true,
        customMessage = "Copied to clipboard!",
        trackAnalytics = true,
        snippetId,
      } = options;

      try {
        // Modern Clipboard API with fallback
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers or non-HTTPS
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          const successful = document.execCommand("copy");
          document.body.removeChild(textArea);

          if (!successful) {
            throw new Error("Fallback copy failed");
          }
        }

        setState((prev) => ({
          copied: true,
          error: null,
          copyCount: prev.copyCount + 1,
        }));

        if (showToast) {
          toast.success(customMessage, {
            duration: 2000,
            style: {
              background: "var(--color-primary)",
              color: "var(--color-text)",
              border: "1px solid var(--color-lightGreen)",
            },
          });
        }

        // Track analytics
        if (trackAnalytics && snippetId) {
          // Fire and forget analytics
          fetch("/api/analytics/copy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              snippetId,
              timestamp: new Date().toISOString(),
              textLength: text.length,
            }),
          }).catch(() => {}); // Silent fail for analytics
        }

        // Reset copied state after 2 seconds
        setTimeout(() => {
          setState((prev) => ({ ...prev, copied: false }));
        }, 2000);

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Copy failed";
        setState((prev) => ({
          ...prev,
          copied: false,
          error: errorMessage,
        }));

        if (showToast) {
          toast.error("Failed to copy to clipboard", {
            description: "Please try again or copy manually",
          });
        }

        return false;
      }
    },
    []
  );

  const resetState = useCallback(() => {
    setState({ copied: false, error: null, copyCount: 0 });
  }, []);

  return {
    ...state,
    copyToClipboard,
    resetState,
  };
}
