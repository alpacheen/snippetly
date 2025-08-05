"use client";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, Suspense, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserProfileSkeleton } from "@/app/components/LoadingSkeletons";
import { AlertCircle, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// Lazy load heavy components with better loading state
const UserProfile = dynamic(() => import("@/app/components/UserProfile"), {
  loading: () => <UserProfileSkeleton />,
  ssr: false,
});

interface ProfileData {
  username: string;
  bio: string;
  avatar_url: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profileForm, setProfileForm] = useState<ProfileData>({
    username: "",
    bio: "",
    avatar_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  // Memoized profile fetch with better error handling
  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      setProfileLoading(true);

      // Optimized query - only select needed fields
      const { data, error } = await supabase
        .from("profiles")
        .select("username, bio, avatar_url")
        .eq("id", user.id)
        .maybeSingle(); // Use maybeSingle to avoid errors when no profile exists

      if (error) {
        console.error("Profile fetch error:", error);
        toast.error("Failed to load profile");
        return;
      }

      if (data) {
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
      toast.error("Unexpected error loading profile");
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile();
    }
  }, [user, authLoading, fetchProfile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profileForm.username.trim()) {
      toast.error("Username is required");
      return;
    }

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
        const { error } = await supabase.from("profiles").insert({
          id: user.id,
          ...profileData,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
        toast.success("Profile created successfully");
        setProfileExists(true);
      }

      setShowEditForm(false);
    } catch (error: any) {
      console.error("Profile save error:", error);
      toast.error(error.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-lightGreen" />
        <span className="ml-3 text-textSecondary">Loading...</span>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <section className="max-w-xl mx-auto py-12 text-center">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
        <p className="text-textSecondary mb-6">
          You need to be logged in to view and edit your profile.
        </p>
        <a
          href="/login"
          className="inline-block px-6 py-2 bg-lightGreen text-primary font-semibold rounded hover:bg-lightGreen/80 transition"
        >
          Sign In
        </a>
      </section>
    );
  }

  // Still loading profile
  if (profileLoading) {
    return <UserProfileSkeleton />;
  }

  // Show edit form
  if (showEditForm || !profileExists) {
    return (
      <section className="max-w-2xl mx-auto py-8">
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
                disabled={saving || !profileForm.username.trim()}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving
                  ? "Saving..."
                  : profileExists
                  ? "Update Profile"
                  : "Create Profile"}
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
      </section>
    );
  }

  // Show profile with optimized loading
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <button
          onClick={() => setShowEditForm(true)}
          className="px-4 py-2 bg-lightGreen text-primary rounded hover:bg-lightGreen/80 transition-colors font-medium"
        >
          Edit Profile
        </button>
      </div>

      <Suspense fallback={<UserProfileSkeleton />}>
        <UserProfile userId={user.id} isOwnProfile={true} />
      </Suspense>
    </div>
  );
}
