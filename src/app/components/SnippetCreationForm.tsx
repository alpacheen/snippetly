"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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

const commonTags = [
  "frontend",
  "backend",
  "utility",
  "algorithm",
  "database",
  "api",
  "authentication",
  "validation",
  "animation",
  "responsive",
  "hooks",
  "components",
  "styling",
  "optimization",
  "security",
  "testing",
  "deployment",
  "debugging",
];

export default function CreateSnippetForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [tagInput, setTagInput] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    language: "JavaScript",
    tags: [] as string[],
    author: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      handleAddTag(tagInput.trim());
      setTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.code.trim() || !formData.author.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("snippets")
        .insert([
          {
            title: formData.title.trim(),
            description: formData.description.trim(),
            code: formData.code.trim(),
            language: formData.language,
            tags: formData.tags,
            author: formData.author.trim(),
            rating: 0,
            ratings_count: 0,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating snippet:", error);
        toast.error("Failed to create snippet");
      } else {
        toast.success("Snippet created successfully!");
        router.push(`/snippets/${data.id}`);
      }
    } catch (error) {
      console.error("Error creating snippet:", error);
      toast.error("Failed to create snippet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Snippet</h1>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className="px-4 py-2 bg-lightGreen text-primary rounded hover:bg-lightGreen/80 transition"
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        <div className="space-y-6">
          <div className="bg-primary border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">{formData.title || "Untitled Snippet"}</h2>
            <p className="text-textSecondary mb-4">{formData.description || "No description provided"}</p>
            <p className="text-sm text-neutral-500 mb-4">
              Language: {formData.language} | Author: {formData.author || "Anonymous"}
            </p>
            
            {formData.code && (
              <SyntaxHighlighter 
                language={formData.language.toLowerCase()} 
                style={vscDarkPlus}
                className="border-3 border-text"
              >
                {formData.code}
              </SyntaxHighlighter>
            )}
            
            {formData.tags.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-neutral-400 mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-darkGreen text-text rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter snippet title"
                className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium mb-2">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Your name"
                className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what this snippet does..."
              rows={3}
              className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
            />
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
              className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
              required
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

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
              rows={12}
              className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="space-y-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Type a tag and press Enter"
                className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
              />
              
              <div className="space-y-2">
                <p className="text-sm text-textSecondary">Common tags:</p>
                <div className="flex flex-wrap gap-2">
                  {commonTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="px-3 py-1 bg-text text-primary rounded text-sm hover:bg-lightGreen transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-textSecondary">Selected tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-darkGreen text-text rounded text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-red-300 hover:text-red-500 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-lightGreen text-primary rounded font-semibold hover:bg-lightGreen/80 disabled:opacity-50 transition"
            >
              {loading ? "Creating..." : "Create Snippet"}
            </button>
            
            <button
              type="button"
              onClick={() => router.push("/snippets")}
              className="px-6 py-3 bg-textSecondary text-primary rounded font-semibold hover:bg-textSecondary/80 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}