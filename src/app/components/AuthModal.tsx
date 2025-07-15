"use client";

import { useState } from 'react';
import { X, Github, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithProvider } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.displayName);
        if (error) throw error;
        toast.success('Account created! Check your email to verify.');
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        toast.success('Signed in successfully!');
      }
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Authentication failed');
      } else {
        toast.error('Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: 'github' | 'google') => {
    try {
      await signInWithProvider(provider);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Authentication failed');
      } else {
        toast.error('Authentication failed');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary border border-textSecondary rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <button
            onClick={onClose}
            className="text-textSecondary hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleProviderSignIn('github')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>
          <button
            onClick={() => handleProviderSignIn('google')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Continue with Google
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-textSecondary"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-primary text-textSecondary">or</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Display Name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-4 py-3 bg-primary border border-textSecondary rounded-lg text-text placeholder-textSecondary focus:border-lightGreen focus:outline-none"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-primary border border-textSecondary rounded-lg text-text placeholder-textSecondary focus:border-lightGreen focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 bg-primary border border-textSecondary rounded-lg text-text placeholder-textSecondary focus:border-lightGreen focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-lightGreen text-primary rounded-lg font-medium hover:bg-lightGreen/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isSignUp ? 'Creating...' : 'Signing in...'}
              </>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-lightGreen hover:text-lightGreen/80 transition-colors text-sm"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}