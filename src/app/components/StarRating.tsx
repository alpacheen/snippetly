"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Props = {
  snippetId: string;
  currentRating: number;
  ratingsCount: number;
};

export default function StarRating({
  snippetId,
  currentRating,
  ratingsCount,
}: Props) {
  const [hover, setHover] = useState<number>(0);
  const [rating, setRating] = useState<number | null>(null);

  const handleRatingChange = async (newRating: number) => {
    setRating(newRating);

    const updatedRating = (
      (currentRating * ratingsCount + newRating) /
      (ratingsCount + 1)
    ).toFixed(2);

    const { error } = await supabase
      .from("snippets")
      .update({
        rating: parseFloat(updatedRating),
        ratings_count: ratingsCount + 1,
      })
      .eq("id", snippetId);

    if (error) {
      console.error("Error updating rating:", error);
      toast.error("Error submitting rating");
    } else {
      toast.success("Thanks for rating!");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleRatingChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          className="text-2xl bg-primary text-amber-300 hover:text-amber-400 transition-colors cursor-pointer"
        >
          {star <= (hover || rating || 0) ? "★" : "☆"}
        </button>
      ))}
      <span className="text-sm text-neutral-500">
        {currentRating.toFixed(1)} ({ratingsCount} ratings)
      </span>
    </div>
  );
}
