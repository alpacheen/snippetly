// "use client";

// import Image from "next/image";
// import { useState } from "react";
// import { User, ImageOff } from "lucide-react";
// import { isValidImageUrl, generateInitials, createPlaceholderDataUrl } from "@/lib/imageUtils";
// import ImageErrorBoundary from "./ImageErrorBoundary";

// interface SafeImageProps {
//   src: string;
//   alt: string;
//   width: number;
//   height: number;
//   className?: string;
//   fallbackIcon?: React.ComponentType<{ className?: string }>;
//   fallbackText?: string;
//   priority?: boolean;
// }

// function SafeImageInner({
//   src,
//   alt,
//   width,
//   height,
//   className = "",
//   fallbackIcon: FallbackIcon = User,
//   fallbackText,
//   priority = false,
// }: SafeImageProps) {
//   const [imageError, setImageError] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   const handleImageError = () => {
//     if (process.env.NODE_ENV === 'development') {
//       console.warn(`Failed to load image: ${src}`);
//     }
//     setImageError(true);
//     setIsLoading(false);
//   };

//   const handleImageLoad = () => {
//     setIsLoading(false);
//   };

//   // Show fallback immediately if no src or invalid URL
//   if (!src || !isValidImageUrl(src) || imageError) {
//     const displayText = fallbackText || generateInitials(alt);
    
//     return (
//       <div
//         className={`flex items-center justify-center bg-lightGreen text-primary ${className}`}
//         style={{ width, height }}
//         role="img"
//         aria-label={alt}
//       >
//         {displayText && displayText !== '?' ? (
//           <span className="font-bold text-lg select-none">
//             {displayText.charAt(0).toUpperCase()}
//           </span>
//         ) : (
//           <FallbackIcon className="w-1/2 h-1/2" />
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
//       {/* Loading placeholder */}
//       {isLoading && (
//         <div
//           className="absolute inset-0 flex items-center justify-center bg-lightGreen animate-pulse"
//           style={{ width, height }}
//         >
//           <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
//         </div>
//       )}
      
//       {/* Actual image */}
//       <Image
//         src={src}
//         alt={alt}
//         width={width}
//         height={height}
//         className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200 object-cover`}
//         onError={handleImageError}
//         onLoad={handleImageLoad}
//         priority={priority}
//         placeholder="blur"
//         blurDataURL={createPlaceholderDataUrl(width, height, fallbackText)}
//       />
//     </div>
//   );
// }

// export default function SafeImage(props: SafeImageProps) {
//   return (
//     <ImageErrorBoundary 
//       width={props.width} 
//       height={props.height} 
//       className={props.className}
//     >
//       <SafeImageInner {...props} />
//     </ImageErrorBoundary>
//   );
// }

// // Avatar-specific component with better error handling
// interface AvatarProps {
//   src?: string;
//   alt: string;
//   size?: number;
//   className?: string;
//   fallbackText?: string;
// }

// export function Avatar({
//   src,
//   alt,
//   size = 40,
//   className = "",
//   fallbackText,
// }: AvatarProps) {
//   // Generate fallback text from alt if not provided
//   const displayFallback = fallbackText || generateInitials(alt);
  
//   return (
//     <SafeImage
//       src={src || ""}
//       alt={alt}
//       width={size}
//       height={size}
//       className={`rounded-full ${className}`}
//       fallbackIcon={User}
//       fallbackText={displayFallback}
//     />
//   );
// }

// // Image with fallback for snippet previews
// interface ImageWithFallbackProps {
//   src?: string;
//   alt: string;
//   width: number;
//   height: number;
//   className?: string;
// }

// export function ImageWithFallback({
//   src,
//   alt,
//   width,
//   height,
//   className = "",
// }: ImageWithFallbackProps) {
//   return (
//     <SafeImage
//       src={src || ""}
//       alt={alt}
//       width={width}
//       height={height}
//       className={`object-cover ${className}`}
//       fallbackIcon={ImageOff}
//     />
//   );
// }
"use client";

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (imageError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <span className="text-gray-500 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => setImageError(true)}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyydwyRWBGgYoeiviJrOKbttebkeFX7YM1jnqmAYOEHJKg7dP7nMN5EqEqKJ/2L8GIOSAv0HAjtA8AgfZOFxkF3LJ6TjHjg7N2+MZV5NZ8nkh/H3kq1Kt1MHLA==;"
      />
    </div>
  );
}