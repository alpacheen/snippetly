import { supabase } from "@/lib/supabase";
import SnippetCard from "@/app/components/SnippetCard";
import TabsFilter from "../components/TabsFilter";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  language?: string;
  tab?: string;
  tag?: string;
};

export default async function SnippetsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const tab = searchParams.tab || "All";

  // Get all tags for the filter
  const { data: allSnippets, error: tagsError } = await supabase
    .from("snippets")
    .select("tags");

  if (tagsError) {
    console.error("Error fetching tags:", tagsError);
  }

  const allTags: string[] = Array.from(
    new Set(allSnippets?.flatMap((snippet) => snippet.tags || []))
  );

  // Build query based on filters
  let query = supabase.from("snippets").select("*");

  if (tab === "Language" && searchParams.language) {
    query = query.eq("language", searchParams.language);
  } else if (tab === "Tags" && searchParams.tag) {
    query = query.contains("tags", [searchParams.tag]);
  } else if (searchParams.q) {
    // Search in title and description
    query = query.or(
      `title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`
    );
  }

  const { data: snippets, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching snippets:", error);
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-bold">Browse Snippets</h1>
        <p className="text-red-500">
          Error loading snippets. Please try again.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Browse Snippets</h1>
      <TabsFilter tags={allTags} />
      {snippets && snippets.length > 0 ? (
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
      ) : (
        <p className="text-neutral-500">
          No snippets found. Try adjusting your search or filters.
        </p>
      )}
    </section>
  );
}
