"use client";

import { useState } from 'react';
import { X, Github, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });

  if (!isOpen) return null;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.email.trim() || !formData.password.trim()) {
    toast.error('Please fill in all required fields');
    return;
  }

  if (isSignUp && !formData.displayName.trim()) {
    toast.error('Please enter your display name');
    return;
  }

  setLoading(true);

  try {
    if (isSignUp) {
      const { error } = await signUp(formData.email, formData.password, formData.displayName);
      
      if (error) {
        // Better error handling
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Try signing in instead.');
          setIsSignUp(false);
        } else if (error.message.includes('Password should be at least')) {
          toast.error('Password must be at least 6 characters long');
        } else if (error.message.includes('Invalid email')) {
          toast.error('Please enter a valid email address');
        } else {
          toast.error(error.message);
        }
      } else {
        setNeedsConfirmation(true);
        toast.success('Account created! Please check your email to confirm your account.');
      }
    } else {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setNeedsConfirmation(true);
          toast.error('Please check your email and confirm your account first.');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Signed in successfully!');
        onClose();
      }
    }
  } catch (error) {
    toast.error('An unexpected error occurred. Please try again.');
    console.error('Auth error:', error);
  } finally {
    setLoading(false);
  }
};
  

  const handleProviderSignIn = async (provider: 'github' | 'google') => {
    try {
      setLoading(true);
      await signInWithProvider(provider);
    } catch (error) {
      toast.error(`Failed to sign in with ${provider}. Please try again.`);
      console.error('Provider auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        toast.success('Confirmation email sent! Please check your inbox.');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to send confirmation email');
      }
    } catch (error) {
      toast.error('Failed to send confirmation email. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setNeedsConfirmation(false);
    setFormData({ email: '', password: '', displayName: '' });
    setShowPassword(false);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setFormData({ email: '', password: '', displayName: '' });
      setShowPassword(false);
      setNeedsConfirmation(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary border border-textSecondary rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-textSecondary hover:text-text transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {needsConfirmation ? (
          <div className="text-center space-y-4">
            <div className="text-2xl mb-4">📧</div>
            <h3 className="text-lg font-semibold">Check your email</h3>
            <p className="text-textSecondary text-sm">
              We sent a confirmation link to <strong>{formData.email}</strong>
            </p>
            <button
              onClick={handleResendConfirmation}
              className="text-lightGreen hover:text-lightGreen/80 text-sm underline"
            >
              Resend confirmation email
            </button>
            <button
              onClick={() => setNeedsConfirmation(false)}
              className="block w-full mt-4 text-textSecondary hover:text-text text-sm"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleProviderSignIn('github')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Github className="w-5 h-5" />
                Continue with GitHub
              </button>
              <button
                onClick={() => handleProviderSignIn('google')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
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
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-text mb-1">
                    Display Name *
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    placeholder="Your display name"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-primary border border-textSecondary rounded-lg text-text placeholder-textSecondary focus:border-lightGreen focus:outline-none disabled:opacity-50"
                    required
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-primary border border-textSecondary rounded-lg text-text placeholder-textSecondary focus:border-lightGreen focus:outline-none disabled:opacity-50"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-3 pr-12 bg-primary border border-textSecondary rounded-lg text-text placeholder-textSecondary focus:border-lightGreen focus:outline-none disabled:opacity-50"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-text transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-lightGreen text-primary rounded-lg font-medium hover:bg-lightGreen/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={switchMode}
                disabled={loading}
                className="text-lightGreen hover:text-lightGreen/80 transition-colors text-sm disabled:opacity-50"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}