"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Comment = {
  id: string;
  snippet_id: string;
  author: string;
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
    fetchComments();
  }, [snippetId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("id, author, content, created_at")
      .eq("snippet_id", snippetId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      setError("Error loading comments");
    } else {
      setComments(data || []);
    }
    setLoading(false);
  };

  if (loading) return <div className="animate-pulse">Loading comments...</div>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-4">Comments ({comments.length})</h2>
      {comments.length === 0 ? (
        <p className="text-textSecondary">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border rounded-lg p-4 bg-brand-secondary"
            >
              <p className="text-text mb-2">{comment.content}</p>
              <p className="text-xs text-textSecondary">
                By {comment.author} on{" "}
                {new Date(comment.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
