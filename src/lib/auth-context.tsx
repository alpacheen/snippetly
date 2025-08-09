"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: "github" | "google") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn("Session error:", error);
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.email);
      
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      
      // Handle sign out - clear everything
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
      }

      // Create profile for confirmed users
      if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        await createUserProfile(session.user);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const createUserProfile = async (user: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        const username =
          user.user_metadata?.username ||
          user.user_metadata?.name ||
          user.user_metadata?.display_name ||
          user.email?.split("@")[0] ||
          `user_${user.id.slice(0, 8)}`;

        await supabase.from("profiles").insert({
          id: user.id,
          username,
          bio: "",
          avatar_url: user.user_metadata?.avatar_url || "",
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.warn("Profile creation error:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      // Validate inputs first
      if (!email || !password || !displayName) {
        return { error: { message: "All fields are required" } as AuthError };
      }
  
      if (password.length < 6) {
        return { error: { message: "Password must be at least 6 characters" } as AuthError };
      }
  
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            username: displayName.trim(),
            name: displayName.trim(),
          },
          // Remove redirect_to for now to avoid the callback issue
          // emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/snippets`,
        },
      });
  
      // Log the response for debugging
      console.log("Signup response:", { data, error });
  
      return { error };
    } catch (error) {
      console.error("Signup error:", error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      // Clear local state immediately
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
      }
      
      // Force clear state
      setSession(null);
      setUser(null);
      setLoading(false);
      
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error("Sign out error:", error);
      // Still clear state on error
      setSession(null);
      setUser(null);
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: "github" | "google") => {
    try {
      console.log(`Initiating ${provider} OAuth flow`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/snippets`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
  
      if (error) {
        console.error(`${provider} OAuth error:`, error);
        throw error;
      }
  
      console.log(`${provider} OAuth initiated successfully`);
    } catch (error) {
      console.error("Provider auth error:", error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};