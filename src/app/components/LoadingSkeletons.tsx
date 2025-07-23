// Loading Skeleton Components for better UX

import React from 'react';

// Generic Skeleton component
export function Skeleton({ 
  className = '', 
  width, 
  height 
}: { 
  className?: string; 
  width?: string | number; 
  height?: string | number; 
}) {
  return (
    <div
      className={`animate-pulse bg-textSecondary/20 rounded ${className}`}
      style={{ width, height }}
    />
  );
}

// Snippet Card Skeleton
export function SnippetCardSkeleton() {
  return (
    <div className="border border-textSecondary p-4 rounded-lg shadow-sm bg-primary">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

// Snippet List Skeleton
export function SnippetListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SnippetCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Snippet Detail Skeleton
export function SnippetDetailSkeleton() {
  return (
    <article className="prose lg:prose-xl max-w-4xl mx-auto py-8">
      <Skeleton className="h-8 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-6" />
      <Skeleton className="h-4 w-1/4 mb-4" />
      <div className="bg-gray-900 rounded-lg p-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-4/5 mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex items-center gap-2 mt-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <Skeleton key={star} className="w-6 h-6" />
        ))}
        <Skeleton className="h-4 w-32 ml-2" />
      </div>
    </article>
  );
}

// User Profile Skeleton
export function UserProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-brand-secondary rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-b border-textSecondary">
        <div className="flex space-x-6">
          {[1, 2, 3].map((tab) => (
            <Skeleton key={tab} className="h-6 w-20 mb-2" />
          ))}
        </div>
      </div>
      
      <SnippetListSkeleton count={4} />
    </div>
  );
}

// Comments Section Skeleton
export function CommentsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="mt-8">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="border border-textSecondary rounded p-4">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Navigation Skeleton
export function NavigationSkeleton() {
  return (
    <nav className="flex items-center space-x-6">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-24" />
    </nav>
  );
}

// Form Skeleton
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-18 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-12 mb-2" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

// Page Loading Skeleton
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}