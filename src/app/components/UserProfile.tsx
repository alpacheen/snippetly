"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Code,
  Star,
  Edit,
  Trash2,
  Plus,
  Eye,
  X,
  Save,
  Heart,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/app/components/SafeImage";
import FavoriteSnippets from "@/app/components/FavoriteSnippets";
import {
  withErrorHandling,
  validateForm,
  showValidationErrors,
} from "@/app/components/ErrorUtils";

type UserProfile = {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
};

type UserSnippet = {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  rating: number;
  ratings_count: number;
  created_at: string;
  updated_at: string;
};

type UserStats = {
  total_snippets: number;
  total_favorites: number;
  average_rating: number;
  total_comments: number;
};

const SNIPPETS_PER_PAGE = 12;

const SUPPORTED_LANGUAGES = [
  "JavaScript",
  "Python",
  "Java",
  "C#",
  "Ruby",
  "Go",
  "PHP",
  "TypeScript",
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
];

const COMMON_TAGS = [
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
];

const validationRules = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 200,
    message: "Title must be between 1-200 characters",
  },
  description: {
    maxLength: 1000,
    message: "Description must be less than 1000 characters",
  },
  code: {
    required: true,
    minLength: 1,
    message: "Code is required",
  },
  language: {
    required: true,
    message: "Please select a language",
  },
};

export default function UserProfile({
  userId,
  isOwnProfile = false,
}: {
  userId: string;
  isOwnProfile?: boolean;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [snippets, setSnippets] = useState<UserSnippet[]>([]);
  const [editingSnippet, setEditingSnippet] = useState<UserSnippet | null>(
    null
  );
  const [stats, setStats] = useState<UserStats | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("snippets");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSnippets, setTotalSnippets] = useState(0);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    code: "",
    language: "JavaScript",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Memoized pagination
  const paginatedSnippets = useMemo(() => {
    const startIndex = (currentPage - 1) * SNIPPETS_PER_PAGE;
    return snippets.slice(startIndex, startIndex + SNIPPETS_PER_PAGE);
  }, [snippets, currentPage]);

  const totalPages = useMemo(
    () => Math.ceil(totalSnippets / SNIPPETS_PER_PAGE),
    [totalSnippets]
  );

  const fetchUserProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, bio, avatar_url, created_at")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load user profile");
        return;
      }

      if (data) setProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Unexpected error loading profile");
    }
  }, [userId]);

  const fetchUserStats = useCallback(async () => {
    try {
      // Fetch comprehensive stats
      const [snippetsCount, favoritesCount, commentsCount, avgRating] =
        await Promise.all([
          // Total snippets
          supabase
            .from("snippets")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId),

          // Total favorites
          supabase
            .from("favorites")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId),

          // Total comments
          supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId),

          // Average rating of user's snippets
          supabase
            .from("snippets")
            .select("rating")
            .eq("user_id", userId)
            .not("rating", "is", null),
        ]);

      const avgRatingValue =
        avgRating.data && avgRating.data.length > 0
          ? avgRating.data.reduce(
              (sum, snippet) => sum + (snippet.rating || 0),
              0
            ) / avgRating.data.length
          : 0;

      setStats({
        total_snippets: snippetsCount.count || 0,
        total_favorites: favoritesCount.count || 0,
        total_comments: commentsCount.count || 0,
        average_rating: avgRatingValue,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  }, [userId]);

  const fetchUserSnippets = useCallback(async () => {
    try {
      // Get total count first
      const { count } = await supabase
        .from("snippets")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      setTotalSnippets(count || 0);

      // Fetch snippets with pagination
      const { data, error } = await supabase
        .from("snippets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(0, SNIPPETS_PER_PAGE * 2 - 1); // Load first 2 pages

      if (error) {
        console.error("Error fetching snippets:", error);
        toast.error("Failed to load snippets");
        return;
      }

      if (data) {
        setSnippets(data);
      }
    } catch (error) {
      console.error("Error in fetchUserSnippets:", error);
      toast.error("Unexpected error loading snippets");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchUserProfile(),
        fetchUserSnippets(),
        fetchUserStats(),
      ]);
    };
    loadData();
  }, [fetchUserProfile, fetchUserSnippets, fetchUserStats]);

  const handleEditSnippet = (snippet: UserSnippet) => {
    setEditingSnippet(snippet);
    setEditFormData({
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags || [],
    });
    setTagInput("");
  };

  const handleCancelEdit = () => {
    setEditingSnippet(null);
    setEditFormData({
      title: "",
      description: "",
      code: "",
      language: "JavaScript",
      tags: [],
    });
    setTagInput("");
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (
      cleanTag &&
      !editFormData.tags.includes(cleanTag) &&
      editFormData.tags.length < 10
    ) {
      setEditFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, cleanTag],
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      handleAddTag(tagInput.trim());
      setTagInput("");
    } else if (
      e.key === "Backspace" &&
      !tagInput &&
      editFormData.tags.length > 0
    ) {
      handleRemoveTag(editFormData.tags[editFormData.tags.length - 1]);
    }
  };

  const handleSaveSnippet = withErrorHandling(async () => {
    if (!editingSnippet) return;

    // Validate form
    const errors = validateForm(editFormData, validationRules);
    if (errors.length > 0) {
      showValidationErrors(errors);
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("snippets")
      .update({
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
        code: editFormData.code.trim(),
        language: editFormData.language,
        tags: editFormData.tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingSnippet.id)
      .eq("user_id", userId);

    if (error) throw error;

    toast.success("Snippet updated successfully");

    // Update local state
    const updatedSnippet = {
      ...editingSnippet,
      ...editFormData,
      updated_at: new Date().toISOString(),
    };

    setSnippets((prev) =>
      prev.map((snippet) =>
        snippet.id === editingSnippet.id ? updatedSnippet : snippet
      )
    );

    setEditingSnippet(null);
  }, "Update snippet");

  const handleDeleteSnippet = withErrorHandling(async (snippetId: string) => {
    const { error } = await supabase
      .from("snippets")
      .delete()
      .eq("id", snippetId)
      .eq("user_id", userId);

    if (error) throw error;

    toast.success("Snippet deleted successfully");
    setSnippets((prev) => prev.filter((snippet) => snippet.id !== snippetId));
    setDeleteConfirm(null);
    setTotalSnippets((prev) => prev - 1);

    // Update stats
    setStats((prev) =>
      prev
        ? {
            ...prev,
            total_snippets: prev.total_snippets - 1,
          }
        : null
    );
  }, "Delete snippet");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="bg-brand-secondary rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">Profile not found</h1>
        <p className="text-textSecondary mt-2">
          The user profile you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-brand-secondary rounded-lg p-6">
        <div className="flex items-start justify-between">
          <Avatar
            src={profile.avatar_url}
            alt={profile.username || "User"}
            size={80}
            fallbackText={profile.username}
            className="flex-shrink-0"
          />
          <div className="flex-1 ml-4">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            <p className="text-textSecondary">
              {profile.bio || "No bio available"}
            </p>
            <p className="text-sm text-textSecondary mt-1">
              Joined {formatDate(profile.created_at)}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1">
                <Code className="w-4 h-4" />
                <span>{stats?.total_snippets || 0} snippets</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-400" />
                <span>{stats?.total_favorites || 0} favorites</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-300" />
                <span>{stats?.average_rating.toFixed(1) || 0} avg rating</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>{stats?.total_comments || 0} comments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-6" role="tablist">
          {["snippets", "favorites", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`${tab}-panel`}
              className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? "border-lightGreen text-lightGreen"
                  : "border-transparent text-textSecondary hover:text-text"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "snippets" && stats?.total_snippets
                ? ` (${stats.total_snippets})`
                : ""}
              {tab === "favorites" && stats?.total_favorites
                ? ` (${stats.total_favorites})`
                : ""}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === "snippets" && (
          <div
            id="snippets-panel"
            role="tabpanel"
            aria-labelledby="snippets-tab"
            className="space-y-4"
          >
            {isOwnProfile && (
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Snippets</h2>
                <button
                  onClick={() => router.push("/snippets/create")}
                  className="flex items-center gap-2 px-4 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
                  aria-label="Create new snippet"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>
              </div>
            )}

            {totalSnippets === 0 ? (
              <div className="text-center py-8">
                <Code className="w-12 h-12 text-textSecondary mx-auto mb-4" />
                <p className="text-textSecondary">
                  {isOwnProfile
                    ? "You haven't created any snippets yet."
                    : "No snippets found."}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => router.push("/snippets/create")}
                    className="mt-4 px-4 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors"
                  >
                    Create Your First Snippet
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedSnippets.map((snippet) => (
                  <div
                    key={snippet.id}
                    className="bg-primary border border-textSecondary rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {snippet.title}
                        </h3>
                        <p className="text-textSecondary text-sm mb-2">
                          {snippet.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-textSecondary">
                          <span>{snippet.language}</span>
                          <span>{formatDate(snippet.created_at)}</span>
                          {snippet.updated_at !== snippet.created_at && (
                            <span>
                              (Updated {formatDate(snippet.updated_at)})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/snippets/${snippet.id}`)}
                          className="p-2 text-textSecondary hover:text-lightGreen transition-colors"
                          title="View snippet"
                          aria-label={`View snippet: ${snippet.title}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isOwnProfile && (
                          <>
                            <button
                              onClick={() => handleEditSnippet(snippet)}
                              className="p-2 text-textSecondary hover:text-blue-400 transition-colors"
                              title="Edit snippet"
                              aria-label={`Edit snippet: ${snippet.title}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  id: snippet.id,
                                  title: snippet.title,
                                })
                              }
                              className="p-2 text-textSecondary hover:text-red-400 transition-colors"
                              title="Delete snippet"
                              aria-label={`Delete snippet: ${snippet.title}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {snippet.tags && snippet.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {snippet.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-darkGreen text-text rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Code Preview */}
                    <div className="relative">
                      <pre className="p-4 bg-gray-900 rounded text-gray-300 text-sm font-mono overflow-x-auto max-h-40 overflow-y-hidden">
                        {snippet.code.slice(0, 300)}
                        {snippet.code.length > 300 && "..."}
                      </pre>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    {currentPage > 1 && (
                      <button
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        className="px-4 py-2 border border-textSecondary text-text rounded-lg hover:bg-textSecondary/10 transition-colors"
                        aria-label="Go to previous page"
                      >
                        Previous
                      </button>
                    )}

                    <span
                      className="px-4 py-2 text-textSecondary"
                      aria-live="polite"
                    >
                      Page {currentPage} of {totalPages}
                    </span>

                    {currentPage < totalPages && (
                      <button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        className="px-4 py-2 border border-textSecondary text-text rounded-lg hover:bg-textSecondary/10 transition-colors"
                        aria-label="Go to next page"
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div
            id="favorites-panel"
            role="tabpanel"
            aria-labelledby="favorites-tab"
          >
            <FavoriteSnippets userId={userId} isOwnProfile={isOwnProfile} />
          </div>
        )}

        {activeTab === "activity" && (
          <div
            id="activity-panel"
            role="tabpanel"
            aria-labelledby="activity-tab"
            className="text-center py-8"
          >
            <Activity className="w-12 h-12 text-textSecondary mx-auto mb-4" />
            <p className="text-textSecondary">Activity feed coming soon!</p>
            <p className="text-sm text-textSecondary mt-2">
              See recent comments, ratings, and snippet interactions.
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingSnippet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-primary border border-textSecondary rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Snippet</h2>
              <button
                onClick={handleCancelEdit}
                className="text-textSecondary hover:text-text transition-colors"
                disabled={saving}
                aria-label="Close edit dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSnippet();
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="edit-title"
                  className="block text-sm font-medium mb-2"
                >
                  Title *
                </label>
                <input
                  id="edit-title"
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
                  required
                  disabled={saving}
                  maxLength={200}
                  aria-describedby="title-help"
                />
                <p id="title-help" className="text-xs text-textSecondary mt-1">
                  {editFormData.title.length}/200 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium mb-2"
                >
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editFormData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
                  disabled={saving}
                  maxLength={1000}
                  aria-describedby="description-help"
                />
                <p
                  id="description-help"
                  className="text-xs text-textSecondary mt-1"
                >
                  {editFormData.description.length}/1000 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="edit-language"
                  className="block text-sm font-medium mb-2"
                >
                  Language *
                </label>
                <select
                  id="edit-language"
                  name="language"
                  value={editFormData.language}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
                  required
                  disabled={saving}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-code"
                  className="block text-sm font-medium mb-2"
                >
                  Code *
                </label>
                <textarea
                  id="edit-code"
                  name="code"
                  value={editFormData.code}
                  onChange={handleFormChange}
                  rows={12}
                  className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none font-mono"
                  required
                  disabled={saving}
                  aria-describedby="code-help"
                />
                <p id="code-help" className="text-xs text-textSecondary mt-1">
                  Use proper indentation and formatting
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tags ({editFormData.tags.length}/10)
                </label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 p-3 border border-textSecondary rounded-lg bg-primary min-h-[2.5rem] items-center">
                    {editFormData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-1 bg-darkGreen text-text rounded text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          disabled={saving}
                          className="text-red-300 hover:text-red-500 ml-1 disabled:opacity-50"
                          aria-label={`Remove tag: ${tag}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder={
                        editFormData.tags.length === 0
                          ? "Type a tag and press Enter..."
                          : "Add another tag..."
                      }
                      className="flex-1 min-w-[120px] bg-transparent outline-none text-text placeholder-textSecondary disabled:opacity-50"
                      disabled={saving || editFormData.tags.length >= 10}
                      aria-label="Add new tag"
                    />
                  </div>

                  <div>
                    <p className="text-sm text-textSecondary mb-2">
                      Popular tags:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          disabled={
                            saving ||
                            editFormData.tags.includes(tag) ||
                            editFormData.tags.length >= 10
                          }
                          className="px-3 py-1 bg-text text-primary rounded text-sm hover:bg-lightGreen transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Add tag: ${tag}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-lightGreen text-primary rounded font-semibold hover:bg-lightGreen/80 disabled:opacity-50 transition"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-6 py-3 bg-textSecondary text-primary rounded font-semibold hover:bg-textSecondary/80 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-primary border border-textSecondary rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Delete Snippet</h3>
            <p className="text-textSecondary mb-6">
              Are you sure you want to delete &ldquo;{deleteConfirm.title}
              &rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDeleteSnippet(deleteConfirm.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-textSecondary text-primary rounded hover:bg-textSecondary/80 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
