// type SnippetCardProps = {
//     title: string;
//     language: string;
//     href: string;
// }

// export default function SnippetCard({ title, language, href }: SnippetCardProps) {
//     return (
//         <div className="border p-4 rounded-lg shadow-sm">
//             <h2 className="text-lg font-semibold">{title}</h2>
//             <p className="text-sm text-textSecondary">{language}</p>
//             <a href={href} className="mt-2 inline-block text-lightGreen hover:underline">View Snippet</a>
//         </div>
//     )
// }
import Link from "next/link";
import { Code, Calendar, Tag } from "lucide-react";

type SnippetCardProps = {
  title: string;
  description?: string;
  language: string;
  href: string;
  tags?: string[];
  createdAt?: string;
  author?: string;
  rating?: number;
}

export default function SnippetCard({ 
  title, 
  description,
  language, 
  href,
  tags,
  createdAt,
  author,
  rating
}: SnippetCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link href={href} className="group block">
      <div className="border border-textSecondary p-4 rounded-lg shadow-sm bg-primary hover:shadow-md hover:border-lightGreen transition-all duration-200 h-full flex flex-col">
        {/* Header */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-text group-hover:text-lightGreen transition-colors line-clamp-2 mb-2">
            {title}
          </h2>
          
          {description && (
            <p className="text-sm text-textSecondary line-clamp-2 mb-3">
              {description}
            </p>
          )}
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-darkGreen text-text rounded text-xs"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 bg-textSecondary/20 text-textSecondary rounded text-xs">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-textSecondary border-t border-textSecondary/20 pt-3 mt-auto">
          <div className="flex items-center gap-1">
            <Code className="w-4 h-4" />
            <span>{language}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {rating && (
              <div className="flex items-center gap-1">
                <span className="text-amber-300">★</span>
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
            
            {createdAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(createdAt)}</span>
              </div>
            )}
          </div>
        </div>

        {author && (
          <div className="text-xs text-textSecondary mt-2">
            by {author}
          </div>
        )}
        
        {/* Hover indicator */}
        <div className="mt-2 text-lightGreen opacity-0 group-hover:opacity-100 transition-opacity text-sm">
          View snippet →
        </div>
      </div>
    </Link>
  );
}
