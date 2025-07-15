import { supabase } from "@/lib/supabase";
import SnippetCard from "@/app/components/SnippetCard";
import TabsFilter from "../components/TabsFilter";

export const dynamic = "force-dynamic";

export default async function SnippetsPage({ searchParams }: { searchParams: Promise<{ q?: string; tab?: string }> }) {
  const params = await searchParams;
  const query = params.q;
  const tab = params.tab;

  const {data: allSnippets} = await supabase
    .from("snippets")
    .select("tags");

    const allTags: string[] = Array.from(
      new Set(allSnippets?.flatMap(snippet => snippet.tags || []))
    )

  let queryParams = supabase.from("snippets").select("*");

  if (tab === "Language" && params.q) {
    queryParams = queryParams.eq("language", params.q);
  } else if (tab === "Tags" && params.q) {
    queryParams = queryParams.contains("tags", [params.q]);
  } else if (query) {
    // Search in title and description
    queryParams = queryParams.or(
      `title.ilike.%${query}%,description.ilike.%${query}%`
    );
  }

  const { data: snippets, error } = await queryParams.order("created_at", {
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {snippets?.map((snippet) => (
          <SnippetCard
            key={snippet.id}
            title={snippet.title}
            language={snippet.language}
            href={`/snippets/${snippet.id}`}
          />
        ))}
      </div>
    </section>
  );
}
