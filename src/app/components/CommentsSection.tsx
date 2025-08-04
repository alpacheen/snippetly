"use client";

import { useState, useEffect, useCallback,  } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/app/components/SafeImage";
import {
  MessageCircle,
  AlertCircle,
  Reply,
  Trash2,
  Send,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  snippet_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
  author?: {
    username: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

interface CommentsProps {
  snippetId: string;
}

export default function CommentsSection({ snippetId }: CommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get comments without complex joins
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select(
          "id, snippet_id, user_id, content, parent_comment_id, created_at"
        )
        .eq("snippet_id", snippetId)
        .order("created_at", { ascending: true });

      if (commentsError) {
        throw commentsError;
      }

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        return;
      }

      // Get unique user IDs
      const userIds = [
        ...new Set(commentsData.map((comment) => comment.user_id)),
      ];

      // Get user profiles separately
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", userIds);

      // Combine comments with author info
      const commentsWithAuthors = commentsData.map((comment) => {
        const author = profilesData?.find(
          (profile) => profile.id === comment.user_id
        );
        return {
          ...comment,
          author: author
            ? {
                username: author.username,
                avatar_url: author.avatar_url,
              }
            : undefined,
        };
      });

      // Organize into threads
      const threaded = organizeComments(commentsWithAuthors);
      setComments(threaded);
    } catch (err: any) {
      console.error("Error fetching comments:", err);
      setError(err.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [snippetId]);

  const organizeComments = (flatComments: any[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create all comments
    flatComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into threads
    flatComments.forEach((comment) => {
      const processedComment = commentMap.get(comment.id)!;

      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(processedComment);
        }
      } else {
        rootComments.push(processedComment);
      }
    });

    return rootComments;
  };

  useEffect(() => {
    if (snippetId) {
      fetchComments();
    }
  }, [fetchComments, snippetId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("comments").insert({
        snippet_id: snippetId,
        user_id: user.id,
        content: newComment.trim(),
        parent_comment_id: null,
      });

      if (error) throw error;

      setNewComment("");
      toast.success("Comment posted!");
      await fetchComments();
    } catch (err: any) {
      console.error("Error posting comment:", err);
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user) {
      toast.error("Please sign in to reply");
      return;
    }

    if (!replyContent.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("comments").insert({
        snippet_id: snippetId,
        user_id: user.id,
        content: replyContent.trim(),
        parent_comment_id: parentId,
      });

      if (error) throw error;

      setReplyContent("");
      setReplyTo(null);
      toast.success("Reply posted!");
      await fetchComments();
    } catch (err: any) {
      console.error("Error posting reply:", err);
      toast.error("Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingComment(commentId);

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success("Comment deleted!");
      await fetchComments();
    } catch (err: any) {
      console.error("Error deleting comment:", err);
      toast.error("Failed to delete comment");
    } finally {
      setDeletingComment(null);
      setShowDeleteConfirm(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 24 * 60)
        return `${Math.floor(diffInMinutes / 60)}h ago`;
      if (diffInMinutes < 7 * 24 * 60)
        return `${Math.floor(diffInMinutes / (24 * 60))}d ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch {
      return "Unknown date";
    }
  };

  const DeleteButton = ({ comment }: { comment: Comment }) => {
    if (!user || user.id !== comment.user_id) return null;

    // Show delete confirmation popup
    if (showDeleteConfirm === comment.id) {
      return (
        <div className="relative">
          <div className="absolute right-0 top-0 bg-primary border border-textSecondary rounded-lg shadow-xl z-50 p-3 min-w-[200px]">
            <p className="text-sm text-text mb-3">Delete this comment?</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteComment(comment.id);
                }}
                disabled={deletingComment === comment.id}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                {deletingComment === comment.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                Delete
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(null);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-textSecondary text-primary rounded hover:bg-textSecondary/80 transition-colors text-sm"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDeleteConfirm(comment.id);
        }}
        className="p-1.5 text-textSecondary hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
        title="Delete comment"
        aria-label="Delete comment"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    );
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={`${isReply ? "ml-8 mt-4" : ""}`}>
      <article className="bg-brand-secondary border border-textSecondary rounded-lg p-4 hover:border-lightGreen/30 transition-colors">
        <div className="flex items-start gap-3">
          <Avatar
            src={comment.author?.avatar_url}
            alt={comment.author?.username || "Anonymous"}
            size={isReply ? 32 : 40}
            fallbackText={comment.author?.username}
            className="flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-text">
                  {comment.author?.username || "Anonymous"}
                </span>
                <span className="text-xs text-textSecondary">•</span>
                <time className="text-xs text-textSecondary">
                  {formatDate(comment.created_at)}
                </time>
              </div>

              <DeleteButton comment={comment} />
            </div>

            {/* Content */}
            <div className="text-text leading-relaxed mb-4">
              <p className="whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>

            {/* Reply button */}
            {user && !isReply && (
              <button
                onClick={() =>
                  setReplyTo(replyTo === comment.id ? null : comment.id)
                }
                className="flex items-center gap-2 text-sm text-textSecondary hover:text-lightGreen transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
            )}
          </div>
        </div>

        {/* Reply form */}
        {replyTo === comment.id && (
          <div className="mt-4 ml-12">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitReply(comment.id);
              }}
              className="space-y-3"
            >
              <div className="flex gap-3">
                <Avatar
                  src={user?.user_metadata?.avatar_url}
                  alt={
                    user?.user_metadata?.display_name || user?.email || "User"
                  }
                  size={32}
                  fallbackText={
                    user?.user_metadata?.display_name || user?.email
                  }
                  className="flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${
                      comment.author?.username || "this comment"
                    }...`}
                    className="w-full p-3 border border-textSecondary rounded-lg bg-primary text-text placeholder-textSecondary resize-none focus:border-lightGreen focus:outline-none focus:ring-2 focus:ring-lightGreen/20"
                    rows={3}
                    maxLength={1000}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between ml-11">
                <span className="text-xs text-textSecondary">
                  {replyContent.length}/1000 characters
                </span>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      !replyContent.trim() ||
                      replyContent.length > 1000
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        Post Reply
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContent("");
                    }}
                    disabled={submitting}
                    className="px-4 py-2 bg-textSecondary text-primary rounded-lg hover:bg-textSecondary/80 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </article>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-6">
          <Loader2 className="w-5 h-5 animate-spin text-lightGreen" />
          <span className="text-textSecondary">Loading comments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Error loading comments</p>
            <p className="text-sm mt-1 text-red-600">{error}</p>
            <button
              onClick={fetchComments}
              className="text-sm underline mt-2 hover:no-underline text-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0);
  }, 0);

  return (
    <div
      className="mt-8"
      onClick={() => setShowDeleteConfirm(null)} // Close delete popup when clicking outside
    >
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-textSecondary" />
        <h2 className="text-lg font-bold text-text">
          Comments ({totalComments})
        </h2>
      </div>

      {/* New comment form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-3">
            <Avatar
              src={user.user_metadata?.avatar_url}
              alt={user.user_metadata?.display_name || user.email || "User"}
              size={40}
              fallbackText={user.user_metadata?.display_name || user.email}
              className="flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this snippet..."
                className="w-full p-3 border border-textSecondary rounded-lg bg-primary text-text placeholder-textSecondary resize-none focus:border-lightGreen focus:outline-none focus:ring-2 focus:ring-lightGreen/20"
                rows={3}
                maxLength={1000}
                required
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-textSecondary">
                  {newComment.length}/1000 characters
                </span>
                <button
                  type="submit"
                  disabled={
                    submitting || !newComment.trim() || newComment.length > 1000
                  }
                  className="flex items-center gap-2 px-6 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 disabled:opacity-50 transition-colors font-medium"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Post Comment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-brand-secondary border border-textSecondary rounded-lg text-center">
          <MessageCircle className="w-12 h-12 text-textSecondary mx-auto mb-3 opacity-50" />
          <p className="text-textSecondary mb-4">
            Join the conversation! Sign in to share your thoughts and connect
            with other developers.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
          >
            Sign In to Comment
          </a>
        </div>
      )}

      {/* Comments list */}
      {totalComments === 0 ? (
        <div className="text-center py-16 text-textSecondary">
          <MessageCircle className="w-20 h-20 mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-semibold mb-2">No comments yet</h3>
          <p className="text-sm">
            Be the first to share your thoughts on this snippet!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
}
