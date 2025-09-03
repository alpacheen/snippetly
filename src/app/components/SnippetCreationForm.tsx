"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Eye, Code, Save, X, Plus, Loader2 } from "lucide-react";
import { SUPPORTED_LANGUAGES, COMMON_TAGS } from "@/types";
import dynamic from "next/dynamic";

// Lazy load syntax highlighter for preview
const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 bg-gray-800 rounded flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-lightGreen" />
        <span className="ml-2 text-gray-300">Loading preview...</span>
      </div>
    ),
  }
);

interface FormData {
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
}

interface SnippetCreationFormProps {
  userId: string;
}

const INITIAL_FORM_DATA: FormData = {
  title: "",
  description: "",
  code: "",
  language: "JavaScript",
  tags: [],
};

export default function SnippetCreationForm({ userId }: SnippetCreationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  // Client-side validation
  const validateForm = useCallback((): string | null => {
    if (!formData.title.trim()) return "Title is required";
    if (formData.title.length > 200) return "Title must be less than 200 characters";
    if (!formData.code.trim()) return "Code is required";
    if (formData.description.length > 1000) return "Description must be less than 1000 characters";
    if (formData.tags.length > 10) return "Maximum 10 tags allowed";
    return null;
  }, [formData]);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleAddTag = useCallback((tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !formData.tags.includes(cleanTag) && formData.tags.length < 10) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, cleanTag] }));
    }
  }, [formData.tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleTagInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      handleAddTag(tagInput.trim());
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && formData.tags.length > 0) {
      handleRemoveTag(formData.tags[formData.tags.length - 1]);
    }
  }, [tagInput, formData.tags, handleAddTag, handleRemoveTag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return; // Prevent double submission

    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!userId) {
      toast.error("You must be logged in to create a snippet");
      return;
    }

    setLoading(true);

    try {
      // Single optimized insert
      const { data, error } = await supabase
        .from("snippets")
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          code: formData.code.trim(),
          language: formData.language,
          tags: formData.tags,
          user_id: userId,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Snippet created successfully!");
      
      // Reset form
      setFormData(INITIAL_FORM_DATA);
      setTagInput("");
      setPreview(false);

      // Navigate to the new snippet
      if (data?.id) {
        router.push(`/snippets/${data.id}`);
      } else {
        router.push("/snippets");
      }
    } catch (error: any) {
      console.error("Create snippet error:", error);
      toast.error(error.message || "Failed to create snippet");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setTagInput("");
    setPreview(false);
  }, []);

  const isFormValid = formData.title.trim() && formData.code.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Snippet</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-textSecondary text-primary rounded-lg hover:bg-textSecondary/80 transition-colors disabled:opacity-50"
          >
            {preview ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      {preview ? (
        /* Preview Mode */
        <div className="space-y-6">
          <div className="bg-primary border border-textSecondary rounded-lg p-6">
            <header className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {formData.title || "Untitled Snippet"}
              </h2>
              <p className="text-textSecondary mb-4">
                {formData.description || "No description provided"}
              </p>
              <div className="flex items-center gap-4 text-sm text-textSecondary">
                <span className="flex items-center gap-1">
                  <Code className="w-4 h-4" />
                  {formData.language}
                </span>
                <span>by you</span>
              </div>
            </header>

            {formData.code && (
              <div className="mb-6">
                <SyntaxHighlighter
                  language={formData.language.toLowerCase()}
                  style={{
                    'pre[class*="language-"]': { margin: 0, borderRadius: '0.5rem' },
                    'code[class*="language-"]': { fontSize: '14px' },
                  }}
                  showLineNumbers
                  wrapLines
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    backgroundColor: '#1f2937',
                  }}
                >
                  {formData.code}
                </SyntaxHighlighter>
              </div>
            )}

            {formData.tags.length > 0 && (
              <div>
                <p className="text-sm text-textSecondary mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-darkGreen text-text rounded text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title and Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a descriptive title"
                className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none disabled:opacity-50"
                required
                disabled={loading}
                maxLength={200}
              />
              <p className="text-xs text-textSecondary mt-1">
                {formData.title.length}/200 characters
              </p>
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium mb-2">
                Language *
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none disabled:opacity-50"
                required
                disabled={loading}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what this snippet does and when to use it..."
              rows={3}
              className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none disabled:opacity-50"
              disabled={loading}
              maxLength={1000}
            />
            <p className="text-xs text-textSecondary mt-1">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Code */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-2">
              Code *
            </label>
            <textarea
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="Paste your code here..."
              rows={15}
              className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none font-mono text-sm disabled:opacity-50"
              required
              disabled={loading}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tags {formData.tags.length > 0 && `(${formData.tags.length}/10)`}
            </label>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 p-3 border border-textSecondary rounded-lg bg-primary min-h-[2.5rem] items-center">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 bg-darkGreen text-text rounded text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={loading}
                      className="text-red-300 hover:text-red-500 ml-1 disabled:opacity-50"
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder={
                    formData.tags.length === 0
                      ? "Type a tag and press Enter..."
                      : "Add another tag..."
                  }
                  className="flex-1 min-w-[120px] bg-transparent outline-none text-text placeholder-textSecondary disabled:opacity-50"
                  disabled={loading || formData.tags.length >= 10}
                />
              </div>

              {/* Common Tags */}
              <div>
                <p className="text-sm text-textSecondary mb-2">Popular tags:</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      disabled={
                        loading ||
                        formData.tags.includes(tag) ||
                        formData.tags.length >= 10
                      }
                      className="px-3 py-1 bg-text text-primary rounded text-sm hover:bg-lightGreen transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3 inline mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-textSecondary">
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="flex items-center gap-2 px-6 py-3 bg-lightGreen text-primary rounded font-semibold hover:bg-lightGreen/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Snippet
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/snippets")}
              disabled={loading}
              className="px-6 py-3 bg-textSecondary text-primary rounded font-semibold hover:bg-textSecondary/80 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            {(formData.title ||
              formData.description ||
              formData.code ||
              formData.tags.length > 0) && (
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-4 py-3 text-textSecondary hover:text-red-400 transition-colors disabled:opacity-50"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}