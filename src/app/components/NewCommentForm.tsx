"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";


type Props = {
  snippetId: string;
  onCommentAdded?: () => void;
};

export default function NewCommentForm({ snippetId, onCommentAdded }: Props) {
  
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please fill out all fields");
      return;
    }

    try{
    setLoading(true);
    setError(null);
    
    const {data: {user}, error: userError} = await supabase.auth.getUser();

    if(userError || !user){
      setError("You must be logged in to comment");
      toast.error("You must be logged in to comment.")
      return;
    }

    const {error: insertError} = await supabase
    .from("comments")
    .insert({
      snippet_id: snippetId,
      user_id: user.id,
      content: content.trim(),
    });

    if(insertError){
      console.error("Error inserting comment:" ,insertError);
      setError("Failed to add comment");
      toast.error("Failed to add comment")
      return;
    }

    setContent("");
    toast.success("Thanks for the comment!")

    if(onCommentAdded){
      onCommentAdded();
    }

    } catch (err){
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred.")
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold">Leave a comment</h3>
      
      <textarea
        placeholder="Your comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        rows={4}
      >
      </textarea>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="px-4 py-2 bg-darkGreen text-text rounded hover:bg-darkGreen/75 disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}
