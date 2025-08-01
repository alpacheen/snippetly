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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Create profile for new users when they first sign in
      // Check if user exists and doesn't have a profile yet
      if (session?.user && event === "SIGNED_IN") {
        const { user } = session;

        // Check if profile already exists
        try {
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single();

          // Only create profile if it doesn't exist
          if (!existingProfile) {
            const username =
              user.user_metadata?.username ||
              user.user_metadata?.display_name ||
              user.email?.split("@")[0] ||
              `user_${user.id.slice(0, 8)}`;

            const { error } = await supabase.from("profiles").insert({
              id: user.id,
              username,
              display_name: user.user_metadata?.display_name || username,
              bio: "",
              avatar_url: user.user_metadata?.avatar_url || "",
              created_at: new Date().toISOString(),
            });

            if (error) {
              console.warn("Profile creation failed:", error);
            }
          }
        } catch (error) {
          console.warn("Profile check/creation error:", error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          username: displayName,
        },
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithProvider = async (provider: "github" | "google") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/snippets`,
      },
    });
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
