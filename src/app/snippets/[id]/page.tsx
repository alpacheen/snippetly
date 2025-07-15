import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import SnippetCodeBlock from "@/app/components/SnippetCodeBlock";
import CommentsList from "@/app/components/CommentsList";
import NewCommentForm from "@/app/components/NewCommentForm";
import StarRating from "@/app/components/StarRating";

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
    openGraph: {
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${encodeURIComponent(snippet.title)}`,
          width: 1200,
          height: 630,
          alt: snippet.title,
        },
      ],
    },
  };
}

export default async function SnippetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: snippet, error } = await supabase
    .from("snippets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !snippet) {
    notFound();
  }

  return (
    <article className="prose lg:prose-xl max-w-4xl mx-auto py-8">
      <h1>{snippet.title}</h1>
      <p className="text-textSecondary">{snippet.description}</p>
      <p className="text-sm text-neutral-500 mb-4">
        Language: {snippet.language}
      </p>
      <SnippetCodeBlock code={snippet.code} language={snippet.language} />
      <StarRating snippetId={snippet.id} />
      <p className="mt-4 text-sm text-neutral-400">
        Tags: {snippet.tags?.join(", ")}
      </p>
      <CommentsList snippetId={snippet.id} />
      <NewCommentForm snippetId={snippet.id} />
    </article>
  );
}

