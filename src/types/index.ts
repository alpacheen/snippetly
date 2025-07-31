export interface User {
  id: string;
  email: string;
  user_metadata: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
    [key: string]: unknown;
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
  rating?: number;
  ratings_count?: number;
  author?: Pick<Profile, "username" | "avatar_url">;
}

export interface Comment {
  id: string;
  snippet_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  username?: string;
  author?: Pick<Profile, "username" | "avatar_url">;
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

// Fixed SearchParams to be fully compatible with Next.js
export interface SearchParams {
  [key: string]: string | string[] | undefined;
  q?: string | string[];
  tab?: string | string[];
  language?: string | string[];
  tag?: string | string[];
  page?: string | string[];
  sort?: string | string[];
}

export interface FilterOptions {
  languages: string[];
  tags: string[];
  sortOptions: Array<{
    value: string;
    label: string;
  }>;
}

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

export interface AppError extends Error {
  code?: string;
  status?: number;
  context?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const SUPPORTED_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
  "Ruby",
  "Go",
  "PHP",
  "C++",
  "Swift",
  "Kotlin",
  "Rust",
  "Dart",
  "Scala",
  "Shell",
  "HTML",
  "CSS",
  "SQL",
  "JSON",
  "YAML",
  "XML",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const COMMON_TAGS = [
  "frontend",
  "backend",
  "utility",
  "algorithm",
  "database",
  "api",
  "authentication",
  "validation",
  "animation",
  "responsive",
  "hooks",
  "components",
  "styling",
  "optimization",
  "security",
  "testing",
  "deployment",
  "debugging",
] as const;

export type CommonTag = (typeof COMMON_TAGS)[number];

export const TABLES = {
  PROFILES: "profiles",
  SNIPPETS: "snippets",
  COMMENTS: "comments",
  RATINGS: "ratings",
} as const;

export type AuthProvider = "github" | "google";
export type Theme = "light" | "dark";
export type SortDirection = "asc" | "desc";

export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler = (
  event: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
export type KeyboardHandler = (event: React.KeyboardEvent<HTMLElement>) => void;