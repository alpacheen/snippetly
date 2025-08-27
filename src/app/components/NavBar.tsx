"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Menu, X, Sun, Moon, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/snippets", label: "Browse" },
  { href: "/snippets/create", label: "Create" },
];

function useTheme() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const shouldBeDark = stored ? stored === "dark" : prefersDark;

    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("light", !shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    document.documentElement.classList.toggle("light", !newTheme);
  };

  return { isDark, toggleTheme };
}

function UserAvatar({ user }: { user: any }) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getInitials = (email: string) => {
    return email?.charAt(0)?.toUpperCase() || "U";
  };

  const avatarUrl = user?.user_metadata?.avatar_url;
  const shouldShowImage = avatarUrl && !imageError;

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setImageError(true);
  }, []);

  return (
    <div className="w-10 h-10 rounded-full bg-lightGreen flex items-center justify-center text-primary font-bold hover:bg-lightGreen/80 transition-colors overflow-hidden relative">
      {shouldShowImage ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-lightGreen/20 animate-pulse" />
          )}
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: isLoading ? "none" : "block" }}
          />
        </>
      ) : (
        <span>{getInitials(user?.email || "")}</span>
      )}
    </div>
  );
}

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      setProfileMenuOpen(false);
      setMobileOpen(false);
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (!target.closest("[data-profile-dropdown]")) {
        setProfileMenuOpen(false);
      }

      if (!target.closest("nav") && mobileOpen) {
        setMobileOpen(false);
      }
    };

    if (mobileOpen || profileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [mobileOpen, profileMenuOpen]);

  return (
    <nav className="bg-primary border-b border-textSecondary text-text relative z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight hover:text-lightGreen transition-colors"
        >
          Snippetly
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-lightGreen transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* Theme Toggle - Desktop */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-textSecondary/10 transition-colors"
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-lightGreen" />
            ) : (
              <Moon className="w-5 h-5 text-darkGreen" />
            )}
          </button>

          {loading ? (
            <div className="w-10 h-10 rounded-full bg-textSecondary/20 animate-pulse"></div>
          ) : user ? (
            <div className="relative" data-profile-dropdown="true">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileMenuOpen(!profileMenuOpen);
                }}
                className="focus:outline-none focus:ring-2 focus:ring-lightGreen rounded-full"
                title="Profile menu"
              >
                <UserAvatar user={user} />
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-primary border border-textSecondary rounded-lg shadow-xl z-50">
                  <div className="p-3 border-b border-textSecondary">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-textSecondary/10 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-textSecondary/10 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-textSecondary/10 transition-colors text-left text-red-400 hover:text-red-300"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded bg-lightGreen text-primary hover:bg-lightGreen/80 transition-colors font-medium"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu button - FIXED */}
        <button
          className="md:hidden text-text focus:outline-none z-50 relative"
          onClick={(e) => {
            e.stopPropagation();
            setMobileOpen(!mobileOpen);
          }}
          data-mobile-button="true"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu dropdown - STAYS AT TOP */}
      {mobileOpen && (
        <div
          className="md:hidden bg-primary border-b border-textSecondary shadow-lg relative z-40"
          data-mobile-menu="true"
        >
          {/* Menu Content */}
          <div className="px-4 py-4 space-y-3">
            {/* Navigation Links */}
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 px-3 hover:text-lightGreen hover:bg-textSecondary/10 rounded transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-textSecondary/20 my-3"></div>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                toggleTheme();
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 py-2 px-3 text-textSecondary hover:text-text hover:bg-textSecondary/10 rounded transition-colors w-full text-left"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-lightGreen" />
              ) : (
                <Moon className="w-4 h-4 text-darkGreen" />
              )}
            </button>

            {/* User Section */}
            {loading ? (
              <div className="py-2">
                <div className="h-8 bg-textSecondary/20 rounded animate-pulse"></div>
              </div>
            ) : user ? (
              <div className="space-y-2 pt-2 border-t border-textSecondary/20">
                <div className="flex items-center gap-3 py-2 px-3 text-sm text-textSecondary bg-textSecondary/5 rounded">
                  <UserAvatar user={user} />
                  <span className="truncate">{user.email}</span>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 py-2 px-3 hover:text-lightGreen hover:bg-textSecondary/10 rounded transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  className="flex items-center gap-3 py-2 px-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors w-full text-left"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-textSecondary/20">
                <Link
                  href="/login"
                  className="block py-2 px-3 bg-lightGreen text-primary rounded-lg text-center font-medium hover:bg-lightGreen/80 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
