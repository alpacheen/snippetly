// "use client";
// import { supabase } from "@/lib/supabase";
// import { useEffect, useState } from "react";

// type Comment = {
//   id: string;
//   snippet_id: string;
//   author: string;
//   content: string;
//   created_at: string;
// };

// type Props = {
//   snippetId: string;
// };

// export default function CommentsList({ snippetId }: Props) {
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         setLoading(true);
//         const { data, error } = await supabase
//           .from("comments")
//           .select("id, author, content, created_at")
//           .eq("snippet_id", snippetId)
//           .order("created_at", { ascending: false });

//         if (error)
//           throw error;
//           setComments(data || []);
//       } catch (err) {
//         setError("Error loading comments");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchComments();
//   }, [snippetId]);

//   if (loading) {
//     return <p className="text-neutral-500">Loading comments...</p>;
//   }

//   if (error) {
//     return <p className="text-red-500">{error}</p>;
//   }

//   return (
//     <div className="mt-8">
//       <h2 className="text-lg font-bold mb-2">Comments</h2>
//       {comments.length === 0 && (
//         <p className="text-neutral-500">No comments yet. Be the first!</p>
//       )}
//       <ul className="space-y-4">
//         {comments.map((comment) => (
//           <li key={comment.id} className="border rounded p-4">
//             <p className="text-sm text-neutral-700">{comment.content}</p>
//             <p className="text-xs text-neutral-400 mt-1">
//               - {comment.author} on {" "}
//               {new Date(comment.created_at).toLocaleString()}
//             </p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";

type Comment = {
  id: string;
  snippet_id: string;
  author: string;
  content: string;
  created_at: string;
};

type Props = {
  snippetId: string;
};

export default function CommentsList({ snippetId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [snippetId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select("id, author, content, created_at")
        .eq("snippet_id", snippetId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">Comments</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded p-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">Comments</h2>
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchComments}
          className="mt-2 px-4 py-2 bg-darkGreen text-text rounded hover:bg-darkGreen/75"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-2">Comments ({comments.length})</h2>
      {comments.length === 0 ? (
        <p className="text-textSecondary">No comments yet. Be the first!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="border rounded p-4 hover:bg-gray-50 transition-colors">
              <p className="text-sm mb-2">{comment.content}</p>
              <p className="text-xs text-textSecondary">
                by {comment.author} • {new Date(comment.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}