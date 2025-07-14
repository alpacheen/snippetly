// "use client";
// import React, { useState, useCallback, useMemo } from 'react';
// import {Plus, X, Code, Save, Eye, EyeOff, Loader2, AlertCircle, Check} from 'lucide-react';
// import {toast} from 'sonner';

// interface SnippetFormdata {
//     title: string;
//     decsription: string;
//     code: string;
//     language: string;
//     tages: string[];
//     isPublic: boolean;
// }

// interface ValidationErrors {
//     title?: string;
//     description?: string;
//     code?: string;
//     language?: string;
//     tags?: string;
// }

// const SUPPORTED_LANGUAGES = [
//     { value: 'javascript', label: 'JavaScript', extension: '.js' },
//   { value: 'typescript', label: 'TypeScript', extension: '.ts' },
//   { value: 'python', label: 'Python', extension: '.py' },
//   { value: 'java', label: 'Java', extension: '.java' },
//   { value: 'csharp', label: 'C#', extension: '.cs' },
//   { value: 'cpp', label: 'C++', extension: '.cpp' },
//   { value: 'go', label: 'Go', extension: '.go' },
//   { value: 'rust', label: 'Rust', extension: '.rs' },
//   { value: 'php', label: 'PHP', extension: '.php' },
//   { value: 'ruby', label: 'Ruby', extension: '.rb' },
//   { value: 'swift', label: 'Swift', extension: '.swift' },
//   { value: 'kotlin', label: 'Kotlin', extension: '.kt' },
//   { value: 'dart', label: 'Dart', extension: '.dart' },
//   { value: 'scala', label: 'Scala', extension: '.scala' },
//   { value: 'shell', label: 'Shell', extension: '.sh' },
//   { value: 'html', label: 'HTML', extension: '.html' },
//   { value: 'css', label: 'CSS', extension: '.css' },
//   { value: 'sql', label: 'SQL', extension: '.sql' },
//   { value: 'json', label: 'JSON', extension: '.json' },
//   { value: 'yaml', label: 'YAML', extension: '.yml' },
// ].sort((a, b) => a.label.localeCompare(b.label));

// const POPULAR_TAGS = [
//     'function', 'utility', 'helper', 'api', 'database', 'frontend', 'backend',
//   'react', 'vue', 'angular', 'node', 'express', 'mongoose', 'validation','animation',
//   'authentication', 'middleware', 'hooks', 'component', 'algorithm', 'optimization'
// ];

// //Validation utility functions

// const validateForm = (data: SnippetFormdata): ValidationErrors => {
//     const errors: ValidationErrors = {};

//     if(!data.title.trim()) {
//         errors.title = 'Title is required';
//     } else if (data.title.trim().length < 3) {
//         errors.title = 'Title must be at least 3 characters';
//     } else if (data.title.trim().length > 100) {
//         errors.title = 'Title must be less than 100 characters';
//     }

//     if(!data.decsription.trim()) {
//         errors.description = 'Description is required';
//     } else if (data.decsription.trim().length < 10) {
//         errors.description = 'Description must be at least 10 characters';
//     } else if (data.decsription.trim().length > 500) {
//         errors.description = 'Description must be less than 500 characters';
//     }

//     if(!data.code.trim()) {
//         errors.code = 'Code is required';
//     } else if (data.code.trim().length < 10) {
//         errors.code = 'Code must be at least 10 characters';
//     } else if (data.code.trim().length > 5000) {
//         errors.code = 'Code must be less than 5000 characters';
//     }

//     if(!data.language) {
//         errors.language = 'Language is required';
//     } 
//     if(!data.tags.length) {
//         errors.tags = 'At least one tag is required';
//     } else if (data.tags.length > 5) {
//         errors.tags = 'You can only add up to 5 tags';
//     }
//     return errors;
// };

// const sanitizeInput = (input: string): string => {
//     return input.trim().replace(/[<>]/g,'');
// };

// //custom hooks
// const useFormValidation = (data: SnippetFormdata) => {
//     return useMemo(() => validateForm(data), [data]);
// };

// const useDebounce = (value: string, delay: number) => {
//     const [debouncedValue, setDebouncedValue] = useState(value);
  
//     React.useEffect(() => {
//       const handler = setTimeout(() => {
//         setDebouncedValue(value);
//       }, delay);
  
//       return () => {
//         clearTimeout(handler);
//       };
//     }, [value, delay]);
  
//     return debouncedValue;
//   };

//   //Main component
//   export default function SnippetCreationForm() {
//     const [formData, setFormData] = useState<SnippetFormData>({
//       title: '',
//       description: '',
//       code: '',
//       language: '',
//       tags: [],
//       isPublic: true
//     });
  
//     const [newTag, setNewTag] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [isDraft, setIsDraft] = useState(false);
//     const [showPreview, setShowPreview] = useState(false);
//     const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
//     const errors = useFormValidation(formData);
//     const debouncedTitle = useDebounce(formData.title, 300);
//     const isFormValid = Object.keys(errors).length === 0;
  
//     // Auto-save draft functionality
//     React.useEffect(() => {
//       if (hasUnsavedChanges && debouncedTitle) {
//         const savedDraft = {
//           ...formData,
//           lastSaved: new Date().toISOString()
//         };
//         // In a real app, save to localStorage or backend
//         console.log('Auto-saving draft:', savedDraft);
//         setIsDraft(true);
//       }
//     }, [debouncedTitle, formData, hasUnsavedChanges]);
  
//     const handleInputChange = useCallback((field: keyof SnippetFormData, value: any) => {
//       setFormData(prev => ({ ...prev, [field]: value }));
//       setHasUnsavedChanges(true);
//     }, []);
  
//     const handleAddTag = useCallback(() => {
//       const trimmedTag = sanitizeInput(newTag.toLowerCase());
//       if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
//         handleInputChange('tags', [...formData.tags, trimmedTag]);
//         setNewTag('');
//       }
//     }, [newTag, formData.tags, handleInputChange]);
  
//     const handleRemoveTag = useCallback((tagToRemove: string) => {
//       handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
//     }, [formData.tags, handleInputChange]);
  
//     const handlePopularTagClick = useCallback((tag: string) => {
//       if (!formData.tags.includes(tag) && formData.tags.length < 10) {
//         handleInputChange('tags', [...formData.tags, tag]);
//       }
//     }, [formData.tags, handleInputChange]);
  
//     const handleSubmit = async (e?: React.FormEvent) => {
//       if (e) e.preventDefault();
      
//       if (!isFormValid) {
//         toast.error('Please fix the errors before submitting');
//         return;
//       }
  
//       setIsSubmitting(true);
      
//       try {
//         const sanitizedData = {
//           ...formData,
//           title: sanitizeInput(formData.title),
//           description: sanitizeInput(formData.description),
//           code: formData.code.trim(),
//           tags: formData.tags.map(tag => sanitizeInput(tag))
//         };
  
//         // Simulate API call
//         await new Promise(resolve => setTimeout(resolve, 1500));
        
//         toast.success('Snippet created successfully!');
        
//         // Reset form
//         setFormData({
//           title: '',
//           description: '',
//           code: '',
//           language: '',
//           tags: [],
//           isPublic: true
//         });
//         setHasUnsavedChanges(false);
//         setIsDraft(false);
        
//       } catch (error) {
//         toast.error('Failed to create snippet. Please try again.');
//         console.error('Submission error:', error);
//       } finally {
//         setIsSubmitting(false);
//       }
//     };
  
//     const handleKeyDown = (e: React.KeyboardEvent) => {
//       if (e.key === 'Enter' && e.ctrlKey) {
//         handleSubmit();
//       }
//     };
  
//     const selectedLanguage = SUPPORTED_LANGUAGES.find(lang => lang.value === formData.language);
  
//     return (
//       <div className="max-w-4xl mx-auto p-6 bg-primary rounded-lg shadow-lg">
//         <div className="flex items-center justify-between mb-6">
//           <h1 className="text-2xl font-bold text-text flex items-center gap-2">
//             <Code className="w-6 h-6 text-lightGreen" />
//             Create New Snippet
//           </h1>
//           {isDraft && (
//             <div className="flex items-center gap-2 text-sm text-lightGreen">
//               <Save className="w-4 h-4" />
//               Draft saved
//             </div>
//           )}
//         </div>
  
//         <div className="space-y-6" onKeyDown={handleKeyDown}>
//           {/* Title */}
//           <div>
//             <label htmlFor="title" className="block text-sm font-medium text-text mb-2">
//               Title *
//             </label>
//             <input
//               id="title"
//               type="text"
//               value={formData.title}
//               onChange={(e) => handleInputChange('title', e.target.value)}
//               placeholder="Enter a descriptive title for your snippet"
//               className={`w-full px-4 py-3 rounded-lg border-2 bg-primary text-text placeholder-textSecondary transition-colors focus:outline-none focus:ring-2 focus:ring-lightGreen ${
//                 errors.title ? 'border-red-500' : 'border-textSecondary focus:border-lightGreen'
//               }`}
//               maxLength={100}
//             />
//             {errors.title && (
//               <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
//                 <AlertCircle className="w-4 h-4" />
//                 {errors.title}
//               </p>
//             )}
//             <p className="mt-1 text-xs text-textSecondary">
//               {formData.title.length}/100 characters
//             </p>
//           </div>
  
//           {/* Description */}
//           <div>
//             <label htmlFor="description" className="block text-sm font-medium text-text mb-2">
//               Description *
//             </label>
//             <textarea
//               id="description"
//               value={formData.description}
//               onChange={(e) => handleInputChange('description', e.target.value)}
//               placeholder="Describe what this snippet does and when to use it"
//               rows={3}
//               className={`w-full px-4 py-3 rounded-lg border-2 bg-primary text-text placeholder-textSecondary transition-colors focus:outline-none focus:ring-2 focus:ring-lightGreen resize-vertical ${
//                 errors.description ? 'border-red-500' : 'border-textSecondary focus:border-lightGreen'
//               }`}
//               maxLength={500}
//             />
//             {errors.description && (
//               <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
//                 <AlertCircle className="w-4 h-4" />
//                 {errors.description}
//               </p>
//             )}
//             <p className="mt-1 text-xs text-textSecondary">
//               {formData.description.length}/500 characters
//             </p>
//           </div>
  
//           {/* Language */}
//           <div>
//             <label htmlFor="language" className="block text-sm font-medium text-text mb-2">
//               Language *
//             </label>
//             <select
//               id="language"
//               value={formData.language}
//               onChange={(e) => handleInputChange('language', e.target.value)}
//               className={`w-full px-4 py-3 rounded-lg border-2 bg-primary text-text transition-colors focus:outline-none focus:ring-2 focus:ring-lightGreen ${
//                 errors.language ? 'border-red-500' : 'border-textSecondary focus:border-lightGreen'
//               }`}
//             >
//               <option value="">Select a language</option>
//               {SUPPORTED_LANGUAGES.map(lang => (
//                 <option key={lang.value} value={lang.value}>
//                   {lang.label} ({lang.extension})
//                 </option>
//               ))}
//             </select>
//             {errors.language && (
//               <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
//                 <AlertCircle className="w-4 h-4" />
//                 {errors.language}
//               </p>
//             )}
//           </div>
  
//           {/* Code */}
//           <div>
//             <div className="flex items-center justify-between mb-2">
//               <label htmlFor="code" className="block text-sm font-medium text-text">
//                 Code *
//               </label>
//               <button
//                 type="button"
//                 onClick={() => setShowPreview(!showPreview)}
//                 className="flex items-center gap-1 text-sm text-lightGreen hover:text-lightGreen/80 transition-colors"
//               >
//                 {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                 {showPreview ? 'Hide Preview' : 'Show Preview'}
//               </button>
//             </div>
            
//             <div className="relative">
//               <textarea
//                 id="code"
//                 value={formData.code}
//                 onChange={(e) => handleInputChange('code', e.target.value)}
//                 placeholder="Paste your code here..."
//                 rows={12}
//                 className={`w-full px-4 py-3 rounded-lg border-2 bg-primary text-text placeholder-textSecondary font-mono text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-lightGreen resize-vertical ${
//                   errors.code ? 'border-red-500' : 'border-textSecondary focus:border-lightGreen'
//                 }`}
//                 style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
//               />
//               {selectedLanguage && (
//                 <div className="absolute top-2 right-2 px-2 py-1 bg-darkGreen text-text text-xs rounded">
//                   {selectedLanguage.label}
//                 </div>
//               )}
//             </div>
            
//             {errors.code && (
//               <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
//                 <AlertCircle className="w-4 h-4" />
//                 {errors.code}
//               </p>
//             )}
            
//             {showPreview && formData.code && (
//               <div className="mt-4 p-4 bg-gray-900 rounded-lg">
//                 <p className="text-sm text-gray-400 mb-2">Preview:</p>
//                 <pre className="text-sm text-gray-100 overflow-x-auto">
//                   <code>{formData.code}</code>
//                 </pre>
//               </div>
//             )}
//           </div>
  
//           {/* Tags */}
//           <div>
//             <label className="block text-sm font-medium text-text mb-2">
//               Tags * (helps others find your snippet)
//             </label>
            
//             {/* Current Tags */}
//             <div className="flex flex-wrap gap-2 mb-3">
//               {formData.tags.map(tag => (
//                 <span
//                   key={tag}
//                   className="inline-flex items-center gap-1 px-3 py-1 bg-darkGreen text-text rounded-full text-sm"
//                 >
//                   {tag}
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveTag(tag)}
//                     className="text-text hover:text-red-300 transition-colors"
//                   >
//                     <X className="w-3 h-3" />
//                   </button>
//                 </span>
//               ))}
//             </div>
  
//             {/* Add New Tag */}
//             <div className="flex gap-2 mb-3">
//               <input
//                 type="text"
//                 value={newTag}
//                 onChange={(e) => setNewTag(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter') {
//                     e.preventDefault();
//                     handleAddTag();
//                   }
//                 }}
//                 placeholder="Add a tag..."
//                 className="flex-1 px-3 py-2 rounded-lg border-2 bg-primary text-text placeholder-textSecondary border-textSecondary focus:border-lightGreen focus:outline-none focus:ring-2 focus:ring-lightGreen"
//                 maxLength={20}
//               />
//               <button
//                 type="button"
//                 onClick={handleAddTag}
//                 disabled={!newTag.trim() || formData.tags.length >= 10}
//                 className="px-4 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
//               >
//                 <Plus className="w-4 h-4" />
//                 Add
//               </button>
//             </div>
  
//             {/* Popular Tags */}
//             <div>
//               <p className="text-sm text-textSecondary mb-2">Popular tags:</p>
//               <div className="flex flex-wrap gap-2">
//                 {POPULAR_TAGS.map(tag => (
//                   <button
//                     key={tag}
//                     type="button"
//                     onClick={() => handlePopularTagClick(tag)}
//                     disabled={formData.tags.includes(tag) || formData.tags.length >= 10}
//                     className="px-2 py-1 bg-textSecondary text-primary rounded text-xs hover:bg-textSecondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     {tag}
//                   </button>
//                 ))}
//               </div>
//             </div>
  
//             {errors.tags && (
//               <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
//                 <AlertCircle className="w-4 h-4" />
//                 {errors.tags}
//               </p>
//             )}
//             <p className="mt-1 text-xs text-textSecondary">
//               {formData.tags.length}/10 tags
//             </p>
//           </div>
  
//           {/* Visibility */}
//           <div>
//             <label className="flex items-center gap-3">
//               <input
//                 type="checkbox"
//                 checked={formData.isPublic}
//                 onChange={(e) => handleInputChange('isPublic', e.target.checked)}
//                 className="w-4 h-4 text-lightGreen bg-primary border-textSecondary rounded focus:ring-lightGreen focus:ring-2"
//               />
//               <span className="text-sm text-text">
//                 Make this snippet public (others can view and use it)
//               </span>
//             </label>
//           </div>
  
//           {/* Submit Button */}
//           <div className="flex items-center justify-between pt-4">
//             <p className="text-sm text-textSecondary">
//               Press <kbd className="px-2 py-1 bg-textSecondary text-primary rounded text-xs">Ctrl+Enter</kbd> to submit
//             </p>
            
//             <button
//               type="button"
//               onClick={handleSubmit}
//               disabled={!isFormValid || isSubmitting}
//               className="px-6 py-3 bg-lightGreen text-primary rounded-lg font-medium hover:bg-lightGreen/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
//             >
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Check className="w-4 h-4" />
//                   Create Snippet
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }
// src/app/components/SnippetCreationForm.tsx
"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Plus, X, Code, Save, Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Types
interface SnippetFormData {
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  isPublic: boolean;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  code?: string;
  language?: string;
  tags?: string;
}

// Constants
const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', extension: '.js' },
  { value: 'typescript', label: 'TypeScript', extension: '.ts' },
  { value: 'python', label: 'Python', extension: '.py' },
  { value: 'java', label: 'Java', extension: '.java' },
  { value: 'csharp', label: 'C#', extension: '.cs' },
  { value: 'cpp', label: 'C++', extension: '.cpp' },
  { value: 'go', label: 'Go', extension: '.go' },
  { value: 'rust', label: 'Rust', extension: '.rs' },
  { value: 'php', label: 'PHP', extension: '.php' },
  { value: 'ruby', label: 'Ruby', extension: '.rb' },
  { value: 'swift', label: 'Swift', extension: '.swift' },
  { value: 'kotlin', label: 'Kotlin', extension: '.kt' },
  { value: 'dart', label: 'Dart', extension: '.dart' },
  { value: 'scala', label: 'Scala', extension: '.scala' },
  { value: 'shell', label: 'Shell', extension: '.sh' },
  { value: 'html', label: 'HTML', extension: '.html' },
  { value: 'css', label: 'CSS', extension: '.css' },
  { value: 'sql', label: 'SQL', extension: '.sql' },
  { value: 'json', label: 'JSON', extension: '.json' },
  { value: 'yaml', label: 'YAML', extension: '.yml' },
].sort((a, b) => a.label.localeCompare(b.label));

const POPULAR_TAGS = [
  'function', 'utility', 'helper', 'api', 'database', 'frontend', 'backend',
  'react', 'vue', 'angular', 'node', 'express', 'mongoose', 'validation',
  'authentication', 'middleware', 'hooks', 'component', 'algorithm', 'optimization'
];

// Validation utilities
const validateForm = (data: SnippetFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!data.title.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (data.title.trim().length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }
  
  if (!data.description.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  } else if (data.description.trim().length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }
  
  if (!data.code.trim()) {
    errors.code = 'Code is required';
  } else if (data.code.trim().length < 10) {
    errors.code = 'Code must be at least 10 characters';
  }
  
  if (!data.language) {
    errors.language = 'Language is required';
  }
  
  if (data.tags.length === 0) {
    errors.tags = 'At least one tag is required';
  } else if (data.tags.length > 10) {
    errors.tags = 'Maximum 10 tags allowed';
  }
  
  return errors;
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Custom hooks
const useFormValidation = (data: SnippetFormData) => {
  return useMemo(() => validateForm(data), [data]);
};

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Main component
export default function SnippetCreationForm() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<SnippetFormData>({
    title: '',
    description: '',
    code: '',
    language: '',
    tags: [],
    isPublic: true
  });

  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const errors = useFormValidation(formData);
  const debouncedTitle = useDebounce(formData.title, 300);
  const isFormValid = Object.keys(errors).length === 0;

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-primary rounded-lg shadow-lg text-center">
        <div className="py-12">
          <Code className="w-16 h-16 text-lightGreen mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text mb-2">Sign in to create snippets</h2>
          <p className="text-textSecondary">
            You need to be signed in to create and share code snippets with the community.
          </p>
        </div>
      </div>
    );
  }

  // Auto-save draft functionality
  React.useEffect(() => {
    if (hasUnsavedChanges && debouncedTitle) {
      const savedDraft = {
        ...formData,
        lastSaved: new Date().toISOString()
      };
      // Save to localStorage as backup
      localStorage.setItem('snippet-draft', JSON.stringify(savedDraft));
      setIsDraft(true);
    }
  }, [debouncedTitle, formData, hasUnsavedChanges]);

  const handleInputChange = useCallback((field: keyof SnippetFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const handleAddTag = useCallback(() => {
    const trimmedTag = sanitizeInput(newTag.toLowerCase());
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
      handleInputChange('tags', [...formData.tags, trimmedTag]);
      setNewTag('');
    }
  }, [newTag, formData.tags, handleInputChange]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  }, [formData.tags, handleInputChange]);

  const handlePopularTagClick = useCallback((tag: string) => {
    if (!formData.tags.includes(tag) && formData.tags.length < 10) {
      handleInputChange('tags', [...formData.tags, tag]);
    }
  }, [formData.tags, handleInputChange]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!isFormValid) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const sanitizedData = {
        title: sanitizeInput(formData.title),
        description: sanitizeInput(formData.description),
        code: formData.code.trim(),
        language: formData.language,
        tags: formData.tags.map(tag => sanitizeInput(tag)),
        is_public: formData.isPublic,
        user_id: user.id,
        rating: 0,
        ratings_count: 0
      };

      const { data, error } = await supabase
        .from('snippets')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      toast.success('Snippet created successfully!');
      
      // Clear draft
      localStorage.removeItem('snippet-draft');
      
      // Redirect to the new snippet
      router.push(`/snippets/${data.id}`);
      
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to create snippet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  const selectedLanguage = SUPPORTED_