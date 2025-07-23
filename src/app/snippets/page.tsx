// import { supabase } from "@/lib/supabase";
// import SnippetCard from "@/app/components/SnippetCard";
// import TabsFilter from "../components/TabsFilter";

// export const dynamic = "force-dynamic";

// export default async function SnippetsPage({ searchParams }: { searchParams: Promise<{ q?: string; tab?: string; language?: string; tag?: string }> }) {
//   const params = await searchParams;
//   const query = params.q;
//   const tab = params.tab;
//   const language = params.language;
//   const tag = params.tag;

//   const {data: allSnippets} = await supabase
//     .from("snippets")
//     .select("tags");

//     const allTags: string[] = Array.from(
//       new Set(allSnippets?.flatMap(snippet => snippet.tags || []))
//     )

//   let queryParams = supabase.from("snippets").select("*");

//   if (tab === "Language" && language) {
//     queryParams = queryParams.eq("language", language);
//   } else if (tab === "Tags" && tag) {
//     queryParams = queryParams.contains("tags", [tag]);
//   } else if (query) {
    
//     // Search in title and description
//     queryParams = queryParams.or(
//       `title.ilike.%${query}%,description.ilike.%${query}%`
//     );
//   }

//   const { data: snippets, error } = await queryParams.order("created_at", {
//     ascending: false,
//   });

//   if (error) {
//     console.error("Error fetching snippets:", error);
//     return (
//       <section className="space-y-6">
//         <h1 className="text-2xl font-bold">Browse Snippets</h1>
//         <p className="text-red-500">
//           Error loading snippets. Please try again.
//         </p>
//       </section>
//     );
//   }

//   return (
//     <section className="space-y-6">
//       <h1 className="text-2xl font-bold">Browse Snippets</h1>
//       <TabsFilter tags={allTags} />
//       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {snippets?.map((snippet) => (
//           <SnippetCard
//             key={snippet.id}
//             title={snippet.title}
//             language={snippet.language}
//             href={`/snippets/${snippet.id}`}
//           />
//         ))}
//       </div>
//     </section>
//   );
// }
import { supabase } from "@/lib/supabase";
import SnippetCard from "@/app/components/SnippetCard";
import TabsFilter from "../components/TabsFilter";
import { SnippetListSkeleton } from "@/app/components/LoadingSkeletons";
import { Suspense } from "react";
import { AlertCircle, Search } from "lucide-react";

export const dynamic = "force-dynamic";

// Loading component for suspense
function SnippetsLoading() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-300 rounded animate-pulse"></div>
      </div>
      <div className="h-10 w-full bg-gray-300 rounded animate-pulse mb-4"></div>
      <SnippetListSkeleton count={8} />
    </section>
  );
}

// Error component
function SnippetsError({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Browse Snippets</h1>
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-text mb-2">Error Loading Snippets</h2>
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
function EmptySnippets({ searchTerm, hasFilters }: { searchTerm?: string; hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Search className="w-16 h-16 text-textSecondary mb-4" />
      <h2 className="text-lg font-semibold text-text mb-2">
        {searchTerm ? `No snippets found for "${searchTerm}"` : "No snippets found"}
      </h2>
      <p className="text-textSecondary text-center mb-6 max-w-md">
        {hasFilters 
          ? "Try adjusting your search criteria or filters to find more snippets."
          : "Be the first to share a code snippet with the community!"
        }
      </p>
      <a
        href="/snippets/create"
        className="px-6 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
      >
        Create First Snippet
      </a>
    </div>
  );
}

async function SnippetsContent({ searchParams }: { 
  searchParams: Promise<{ q?: string; tab?: string; language?: string; tag?: string }> 
}) {
  const params = await searchParams;
  const query = params.q;
  const tab = params.tab;
  const language = params.language;
  const tag = params.tag;

  try {
    // Fetch all tags for filter component
    const { data: allSnippets, error: tagsError } = await supabase
      .from("snippets")
      .select("tags");

    if (tagsError) {
      console.error("Error fetching tags:", tagsError);
      return <SnippetsError message="Failed to load snippet categories. Please try again." />;
    }

    const allTags: string[] = Array.from(
      new Set(allSnippets?.flatMap(snippet => snippet.tags || []))
    );

    // Build query with filters
    let queryParams = supabase.from("snippets").select("*");

    if (tab === "Language" && language) {
      queryParams = queryParams.eq("language", language);
    } else if (tab === "Tags" && tag) {
      queryParams = queryParams.contains("tags", [tag]);
    } else if (query) {
      // Search in title, description, and code
      queryParams = queryParams.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,code.ilike.%${query}%`
      );
    }

    const { data: snippets, error } = await queryParams
      .order("created_at", { ascending: false })
      .limit(50); // Limit results for better performance

    if (error) {
      console.error("Error fetching snippets:", error);
      return <SnippetsError message="Failed to load snippets. Please try again." />;
    }

    const hasFilters = !!(tab || query || language || tag);

    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Browse Snippets</h1>
          <div className="text-sm text-textSecondary">
            {snippets?.length || 0} snippet{snippets?.length !== 1 ? 's' : ''} found
          </div>
        </div>
        
        <TabsFilter tags={allTags} />
        
        {!snippets || snippets.length === 0 ? (
          <EmptySnippets searchTerm={query} hasFilters={hasFilters} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {snippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                title={snippet.title}
                language={snippet.language}
                href={`/snippets/${snippet.id}`}
              />
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return <SnippetsError message="An unexpected error occurred while loading snippets." />;
  }
}

export default async function SnippetsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; tab?: string; language?: string; tag?: string }> 
}) {
  return (
    <Suspense fallback={<SnippetsLoading />}>
      <SnippetsContent searchParams={searchParams} />
    </Suspense>
  );
}