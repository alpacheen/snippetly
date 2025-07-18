"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Comment = {
  id: string;
  snippet_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
};

type Props = {
  snippetId: string;
  refreshTrigger?: number;
};

export default function CommentsList({ snippetId, refreshTrigger }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("id, user_id, content, created_at, snippet_id")
          .eq("snippet_id", snippetId)
          .order("created_at", { ascending: false });

        if (commentsError) {
          console.error("Error fetching comments:", commentsError);
          setError(`Error loading comments: ${commentsError.message}`);
          return;
        }

        if (!commentsData || commentsData.length === 0) {
          setComments([]);
          return;
        }

        const userIds = [
          ...new Set(commentsData.map((comment) => comment.user_id)),
        ];

        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        if (profilesError) {
          console.warn("Error fetching profiles:", profilesError);
          setComments(commentsData);
          return;
        }

        const userMap = new Map(
          profilesData?.map((profile) => [profile.id, profile.username]) || []
        );

        const commentsWithUsernames = commentsData.map((comment) => ({
          ...comment,
          username: userMap.get(comment.user_id) || "Anonymous",
        }));

        setComments(commentsWithUsernames);
      } catch (error) {
        console.error("Unexpected error fetching comments:", error);
        setError("Unexpected error loading comments");
      } finally {
        setLoading(false);
      }
    };

    if (snippetId) {
      fetchComments();
    }
  }, [snippetId, refreshTrigger]);

  if (loading) {
    return <p className="text-neutral-500">Loading comments...</p>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        <p>{error}</p>
        <p className="text-sm mt-2">
          Check the browser console for more details.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-2">Comments ({comments.length})</h2>
      {comments.length === 0 && (
        <p className="text-neutral-500">No comments yet. Be the first!</p>
      )}
      <ul className="space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="border rounded p-4">
            <p className="text-sm text-textSecondary">{comment.content}</p>
            <p className="text-xs text-neutral-400 mt-1">
              - {comment.username} on{" "}
              {new Date(comment.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
