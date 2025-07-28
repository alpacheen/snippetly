// src/app/components/RealtimeCommentsSection.tsx
"use client";

import { useState } from "react";
import RealtimeCommentsList from "./RealtimeCommentsList";
import NewCommentForm from "./NewCommentForm";

type Props = {
  snippetId: string;
};

export default function RealtimeCommentsSection({ snippetId }: Props) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCommentAdded = () => {
    // The real-time subscription will handle the update automatically
    // This is just for backwards compatibility with the form
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      <RealtimeCommentsList snippetId={snippetId} />
      <NewCommentForm snippetId={snippetId} onCommentAdded={handleCommentAdded} />
    </div>
  );
}