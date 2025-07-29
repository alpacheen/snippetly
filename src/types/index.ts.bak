// src/types/index.ts

export interface User {
    id: string;
    email: string;
    user_metadata: {
      display_name?: string;
      username?: string;
      avatar_url?: string;
      [key: string]: any;
    };
    created_at: string;
    updated_at: string;
  }
  
  export interface Profile {
    id: string;
    username: string;
    bio?: string;
    avatar_url?: string;
    created_at: string;
    updated_at?: string;
  }
  
  export interface Snippet {
    id: string;
    title: string;
    description: string;
    code: string;
    language: string;
    tags: string[];
    user_id: string;
    created_at: string;
    updated_at: string;
    // Computed fields
    rating?: number;
    ratings_count?: number;
    author?: Pick<Profile, 'username' | 'avatar_url'>;
  }
  
  export interface Comment {
    id: string;
    snippet_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at?: string;
    // Computed fields
    username?: string;
    author?: Pick<Profile, 'username' | 'avatar_url'>;
  }
  
  export interface Rating {
    id: string;
    snippet_id: string;
    user_id: string;
    rating: number;
    created_at: string;
    updated_at?: string;
  }
  
  export interface SnippetWithStats extends Snippet {
    rating: number;
    ratings_count: number;
    comments_count: number;
  }
  
  // Form types
  export interface CreateSnippetForm {
    title: string;
    description: string;
    code: string;
    language: string;
    tags: string[];
  }
  
  export interface UpdateProfileForm {
    username: string;
    bio?: string;
    avatar_url?: string;
  }
  
  export interface AuthForm {
    email: string;
    password: string;
    displayName?: string;
  }
  
  // API Response types
  export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    success: boolean;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    count: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  }
  
  // Search and filter types
  export interface SearchParams {
    q?: string;
    tab?: 'All' | 'Language' | 'Tags';
    language?: string;
    tag?: string;
    page?: number;
    sort?: 'newest' | 'oldest' | 'rating' | 'popular';
  }
  
  export interface FilterOptions {
    languages: string[];
    tags: string[];
    sortOptions: Array<{
      value: SearchParams['sort'];
      label: string;
    }>;
  }
  
  // Component prop types
  export interface ComponentWithChildren {
    children: React.ReactNode;
  }
  
  export interface ComponentWithClassName {
    className?: string;
  }
  
  export interface LoadingState {
    loading: boolean;
    error?: string | null;
  }
  
  // Error types
  export interface AppError extends Error {
    code?: string;
    status?: number;
    context?: Record<string, any>;
  }
  
  export interface ValidationError {
    field: string;
    message: string;
  }
  
  // Constants
  export const SUPPORTED_LANGUAGES = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C#',
    'Ruby',
    'Go',
    'PHP',
    'C++',
    'Swift',
    'Kotlin',
    'Rust',
    'Dart',
    'Scala',
    'Shell',
    'HTML',
    'CSS',
    'SQL',
    'JSON',
    'YAML',
    'XML',
  ] as const;
  
  export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
  
  export const COMMON_TAGS = [
    'frontend',
    'backend',
    'utility',
    'algorithm',
    'database',
    'api',
    'authentication',
    'validation',
    'animation',
    'responsive',
    'hooks',
    'components',
    'styling',
    'optimization',
    'security',
    'testing',
    'deployment',
    'debugging',
  ] as const;
  
  export type CommonTag = typeof COMMON_TAGS[number];
  
  // Database table names (for consistency)
  export const TABLES = {
    PROFILES: 'profiles',
    SNIPPETS: 'snippets',
    COMMENTS: 'comments',
    RATINGS: 'ratings',
  } as const;
  
  // Auth provider types
  export type AuthProvider = 'github' | 'google';
  
  // Theme types
  export type Theme = 'light' | 'dark';
  
  // Sort directions
  export type SortDirection = 'asc' | 'desc';
  
  // Event handler types
  export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
  export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
  export type KeyboardHandler = (event: React.KeyboardEvent<HTMLElement>) => void;