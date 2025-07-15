"use client";
import SnippetForm from "@/app/components/SnippetForm";
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";

export default function CreateSnippetPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!user) {
    return (
      <section className="max-w-xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in to create a snippet</h1>
        <p className="mb-6">You must be logged in to create and share code snippets.</p>
        <button
          className="px-6 py-2 bg-lightGreen text-primary font-semibold rounded hover:bg-lightGreen/80 transition"
          onClick={() => router.push("/login")}
        >
          Login / Sign Up
        </button>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create a New Snippet</h1>
      <SnippetForm userId={user.id} />
    </section>
  );
}
