import { supabasePublic } from "@/lib/supabase";
import SnippetCard from "@/app/components/SnippetCard";
import { SnippetListSkeleton } from "@/app/components/LoadingSkeletons";
import { Suspense } from "react";
import { AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import type { Snippet, SearchParams } from "@/types";
import EnhancedSearchBar from "../components/EnhancedSearchBar";
import ClientSortFilters from "../components/ClientSortFilters";

export const dynamic = "force-dynamic";
export const revalidate = 60;

interface SnippetsPageProps {
  searchParams: Promise<SearchParams>;
}

// This matches what Supabase actually returns
interface SupabaseSnippetRaw {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  user_id: string;
  created_at: string;
  rating?: number;
  ratings_count?: number;
  profiles:
    | {
        username: string;
        avatar_url?: string;
      }[]
    | null;
}

async function SnippetsContent({ searchParams }: SnippetsPageProps) {
  const params = await searchParams;
  const { q: query, language, tag, sort = "newest", page = "1" } = params;
  const currentPage = parseInt(page.toString(), 10) || 1;

  try {
    // Build optimized query with proper Supabase syntax
    let queryBuilder = supabasePublic.from("snippets").select(
      `
        id,
        title,
        description,
        language,
        tags,
        user_id,
        created_at,
        rating,
        ratings_count,
        profiles:user_id (
          username,
          avatar_url
        )
      `,
      { count: "exact" }
    );

    // Apply filters with proper syntax
    if (language) {
      queryBuilder = queryBuilder.eq("language", language);
    }

    if (tag) {
      queryBuilder = queryBuilder.contains("tags", [tag]);
    }

    if (query) {
      const searchPattern = `%${query}%`;
      queryBuilder = queryBuilder.or(
        `title.ilike.${searchPattern},description.ilike.${searchPattern},language.ilike.${searchPattern}`
      );
    }

    // Apply sorting with correct Supabase syntax
    switch (sort) {
      case "oldest":
        queryBuilder = queryBuilder.order("created_at", { ascending: true });
        break;
      case "popular":
        queryBuilder = queryBuilder.order("rating", {
          ascending: false,
          nullsFirst: false,
        });
        break;
      case "newest":
      default:
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
        break;
    }

    // Apply pagination
    const itemsPerPage = 24;
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data: snippets, error, count } = await queryBuilder.range(from, to);

    if (error) {
      console.error("Error fetching snippets:", error);
      return (
        <SnippetsError message="Failed to load snippets. Please try again." />
      );
    }

    // Transform data safely with proper typing
    const transformedSnippets: Snippet[] =
      snippets?.map((snippet: SupabaseSnippetRaw) => ({
        id: snippet.id,
        title: snippet.title,
        description: snippet.description,
        code: "", // Not selected in query for performance
        language: snippet.language,
        tags: snippet.tags || [],
        user_id: snippet.user_id,
        created_at: snippet.created_at,
        updated_at: snippet.created_at, // Use created_at as fallback
        rating: snippet.rating || 0,
        ratings_count: snippet.ratings_count || 0,
        author:
          snippet.profiles && snippet.profiles.length > 0
            ? {
                username: snippet.profiles[0].username,
                avatar_url: snippet.profiles[0].avatar_url,
              }
            : undefined,
      })) || [];

    const hasFilters = !!(query || language || tag);
    const totalPages = Math.ceil((count || 0) / itemsPerPage);

    return (
      <section className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Browse Snippets</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-textSecondary">
              {count !== null && (
                <>
                  {count.toLocaleString()} snippet{count !== 1 ? "s" : ""}
                  {hasFilters && " found"}
                </>
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

        <EnhancedSearchBar />

        {!transformedSnippets || transformedSnippets.length === 0 ? (
          <EmptySnippets searchTerm={query} hasFilters={hasFilters} />
        ) : (
          <>
            <ClientSortFilters currentSort={sort} searchParams={params} />

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

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              searchParams={params}
            />
          </>
        )}
      </section>
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return (
      <SnippetsError message="An unexpected error occurred. Please try again later." />
    );
  }
}

function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: SearchParams;
}) {
  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "page") {
        params.set(key, value.toString());
      }
    });
    if (page > 1) params.set("page", page.toString());
    return `/snippets${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="px-4 py-2 border border-textSecondary text-text rounded-lg hover:bg-textSecondary/10 transition-colors"
        >
          Previous
        </Link>
      )}

      <span className="px-4 py-2 text-textSecondary">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages && (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="px-4 py-2 border border-textSecondary text-text rounded-lg hover:bg-textSecondary/10 transition-colors"
        >
          Next
        </Link>
      )}
    </div>
  );
}

function SnippetsLoading() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-textSecondary/20 rounded animate-pulse"></div>
        <div className="h-6 w-32 bg-textSecondary/20 rounded animate-pulse"></div>
      </div>
      <div className="h-12 w-full bg-textSecondary/20 rounded animate-pulse"></div>
      <SnippetListSkeleton count={8} />
    </section>
  );
}

function SnippetsError({ message }: { message: string }) {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Browse Snippets</h1>
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-text mb-2">
          Error Loading Snippets
        </h2>
        <p className="text-textSecondary text-center mb-6 max-w-md">
          {message}
        </p>
        <Link
          href="/snippets"
          className="px-6 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
        >
          Try Again
        </Link>
      </div>
    </section>
  );
}

function EmptySnippets({
  searchTerm,
  hasFilters,
}: {
  searchTerm?: string;
  hasFilters: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-lg font-semibold text-text mb-2">
        {searchTerm
          ? `No snippets found for "${searchTerm}"`
          : "No snippets match your search"}
      </h2>
      <p className="text-textSecondary text-center mb-6 max-w-md">
        {hasFilters
          ? "Try adjusting your search criteria to find more snippets."
          : "Be the first to share a code snippet with the community!"}
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
            Clear Search
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function SnippetsPage(props: SnippetsPageProps) {
  return (
    <Suspense fallback={<SnippetsLoading />}>
      <SnippetsContent {...props} />
    </Suspense>
  );
}
