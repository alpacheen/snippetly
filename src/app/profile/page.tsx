"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { User, Edit, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Lazy load heavy components
const UserProfile = dynamic(() => import("@/app/components/UserProfile"), {
  loading: () => <ProfileSkeleton />,
  ssr: false,
});

interface ProfileData {
  id: string;
  username: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
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
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileForm, setProfileForm] = useState({
    username: "",
    bio: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  // Optimized profile fetch - single query with error handling
  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, bio, avatar_url, created_at")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile fetch error:", error);
        if (error.code !== "PGRST116") {
          toast.error("Failed to load profile");
          return;
        }
      }

      if (data) {
        setProfile(data);
        setProfileForm({
          username: data.username || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        });
        setProfileExists(true);
      } else {
        // No profile exists, show create form
        setShowEditForm(true);
        setProfileExists(false);
      }
    } catch (error) {
      console.error("Unexpected profile error:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Redirect non-authenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch profile when user is available
  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile();
    }
  }, [user, authLoading, fetchProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!profileForm.username.trim()) {
      toast.error("Username is required");
      return false;
    }
    if (profileForm.username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return false;
    }
    if (profileForm.bio.length > 200) {
      toast.error("Bio must be less than 200 characters");
      return false;
    }
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !validateForm() || saving) return;

    setSaving(true);

    try {
      const profileData = {
        username: profileForm.username.trim(),
        bio: profileForm.bio.trim(),
        avatar_url: profileForm.avatar_url.trim(),
      };

      if (profileExists) {
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", user.id);

        if (error) throw error;
        toast.success("Profile updated successfully");
      } else {
        const { error } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            ...profileData,
            created_at: new Date().toISOString(),
          });

        if (error) throw error;
        toast.success("Profile created successfully");
        setProfileExists(true);
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, ...profileData } : null);
      setShowEditForm(false);
    } catch (error: any) {
      console.error("Profile save error:", error);
      if (error.code === "23505") {
        toast.error("Username already taken");
      } else {
        toast.error("Failed to save profile");
      }
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-lightGreen mr-3" />
        <span className="text-textSecondary">Loading profile...</span>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
        <p className="text-textSecondary mb-6">
          You need to be logged in to view your profile.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-2 bg-lightGreen text-primary font-semibold rounded hover:bg-lightGreen/80 transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Show edit form
  if (showEditForm || !profileExists) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-primary border border-textSecondary rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {profileExists ? "Edit Profile" : "Create Your Profile"}
            </h1>
            {profileExists && (
              <button
                onClick={() => setShowEditForm(false)}
                className="text-textSecondary hover:text-text transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="username" className="block font-semibold mb-2">
                Username *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={profileForm.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none disabled:opacity-50"
                required
                disabled={saving}
                minLength={3}
                maxLength={50}
              />
            </div>

            <div>
              <label htmlFor="bio" className="block font-semibold mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={profileForm.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none disabled:opacity-50"
                rows={3}
                disabled={saving}
                maxLength={200}
              />
              <p className="text-xs text-textSecondary mt-1">
                {profileForm.bio.length}/200 characters
              </p>
            </div>

            <div>
              <label htmlFor="avatar_url" className="block font-semibold mb-2">
                Avatar URL
              </label>
              <input
                id="avatar_url"
                name="avatar_url"
                type="url"
                value={profileForm.avatar_url}
                onChange={handleChange}
                placeholder="https://example.com/your-avatar.jpg"
                className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none disabled:opacity-50"
                disabled={saving}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-lightGreen text-primary rounded font-semibold hover:bg-lightGreen/80 disabled:opacity-50 transition"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Saving..." : profileExists ? "Update Profile" : "Create Profile"}
              </button>

              {profileExists && (
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="px-6 py-2 bg-textSecondary text-primary rounded font-semibold hover:bg-textSecondary/80 transition disabled:opacity-50"
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Show profile
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <button
          onClick={() => setShowEditForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-lightGreen text-primary rounded hover:bg-lightGreen/80 transition-colors font-medium"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <UserProfile userId={user.id} isOwnProfile={true} />
    </div>
  );
}