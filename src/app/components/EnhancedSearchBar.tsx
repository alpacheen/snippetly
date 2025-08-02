"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Code, Hash } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchSuggestion {
  type: "language" | "tag" | "snippet";
  value: string;
  count?: number;
  id?: string;
}

// Cache for suggestions to avoid repeated API calls
const suggestionCache = new Map<string, SearchSuggestion[]>();

export default function EnhancedSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce the query to reduce API calls
  const debouncedQuery = useDebounce(query, 300);

  // Memoized popular suggestions
  const popularSuggestions = useMemo(
    () => [
      { type: "language" as const, value: "JavaScript" },
      { type: "language" as const, value: "Python" },
      { type: "language" as const, value: "React" },
      { type: "tag" as const, value: "frontend" },
      { type: "tag" as const, value: "backend" },
      { type: "tag" as const, value: "utility" },
    ],
    []
  );

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions(popularSuggestions);
        return;
      }

      // Check cache first
      const cacheKey = debouncedQuery.toLowerCase();
      if (suggestionCache.has(cacheKey)) {
        setSuggestions(suggestionCache.get(cacheKey)!);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);

      try {
        const suggestions: SearchSuggestion[] = [];

        const searchPattern = `%${debouncedQuery}%`;

        const { data: snippets } = await supabase
          .from("snippets")
          .select("id, title, language")
          .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
          .limit(3);

        if (snippets) {
          snippets.forEach((snippet) => {
            suggestions.push({
              type: "snippet",
              value: snippet.title,
              id: snippet.id,
            });
          });
        }

        
        const { data: languages } = await supabase
          .from("snippets")
          .select("language")
          .ilike("language", searchPattern)
          .limit(5);

        if (languages) {
          const uniqueLanguages = [
            ...new Set(languages.map((l) => l.language)),
          ];
          uniqueLanguages.slice(0, 3).forEach((lang) => {
            suggestions.push({
              type: "language",
              value: lang,
            });
          });
        }

        // Cache the results
        const finalSuggestions = suggestions.slice(0, 8);
        suggestionCache.set(cacheKey, finalSuggestions);
        setSuggestions(finalSuggestions);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error fetching suggestions:", error);
          // Fallback to popular suggestions on error
          setSuggestions(popularSuggestions);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, popularSuggestions]);

  const handleSearch = (searchQuery: string, suggestionType?: string) => {
    if (!searchQuery.trim()) return;

    const params = new URLSearchParams(searchParams);

    if (suggestionType === "language") {
      params.set("language", searchQuery);
      params.delete("q");
    } else if (suggestionType === "tag") {
      params.set("tag", searchQuery);
      params.delete("q");
    } else {
      params.set("q", searchQuery);
      params.delete("language");
      params.delete("tag");
    }

    params.delete("page");

    router.push(`/snippets?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "snippet" && suggestion.id) {
      router.push(`/snippets/${suggestion.id}`);
    } else {
      handleSearch(suggestion.value, suggestion.type);
    }
    setQuery(suggestion.value);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(query);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const getSuggestionIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "language":
        return <Code className="w-4 h-4 text-blue-500" />;
      case "tag":
        return <Hash className="w-4 h-4 text-green-500" />;
      case "snippet":
        return <Search className="w-4 h-4 text-purple-500" />;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search snippets, languages, tags..."
          className="w-full pl-10 pr-12 py-3 border border-textSecondary rounded-lg bg-primary text-text placeholder-textSecondary focus:border-lightGreen focus:outline-none focus:ring-2 focus:ring-lightGreen/20 transition-colors"
        />

        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-textSecondary hover:text-text transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full mt-2 w-full bg-primary border border-textSecondary rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-center text-textSecondary">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lightGreen mx-auto"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.value}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-textSecondary/10 transition-colors border-b border-textSecondary/20 last:border-b-0"
                >
                  {getSuggestionIcon(suggestion.type)}
                  <div className="flex-grow min-w-0">
                    <span className="text-text truncate block">
                      {suggestion.value}
                    </span>
                    <span className="text-xs text-textSecondary capitalize">
                      {suggestion.type === "snippet"
                        ? "Snippet"
                        : suggestion.type}
                    </span>
                  </div>
                </button>
              ))}
            </>
          ) : query.length > 0 ? (
            <div className="p-4 text-center text-textSecondary">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Press Enter to search for &ldquo;{query}&rdquo;</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
