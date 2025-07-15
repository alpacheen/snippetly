"use client";
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [snippets, setSnippets] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    supabase
      .from("snippets")
      .select("id, title, language, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSnippets(data || []);
        setFetching(false);
      });
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <section className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="mb-8 flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-lightGreen flex items-center justify-center text-2xl text-primary font-bold">
          {user.email?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <div className="font-semibold">{user.email}</div>
          <div className="text-sm text-neutral-400">User ID: {user.id}</div>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2">My Snippets</h2>
      {fetching ? (
        <div>Loading snippets...</div>
      ) : snippets.length === 0 ? (
        <div className="text-neutral-500">You haven't created any snippets yet.</div>
      ) : (
        <ul className="space-y-3">
          {snippets.map(snippet => (
            <li key={snippet.id} className="border rounded p-4 flex justify-between items-center">
              <div>
                <Link href={`/snippets/${snippet.id}`} className="font-semibold hover:underline">
                  {snippet.title}
                </Link>
                <span className="ml-2 text-xs text-neutral-400">{snippet.language}</span>
              </div>
              <span className="text-xs text-neutral-400">{new Date(snippet.created_at).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
} 