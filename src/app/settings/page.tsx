"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Copy, RefreshCw, Key, Settings, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingKey, setFetchingKey] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch existing API key on mount
  useEffect(() => {
    const fetchApiKey = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from("profiles")
          .select("api_key")
          .eq("id", user.id)
          .single();
          
        if (data?.api_key) {
          setApiKey(data.api_key);
        }
      } catch (error) {
        console.error("Error fetching API key:", error);
      } finally {
        setFetchingKey(false);
      }
    };

    fetchApiKey();
  }, [user]);

  const generateApiKey = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Session expired. Please sign in again.");
        return;
      }

      const response = await fetch("/api/vscode/generate-key", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();
      if (data.apiKey) {
        setApiKey(data.apiKey);
        toast.success("API key generated successfully!");
      } else {
        toast.error(data.error || "Failed to generate API key");
      }
    } catch (error) {
      console.error("Generate key error:", error);
      toast.error("Failed to generate API key");
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = async () => {
    await navigator.clipboard.writeText(apiKey);
    toast.success("API key copied to clipboard!");
  };

  if (authLoading || fetchingKey) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-lightGreen" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      {/* User Info Section */}
      <div className="bg-brand-secondary rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-lightGreen" />
          <h2 className="text-lg font-semibold">Account Information</h2>
        </div>
        <div className="space-y-2 text-textSecondary">
          <p>Email: {user.email}</p>
          <p>User ID: {user.id}</p>
        </div>
      </div>

      {/* VS Code Extension Section */}
      <div className="bg-brand-secondary rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-lightGreen" />
          <h2 className="text-lg font-semibold">VS Code Extension</h2>
        </div>

        <p className="text-textSecondary mb-6">
          Connect your VS Code to Snippetly to save and search snippets directly from your editor.
        </p>

        {!apiKey ? (
          <div className="space-y-4">
            <p className="text-sm text-textSecondary">
              No API key found. Generate one to connect your VS Code extension.
            </p>
            <button
              onClick={generateApiKey}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-lightGreen text-primary rounded hover:bg-lightGreen/80 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Generate API Key
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* API Key Display */}
            <div>
              <label className="block text-sm font-medium mb-2">Your API Key</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={apiKey}
                  readOnly
                  className="flex-1 px-3 py-2 bg-primary border border-textSecondary rounded font-mono text-sm"
                />
                <button
                  onClick={copyApiKey}
                  className="p-2 bg-lightGreen text-primary rounded hover:bg-lightGreen/80 transition-colors"
                  title="Copy API key"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Warning Message */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>⚠️ Important:</strong> Keep this API key secure. Anyone with this key can access your snippets.
              </p>
            </div>

            {/* Setup Instructions */}
            <div className="space-y-3">
              <h3 className="font-semibold">Setup Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-textSecondary">
                <li>Install the Snippetly VS Code extension from the marketplace</li>
                <li>Open VS Code Command Palette (Cmd+Shift+P or Ctrl+Shift+P)</li>
                <li>Run &quot;Snippetly: Connect to Cloud&quot;</li>
                <li>Paste your API key when prompted</li>
                <li>You&apos;re connected! Use Cmd+Shift+S (Mac) or Ctrl+Shift+S (Windows) to save snippets</li>
              </ol>
            </div>

            {/* VS Code Extension Features */}
            <div className="mt-6 p-4 bg-primary border border-textSecondary rounded">
              <h4 className="font-medium mb-2">Extension Features:</h4>
              <ul className="text-sm text-textSecondary space-y-1">
                <li>✅ Save code snippets directly from VS Code</li>
                <li>✅ Search your snippet library</li>
                <li>✅ Insert snippets into your code</li>
                <li>✅ Offline support with sync</li>
                <li>✅ Multiple language support</li>
              </ul>
            </div>

            {/* Regenerate Button */}
            <div className="pt-4 border-t border-textSecondary">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to regenerate your API key? The old key will stop working.")) {
                    generateApiKey();
                  }
                }}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate API Key
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}