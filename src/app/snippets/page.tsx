// import { supabase } from "@/lib/supabase";
// import SnippetCard from "@/app/components/SnippetCard";
// import TabsFilter from "../components/TabsFilter";



// export const dynamic = "force-dynamic";

// export default async function SnippetsPage({searchParams, }:{ searchParams:{q?:string; language?: string; tab?: string; tag?: string}}) {
  
//   const tab = searchParams.tab || "All";

//   const {data: allSnippets, error: tagsError} = await supabase
//     .from("snippets")
//     .select("tags");

//     const allTags: string[] = Array.from(
//       new Set(allSnippets?.flatMap(snippet => snippet.tags || []))
//     )

//   let query = supabase.from("snippets").select("*");

//   if(tab === "Language" && searchParams.language) {
//     query = query.eq("language", searchParams.language);
//   } else if(tab === "Tags" && searchParams.tag) {
//     query = query.contains("tags", [searchParams.tag]);
//   } else {
//     query = query.ilike("title", `%${searchParams.q || ""}%`);
//   }
//   const { data: snippets, error } = await query.order("created_at", { ascending: false });

//   return (
//     <section className="space-y-6">
//       <h1 className="text-2xl font-bold">Browse Snippets</h1>
//       <TabsFilter tags={allTags} />
//       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {snippets?.map((snippet) => (
//           <SnippetCard
//             key={snippet.id}
//             title={snippet.title}
//             language={snippet.language}
//             href={`/snippets/${snippet.id}`}
//           />
//         ))}
//       </div>
//     </section>
//   );
// }
// src/app/snippets/page.tsx
import { supabase } from "@/lib/supabase";
import SnippetCard from "@/app/components/SnippetCard";
import TabsFilter from "../components/TabsFilter";
import { Trending, Star, Clock, Fire } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  language?: string;
  tab?: string;
  tag?: string;
  sort?: string;
};

export default async function SnippetsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const tab = searchParams.tab || "All";
  const sortBy = searchParams.sort || "recent";

  // Get all tags for the filter
  const { data: allSnippets } = await supabase
    .from("snippets")
    .select("tags");

  const allTags: string[] = Array.from(
    new Set(allSnippets?.flatMap(snippet => snippet.tags || []))
  );

  // Build the main query
  let query = supabase.from("snippets").select("*");

  // Apply filters
  if (tab === "Language" && searchParams.language) {
    query = query.eq("language", searchParams.language);
  } else if (tab === "Tags" && searchParams.tag) {
    query = query.contains("tags", [searchParams.tag]);
  } else if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`);
  }

  // Apply sorting
  switch (sortBy) {
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "popular":
      query = query.order("ratings_count", { ascending: false });
      break;
    case "recent":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data: snippets, error } = await query;

  // Get trending snippets (most rated in last 7 days)
  const { data: trending } = await supabase
    .from("snippets")
    .select("*")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("ratings_count", { ascending: false })
    .limit(4);

  // Get featured snippets (highest rated)
  const { data: featured } = await supabase
    .from("snippets")
    .select("*")
    .gte("rating", 4.5)
    .order("rating", { ascending: false })
    .limit(4);

  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Discover Amazing Code Snippets</h1>
        <p className="text-textSecondary max-w-2xl mx-auto">
          Browse through thousands of hand-picked code snippets from developers worldwide
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-brand-secondary rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-lightGreen">{snippets?.length || 0}</div>
          <div className="text-sm text-textSecondary">Total Snippets</div>
        </div>
        <div className="bg-brand-secondary rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-lightGreen">{allTags.length}</div>
          <div className="text-sm text-textSecondary">Categories</div>
        </div>
        <div className="bg-brand-secondary rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-lightGreen">{trending?.length || 0}</div>
          <div className="text-sm text-textSecondary">Trending</div>
        </div>
        <div className="bg-brand-secondary rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-lightGreen">{featured?.length || 0}</div>
          <div className="text-sm text-textSecondary">Featured</div>
        </div>
      </div>

      {/* Trending Section */}
      {trending && trending.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Fire className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold">Trending This Week</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trending.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                title={snippet.title}
                language={snippet.language}
                href={`/snippets/${snippet.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Featured Section */}
      {featured && featured.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold">Featured Snippets</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                title={snippet.title}
                language={snippet.language}
                href={`/snippets/${snippet.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Browse Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Browse All Snippets</h2>
          <select 
            className="px-3 py-2 border rounded-lg bg-primary text-text"
            defaultValue={sortBy}
            onChange={(e) => {
              const params = new URLSearchParams(window.location.search);
              params.set('sort', e.target.value);
              window.location.search = params.toString();
            }}
          >
            <option value="recent">Latest</option>
            <option value="rating">Highest Rated</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        <TabsFilter tags={allTags} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {snippets?.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              title={snippet.title}
              language={snippet.language}
              href={`/snippets/${snippet.id}`}
            />
          ))}
        </div>

        {snippets?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-textSecondary">No snippets found matching your criteria.</p>
          </div>
        )}
      </div>
    </section>
  );
}
