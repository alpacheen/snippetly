"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AuthModal from "@/app/components/AuthModal";
import { Code } from "lucide-react";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(true);

  
  useEffect(() => {
    if (!loading && user) {
      router.push("/snippets");
    }
  }, [user, loading, router]);

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lightGreen"></div>
      </div>
    );
  }

  
  if (user) {
    return null;
  }

  const handleCloseModal = () => {
    setShowAuthModal(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <div className="text-center mb-8 max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Code className="w-12 h-12 text-lightGreen mr-3" />
          <h1 className="text-3xl font-bold text-text">Snippetly</h1>
        </div>
        <h2 className="text-xl font-semibold text-text mb-4">
          Welcome to Your Code Library
        </h2>
        <p className="text-textSecondary">
          Join thousands of developers sharing and discovering amazing code
          snippets
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mb-8">
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-lightGreen rounded-full flex items-center justify-center mx-auto mb-3">
            <Code className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text mb-2">
            Save & Organize
          </h3>
          <p className="text-textSecondary text-sm">
            Keep your favorite code snippets organized and easily accessible
          </p>
        </div>

        <div className="text-center p-4">
          <div className="w-12 h-12 bg-lightGreen rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text mb-2">
            Share & Discover
          </h3>
          <p className="text-textSecondary text-sm">
            Share your knowledge and discover new solutions from the community
          </p>
        </div>

        <div className="text-center p-4">
          <div className="w-12 h-12 bg-lightGreen rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text mb-2">
            Search & Filter
          </h3>
          <p className="text-textSecondary text-sm">
            Powerful search and filtering to find exactly what you need
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-8 py-3 bg-lightGreen text-primary rounded-lg font-semibold hover:bg-lightGreen/80 transition-colors"
        >
          Get Started
        </button>
        <p className="text-textSecondary text-sm mt-3">
          Already have an account? Click above to sign in
        </p>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={handleCloseModal} />
    </div>
  );
}
