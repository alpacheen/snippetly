import { useState, useEffect } from "react";

export const ALLOWED_IMAGE_DOMAINS = [
  "img.freepik.com",
  "images.unsplash.com",
  "avatars.githubusercontent.com",
  "lh3.googleusercontent.com",
  "cdn.jsdelivr.net",
  "via.placeholder.com",
  "picsum.photos",
  "imgur.com",
  "i.imgur.com",
] as const;

export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  try {
    const parsedUrl = new URL(url);
    return ALLOWED_IMAGE_DOMAINS.includes(parsedUrl.hostname as never);
  } catch {
    return false;
  }
}

export function sanitizeImageUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;
  return isValidImageUrl(url) ? url : null;
}

export function generateInitials(name: string, maxLength = 2): string {
  if (!name) return "?";

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return words
    .slice(0, maxLength)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function createPlaceholderDataUrl(
  width: number,
  height: number,
  text?: string,
  backgroundColor = "#A8DAB5",
  textColor = "#231f20"
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      ${
        text
          ? `
        <text 
          x="50%" 
          y="50%" 
          font-family="sans-serif" 
          font-size="${Math.min(width, height) / 3}" 
          font-weight="bold"
          fill="${textColor}" 
          text-anchor="middle" 
          dominant-baseline="central"
        >
          ${text.charAt(0).toUpperCase()}
        </text>
      `
          : ""
      }
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export enum ImageLoadState {
  LOADING = "loading",
  LOADED = "loaded",
  ERROR = "error",
  FALLBACK = "fallback",
}

export function useImageLoadState(src?: string) {
  const [loadState, setLoadState] = useState<ImageLoadState>(
    src && isValidImageUrl(src)
      ? ImageLoadState.LOADING
      : ImageLoadState.FALLBACK
  );

  const handleLoad = () => setLoadState(ImageLoadState.LOADED);
  const handleError = () => setLoadState(ImageLoadState.ERROR);

  useEffect(() => {
    if (!src || !isValidImageUrl(src)) {
      setLoadState(ImageLoadState.FALLBACK);
    } else {
      setLoadState(ImageLoadState.LOADING);
    }
  }, [src]);

  return {
    loadState,
    isLoading: loadState === ImageLoadState.LOADING,
    isLoaded: loadState === ImageLoadState.LOADED,
    hasError: loadState === ImageLoadState.ERROR,
    showFallback:
      loadState === ImageLoadState.FALLBACK ||
      loadState === ImageLoadState.ERROR,
    handleLoad,
    handleError,
  };
}
