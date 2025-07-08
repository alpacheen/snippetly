import { supabase } from "@/lib/supabase";
import SnippetCard from "@/app/components/SnippetCard";

export const dynamic = "force-dynamic";

export default async function SnippetsPage() {
  const { data: snippets, error } = await supabase
    .from("snippets")
    .select("id, title, language");

  if (error) {
    console.error(error);
    return <div>Error loading snippets</div>;
  }

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Browse Snippets</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {snippets?.map((snippet) => (
          <SnippetCard
            key={snippet.id}
            title={snippet.title}
            language={snippet.language}
            href={`/snippets/${snippet.id}`} // ← dynamic link!
          />
        ))}
      </div>
    </section>
  );
}
