"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/app/context/UserContext";
import { toast } from "sonner";

type Props = {
  snippetId: string;
};

export default function StarRating({ snippetId }: Props) {
  const { user } = useUser();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [average, setAverage] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    async function fetchRatings() {
      setLoading(true);
      const { data, error } = await supabase
        .from("ratings")
        .select("rating, user_id")
        .eq("snippet_id", snippetId);

      if (data) {
        setCount(data.length);
        setAverage(
          data.length ? data.reduce((sum, r) => sum + r.rating, 0) / data.length : 0
        );
        if (user) {
          const myRating = data.find((r) => r.user_id === user.id)?.rating;
          setUserRating(myRating ?? null);
        }
      }
      setLoading(false);
    }
    fetchRatings();
  }, [snippetId, user]);

  
  const handleRating = async (rating: number) => {
    if (!user) {
      toast.error("You must be logged in to rate.");
      return;
    }
    setUserRating(rating);
    const { error } = await supabase
      .from("ratings")
      .upsert(
        { user_id: user.id, snippet_id: snippetId, rating },
        { onConflict: "user_id,snippet_id" }
      );
    if (error) {
      console.error(error); 
      toast.error("Failed to submit rating");
    } else {
      toast.success("Thanks for rating!");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleRating(star)}
          className="text-2xl bg-primary text-amber-300"
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          {star <= (userRating ?? 0) ? "★" : "☆"}
        </button>
      ))}
      <span className="text-sm text-neutral-500">
        {loading ? "..." : `(${count} ratings, avg: ${average.toFixed(2)})`}
      </span>
    </div>
  );
}
