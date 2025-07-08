import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data: snippet } = await supabase
    .from("snippets")
    .select("title, description")
    .eq("id", params.id)
    .single();

  if (!snippet) {
    return { title: "Snippet Not Found | Snippetly" };
  }

  return {
    title: `${snippet.title} | Snippetly`,
    description: snippet.description,
  };
}

export default async function SnippetPage({ params }: { params: { id: string } }) {
  const { data: snippet, error } = await supabase
    .from("snippets")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !snippet) {
    console.error(error);
    notFound();
  }

  return (
    <article className="prose lg:prose-xl max-w-4xl mx-auto py-8">
      <h1>{snippet.title}</h1>
      <p className="text-neutral-600">{snippet.description}</p>
      <p className="text-sm text-neutral-500 mb-4">
        Language: {snippet.language}
      </p>

      <SyntaxHighlighter
        language={snippet.language.toLowerCase()}
        style={vscDarkPlus}
      >
        {snippet.code}
      </SyntaxHighlighter>

      <p className="mt-4 text-sm text-neutral-400">
        Tags: {snippet.tags?.join(", ")}
      </p>
    </article>
  );
}
