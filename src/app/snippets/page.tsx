import { supabase } from "@/lib/supabase";
import SnippetCard from "@/app/components/SnippetCard";
import TabsFilter from "../components/TabsFilter";
import Link from "next/link";


export const dynamic = "force-dynamic";

export default async function SnippetsPage({searchParams, }:{ searchParams:{q?:string; language?: string; tab?: string}}) {
  
  const tab = searchParams.tab || "All";

  const {data: allSnippets, error: tagsError} = await supabase
    .from("snippets")
    .select("tags");

    const allTags: string[] = Array.from(
      new Set(allSnippets?.flatMap(snippet => snippet.tags || []))
    )

  let query = supabase.from("snippets").select("*");

  if(tab === "Language" && searchParams.language) {
    query = query.eq("language", searchParams.language);
  } else if(tab === "Tags" && searchParams.tags) {
    query = query.contains("tags", [searchParams.tags]);
  } else {
    query = query.ilike("title", `%${searchParams.q || ""}%`);
  }
  const { data: snippets, error } = await query.order("created_at", { ascending: false });

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

