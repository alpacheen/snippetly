import { supabase } from "@/lib/supabase";
import SnippetCard from "@/app/components/SnippetCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SnippetsPage({searchParams, }:{ searchParams:{q?:string; language?: string}}) {
  const  searchQuery = searchParams.q || "";
  const languageFilter = searchParams.language || "";

  let query = supabase.from("snippets").select("id, title, language");
  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }
  if (languageFilter) {
    query = query.eq("language", languageFilter);
}
  const { data: snippets, error } = await query
  if (error) {
    console.error(error);
    return <div>Error loading snippets</div>;
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Browse Snippets</h1>

      <form className="space-x-2">
        <input type="text"
        name="q"
        placeholder="Search title..."
        defaultValue={searchQuery}
        className="border px-3 py-2 rounded" />
        <select name="language"
        defaultValue={languageFilter}
        className="border px-3 py-2 rounded">
          <option value="">All Languages</option>
          <option value="JavaScript">JavaScript</option>
          <option value="TypeScript">TypeScript</option>
          <option value="Python">Python</option>
          <option value="Go">Go</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Search
        </button>
      </form>
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

