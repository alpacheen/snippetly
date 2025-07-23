"use client";

import Image from "next/image";
import { useState } from "react";
import { User, ImageOff } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
  fallbackText?: string;
  priority?: boolean;
}

export default function SafeImage({
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

  // Check if the URL is from an allowed domain
  const isValidImageUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      const allowedDomains = [
        'img.freepik.com',
        'images.unsplash.com',
        'avatars.githubusercontent.com',
        'lh3.googleusercontent.com',
        'cdn.jsdelivr.net',
        'via.placeholder.com',
        'picsum.photos',
        'imgur.com',
        'i.imgur.com',
      ];
      return allowedDomains.includes(parsedUrl.hostname);
    } catch {
      return false;
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // If no src or invalid URL, show fallback immediately
  if (!src || !isValidImageUrl(src) || imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-lightGreen text-primary ${className}`}
        style={{ width, height }}
      >
        {fallbackText ? (
          <span className="font-bold text-lg">
            {fallbackText.charAt(0).toUpperCase()}
          </span>
        ) : (
          <FallbackIcon className={`w-${Math.min(width, height) / 4} h-${Math.min(width, height) / 4}`} />
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Loading placeholder */}
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse rounded"
          style={{ width, height }}
        >
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Actual image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority={priority}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyejFBSyQQQhgCVHUCjKte"
      />
    </div>
  );
}

// Avatar-specific component
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
  return (
    <SafeImage
      src={src || ""}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      fallbackIcon={User}
      fallbackText={fallbackText}
    />
  );
}

// Image with fallback for snippet previews
interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className = "",
}: ImageWithFallbackProps) {
  return (
    <SafeImage
      src={src || ""}
      alt={alt}
      width={width}
      height={height}
      className={`object-cover ${className}`}
      fallbackIcon={ImageOff}
    />
  );
}