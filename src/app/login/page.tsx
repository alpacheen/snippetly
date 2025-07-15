"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }
    setLoading(false);
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    toast.success(isSignUp ? "Sign up successful! Check your email to confirm." : "Logged in!");
    if (!isSignUp) router.push("/");
  };

  return (
    <section className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6 text-center">{isSignUp ? "Sign Up" : "Login"}</h1>
      <form onSubmit={handleAuth} className="space-y-4 bg-primary p-6 rounded-lg shadow">
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded bg-primary text-text"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded bg-primary text-text"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="w-full px-6 py-2 bg-lightGreen text-primary font-semibold rounded hover:bg-lightGreen/80 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (isSignUp ? "Signing up..." : "Logging in...") : (isSignUp ? "Sign Up" : "Login")}
        </button>
      </form>
      <div className="text-center mt-4">
        <button
          className="text-lightGreen hover:underline"
          onClick={() => setIsSignUp(s => !s)}
          disabled={loading}
        >
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </button>
      </div>
    </section>
  );
} 