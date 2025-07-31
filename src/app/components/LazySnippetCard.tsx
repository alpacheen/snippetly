"use client";

import { memo } from "react";
import SnippetCard from "./SnippetCard";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import type { Snippet } from "@/types";

interface LazySnippetCardProps {
  snippet: Snippet;
  className?: string;
}

const LazySnippetCard = memo(function LazySnippetCard({
  snippet,
  className,
}: LazySnippetCardProps) {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true,
    rootMargin: "50px",
  });

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        <SnippetCard snippet={snippet} />
      ) : (
        <div className="h-48 animate-pulse bg-textSecondary/20 rounded-lg" />
      )}
    </div>
  );
});

export default LazySnippetCard;
