"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Comment = {
  id: string;
  snippet_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type Props = {
  snippetId: string;
};

export default function CommentsList({ snippetId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("comments")
          .select("id, user_id, content, created_at, snippet_id")
          .eq("snippet_id", snippetId)
          .order("created_at", { ascending: false });

          if (error) {
            setError("Error loading comments");
            console.error("Error fetching comments:", error);
          } else {
            setComments(data || []);
          }
        } catch (err) {
          setError("Error loading comments");
          console.error("Error fetching comments:", err);
        } finally {
          setLoading(false);
        }
    };

    fetchComments();
  }, [snippetId]);

  if (loading) {
    return <p className="text-neutral-500">Loading comments...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-2">Comments</h2>
      {comments.length === 0 && (
        <p className="text-neutral-500">No comments yet. Be the first!</p>
      )}
      <ul className="space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="border rounded p-4">
            <p className="text-sm text-textSecondary">{comment.content}</p>
            <p className="text-xs text-neutral-400 mt-1">
              - {comment.user_id} on {" "}
              {new Date(comment.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
