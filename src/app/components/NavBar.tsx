"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sun, Moon, User, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/snippets", label: "Browse" },
  { href: "/snippets/create", label: "Create" },
];


function useTheme() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      document.documentElement.classList.toggle("light", !newTheme);
    }
  };

  return { isDark, toggleTheme };
}

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    setProfileMenuOpen(false);
    router.push("/");
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <nav className="bg-primary border-b border-textSecondary text-text relative">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Snippetly
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-lightGreen transition"
            >
              {link.label}
            </Link>
          ))}

          {/* Theme Toggle - Desktop */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-primary hover:bg-text/70 transition-colors cursor-pointer"
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-lightGreen" />
            ) : (
              <Moon className="w-5 h-5 text-darkGreen" />
            )}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-10 h-10 rounded-full bg-lightGreen flex items-center justify-center text-primary font-bold hover:bg-lightGreen/80 transition-colors cursor-pointer"
                title="Profile menu"
              >
                {getInitials(user.email || "U")}
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-primary border border-textSecondary rounded-lg shadow-lg z-20">
                    <div className="p-3 border-b border-textSecondary">
                      
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
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-textSecondary/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded bg-lightGreen text-primary hover:bg-lightGreen/80 transition font-medium"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-text focus:outline-none"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-primary border-t border-textSecondary px-4 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 hover:text-lightGreen transition"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 py-2 hover:text-lightGreen transition"
                onClick={() => setMobileOpen(false)}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <button
                className="flex items-center gap-2 py-2 text-textSecondary hover:text-text transition w-full text-left"
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 py-2 text-textSecondary hover:text-text transition cursor-pointer"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-lightGreen" />
                ) : (
                  <Moon className="w-4 h-4 text-darkGreen" />
                )}
                
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block py-2 hover:text-lightGreen transition"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
