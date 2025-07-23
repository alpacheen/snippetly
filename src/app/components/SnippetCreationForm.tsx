// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabase";
// import { toast } from "sonner";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
// import { title } from "process";

// const languages = [
//   "JavaScript",
//   "Python",
//   "Java",
//   "C#",
//   "Ruby",
//   "Go",
//   "PHP",
//   "TypeScript",
//   "C++",
//   "Swift",
//   "Kotlin",
//   "Rust",
//   "Dart",
//   "Scala",
//   "Shell",
//   "HTML",
//   "CSS",
//   "SQL",
//   "JSON",
//   "YAML",
//   "XML",
// ];

// const commonTags = [
//   "frontend",
//   "backend",
//   "utility",
//   "algorithm",
//   "database",
//   "api",
//   "authentication",
//   "validation",
//   "animation",
//   "responsive",
//   "hooks",
//   "components",
//   "styling",
//   "optimization",
//   "security",
//   "testing",
//   "deployment",
//   "debugging",
// ];

// interface CreateSnippetFormProps {
//   userId?: string;
// }
// export default function CreateSnippetForm({userId}: CreateSnippetFormProps) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [preview, setPreview] = useState(false);
//   const [tagInput, setTagInput] = useState("");

//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     code: "",
//     language: "JavaScript",
//     tags: [] as string[],

//   });

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleAddTag = (tag: string) => {
//     if (tag && !formData.tags.includes(tag)) {
//       setFormData(prev => ({
//         ...prev,
//         tags: [...prev.tags, tag],
//       }));
//     }
//   };

//   const handleRemoveTag = (tagToRemove: string) => {
//     setFormData(prev => ({
//       ...prev,
//       tags: prev.tags.filter(tag => tag !== tagToRemove),
//     }));
//   };

//   const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" && tagInput.trim()) {
//       e.preventDefault();
//       handleAddTag(tagInput.trim());
//       setTagInput("");
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     //Check current user
//     const { data: { user }, error: userError } = await supabase.auth.getUser();
//     console.log("Current User:", user);
//     console.log("User Error:", userError);
//     console.log("User ID:", userId);

//     if (!formData.title.trim() || !formData.code.trim() ){
//       toast.error("Please fill in all required fields");
//       return;
//     }
//     if (!userId){
//       toast.error("User ID is required to create a snippet");
//       return;
//     }

//     const insertData = {
//       title: formData.title.trim(),
//       description: formData.description.trim(),
//       code: formData.code.trim(),
//       language: formData.language,
//       tags: formData.tags,
//       user_id: userId || user?.id || null,
//     }
//     console.log("Insert Data:", insertData);
//     console.log("Tags type: ", typeof insertData.tags,);

//     setLoading(true);

//     try {
//       console.log("Submitting snippet to Supabase...");
//       const { data , error } = await supabase
//         .from("snippets")
//         .insert(insertData)
//         .select()
//         .single();

//       if (error) {
//         console.log("Supabase Error Details:", {
//           message: error.message,
//           code: error.code,
//           details: error.details,
//         });
//         toast.error("Failed to create snippet: " + error.message);
//       }
//       console.log("Snippet created successfully:", data);
//       toast.success("Snippet created successfully!");

//       setFormData({
//         title: "",
//         description: "",
//         code: "",
//         language: "JavaScript",
//         tags: [],
//       });

//       if(data?.id) {
//         router.push(`/snippets/${data.id}`);
//       } else {
//         router.push("/snippets");
//       }

//     } catch (error) {
//       console.error("Network error:", error);
//       toast.error("Failed to create snippet");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold"></h1>
//         <button
//           type="button"
//           onClick={() => setPreview(!preview)}
//           className="px-4 py-2 bg-lightGreen text-primary rounded hover:bg-lightGreen/80 transition"
//         >
//           {preview ? "Edit" : "Preview"}
//         </button>
//       </div>

//       {preview ? (
//         <div className="space-y-6">
//           <div className="bg-primary border rounded-lg p-6">
//             <h2 className="text-xl font-semibold mb-2">{formData.title || "Untitled Snippet"}</h2>
//             <p className="text-textSecondary mb-4">{formData.description || "No description provided"}</p>
//             <p className="text-sm text-neutral-500 mb-4">
//               Language: {formData.language} | Author: {userId || "Anonymous"}
//             </p>

//             {formData.code && (
//               <SyntaxHighlighter
//                 language={formData.language.toLowerCase()}
//                 style={vscDarkPlus}
//                 className="border-3 border-text"
//               >
//                 {formData.code}
//               </SyntaxHighlighter>
//             )}

//             {formData.tags.length > 0 && (
//               <div className="mt-4">
//                 <p className="text-sm text-neutral-400 mb-2">Tags:</p>
//                 <div className="flex flex-wrap gap-2">
//                   {formData.tags.map((tag) => (
//                     <span
//                       key={tag}
//                       className="px-2 py-1 bg-darkGreen text-text rounded text-sm"
//                     >
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       ) : (
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label htmlFor="title" className="block text-sm font-medium mb-2">
//                 Title *
//               </label>
//               <input
//                 type="text"
//                 id="title"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleInputChange}
//                 placeholder="Enter snippet title"
//                 className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
//                 required
//               />
//             </div>
//             </div>
//           <div>
//             <label htmlFor="description" className="block text-sm font-medium mb-2">
//               Description
//             </label>
//             <textarea
//               id="description"
//               name="description"
//               value={formData.description}
//               onChange={handleInputChange}
//               placeholder="Describe what this snippet does..."
//               rows={3}
//               className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
//             />
//           </div>

//           <div>
//             <label htmlFor="language" className="block text-sm font-medium mb-2">
//               Language *
//             </label>
//             <select
//               id="language"
//               name="language"
//               value={formData.language}
//               onChange={handleInputChange}
//               className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
//               required
//             >
//               {languages.map((lang) => (
//                 <option key={lang} value={lang}>
//                   {lang}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label htmlFor="code" className="block text-sm font-medium mb-2">
//               Code *
//             </label>
//             <textarea
//               id="code"
//               name="code"
//               value={formData.code}
//               onChange={handleInputChange}
//               placeholder="Paste your code here..."
//               rows={12}
//               className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none font-mono"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">Tags</label>
//             <div className="space-y-3">
//               <input
//                 type="text"
//                 value={tagInput}
//                 onChange={(e) => setTagInput(e.target.value)}
//                 onKeyDown={handleTagInputKeyDown}
//                 placeholder="Type a tag and press Enter"
//                 className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
//               />

//               <div className="space-y-2">
//                 <p className="text-sm text-textSecondary">Common tags:</p>
//                 <div className="flex flex-wrap gap-2">
//                   {commonTags.map((tag) => (
//                     <button
//                       key={tag}
//                       type="button"
//                       onClick={() => handleAddTag(tag)}
//                       className="px-3 py-1 bg-text text-primary rounded text-sm hover:bg-lightGreen transition"
//                     >
//                       {tag}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {formData.tags.length > 0 && (
//                 <div className="space-y-2">
//                   <p className="text-sm text-textSecondary">Selected tags:</p>
//                   <div className="flex flex-wrap gap-2">
//                     {formData.tags.map((tag) => (
//                       <span
//                         key={tag}
//                         className="px-3 py-1 bg-darkGreen text-text rounded text-sm flex items-center gap-2"
//                       >
//                         {tag}
//                         <button
//                           type="button"
//                           onClick={() => handleRemoveTag(tag)}
//                           className="text-red-300 hover:text-red-500 ml-1"
//                         >
//                           ×
//                         </button>
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="flex gap-4">
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-6 py-3 bg-lightGreen text-primary rounded font-semibold hover:bg-lightGreen/80 disabled:opacity-50 transition"
//             >
//               {loading ? "Creating..." : "Create Snippet"}
//             </button>

//             <button
//               type="button"
//               onClick={() => router.push("/snippets")}
//               className="px-6 py-3 bg-textSecondary text-primary rounded font-semibold hover:bg-textSecondary/80 transition"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       )}
//     </div>
//   );
// }
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabase";
// import { toast } from "sonner";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// const languages = [
//   "JavaScript",
//   "Python",
//   "Java",
//   "C#",
//   "Ruby",
//   "Go",
//   "PHP",
//   "TypeScript",
//   "C++",
//   "Swift",
//   "Kotlin",
//   "Rust",
//   "Dart",
//   "Scala",
//   "Shell",
//   "HTML",
//   "CSS",
//   "SQL",
//   "JSON",
//   "YAML",
//   "XML",
// ];

// const commonTags = [
//   "frontend",
//   "backend",
//   "utility",
//   "algorithm",
//   "database",
//   "api",
//   "authentication",
//   "validation",
//   "animation",
//   "responsive",
//   "hooks",
//   "components",
//   "styling",
//   "optimization",
//   "security",
//   "testing",
//   "deployment",
//   "debugging",
// ];

// interface CreateSnippetFormProps {
//   userId?: string;
// }

// export default function CreateSnippetForm({ userId }: CreateSnippetFormProps) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [preview, setPreview] = useState(false);
//   const [tagInput, setTagInput] = useState("");

//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     code: "",
//     language: "JavaScript",
//     tags: [] as string[],
//   });

//   const handleInputChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleAddTag = (tag: string) => {
//     if (tag && !formData.tags.includes(tag)) {
//       setFormData((prev) => ({
//         ...prev,
//         tags: [...prev.tags, tag],
//       }));
//     }
//   };

//   const handleRemoveTag = (tagToRemove: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       tags: prev.tags.filter((tag) => tag !== tagToRemove),
//     }));
//   };

//   const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" && tagInput.trim()) {
//       e.preventDefault();
//       handleAddTag(tagInput.trim());
//       setTagInput("");
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validate required fields
//     if (!formData.title.trim() || !formData.code.trim()) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     if (!userId) {
//       toast.error("You must be logged in to create a snippet");
//       return;
//     }

//     const insertData = {
//       title: formData.title.trim(),
//       description: formData.description.trim(),
//       code: formData.code.trim(),
//       language: formData.language,
//       tags: formData.tags,
//       user_id: userId,
//     };

//     setLoading(true);

//     try {
//       const { data, error } = await supabase
//         .from("snippets")
//         .insert(insertData)
//         .select()
//         .single();

//       if (error) {
//         console.error("Supabase Error Details:", {
//           message: error.message,
//           code: error.code,
//           details: error.details,
//         });
//         toast.error("Failed to create snippet: " + error.message);
//         return;
//       }

//       toast.success("Snippet created successfully!");

//       // Reset form
//       setFormData({
//         title: "",
//         description: "",
//         code: "",
//         language: "JavaScript",
//         tags: [],
//       });
//       setTagInput("");

//       if (data?.id) {
//         router.push(`/snippets/${data.id}`);
//       } else {
//         router.push("/snippets");
//       }
//     } catch (error) {
//       console.error("Network error:", error);
//       toast.error("Failed to create snippet");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">Create New Snippet</h1>
//         <button
//           type="button"
//           onClick={() => setPreview(!preview)}
//           className="px-4 py-2 bg-lightGreen text-primary rounded hover:bg-lightGreen/80 transition"
//         >
//           {preview ? "Edit" : "Preview"}
//         </button>
//       </div>

//       {preview ? (
//         <div className="space-y-6">
//           <div className="bg-primary border rounded-lg p-6">
//             <h2 className="text-xl font-semibold mb-2">
//               {formData.title || "Untitled Snippet"}
//             </h2>
//             <p className="text-textSecondary mb-4">
//               {formData.description || "No description provided"}
//             </p>
//             <p className="text-sm text-neutral-500 mb-4">
//               Language: {formData.language} | Author: {userId || "Anonymous"}
//             </p>

//             {formData.code && (
//               <SyntaxHighlighter
//                 language={formData.language.toLowerCase()}
//                 style={vscDarkPlus}
//                 className="border-3 border-text"
//               >
//                 {formData.code}
//               </SyntaxHighlighter>
//             )}

//             {formData.tags.length > 0 && (
//               <div className="mt-4">
//                 <p className="text-sm text-neutral-400 mb-2">Tags:</p>
//                 <div className="flex flex-wrap gap-2">
//                   {formData.tags.map((tag) => (
//                     <span
//                       key={tag}
//                       className="px-2 py-1 bg-darkGreen text-text rounded text-sm"
//                     >
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       ) : (
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label htmlFor="title" className="block text-sm font-medium mb-2">
//                 Title *
//               </label>
//               <input
//                 type="text"
//                 id="title"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleInputChange}
//                 placeholder="Enter snippet title"
//                 className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
//                 required
//                 disabled={loading}
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="language"
//                 className="block text-sm font-medium mb-2"
//               >
//                 Language *
//               </label>
//               <select
//                 id="language"
//                 name="language"
//                 value={formData.language}
//                 onChange={handleInputChange}
//                 className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
//                 required
//                 disabled={loading}
//               >
//                 {languages.map((lang) => (
//                   <option key={lang} value={lang}>
//                     {lang}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div>
//             <label
//               htmlFor="description"
//               className="block text-sm font-medium mb-2"
//             >
//               Description
//             </label>
//             <textarea
//               id="description"
//               name="description"
//               value={formData.description}
//               onChange={handleInputChange}
//               placeholder="Describe what this snippet does..."
//               rows={3}
//               className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
//               disabled={loading}
//             />
//           </div>

//           <div>
//             <label htmlFor="code" className="block text-sm font-medium mb-2">
//               Code *
//             </label>
//             <textarea
//               id="code"
//               name="code"
//               value={formData.code}
//               onChange={handleInputChange}
//               placeholder="Paste your code here..."
//               rows={12}
//               className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none font-mono"
//               required
//               disabled={loading}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">Tags</label>
//             <div className="space-y-3">
//               <input
//                 type="text"
//                 value={tagInput}
//                 onChange={(e) => setTagInput(e.target.value)}
//                 onKeyDown={handleTagInputKeyDown}
//                 placeholder="Type a tag and press Enter"
//                 className="w-full border px-3 py-2 rounded bg-primary text-text border-textSecondary focus:border-lightGreen focus:outline-none"
//                 disabled={loading}
//               />

//               <div className="space-y-2">
//                 <p className="text-sm text-textSecondary">Common tags:</p>
//                 <div className="flex flex-wrap gap-2">
//                   {commonTags.map((tag) => (
//                     <button
//                       key={tag}
//                       type="button"
//                       onClick={() => handleAddTag(tag)}
//                       disabled={loading}
//                       className="px-3 py-1 bg-text text-primary rounded text-sm hover:bg-lightGreen transition disabled:opacity-50"
//                     >
//                       {tag}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {formData.tags.length > 0 && (
//                 <div className="space-y-2">
//                   <p className="text-sm text-textSecondary">Selected tags:</p>
//                   <div className="flex flex-wrap gap-2">
//                     {formData.tags.map((tag) => (
//                       <span
//                         key={tag}
//                         className="px-3 py-1 bg-darkGreen text-text rounded text-sm flex items-center gap-2"
//                       >
//                         {tag}
//                         <button
//                           type="button"
//                           onClick={() => handleRemoveTag(tag)}
//                           disabled={loading}
//                           className="text-red-300 hover:text-red-500 ml-1 disabled:opacity-50"
//                         >
//                           ×
//                         </button>
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="flex gap-4">
//             <button
//               type="submit"
//               disabled={
//                 loading || !formData.title.trim() || !formData.code.trim()
//               }
//               className="px-6 py-3 bg-lightGreen text-primary rounded font-semibold hover:bg-lightGreen/80 disabled:opacity-50 transition"
//             >
//               {loading ? "Creating..." : "Create Snippet"}
//             </button>

//             <button
//               type="button"
//               onClick={() => router.push("/snippets")}
//               disabled={loading}
//               className="px-6 py-3 bg-textSecondary text-primary rounded font-semibold hover:bg-textSecondary/80 transition disabled:opacity-50"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       )}
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Eye, Code, Save, X, Plus } from "lucide-react";
import { withErrorHandling, validateForm, showValidationErrors } from "@/app/components/ErrorUtils";
import type { CreateSnippetForm, SupportedLanguage, CommonTag } from "@/types";
import { SUPPORTED_LANGUAGES, COMMON_TAGS } from "@/types";

interface SnippetCreationFormProps {
  userId: string;
}

const validationRules = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 200,
    message: 'Title must be between 1-200 characters'
  },
  description: {
    maxLength: 1000,
    message: 'Description must be less than 1000 characters'
  },
  code: {
    required: true,
    minLength: 1,
    message: 'Code is required'
  },
  language: {
    required: true,
    message: 'Please select a language'
  }
};

export default function SnippetCreationForm({ userId }: SnippetCreationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [tagInput, setTagInput] = useState("");
  
  const [formData, setFormData] = useState<CreateSnippetForm>({
    title: "",
    description: "",
    code: "",
    language: "JavaScript",
    tags: [],
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
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !formData.tags.includes(cleanTag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, cleanTag],
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
    } else if (e.key === "Backspace" && !tagInput && formData.tags.length > 0) {
      // Remove last tag if backspace is pressed on empty input
      handleRemoveTag(formData.tags[formData.tags.length - 1]);
    }
  };

  const handleSubmit = withErrorHandling(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm(formData, validationRules);
    if (errors.length > 0) {
      showValidationErrors(errors);
      return;
    }

    if (!userId) {
      toast.error("You must be logged in to create a snippet");
      return;
    }

    setLoading(true);

    const insertData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      code: formData.code.trim(),
      language: formData.language,
      tags: formData.tags,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from("snippets")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create snippet: ${error.message}`);
    }

    toast.success("Snippet created successfully!");

    // Reset form
    setFormData({
      title: "",
      description: "",
      code: "",
      language: "JavaScript",
      tags: [],
    });
    setTagInput("");

    if (data?.id) {
      router.push(`/snippets/${data.id}`);
    } else {
      router.push("/snippets");
    }
  }, 'Create snippet');

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      code: "",
      language: "JavaScript",
      tags: [],
    });
    setTagInput("");
    setPreview(false);
  };

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
                <span>by {userId}</span>
              </div>
            </header>
            
            {formData.code && (
              <div className="mb-6">
                <SyntaxHighlighter 
                  language={formData.language.toLowerCase()} 
                  style={vscDarkPlus}
                  showLineNumbers
                  wrapLines
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
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
                      {tag}
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
          {/* Title and Language Row */}
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
            <p className="text-xs text-textSecondary mt-1">
              Use proper indentation and formatting for better readability
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tags {formData.tags.length > 0 && `(${formData.tags.length}/10)`}
            </label>
            
            {/* Tag Input */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 p-3 border border-textSecondary rounded-lg bg-primary min-h-[2.5rem] items-center">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 bg-darkGreen text-text rounded text-sm"
                  >
                    {tag}
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
                  placeholder={formData.tags.length === 0 ? "Type a tag and press Enter..." : "Add another tag..."}
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
                      disabled={loading || formData.tags.includes(tag) || formData.tags.length >= 10}
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
              disabled={loading || !formData.title.trim() || !formData.code.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-lightGreen text-primary rounded font-semibold hover:bg-lightGreen/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? "Creating..." : "Create Snippet"}
            </button>
            
            <button
              type="button"
              onClick={() => router.push("/snippets")}
              disabled={loading}
              className="px-6 py-3 bg-textSecondary text-primary rounded font-semibold hover:bg-textSecondary/80 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            {(formData.title || formData.description || formData.code || formData.tags.length > 0) && (
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