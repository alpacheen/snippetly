"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Code, Plus, Search, Home, User, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import AuthModal from "./AuthModal";

interface ClientLayoutProps {
  children: ReactNode;
}

function Navigation() {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <nav className="flex items-center space-x-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-text hover:text-lightGreen transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <Link
          href="/snippets"
          className="flex items-center gap-2 text-text hover:text-lightGreen transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Browse</span>
        </Link>

        {user ? (
          <>
            <Link
              href="/snippets/create"
              className="flex items-center gap-2 px-3 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-text text-sm hidden md:inline">
                {user.user_metadata?.display_name || user.email}
              </span>
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-textSecondary hover:text-text transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <header className="px-6 py-4 border-b border-textSecondary">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Code className="w-6 h-6 text-lightGreen" />
            <span className="text-xl font-bold">Snippetly</span>
          </Link>
          <Navigation />
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-6">{children}</main>
      <footer className="px-6 py-4 border-t border-textSecondary text-center text-textSecondary">
        &copy; {new Date().getFullYear()} Snippetly. All rights reserved.
      </footer>
    </>
  );
}
