"use client";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ display_name: "", bio: "", avatar_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setForm({
          display_name: data?.display_name || "",
          bio: data?.bio || "",
          avatar_url: data?.avatar_url || "",
        });
      });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (!user) return;
    await supabase.from("profiles").update(form).eq("id", user.id);
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in.</div>;

  return (
    <section className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <input
          name="display_name"
          value={form.display_name}
          onChange={handleChange}
          placeholder="Display Name"
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