"use client";
import React, {useState} from "react";
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
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(null);

  const handleRatingChange = async (newRating: number) => {
    setRating(newRating);

    const updatedRating = (
      (currentRating * ratingsCount + newRating) /
      (ratingsCount + 1)
    ).toFixed(2);


    const { error } = await supabase
      .from("snippets")
      .update({
        rating: updatedRating,
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
        className="text-2xl bg-amber-300">
          {star <= (hover || rating) ? "★" : "☆"}
        </button>
      ))}
      <span className="text-sm text-neutral-500">({ratingsCount} ratings)</span>
    </div>
  );
}
