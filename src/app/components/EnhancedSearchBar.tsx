"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Code, Hash, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SearchSuggestion {
  type: "language" | "tag" | "snippet";
  value: string;
  count?: number;
  id?: string;
}


class SearchCache {
  private cache = new Map<string, { data: SearchSuggestion[]; expiry: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  get(key: string): SearchSuggestion[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key: string, data: SearchSuggestion[]): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.TTL
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

const searchCache = new SearchCache();

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function EnhancedSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced query for API calls
  const debouncedQuery = useDebounce(query, 300);

  // Popular suggestions for empty search
  const popularSuggestions = useMemo(() => [
    { type: "language" as const, value: "JavaScript" },
    { type: "language" as const, value: "Python" },
    { type: "language" as const, value: "React" },
    { type: "tag" as const, value: "frontend" },
    { type: "tag" as const, value: "backend" },
    { type: "tag" as const, value: "utility" },
  ], []);

  // Optimized search function
  const searchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions(popularSuggestions);
      setLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = searchQuery.toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached) {
      setSuggestions(cached);
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      const searchPattern = `%${searchQuery}%`;

      // Single optimized query using text search
      const { data: snippets, error } = await supabase
        .from("snippets")
        .select("id, title, language")
        .or(`title.ilike.${searchPattern},language.ilike.${searchPattern}`)
        .limit(8)
        .abortSignal(abortControllerRef.current.signal);

      if (error) throw error;

      const suggestions: SearchSuggestion[] = [];

      // Add snippet suggestions
      if (snippets) {
        const uniqueLanguages = new Set<string>();
        
        snippets.forEach((snippet) => {
          // Add snippet suggestion
          suggestions.push({
            type: "snippet",
            value: snippet.title,
            id: snippet.id,
          });

          // Collect unique languages
          if (snippet.language.toLowerCase().includes(searchQuery.toLowerCase())) {
            uniqueLanguages.add(snippet.language);
          }
        });

        // Add language suggestions
        uniqueLanguages.forEach((lang) => {
          suggestions.push({
            type: "language",
            value: lang,
          });
        });
      }

      // Add common tags that match
      const matchingTags = ["frontend", "backend", "utility", "algorithm", "database"]
        .filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      matchingTags.forEach(tag => {
        suggestions.push({
          type: "tag",
          value: tag,
        });
      });

      const finalSuggestions = suggestions.slice(0, 8);
      searchCache.set(cacheKey, finalSuggestions);
      setSuggestions(finalSuggestions);

    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Search error:", error);
        setSuggestions(popularSuggestions);
      }
    } finally {
      setLoading(false);
    }
  }, [popularSuggestions]);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (showSuggestions) {
      searchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, showSuggestions, searchSuggestions]);

  const handleSearch = useCallback((searchQuery: string, suggestionType?: string) => {
    if (!searchQuery.trim()) return;

    const params = new URLSearchParams(searchParams);

    // Clear existing search params
    params.delete("q");
    params.delete("language");
    params.delete("tag");
    params.delete("page");

    // Set appropriate parameter based on suggestion type
    if (suggestionType === "language") {
      params.set("language", searchQuery);
    } else if (suggestionType === "tag") {
      params.set("tag", searchQuery);
    } else {
      params.set("q", searchQuery);
    }

    router.push(`/snippets?${params.toString()}`);
    setShowSuggestions(false);
    inputRef.current?.blur();
  }, [router, searchParams]);

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === "snippet" && suggestion.id) {
      router.push(`/snippets/${suggestion.id}`);
    } else {
      handleSearch(suggestion.value, suggestion.type);
    }
    setQuery(suggestion.value);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  }, [router, handleSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : -1
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > -1 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch(query);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, handleSuggestionClick, handleSearch, query]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    if (!showSuggestions) {
      setShowSuggestions(true);
    }
  }, [showSuggestions]);

  const handleFocus = useCallback(() => {
    setShowSuggestions(true);
    if (!debouncedQuery) {
      setSuggestions(popularSuggestions);
    }
  }, [debouncedQuery, popularSuggestions]);

  const clearQuery = useCallback(() => {
    setQuery("");
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getSuggestionIcon = useCallback((type: SearchSuggestion["type"]) => {
    switch (type) {
      case "language":
        return <Code className="w-4 h-4 text-blue-500" />;
      case "tag":
        return <Hash className="w-4 h-4 text-green-500" />;
      case "snippet":
        return <Search className="w-4 h-4 text-purple-500" />;
    }
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search snippets, languages, tags..."
          className="w-full pl-10 pr-12 py-3 border border-textSecondary rounded-lg bg-primary text-text placeholder-textSecondary focus:border-lightGreen focus:outline-none focus:ring-2 focus:ring-lightGreen/20 transition-colors"
          autoComplete="off"
        />

        {query && (
          <button
            onClick={clearQuery}
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
            <div className="p-4 text-center">
              <Loader2 className="w-5 h-5 animate-spin text-lightGreen mx-auto mb-2" />
              <p className="text-sm text-textSecondary">Searching...</p>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-textSecondary/20 last:border-b-0 ${
                  index === selectedIndex
                    ? "bg-lightGreen/10 text-lightGreen"
                    : "hover:bg-textSecondary/10"
                }`}
              >
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-grow min-w-0">
                  <span className="text-text truncate block">
                    {suggestion.value}
                  </span>
                  <span className="text-xs text-textSecondary capitalize">
                    {suggestion.type === "snippet" ? "Snippet" : suggestion.type}
                  </span>
                </div>
              </button>
            ))
          ) : query.length > 0 ? (
            <div className="p-4 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50 text-textSecondary" />
              <p className="text-sm text-textSecondary">
                Press Enter to search for "{query}"
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}