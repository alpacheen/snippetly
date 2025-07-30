"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Clock, Code, Hash } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SearchSuggestion {
  type: 'language' | 'tag' | 'snippet';
  value: string;
  count?: number;
  id?: string;
}

export default function EnhancedSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions based on query
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const suggestions: SearchSuggestion[] = [];

        // Get matching snippets
        const { data: snippets } = await supabase
          .from('snippets')
          .select('id, title, language')
          .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
          .limit(3);

        if (snippets) {
          snippets.forEach(snippet => {
            suggestions.push({
              type: 'snippet',
              value: snippet.title,
              id: snippet.id
            });
          });
        }

        // Get matching languages
        const { data: languages } = await supabase
          .from('snippets')
          .select('language')
          .ilike('language', `%${query}%`)
          .limit(3);

        if (languages) {
          const uniqueLanguages = [...new Set(languages.map(l => l.language))];
          uniqueLanguages.forEach(lang => {
            suggestions.push({
              type: 'language',
              value: lang
            });
          });
        }

        // Get matching tags
        const { data: tagSnippets } = await supabase
          .from('snippets')
          .select('tags')
          .limit(50);

        if (tagSnippets) {
          const allTags = tagSnippets.flatMap(s => s.tags || []);
          const matchingTags = [...new Set(allTags.filter(tag => 
            tag.toLowerCase().includes(query.toLowerCase())
          ))].slice(0, 3);
          
          matchingTags.forEach(tag => {
            suggestions.push({
              type: 'tag',
              value: tag
            });
          });
        }

        setSuggestions(suggestions.slice(0, 8));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (searchQuery: string, suggestionType?: string) => {
    if (!searchQuery.trim()) return;
    
    const params = new URLSearchParams(searchParams);
    
    if (suggestionType === 'language') {
      params.set('language', searchQuery);
      params.set('tab', 'Language');
      params.delete('q');
    } else if (suggestionType === 'tag') {
      params.set('tag', searchQuery);
      params.set('tab', 'Tags');
      params.delete('q');
    } else {
      params.set('q', searchQuery);
      params.delete('language');
      params.delete('tag');
      params.delete('tab');
    }
    
    params.delete('page'); // Reset to first page
    
    router.push(`/snippets?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'snippet' && suggestion.id) {
      router.push(`/snippets/${suggestion.id}`);
    } else {
      handleSearch(suggestion.value, suggestion.type);
    }
    setQuery(suggestion.value);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'language':
        return <Code className="w-4 h-4 text-blue-500" />;
      case 'tag':
        return <Hash className="w-4 h-4 text-green-500" />;
      case 'snippet':
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
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
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-textSecondary hover:text-text transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
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
                      {suggestion.type === 'snippet' ? 'Snippet' : suggestion.type}
                    </span>
                  </div>
                  {suggestion.count && (
                    <span className="text-xs text-textSecondary">
                      {suggestion.count}
                    </span>
                  )}
                </button>
              ))}
            </>
          ) : query.length > 0 ? (
            <div className="p-4 text-center text-textSecondary">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Press Enter to search for "{query}"</p>
            </div>
          ) : (
            <div className="p-4 text-center text-textSecondary">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Start typing to search snippets</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}