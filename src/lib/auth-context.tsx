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
      console.log('Auth event:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Create profile for new users when they first sign in
      if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        const { user } = session;

        try {
          // Check if profile exists
          const { data: existingProfile, error: checkError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

          if (checkError) {
            console.warn("Error checking profile:", checkError);
            return;
          }

          // Only create profile if it doesn't exist
          if (!existingProfile) {
            console.log("Creating profile for new user:", user.id);
            
            const username =
              user.user_metadata?.username ||
              user.user_metadata?.name ||
              user.user_metadata?.display_name ||
              user.email?.split("@")[0] ||
              `user_${user.id.slice(0, 8)}`;

            const { error: insertError } = await supabase.from("profiles").insert({
              id: user.id,
              username,
              bio: "",
              avatar_url: user.user_metadata?.avatar_url || "",
              created_at: new Date().toISOString(),
            });

            if (insertError) {
              console.warn("Profile creation failed:", insertError);
            } else {
              console.log("Profile created successfully for:", username);
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
    try {
      const result = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (result.error) {
        console.error("Sign in error:", result.error);
      }
      
      return result;
    } catch (error) {
      console.error("Unexpected sign in error:", error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      const result = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            username: displayName.trim(),
            name: displayName.trim(),
          },
          
          emailRedirectTo: undefined,
        },
      });

      if (result.error) {
        console.error("Sign up error:", result.error);
      } else if (result.data.user && !result.data.user.email_confirmed_at) {
        console.log("User created, email confirmation may be required");
      }

      return result;
    } catch (error) {
      console.error("Unexpected sign up error:", error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const signInWithProvider = async (provider: "github" | "google") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/snippets`,
        },
      });

      if (error) {
        console.error(`${provider} auth error:`, error);
        throw error;
      }
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