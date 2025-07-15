"use client";
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/snippets', label: 'Browse' },
  { href: '/snippets/create', label: 'Create' },
];

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="bg-primary border-b text-text">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Snippetly
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-lightGreen transition">
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profile" className="hover:text-lightGreen transition">Profile</Link>
              <button
                className="ml-2 px-3 py-1 rounded bg-darkGreen text-text hover:bg-darkGreen/80 transition"
                onClick={handleLogout}
              >
                Logout
              </button>
              <div className="ml-4 w-8 h-8 rounded-full bg-lightGreen flex items-center justify-center text-primary font-bold cursor-pointer" title="Profile">
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
            </>
          ) : (
            <Link href="/login" className="ml-2 px-3 py-1 rounded bg-lightGreen text-primary hover:bg-lightGreen/80 transition">Login</Link>
          )}
        </div>
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
        <div className="md:hidden bg-primary border-t px-4 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block py-2 hover:text-lightGreen transition" onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profile" className="block py-2 hover:text-lightGreen transition" onClick={() => setMobileOpen(false)}>Profile</Link>
              <button className="block w-full text-left py-2 px-0 hover:text-lightGreen transition" onClick={handleLogout}>Logout</button>
              <div className="w-8 h-8 rounded-full bg-lightGreen flex items-center justify-center text-primary font-bold mt-2" title="Profile">
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
            </>
          ) : (
            <Link href="/login" className="block py-2 hover:text-lightGreen transition" onClick={() => setMobileOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </nav>
  );
} 