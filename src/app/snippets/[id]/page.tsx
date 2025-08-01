// import { supabase } from "@/lib/supabase";
// import { notFound } from "next/navigation";
// import CodeBlock from "@/app/components/CodeBlock";
// import StarRating from "@/app/components/StarRating";
// import CommentsSection from "@/app/components/CommentsSection";

// export const dynamic = "force-dynamic";

// function getFileExtension(language: string): string {
//   const extensions: Record<string, string> = {
//     'javascript': 'js',
//     'typescript': 'ts',
//     'python': 'py',
//     'java': 'java',
//     'cpp': 'cpp',
//     'c': 'c',
//     'csharp': 'cs',
//     'php': 'php',
//     'ruby': 'rb',
//     'go': 'go',
//     'rust': 'rs',
//     'swift': 'swift',
//     'kotlin': 'kt',
//     'dart': 'dart',
//     'html': 'html',
//     'css': 'css',
//     'scss': 'scss',
//     'json': 'json',
//     'yaml': 'yml',
//     'xml': 'xml',
//     'sql': 'sql',
//     'shell': 'sh',
//     'bash': 'sh'
//   };
//   return extensions[language.toLowerCase()] || 'txt';
// }

// export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;

//   try {
//     const { data: snippet } = await supabase
//     .from("snippets")
//     .select("title, description")
//     .eq("id", id)
//     .single();

//   if (!snippet) {
//     return { title: "Snippet Not Found | Snippetly" };
//   }

//   return {
//     title: `${snippet.title} | Snippetly`,
//     description: snippet.description,
//     openGraph: {
//       images: [
//         {
//           url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${encodeURIComponent(snippet.title)}`,
//           width: 1200,
//           height: 630,
//           alt: snippet.title,
//         },
//       ],
//     },
//   };
// } catch (error) {
//     console.error("Error fetching snippet for metadata:", error);
//     return { title: "Snippet | Snippetly" };
//   }
// }

// // Type for our processed snippet
// interface ProcessedSnippet {
//   id: string;
//   title: string;
//   description: string;
//   code: string;
//   language: string;
//   tags: string[];
//   user_id: string;
//   created_at: string;
//   rating?: number;
//   ratings_count?: number;
//   author?: {
//     username: string;
//     avatar_url?: string;
//   };
// }

// export default async function SnippetDetailPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;

//   try{
//     const { data: rawSnippet, error } = await supabase
//     .from("snippets")
//     .select(`
//       id,
//       title,
//       description,
//       code,
//       language,
//       tags,
//       user_id,
//       created_at,
//       rating,
//       ratings_count,
//       profiles (
//         username,
//         avatar_url
//       )
//     `)
//     .eq("id", id)
//     .single();

//   if (error || !rawSnippet) {
//     console.error("Error fetching snippet:", error);
//     notFound();
//   }

//   // Process the raw data to handle profiles array
//   const snippet: ProcessedSnippet = {
//     ...rawSnippet,
//     author: rawSnippet.profiles && Array.isArray(rawSnippet.profiles) && rawSnippet.profiles.length > 0 
//       ? rawSnippet.profiles[0] 
//       : undefined
//   };

// return (
//   <article className="prose lg:prose-xl max-w-4xl mx-auto py-8">
//     {/* Header */}
//     <div className="not-prose mb-8">
//       <h1 className="text-3xl font-bold text-text mb-4">{snippet.title}</h1>
      
//       {snippet.description && (
//         <p className="text-lg text-textSecondary mb-4">{snippet.description}</p>
//       )}
      
//       {/* Metadata */}
//       <div className="flex items-center gap-4 text-sm text-textSecondary mb-6">
//         <span className="px-2 py-1 bg-darkGreen text-text rounded text-xs">
//           {snippet.language}
//         </span>
//         {snippet.author?.username && (
//           <span>by {snippet.author.username}</span>
//         )}
//         <span>{new Date(snippet.created_at).toLocaleDateString()}</span>
//       </div>
      
//       {/* Tags */}
//       {snippet.tags && snippet.tags.length > 0 && (
//         <div className="flex flex-wrap gap-2 mb-6">
//           {snippet.tags.map((tag: string) => (
//             <span
//               key={tag}
//               className="px-2 py-1 bg-textSecondary/20 text-textSecondary rounded text-xs"
//             >
//               #{tag}
//             </span>
//           ))}
//         </div>
//       )}
//     </div>

//     {/*Code Block */}
//     <div className="not-prose mb-8">
//       <CodeBlock 
//         code={snippet.code} 
//         language={snippet.language}
//         title={snippet.title}
//         fileName={`${snippet.title.toLowerCase().replace(/\s+/g, '-')}.${getFileExtension(snippet.language)}`}
//         snippetId={snippet.id}
//         showLineNumbers={true}
//       />
//     </div>

//     {/* Rating */}
//     <div className="not-prose mb-8">
//       <StarRating snippetId={snippet.id} />
//     </div>

//     {/* Real-time Comments */}
//     <div className="not-prose">
//       <CommentsSection snippetId={snippet.id} />
//     </div>
//   </article>
// );
// } catch (error) {
// console.error('Unexpected error:', error);
// notFound();
// }
// }
import { generateSEOMetadata } from '@/app/components/SEOHead';
import { SnippetStructuredData } from '@/app/components/SnippetStructuredData';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { data: snippet } = await supabase
      .from("snippets")
      .select(`
        title,
        description,
        language,
        tags,
        created_at,
        updated_at,
        profiles (username)
      `)
      .eq("id", id)
      .single();

    if (!snippet) {
      return generateSEOMetadata({
        title: "Snippet Not Found | Snippetly",
        description: "The code snippet you're looking for doesn't exist.",
      });
    }

    const author = Array.isArray(snippet.profiles) && snippet.profiles.length > 0 
      ? snippet.profiles[0].username 
      : undefined;

    return generateSEOMetadata({
      title: `${snippet.title} | Snippetly`,
      description: snippet.description || `A ${snippet.language} code snippet shared on Snippetly`,
      url: `/snippets/${id}`,
      type: 'article',
      publishedTime: snippet.created_at,
      modifiedTime: snippet.updated_at,
      tags: snippet.tags || [],
      author,
      language: snippet.language,
    });
  } catch (error) {
    console.error("Error fetching snippet for metadata:", error);
    return generateSEOMetadata({
      title: "Code Snippet | Snippetly",
      description: "Discover and learn from community-shared code snippets.",
    });
  }
}