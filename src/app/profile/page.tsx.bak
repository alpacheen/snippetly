// "use client";
// import { useAuth } from "@/lib/auth-context";
// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase";

// export default function ProfilePage() {
//   const { user, loading } = useAuth();
//   const [form, setForm] = useState({ username: "", bio: "", avatar_url: "" });
//   const [saving, setSaving] = useState(false);
//   const [profileExists,setProfileExists] = useState(false);

//   useEffect(() => {
//     if (!user) return;
    
//     const fetchProfile = async () => {
//       try{
//         const {data,error} = await supabase
//       .from("profiles")
//       .select("*")
//       .eq("id", user.id)
//       .maybeSingle()
//       if(error) {
//         console.error("Error fetching profile:", error);
//         return;
//       }
//       if(data) {
//         setForm({
//           username: data.username || "",
//           bio: data.bio || "",
//           avatar_url: data.avatar_url || "",
//         });
//         setProfileExists(true);
//       }
//     } catch (error) {
//       console.error("Error fetching profile:", error);
//     }
//   };
//   fetchProfile();
//   }, [user]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSave = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);
//     if (!user) {
//       setSaving(false);
//       return;
//     }
//     try{
//       if(profileExists) {
//         const {error} = await supabase
//         .from("profiles")
//         .update(form)
//         .eq("id", user.id);

//         if(error) {
//           console.error("Error updating profile:", error);
//         } else {
//           console.log("Profile updated successfully");
//         }
//       } else {
//         const {error} = await supabase
//         .from("profiles")
//         .insert({
//           id: user.id,
//           ...form,
//         });
//         if(error) {
//           console.error("Error creating profile:", error);
//         } else {
//           console.log("Profile created successfully");
//           setProfileExists(true);
//         }
//       }
//     } catch (error) {
//       console.error("Error saving profile:", error);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (!user) return <div>Please log in.</div>;

//   return (
//     <section className="max-w-2xl mx-auto py-8">
//       <h1 className="text-2xl font-bold mb-4">Profile</h1>
//       <form onSubmit={handleSave} className="space-y-4">
//         <input
//           name="username"
//           value={form.username}
//           onChange={handleChange}
//           placeholder="Username"
//           className="w-full border px-3 py-2 rounded"
//         />
//         <textarea
//           name="bio"
//           value={form.bio}
//           onChange={handleChange}
//           placeholder="Bio"
//           className="w-full border px-3 py-2 rounded"
//         />
//         <input
//           name="avatar_url"
//           value={form.avatar_url}
//           onChange={handleChange}
//           placeholder="Avatar URL"
//           className="w-full border px-3 py-2 rounded"
//         />
//         <button
//           type="submit"
//           className="px-4 py-2 bg-lightGreen text-primary rounded"
//           disabled={saving}
//         >
//           {saving ? "Saving..." : "Save"}
//         </button>
//       </form>
//     </section>
//   );
// } 
"use client";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import UserProfile from "@/app/components/UserProfile";
import { UserProfileSkeleton } from "@/app/components/LoadingSkeletons";
import { AlertCircle, User } from "lucide-react";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profileForm, setProfileForm] = useState({ 
    username: "", 
    bio: "", 
    avatar_url: "" 
  });
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching profile:", error);
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
          // No profile exists, show the edit form by default
          setShowEditForm(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Unexpected error loading profile");
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    if (!profileForm.username.trim()) {
      toast.error("Username is required");
      return;
    }

    setSaving(true);
    
    try {
      if (profileExists) {
        const { error } = await supabase
          .from("profiles")
          .update({
            username: profileForm.username.trim(),
            bio: profileForm.bio.trim(),
            avatar_url: profileForm.avatar_url.trim(),
          })
          .eq("id", user.id);

        if (error) {
          console.error("Error updating profile:", error);
          toast.error("Failed to update profile");
          return;
        }
        
        toast.success("Profile updated successfully");
      } else {
        const { error } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            username: profileForm.username.trim(),
            bio: profileForm.bio.trim(),
            avatar_url: profileForm.avatar_url.trim(),
            created_at: new Date().toISOString(),
          });
          
        if (error) {
          console.error("Error creating profile:", error);
          toast.error("Failed to create profile");
          return;
        }
        
        toast.success("Profile created successfully");
        setProfileExists(true);
      }
      
      setShowEditForm(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Unexpected error saving profile");
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (authLoading || profileLoading) {
    return <UserProfileSkeleton />;
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

  // Show edit form or profile view
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
                className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
                required
                disabled={saving}
                minLength={3}
                maxLength={50}
              />
              <p className="text-xs text-textSecondary mt-1">
                This will be displayed on your snippets and profile
              </p>
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
                className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
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
                className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
                disabled={saving}
              />
              <p className="text-xs text-textSecondary mt-1">
                Link to your profile picture
              </p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-lightGreen text-primary rounded font-semibold hover:bg-lightGreen/80 disabled:opacity-50 transition"
                disabled={saving || !profileForm.username.trim()}
              >
                {saving ? "Saving..." : (profileExists ? "Update Profile" : "Create Profile")}
              </button>
              
              {profileExists && (
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="px-6 py-2 bg-textSecondary text-primary rounded font-semibold hover:bg-textSecondary/80 transition"
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

  // Show full profile with snippets
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
      
      <UserProfile userId={user.id} isOwnProfile={true} />
    </div>
  );
}