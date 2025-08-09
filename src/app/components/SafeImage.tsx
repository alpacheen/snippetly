"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { User, ImageOff } from "lucide-react";

const ALLOWED_DOMAINS = [
  "avatars.githubusercontent.com",
  "lh3.googleusercontent.com",
  "images.unsplash.com",
  "img.freepik.com",
  "via.placeholder.com",
  "picsum.photos",
  "imgur.com",
  "i.imgur.com",
];

function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  try {
    const parsedUrl = new URL(url);
    return ALLOWED_DOMAINS.includes(parsedUrl.hostname);
  } catch {
    return false;
  }
}

interface SafeImageProps {
  src?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
  fallbackText?: string;
  priority?: boolean;
}

function SafeImage({
  src,
  alt,
  width,
  height,
  className = "",
  fallbackIcon: FallbackIcon = User,
  fallbackText,
  priority = false,
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageError(false);
    setIsLoading(false);
  }, []);

  
  if (!src || !isValidImageUrl(src) || imageError) {
    const displayText = fallbackText || generateInitials(alt);

    return (
      <div
        className={`flex items-center justify-center bg-lightGreen text-primary rounded-full ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        {displayText && displayText !== "?" ? (
          <span className="font-bold text-lg select-none">
            {displayText.charAt(0).toUpperCase()}
          </span>
        ) : (
          <FallbackIcon className="w-1/2 h-1/2" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-lightGreen/20 animate-pulse">
          <div className="w-6 h-6 border-2 border-lightGreen border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Actual image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-200 object-cover`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority={priority}
        unoptimized={false}
      />
    </div>
  );
}

function generateInitials(name: string): string {
  if (!name) return "?";

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}


interface AvatarProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  fallbackText?: string;
}

export function Avatar({
  src,
  alt,
  size = 40,
  className = "",
  fallbackText,
}: AvatarProps) {
  const displayFallback = fallbackText || generateInitials(alt);

  return (
    <SafeImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      fallbackIcon={User}
      fallbackText={displayFallback}
    />
  );
}

export default SafeImage;
