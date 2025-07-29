"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/app/components/SafeImage";
import { MessageCircle, AlertCircle } from "lucide-react";

type Comment = {
  id: string;
  snippet_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
};

interface RealtimeCommentsListProps {
  snippetId: string;
}

export default function RealtimeCommentsList({ snippetId }: RealtimeCommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!snippetId) return;

    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("comments")
          .select(`
            *,
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .eq("snippet_id", snippetId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching comments:", error);
          setError("Failed to load comments");
          return;
        }

        setComments(data || []);
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("Unexpected error loading comments");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();

    // Set up real-time subscription
    const channel = supabase
      .channel(`comments_${snippetId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `snippet_id=eq.${snippetId}`
        },
        async (payload) => {
          // Fetch the complete comment with profile data
          const { data: commentData } = await supabase
            .from('comments')
            .select(`
              *,
              profiles:user_id (
                username,
                avatar_url
              )
            `)
            .eq('id', (payload.new as any).id)
            .single();

          if (commentData) {
            setComments(current => [commentData, ...current]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [snippetId]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)}h ago`;
      if (diffInMinutes < 7 * 24 * 60) return `${Math.floor(diffInMinutes / (24 * 60))}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return "Unknown date";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-textSecondary py-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lightGreen"></div>
        <span>Loading comments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Error loading comments</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-textSecondary" />
        <h2 className="text-lg font-bold text-text">
          Comments ({comments.length})
        </h2>
      </div>
      
      {comments.length === 0 ? (
        <div className="text-center py-12 text-textSecondary">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-2">No comments yet</p>
          <p className="text-sm">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <article 
              key={comment.id} 
              className="bg-brand-secondary border border-textSecondary rounded-lg p-4 hover:border-lightGreen/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Avatar
                  src={comment.profiles?.avatar_url}
                  alt={comment.profiles?.username || "Anonymous"}
                  size={36}
                  fallbackText={comment.profiles?.username}
                  className="flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-text">
                      {comment.profiles?.username || "Anonymous"}
                    </span>
                    <span className="text-xs text-textSecondary">•</span>
                    <time className="text-xs text-textSecondary">
                      {formatDate(comment.created_at)}
                    </time>
                  </div>
                  
                  <div className="text-text leading-relaxed">
                    <p className="whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
