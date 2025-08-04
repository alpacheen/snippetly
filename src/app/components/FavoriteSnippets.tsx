"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Heart,
  Star,
  Code,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface FavoriteSnippet {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  user_id: string;
  created_at: string;
  rating?: number;
  ratings_count?: number;
  author?: { username: string; avatar_url?: string };
  favorited_at: string;
}

interface FavoriteSnippetsProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function FavoriteSnippets({
  userId,
  isOwnProfile,
}: FavoriteSnippetsProps) {
  const [favorites, setFavorites] = useState<FavoriteSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching favorites for user:", userId);

      
      const { data: favoriteRecords, error: favoritesError } = await supabase
        .from("favorites")
        .select("snippet_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (favoritesError) {
        console.error("Error fetching favorite records:", favoritesError);
        setError(`Failed to load favorites: ${favoritesError.message}`);
        return;
      }

      console.log("Favorite records:", favoriteRecords);

      if (!favoriteRecords || favoriteRecords.length === 0) {
        setFavorites([]);
        return;
      }

      
      const snippetIds = favoriteRecords.map((fav) => fav.snippet_id);

      const { data: snippetsData, error: snippetsError } = await supabase
        .from("snippets")
        .select(
          `
          id,
          title,
          description,
          language,
          tags,
          user_id,
          created_at,
          rating,
          ratings_count
        `
        )
        .in("id", snippetIds);

      if (snippetsError) {
        console.error("Error fetching snippet details:", snippetsError);
        setError(`Failed to load snippet details: ${snippetsError.message}`);
        return;
      }

      console.log("Snippets data:", snippetsData);

      
      const authorIds = [...new Set(snippetsData?.map((s) => s.user_id) || [])];

      const { data: authorsData, error: authorsError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", authorIds);

      if (authorsError) {
        console.warn(
          "Error fetching authors (continuing without):",
          authorsError
        );
      }

      console.log("Authors data:", authorsData);

      // Step 4: Combine all the data
      const transformedFavorites: FavoriteSnippet[] =
        snippetsData?.map((snippet) => {
          const favorite = favoriteRecords.find(
            (fav) => fav.snippet_id === snippet.id
          );
          const author = authorsData?.find(
            (author) => author.id === snippet.user_id
          );

          return {
            ...snippet,
            favorited_at: favorite?.created_at || snippet.created_at,
            author: author
              ? {
                  username: author.username,
                  avatar_url: author.avatar_url,
                }
              : undefined,
          };
        }) || [];

      // Sort by favorited date
      transformedFavorites.sort(
        (a, b) =>
          new Date(b.favorited_at).getTime() -
          new Date(a.favorited_at).getTime()
      );

      console.log("Final favorites:", transformedFavorites);
      setFavorites(transformedFavorites);
    } catch (error) {
      console.error("Unexpected error fetching favorites:", error);
      setError("An unexpected error occurred while loading favorites");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    }
  }, [fetchFavorites, userId]);

  const handleRemoveFavorite = async (snippetId: string) => {
    try {
      console.log("Removing favorite:", { userId, snippetId });

      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("snippet_id", snippetId);

      if (error) {
        console.error("Error removing favorite:", error);
        toast.error("Failed to remove from favorites");
        return;
      }

      // Update local state
      setFavorites((prev) => prev.filter((fav) => fav.id !== snippetId));
      toast.success("Removed from favorites");
    } catch (error) {
      console.error("Unexpected error removing favorite:", error);
      toast.error("An unexpected error occurred");
    }
  };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString("en-US", {
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //   });
  // };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lightGreen"></div>
          <span className="text-textSecondary">Loading favorites...</span>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-primary border border-textSecondary rounded-lg p-6"
          >
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-300 rounded w-20"></div>
              <div className="h-6 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text mb-2">
          Error Loading Favorites
        </h3>
        <p className="text-red-500 mb-4">{error}</p>
        <div className="space-y-2">
          <button
            onClick={fetchFavorites}
            className="px-4 py-2 bg-lightGreen text-primary rounded hover:bg-lightGreen/80 transition-colors"
          >
            Try Again
          </button>
          <div className="text-xs text-textSecondary">
            Check the browser console for more details
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-textSecondary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text mb-2">
          {isOwnProfile ? "No favorite snippets yet" : "No favorite snippets"}
        </h3>
        <p className="text-textSecondary mb-6">
          {isOwnProfile
            ? "Start favoriting snippets to build your collection of useful code!"
            : "This user hasn't favorited any snippets yet."}
        </p>
        {isOwnProfile && (
          <Link
            href="/snippets"
            className="inline-flex items-center gap-2 px-4 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors"
          >
            Browse Snippets
            <ExternalLink className="w-4 h-4" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Favorite Snippets ({favorites.length})
        </h2>
      </div>

      <div className="space-y-4">
        {favorites.map((snippet) => (
          <div
            key={snippet.id}
            className="bg-primary border border-textSecondary rounded-lg p-6 hover:border-lightGreen/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <Link href={`/snippets/${snippet.id}`} className="block group">
                  <h3 className="text-lg font-semibold text-text group-hover:text-lightGreen transition-colors mb-2">
                    {snippet.title}
                  </h3>
                </Link>

                {snippet.description && (
                  <p className="text-textSecondary text-sm mb-3 line-clamp-2">
                    {snippet.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-textSecondary mb-3">
                  <div className="flex items-center gap-1">
                    <Code className="w-4 h-4" />
                    <span>{snippet.language}</span>
                  </div>

                  {snippet.author && <span>by {snippet.author.username}</span>}

                  {/* <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Favorited {formatDate(snippet.favorited_at)}</span>
                  </div> */}

                  {snippet.rating && snippet.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-300 fill-current" />
                      <span>{snippet.rating.toFixed(1)}</span>
                      {snippet.ratings_count && (
                        <span className="text-xs">
                          ({snippet.ratings_count})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {snippet.tags && snippet.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {snippet.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-darkGreen text-text rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {snippet.tags.length > 3 && (
                      <span className="px-2 py-1 bg-textSecondary/20 text-textSecondary rounded text-xs">
                        +{snippet.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/snippets/${snippet.id}`}
                  className="p-2 text-textSecondary hover:text-lightGreen transition-colors"
                  title="View snippet"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>

                {isOwnProfile && (
                  <button
                    onClick={() => handleRemoveFavorite(snippet.id)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    title="Remove from favorites"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
