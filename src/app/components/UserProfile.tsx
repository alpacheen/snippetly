"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User, Code, Star, Edit, Trash2, Plus, Eye, X, Save } from "lucide-react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Avatar } from "@/app/components/SafeImage";

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
  average_rating: number;
};

const languages = [
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

const commonTags = [
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
  const [editingSnippet, setEditingSnippet] = useState<UserSnippet | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [expandedSnippet, setExpandedSnippet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("snippets");
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    code: "",
    language: "JavaScript",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

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

  const fetchUserSnippets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("snippets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching snippets:", error);
        toast.error("Failed to load snippets");
        return;
      }

      if (data) {
        setSnippets(data);

        const totalSnippets = data.length;
        const avgRating =
          data.length > 0
            ? data.reduce((sum, snippet) => sum + (snippet.rating || 0), 0) /
              data.length
            : 0;

        setStats({
          total_snippets: totalSnippets,
          average_rating: avgRating,
        });
      }
    } catch (error) {
      console.error("Error in fetchUserSnippets:", error);
      toast.error("Unexpected error loading snippets");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserSnippets();
  }, [userId, fetchUserProfile, fetchUserSnippets]);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = (tag: string) => {
    if (tag && !editFormData.tags.includes(tag)) {
      setEditFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      handleAddTag(tagInput.trim());
      setTagInput("");
    }
  };

  const handleSaveSnippet = async () => {
    if (!editingSnippet) return;

    if (!editFormData.title.trim() || !editFormData.code.trim()) {
      toast.error("Title and code are required");
      return;
    }

    setSaving(true);
    try {
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

      if (error) {
        console.error("Error updating snippet:", error);
        toast.error("Failed to update snippet");
        return;
      }

      toast.success("Snippet updated successfully");
      
      // Update local state
      const updatedSnippet = {
        ...editingSnippet,
        ...editFormData,
        updated_at: new Date().toISOString(),
      };
      
      setSnippets(prev =>
        prev.map(snippet => 
          snippet.id === editingSnippet.id ? updatedSnippet : snippet
        )
      );
      
      setEditingSnippet(null);
    } catch (error) {
      console.error("Network Error:", error);
      toast.error("Failed to update snippet");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSnippet = async (snippetId: string) => {
    try {
      const { error } = await supabase
        .from("snippets")
        .delete()
        .eq("id", snippetId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error deleting snippet:", error);
        toast.error("Failed to delete snippet");
        return;
      }
      
      toast.success("Snippet deleted successfully");
      setSnippets(prev => prev.filter(snippet => snippet.id !== snippetId));
      setDeleteConfirm(null);
      
      // Update stats
      setStats(prev => prev ? {
        ...prev,
        total_snippets: prev.total_snippets - 1
      } : null);
    } catch (error) {
      console.error("Network Error:", error);
      toast.error("Failed to delete snippet");
    }
  };

  const toggleSnippetExpand = (snippetId: string) => {
    setExpandedSnippet(prev => {
      const newSet = new Set(prev);
      if (newSet.has(snippetId)) {
        newSet.delete(snippetId);
      } else {
        newSet.add(snippetId);
      }
      return newSet;
    });
  };

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
        <p className="text-textSecondary mt-2">The user profile you're looking for doesn't exist.</p>
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
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1">
                <Code className="w-4 h-4" />
                <span>{stats?.total_snippets || 0} snippets</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-300" />
                <span>{stats?.average_rating.toFixed(1) || 0} avg rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-6">
          {["snippets", "favorites", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? "border-lightGreen text-lightGreen"
                  : "border-transparent text-textSecondary hover:text-text"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === "snippets" && (
          <div className="space-y-4">
            {isOwnProfile && (
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Snippets</h2>
                <button
                  onClick={() => router.push("/snippets/create")}
                  className="flex items-center gap-2 px-4 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>
              </div>
            )}
            
            {snippets.length === 0 ? (
              <div className="text-center py-8">
                <Code className="w-12 h-12 text-textSecondary mx-auto mb-4" />
                <p className="text-textSecondary">
                  {isOwnProfile ? "You haven't created any snippets yet." : "No snippets found."}
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
                {snippets.map((snippet) => (
                  <div key={snippet.id} className="bg-primary border border-textSecondary rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{snippet.title}</h3>
                        <p className="text-textSecondary text-sm mb-2">{snippet.description}</p>
                        <div className="flex items-center gap-4 text-sm text-textSecondary">
                          <span>{snippet.language}</span>
                          <span>{formatDate(snippet.created_at)}</span>
                          {snippet.updated_at !== snippet.created_at && (
                            <span>(Updated {formatDate(snippet.updated_at)})</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/snippets/${snippet.id}`)}
                          className="p-2 text-textSecondary hover:text-lightGreen transition-colors"
                          title="View snippet"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {isOwnProfile && (
                          <>
                            <button
                              onClick={() => handleEditSnippet(snippet)}
                              className="p-2 text-textSecondary hover:text-blue-400 transition-colors"
                              title="Edit snippet"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ id: snippet.id, title: snippet.title })}
                              className="p-2 text-textSecondary hover:text-red-400 transition-colors"
                              title="Delete snippet"
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
                      <div className="max-h-40 overflow-hidden">
                        <SyntaxHighlighter
                          language={snippet.language.toLowerCase()}
                          style={vscDarkPlus}
                          className="text-sm"
                        >
                          {expandedSnippet.has(snippet.id) ? snippet.code : snippet.code.slice(0, 200)}
                        </SyntaxHighlighter>
                      </div>
                      
                      {snippet.code.length > 200 && (
                        <button
                          onClick={() => toggleSnippetExpand(snippet.id)}
                          className="mt-2 text-lightGreen hover:underline text-sm"
                        >
                          {expandedSnippet.has(snippet.id) ? "Show less" : "Show more"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-textSecondary mx-auto mb-4" />
            <p className="text-textSecondary">Favorites feature coming soon!</p>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-textSecondary mx-auto mb-4" />
            <p className="text-textSecondary">Activity feed coming soon!</p>
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
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Language *</label>
                <select
                  name="language"
                  value={editFormData.language}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
                  required
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Code *</label>
                <textarea
                  name="code"
                  value={editFormData.code}
                  onChange={handleFormChange}
                  rows={12}
                  className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Type a tag and press Enter"
                    className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
                  />
                  
                  <div className="space-y-2">
                    <p className="text-sm text-textSecondary">Common tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {commonTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          className="px-3 py-1 bg-text text-primary rounded text-sm hover:bg-lightGreen transition"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {editFormData.tags.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-textSecondary">Selected tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {editFormData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-darkGreen text-text rounded text-sm flex items-center gap-2"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-red-300 hover:text-red-500 ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSaveSnippet}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-lightGreen text-primary rounded font-semibold hover:bg-lightGreen/80 disabled:opacity-50 transition"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-3 bg-textSecondary text-primary rounded font-semibold hover:bg-textSecondary/80 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-primary border border-textSecondary rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Delete Snippet</h3>
            <p className="text-textSecondary mb-6">
              Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
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
