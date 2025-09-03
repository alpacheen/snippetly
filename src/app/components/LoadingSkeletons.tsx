import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className = "", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin text-lightGreen ${sizeClasses[size]}`} />
      {text && <span className="text-textSecondary text-sm">{text}</span>}
    </div>
  );
}

export function PageLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function InlineLoading({ text }: { text?: string }) {
  return <LoadingSpinner size="sm" text={text} className="py-2" />;
}

// Simplified skeleton for critical content only
export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="bg-brand-secondary rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 bg-textSecondary/20 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-textSecondary/20 rounded w-1/4"></div>
            <div className="h-4 bg-textSecondary/20 rounded w-1/2"></div>
            <div className="h-4 bg-textSecondary/20 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SnippetListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="border border-textSecondary rounded-lg p-4 space-y-3">
            <div className="h-5 bg-textSecondary/20 rounded w-3/4"></div>
            <div className="h-4 bg-textSecondary/20 rounded w-full"></div>
            <div className="h-4 bg-textSecondary/20 rounded w-2/3"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 bg-textSecondary/20 rounded w-1/4"></div>
              <div className="h-4 bg-textSecondary/20 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}