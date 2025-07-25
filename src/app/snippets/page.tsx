import { supabasePublic } from "@/lib/supabase";
import SnippetCard from "@/app/components/SnippetCard";
import TabsFilter from "@/app/components/TabsFilter";
import { SnippetListSkeleton } from "@/app/components/LoadingSkeletons";
import { Suspense } from "react";
import { AlertCircle, Search, Plus } from "lucide-react";
import Link from "next/link";
import type { Snippet, SearchParams } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Revalidate every 5 minutes

interface SnippetsPageProps {
  searchParams: Promise<SearchParams>;
}

interface SnippetWithAuthor extends Snippet {
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

// Loading component for suspense
function SnippetsLoading() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-textSecondary/20 rounded animate-pulse"></div>
        <div className="h-6 w-32 bg-textSecondary/20 rounded animate-pulse"></div>
      </div>
      <div className="h-10 w-full bg-textSecondary/20 rounded animate-pulse"></div>
      <SnippetListSkeleton count={8} />
    </section>
  );
}

// Error component
function SnippetsError({
  message,
  retry,
  type = "error",
}: {
  message: string;
  retry?: () => void;
  type?: "error" | "network" | "permission";
}) {
  const getIcon = () => {
    switch (type) {
      case "network":
        return "🌐";
      case "permission":
        return "🔒";
      default:
        return "⚠️";
    }
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Browse Snippets</h1>
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-4">{getIcon()}</div>
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-text mb-2">
          {type === "network"
            ? "Connection Error"
            : type === "permission"
            ? "Access Denied"
            : "Error Loading Snippets"}
        </h2>
        <p className="text-textSecondary text-center mb-6 max-w-md">
          {message}
        </p>
        {retry && (
          <button
            onClick={retry}
            className="px-6 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
          >
            Try Again
          </button>
        )}
      </div>
    </section>
  );
}

// Empty state component
function EmptySnippets({
  searchTerm,
  hasFilters,
  totalCount = 0,
}: {
  searchTerm?: string;
  hasFilters: boolean;
  totalCount?: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Search className="w-16 h-16 text-textSecondary mb-4" />
      <h2 className="text-lg font-semibold text-text mb-2">
        {searchTerm
          ? `No snippets found for "${searchTerm}"`
          : hasFilters
          ? "No snippets match your filters"
          : totalCount === 0
          ? "No snippets yet"
          : "No results"}
      </h2>
      <p className="text-textSecondary text-center mb-6 max-w-md">
        {hasFilters
          ? "Try adjusting your search criteria or filters to find more snippets."
          : totalCount === 0
          ? "Be the first to share a code snippet with the community!"
          : "Start by browsing all snippets or try a different search."}
      </p>
      <div className="flex gap-4">
        <Link
          href="/snippets/create"
          className="flex items-center gap-2 px-6 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Snippet
        </Link>
        {hasFilters && (
          <Link
            href="/snippets"
            className="px-6 py-2 border border-textSecondary text-text rounded-lg hover:bg-textSecondary/10 transition-colors"
          >
            Clear Filters
          </Link>
        )}
      </div>
    </div>
  );
}

async function SnippetsContent({ searchParams }: SnippetsPageProps) {
  const params = await searchParams;
  const { q: query, tab, language, tag, sort = "newest", page = 1 } = params;

  try {
    // Fetch all tags for filter component (cached)
    const { data: allSnippetsForTags, error: tagsError } = await supabasePublic
      .from("snippets")
      .select("tags")
      .limit(1000); // Reasonable limit for tag extraction

    if (tagsError) {
      console.error("Error fetching tags:", tagsError);
      return (
        <SnippetsError
          message="Failed to load snippet categories. Please check your connection and try again."
          type="network"
        />
      );
    }

    const allTags: string[] = Array.from(
      new Set(allSnippetsForTags?.flatMap((snippet) => snippet.tags || []))
    ).sort();

    // Get total count for empty state
    const { count: totalCount } = await supabasePublic
      .from("snippets")
      .select("*", { count: "exact", head: true });

    // Build query with filters and joins
    let queryBuilder = supabasePublic.from("snippets").select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `);

    // Apply filters
    if (tab === "Language" && language) {
      queryBuilder = queryBuilder.eq("language", language);
    } else if (tab === "Tags" && tag) {
      queryBuilder = queryBuilder.contains("tags", [tag]);
    } else if (query) {
      // Enhanced search across multiple fields
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,code.ilike.%${query}%,tags.cs.{${query}}`
      );
    }

    // Apply sorting
    switch (sort) {
      case "oldest":
        queryBuilder = queryBuilder.order("created_at", { ascending: true });
        break;
      case "rating":
        // Note: This would require a computed column or separate query for ratings
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
        break;
      case "popular":
        // Note: This would require view count or other popularity metrics
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
        break;
      case "newest":
      default:
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
        break;
    }

    // Apply pagination
    const itemsPerPage = 20;
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const {
      data: snippets,
      error,
      count,
    } = await queryBuilder.range(from, to).limit(itemsPerPage);

    if (error) {
      console.error("Error fetching snippets:", error);
      const errorType = error.message.includes("permission")
        ? "permission"
        : "error";
      return (
        <SnippetsError
          message={`Failed to load snippets: ${error.message}`}
          type={errorType}
        />
      );
    }

    // Transform data to match our Snippet type
    const transformedSnippets: Snippet[] =
      (snippets as SnippetWithAuthor[])?.map((snippet) => ({
        ...snippet,
        author: snippet.profiles
          ? {
              username: snippet.profiles.username,
              avatar_url: snippet.profiles.avatar_url,
            }
          : undefined,
      })) || [];

    const hasFilters = !!(tab || query || language || tag);
    const totalPages = Math.ceil((count || 0) / itemsPerPage);

    return (
      <section className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Browse Snippets</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-textSecondary">
              {count !== null ? (
                <>
                  {count.toLocaleString()} snippet{count !== 1 ? "s" : ""}
                  {hasFilters && " found"}
                </>
              ) : (
                "Loading..."
              )}
            </div>
            <Link
              href="/snippets/create"
              className="flex items-center gap-2 px-4 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <TabsFilter tags={allTags} />

        {/* Results */}
        {!transformedSnippets || transformedSnippets.length === 0 ? (
          <EmptySnippets
            searchTerm={query}
            hasFilters={hasFilters}
            totalCount={totalCount || 0}
          />
        ) : (
          <>
            {/* Snippets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {transformedSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  showAuthor={true}
                  showStats={true}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {page > 1 && (
                  <Link
                    href={{
                      pathname: "/snippets",
                      query: { ...params, page: page - 1 },
                    }}
                    className="px-4 py-2 border border-textSecondary text-text rounded-lg hover:bg-textSecondary/10 transition-colors"
                  >
                    Previous
                  </Link>
                )}

                <span className="px-4 py-2 text-textSecondary">
                  Page {page} of {totalPages}
                </span>

                {page < totalPages && (
                  <Link
                    href={{
                      pathname: "/snippets",
                      query: { ...params, page: page + 1 },
                    }}
                    className="px-4 py-2 border border-textSecondary text-text rounded-lg hover:bg-textSecondary/10 transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </section>
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return (
      <SnippetsError
        message="An unexpected error occurred while loading snippets. Please try again later."
        type="error"
      />
    );
  }
}

export default async function SnippetsPage(props: SnippetsPageProps) {
  return (
    <Suspense fallback={<SnippetsLoading />}>
      <SnippetsContent {...props} />
    </Suspense>
  );
}
