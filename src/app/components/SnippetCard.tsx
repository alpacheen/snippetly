import { memo, useMemo } from "react";
import Link from "next/link";
import { Code, Calendar, Tag, Star } from "lucide-react";
import { Avatar } from "@/app/components/SafeImage";
import type { Snippet } from "@/types";

interface OptimizedSnippetCardProps {
  snippet: Snippet;
  showAuthor?: boolean;
  showStats?: boolean;
  className?: string;
}

export const OptimizedSnippetCard = memo(function SnippetCard({
  snippet,
  showAuthor = true,
  showStats = true,
  className = "",
}: OptimizedSnippetCardProps) {
  const { id, title, description, language, tags, created_at, rating, ratings_count, author } = snippet;

  // Memoized calculations for performance
  const formattedDate = useMemo(() => {
    const date = new Date(created_at);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return diffInHours < 1 ? "Just now" : `${diffInHours}h ago`;
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  }, [created_at]);

  const truncatedDescription = useMemo(() => {
    if (!description) return "";
    return description.length <= 120 
      ? description 
      : description.slice(0, 120).trim() + "...";
  }, [description]);

  const displayTags = useMemo(() => 
    tags?.slice(0, 3) || []
  , [tags]);

  const hasMoreTags = tags && tags.length > 3;

  return (
    <Link href={`/snippets/${id}`} className={`group block ${className}`}>
      <article className="border border-textSecondary rounded-lg shadow-sm bg-primary hover:shadow-md hover:border-lightGreen transition-all duration-200 h-full flex flex-col overflow-hidden p-4">
        {/* Header */}
        <header className="flex-1 mb-3">
          <h2 className="font-semibold text-text group-hover:text-text transition-colors line-clamp-2 mb-2 text-lg">
            {title}
          </h2>

          {truncatedDescription && (
            <p className="text-sm text-textSecondary line-clamp-2 mb-3">
              {truncatedDescription}
            </p>
          )}
        </header>

        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {displayTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-darkGreen text-text rounded text-xs"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {hasMoreTags && (
              <span className="px-2 py-1 bg-textSecondary/20 text-textSecondary rounded text-xs">
                +{tags!.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="space-y-2 mt-auto">
          {/* Language and Stats */}
          <div className="flex items-center justify-between text-sm text-text">
            <div className="flex items-center gap-1">
              <Code className="w-4 h-4" />
              <span>{language}</span>
            </div>

            {showStats && (
              <div className="flex items-center gap-3">
                {rating && rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-300 fill-current" />
                    <span>{rating.toFixed(1)}</span>
                    {ratings_count && (
                      <span className="text-xs">({ratings_count})</span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            )}
          </div>

          {/* Author */}
          {showAuthor && author && (
            <div className="flex items-center gap-2 text-xs text-textSecondary pt-2 border-t border-textSecondary/20">
              <Avatar
                src={author.avatar_url}
                alt={author.username}
                size={16}
                fallbackText={author.username}
              />
              <span>by {author.username}</span>
            </div>
          )}

          {/* Hover indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-lightGreen text-sm pt-1">
            View snippet →
          </div>
        </footer>
      </article>
    </Link>
  );
});
