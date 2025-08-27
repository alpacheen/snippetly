"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { toast } from "sonner";

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

    // DEBUG: Log environment
    console.log("🔍 AUTH DEBUG - Environment:");
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Base URL:", process.env.NEXT_PUBLIC_BASE_URL);
    console.log(
      "Current origin:",
      typeof window !== "undefined" ? window.location.origin : "server"
    );

    const getInitialSession = async () => {
      try {
        console.log("🔍 AUTH DEBUG - Getting initial session...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("🔍 AUTH DEBUG - Session error:", error);
        } else {
          console.log(
            "🔍 AUTH DEBUG - Initial session:",
            session ? "Found" : "None"
          );
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error("🔍 AUTH DEBUG - Auth initialization error:", error);
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
      console.log(
        "🔍 AUTH DEBUG - Auth event:",
        event,
        session?.user?.email || "No user"
      );

      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      // Handle sign out - clear everything
      if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
      }

      // Create profile for confirmed users
      if (
        session?.user &&
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
      ) {
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
      console.log("🔍 AUTH DEBUG - Creating profile for:", user.email);

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        console.log("🔍 AUTH DEBUG - No existing profile, creating new one");

        const metadata = user.user_metadata;
        console.log("🔍 AUTH DEBUG - User metadata:", metadata);

        const username =
          metadata?.preferred_username || // GitHub
          metadata?.user_name || // GitHub alt
          metadata?.name || // Google/general
          metadata?.full_name || // Google alt
          metadata?.display_name || // Manual signup
          user.email?.split("@")[0] || // Email fallback
          `user_${user.id.slice(0, 8)}`; // Final fallback

        console.log("🔍 AUTH DEBUG - Generated username:", username);

        const { error } = await supabase.from("profiles").insert({
          id: user.id,
          username: username.replace(/[^a-zA-Z0-9_]/g, "_"), // Sanitize username
          bio: "",
          avatar_url: metadata?.avatar_url || "",
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.error("🔍 AUTH DEBUG - Profile creation failed:", error);
        } else {
          console.log("🔍 AUTH DEBUG - Profile created successfully");
        }
      } else {
        console.log("🔍 AUTH DEBUG - Profile already exists");
      }
    } catch (error) {
      console.error("🔍 AUTH DEBUG - Profile creation error:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔍 AUTH DEBUG - Email sign in attempt");
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error("🔍 AUTH DEBUG - Email sign in error:", error);
      } else {
        console.log("🔍 AUTH DEBUG - Email sign in successful");
      }

      return { error };
    } catch (error) {
      console.error("🔍 AUTH DEBUG - Email sign in exception:", error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      console.log("🔍 AUTH DEBUG - Email sign up attempt");

      // Validate inputs first
      if (!email || !password || !displayName) {
        return { error: { message: "All fields are required" } as AuthError };
      }

      if (password.length < 6) {
        return {
          error: {
            message: "Password must be at least 6 characters",
          } as AuthError,
        };
      }

      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            username: displayName.trim(),
            name: displayName.trim(),
          },
        },
      });

      if (error) {
        console.error("🔍 AUTH DEBUG - Email sign up error:", error);
      } else {
        console.log("🔍 AUTH DEBUG - Email sign up successful");
      }

      return { error };
    } catch (error) {
      console.error("🔍 AUTH DEBUG - Email sign up exception:", error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      console.log("🔍 AUTH DEBUG - Sign out attempt");
      setLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("🔍 AUTH DEBUG - Sign out error:", error);
      } else {
        console.log("🔍 AUTH DEBUG - Sign out successful");
      }

      setSession(null);
      setUser(null);
      setLoading(false);

      window.location.href = "/";
    } catch (error) {
      console.error("🔍 AUTH DEBUG - Sign out exception:", error);
      setSession(null);
      setUser(null);
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: "github" | "google") => {
    try {
      console.log(`Starting ${provider} OAuth...`);

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");

      const redirectUrl = `${baseUrl}/api/auth/callback`;

      console.log(`OAuth redirect URL: ${redirectUrl}`);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error(`${provider} OAuth error:`, error);
        toast.error(`Failed to sign in with ${provider}. Please try again.`);
        throw error;
      }

      console.log(`${provider} OAuth initiated successfully`);
    } catch (error) {
      console.error("Provider auth exception:", error);
      toast.error("Authentication failed. Please try again.");
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
