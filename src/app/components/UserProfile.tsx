"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User, Code, Star, Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import language from "react-syntax-highlighter/dist/esm/languages/hljs/1c";

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
  const [expandedSnippet, setExpandedSnippet] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("snippets");

  const fetchUserProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, bio, avatar_url, created_at")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data) setProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
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
  }

  const handleSaveSnippet = async (snippet: UserSnippet) => {
    try{
      const {error} = await supabase
      .from("snippets")
      .update({
        title: updateSnippet.title,
        description: updateSnippet.description,
        code: updateSnippet.code,
        language: updateSnippet.language,
        tags: updateSnippet.tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", updatedSnippet.id)
      .eq("user_id", userId);

      if(error) {
        console.error("Error updating snippet:", error);
        toast.error("Failed to update snippet");
        return;
      }
      toast.success("Snippet updated successfully");
      setSnippets((prev) =>
        prev.map((snippet) => (snippet.id === updatedSnippet.id ? updatedSnippet : snippet))
      );
    setEditingSnippet(null);
    } catch (error) {
      console.error("Network Error:", error);
      toast.error("Failed to update snippet");
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
      setSnippets((prev) => prev.filter((snippet) => snippet.id !== snippetId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Network Error:", error);
      toast.error("Failed to delete snippet");
    }
  };

  const toggleSnippetExpand = (snippetId: string) => {
    setExpandedSnippet((prev) => {
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


  if (loading) return <div className="animate-pulse">Loading profile...</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-brand-secondary rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="w-20 h-20 bg-lightGreen rounded-full flex items-center justify-center">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.username || "User"}
                width={80}
                height={80}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-primary" />
            )}
          </div>
          <div className="flex-1 ml-4">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            <p className="text-textSecondary">
              {profile.bio || "No bio available"}
            </p>
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1">
                <Code className="w-4 h-4" />
                <span>{stats?.total_snippets} snippets</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-300" />
                <span>{stats?.average_rating.toFixed(1)} avg rating</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                title={snippet.title}
                language={snippet.language}
                href={`/snippets/${snippet.id}`}
              />
            ))}
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="text-center py-8">
            <p className="text-textSecondary">Favorites feature coming soon!</p>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="text-center py-8">
            <p className="text-textSecondary">Activity feed coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
