"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/snippets", label: "Browse" },
  { href: "/snippets/create", label: "Create" },
];

// Simple theme toggle hook
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
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="bg-primary border-b border-textSecondary text-text">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Snippetly
        </Link>

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

          {user ? (
            <>
              <Link
                href="/profile"
                className="hover:text-lightGreen transition"
              >
                Profile
              </Link>
              <button
                className="ml-2 px-3 py-1 rounded bg-darkGreen text-text hover:bg-darkGreen/80 transition"
                onClick={handleLogout}
              >
                Logout
              </button>
              <div
                className="ml-4 w-8 h-8 rounded-full bg-lightGreen flex items-center justify-center text-primary font-bold cursor-pointer"
                title="Profile"
              >
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="ml-2 px-3 py-1 rounded bg-lightGreen text-primary hover:bg-lightGreen/80 transition"
            >
              Login
            </Link>
          )}
        </div>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-textSecondary/10 hover:bg-textSecondary/20 transition-colors"
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-textSecondary" />
          ) : (
            <Moon className="w-5 h-5 text-textSecondary" />
          )}
        </button>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-text focus:outline-none"
          onClick={() => setMobileOpen((open) => !open)}
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
                className="block py-2 hover:text-lightGreen transition"
                onClick={() => setMobileOpen(false)}
              >
                Profile
              </Link>
              <button
                className="block w-full text-left py-2 px-0 hover:text-lightGreen transition"
                onClick={handleLogout}
              >
                Logout
              </button>
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 py-2 text-textSecondary hover:text-text transition"
              >
                {isDark ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                {isDark ? "Light Mode" : "Dark Mode"}
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
