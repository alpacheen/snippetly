// "use client";

// import { supabase } from "@/lib/supabase";
// import { useEffect, useState } from "react";

// type Comment = {
//   id: string;
//   snippet_id: string;
//   user_id: string;
//   content: string;
//   created_at: string;
//   username?: string;
// };

// type Props = {
//   snippetId: string;
//   refreshTrigger?: number;
// };

// export default function CommentsList({ snippetId, refreshTrigger }: Props) {
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const { data: commentsData, error: commentsError } = await supabase
//           .from("comments")
//           .select("id, user_id, content, created_at, snippet_id")
//           .eq("snippet_id", snippetId)
//           .order("created_at", { ascending: false });

//         if (commentsError) {
//           console.error("Error fetching comments:", commentsError);
//           setError(`Error loading comments: ${commentsError.message}`);
//           return;
//         }

//         if (!commentsData || commentsData.length === 0) {
//           setComments([]);
//           return;
//         }

//         const userIds = [
//           ...new Set(commentsData.map((comment) => comment.user_id)),
//         ];

//         const { data: profilesData, error: profilesError } = await supabase
//           .from("profiles")
//           .select("id, username")
//           .in("id", userIds);

//         if (profilesError) {
//           console.warn("Error fetching profiles:", profilesError);
//           setComments(commentsData);
//           return;
//         }

//         const userMap = new Map(
//           profilesData?.map((profile) => [profile.id, profile.username]) || []
//         );

//         const commentsWithUsernames = commentsData.map((comment) => ({
//           ...comment,
//           username: userMap.get(comment.user_id) || "Anonymous",
//         }));

//         setComments(commentsWithUsernames);
//       } catch (error) {
//         console.error("Unexpected error fetching comments:", error);
//         setError("Unexpected error loading comments");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (snippetId) {
//       fetchComments();
//     }
//   }, [snippetId, refreshTrigger]);

//   if (loading) {
//     return <p className="text-neutral-500">Loading comments...</p>;
//   }

//   if (error) {
//     return (
//       <div className="text-red-500">
//         <p>{error}</p>
//         <p className="text-sm mt-2">
//           Check the browser console for more details.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="mt-8">
//       <h2 className="text-lg font-bold mb-2">Comments ({comments.length})</h2>
//       {comments.length === 0 && (
//         <p className="text-neutral-500">No comments yet. Be the first!</p>
//       )}
//       <ul className="space-y-4">
//         {comments.map((comment) => (
//           <li key={comment.id} className="border rounded p-4">
//             <p className="text-sm text-textSecondary">{comment.content}</p>
//             <p className="text-xs text-neutral-400 mt-1">
//               - {comment.username} on{" "}
//               {new Date(comment.created_at).toLocaleString()}
//             </p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
// src/app/components/CommentsList.tsx 
// src/app/components/CommentsList.tsx - SIMPLE VERSION
"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Avatar } from "@/app/components/SafeImage";
import { MessageCircle, AlertCircle } from "lucide-react";

type Comment = {
  id: string;
  snippet_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
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

        console.log('Fetching comments for snippet:', snippetId);

        // Step 1: Get comments
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .eq("snippet_id", snippetId)
          .order("created_at", { ascending: false });

        if (commentsError) {
          console.error("Error fetching comments:", commentsError);
          setError(`Comments error: ${commentsError.message}`);
          return;
        }

        console.log('Comments data:', commentsData);

        if (!commentsData || commentsData.length === 0) {
          setComments([]);
          return;
        }

        // Step 2: Get user profiles for each comment
        const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
        console.log('User IDs to fetch:', userIds);

        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);

        if (profilesError) {
          console.warn("Error fetching profiles:", profilesError);
          // Still show comments even without usernames
          setComments(commentsData.map(comment => ({
            ...comment,
            username: "Anonymous",
            avatar_url: ""
          })));
          return;
        }

        console.log('Profiles data:', profilesData);

        // Step 3: Merge comments with user data
        const userMap = new Map(
          (profilesData || []).map(profile => [profile.id, profile])
        );

        const enrichedComments = commentsData.map(comment => ({
          ...comment,
          username: userMap.get(comment.user_id)?.username || "Anonymous",
          avatar_url: userMap.get(comment.user_id)?.avatar_url || ""
        }));

        console.log('Enriched comments:', enrichedComments);
        setComments(enrichedComments);

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
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm underline mt-2 hover:no-underline"
          >
            Try refreshing the page
          </button>
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
                {/* Avatar */}
                <Avatar
                  src={comment.avatar_url}
                  alt={comment.username || "Anonymous"}
                  size={36}
                  fallbackText={comment.username}
                  className="flex-shrink-0"
                />
                
                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-text">
                      {comment.username || "Anonymous"}
                    </span>
                    <span className="text-xs text-textSecondary">
                      •
                    </span>
                    <time className="text-xs text-textSecondary">
                      {formatDate(comment.created_at)}
                    </time>
                  </div>
                  
                  {/* Content */}
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