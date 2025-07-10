"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Props = {
  snippetId: string;
};

export default function NewCommentForm({ snippetId }: Props) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) {
      toast.error("Please fill out all fields");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("comments").insert([
      {
        snippet_id: snippetId,
        author,
        content,
      },
    ]);
    setLoading(false);

    if (error) {
      console.error(error);
      toast.error("Failed to submit comment");
    } else {
      toast.success("Comment added!");
      setAuthor("");
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold">Leave a comment</h3>
      <input
        type="text"
        placeholder="Your name"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
      <textarea
        placeholder="Your comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        rows={4}
      ></textarea>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-darkGreen text-text rounded hover:bg-darkGreen/75 disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}
