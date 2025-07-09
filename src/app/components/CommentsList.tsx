import { supabase } from "@/lib/supabase";

type Comment = {
  id: string;
  snippetId: string;
  userId: string;
  content: string;
  createdAt: string;
};

type Props = {
  snippetId: string;
};

export default function CommentsList({ snippetId }): Props {
  const { data: comments, error } = supabase
    .from("comments")
    .select("id,author,content,created_at")
    .eq("snippet_id", snippetId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching comments:", error);
    return <p className="text-red-500">Error loading comments</p>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-2">Comments</h2>
      {comments?.length === 0 && (
        <p className="text-neutral-500">No comments yet. Be the first!</p>
      )}
      <ul className="space-y-4">
        {comments?.map((comment) => (
          <li key={comment.id} className="border rounded p-4">
            <p className="text-sm text-neutral-700">{comment.content}</p>
            <p className="text-xs text-neutral-400 mt-1">
              - {comment.author} on{" "}
              {new Date(comment.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
