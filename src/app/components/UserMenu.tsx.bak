"use client";

import { useAuth } from '@/lib/auth-context';
import { User, LogOut, Settings, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function UserMenu() {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/login" className="text-lightGreen hover:underline">
          Sign In
        </Link>
        <Link href="/register" className="bg-darkGreen text-text px-4 py-2 rounded hover:bg-darkGreen/75">
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 text-text hover:text-lightGreen">
        <User size={20} />
        <span>{user.user_metadata?.username || user.email}</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-primary border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <Link href="/profile" className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 hover:text-primary">
          <Settings size={16} />
          <span>Profile</span>
        </Link>
        <Link href="/snippets/new" className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 hover:text-primary">
          <PlusCircle size={16} />
          <span>New Snippet</span>
        </Link>
        <button 
          onClick={signOut}
          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 hover:text-primary w-full text-left"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}