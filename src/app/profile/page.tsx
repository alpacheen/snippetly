"use client";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ username: "", bio: "", avatar_url: "" });
  const [saving, setSaving] = useState(false);
  const [profileExists,setProfileExists] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try{
        const {data,error} = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      if(error) {
        console.error("Error fetching profile:", error);
        return;
      }
      if(data) {
        setForm({
          username: data.username || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        });
        setProfileExists(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };
  fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (!user) {
      setSaving(false);
      return;
    }
    try{
      if(profileExists) {
        const {error} = await supabase
        .from("profiles")
        .update(form)
        .eq("id", user.id);

        if(error) {
          console.error("Error updating profile:", error);
        } else {
          console.log("Profile updated successfully");
        }
      } else {
        const {error} = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          ...form,
        });
        if(error) {
          console.error("Error creating profile:", error);
        } else {
          console.log("Profile created successfully");
          setProfileExists(true);
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in.</div>;

  return (
    <section className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          placeholder="Bio"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          name="avatar_url"
          value={form.avatar_url}
          onChange={handleChange}
          placeholder="Avatar URL"
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-lightGreen text-primary rounded"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </section>
  );
} 