"use client";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "Java", "C#", "Ruby", "Go", "PHP", "C++", "Swift", "Kotlin", "Rust", "Dart", "Scala", "Shell", "HTML", "CSS"
];

type FormData = {
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string;
};

type SnippetFormProps = {
  userId: string;
};

export default function SnippetForm({ userId }: SnippetFormProps) {
  const { register, handleSubmit, control, formState: { errors }, reset, watch } = useForm<FormData>({
    defaultValues: { language: "JavaScript" }
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const selectedLanguage = watch("language") || "JavaScript";

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    // Sanitize code input (basic)
    const sanitizedCode = data.code.replace(/<script/gi, "&lt;script");
    const tagsArray = data.tags.split(",").map(t => t.trim()).filter(Boolean);
    const { data: snippet, error } = await supabase.from("snippets").insert([
      {
        title: data.title,
        description: data.description,
        code: sanitizedCode,
        language: data.language,
        tags: tagsArray,
        owner_id: userId,
      }
    ]).select().single();
    setLoading(false);
    if (error) {
      toast.error("Failed to create snippet");
      return;
    }
    toast.success("Snippet created!");
    reset();
    router.push(`/snippets/${snippet.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-primary p-6 rounded-lg shadow">
      <div>
        <label className="block font-semibold mb-1">Title</label>
        <input
          type="text"
          {...register("title", { required: true, maxLength: 100 })}
          className="w-full border px-3 py-2 rounded bg-primary text-text"
          disabled={loading}
        />
        {errors.title && <span className="text-red-500 text-sm">Title is required (max 100 chars)</span>}
      </div>
      <div>
        <label className="block font-semibold mb-1">Description</label>
        <textarea
          {...register("description", { required: true, maxLength: 300 })}
          className="w-full border px-3 py-2 rounded bg-primary text-text"
          rows={3}
          disabled={loading}
        />
        {errors.description && <span className="text-red-500 text-sm">Description is required (max 300 chars)</span>}
      </div>
      <div>
        <label className="block font-semibold mb-1">Code</label>
        <textarea
          {...register("code", { required: true })}
          className="w-full border px-3 py-2 rounded bg-primary text-text font-mono"
          rows={12}
          disabled={loading}
        />
        {errors.code && <span className="text-red-500 text-sm">Code is required</span>}
      </div>
      <div>
        <label className="block font-semibold mb-1">Language</label>
        <select
          {...register("language", { required: true })}
          className="w-full border px-3 py-2 rounded bg-primary text-text"
          disabled={loading}
        >
          <option value="">Select language</option>
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        {errors.language && <span className="text-red-500 text-sm">Language is required</span>}
      </div>
      <div>
        <label className="block font-semibold mb-1">Tags <span className="text-xs text-neutral-400">(comma separated)</span></label>
        <input
          type="text"
          {...register("tags")}
          className="w-full border px-3 py-2 rounded bg-primary text-text"
          placeholder="e.g. react, hooks, async"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        className="px-6 py-2 bg-lightGreen text-primary font-semibold rounded hover:bg-lightGreen/80 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Snippet"}
      </button>
    </form>
  );
} 