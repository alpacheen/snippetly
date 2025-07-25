// "use client";

// import { useState } from 'react';
// import { supabase } from '@/lib/supabase';
// import { toast } from 'sonner';
// import { useRouter } from 'next/navigation';

// type AuthMode = 'login' | 'register';

// interface AuthFormProps {
//   mode: AuthMode;
//   onSuccess?: () => void;
// }

// export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [username, setUsername] = useState('');
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       if (mode === 'register') {
//         const { data, error } = await supabase.auth.signUp({
//           email,
//           password,
//           options: {
//             data: {
//               username,
//               display_name: username,
//             }
//           }
//         });

//         if (!error && data.user) {
//           // Create profile row
//           await supabase.from('profiles').insert([
//             {
//               id: data.user.id, // This must match the user's UUID
//               username,
//               bio: '',
//               avatar_url: '',
//               created_at: new Date().toISOString()
//             }
//           ]);
//         }
        
//         toast.success('Registration successful! Please check your email to verify your account.');
//         router.push('/login');
//       } else {
//         const { error } = await supabase.auth.signInWithPassword({
//           email,
//           password,
//         });

//         if (error) throw error;
        
//         toast.success('Login successful!');
//         onSuccess?.();
//         router.push('/snippets');
//       }
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         toast.error(error.message || 'An error occurred');
//       } else {
//         toast.error('An error occurred');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
//       <div className="text-center mb-6">
//         <h1 className="text-2xl font-bold">
//           {mode === 'login' ? 'Welcome back' : 'Create account'}
//         </h1>
//         <p className="text-textSecondary mt-2">
//           {mode === 'login' 
//             ? 'Sign in to your Snippetly account' 
//             : 'Join the Snippetly community'}
//         </p>
//       </div>

//       {mode === 'register' && (
//         <div>
//           <label className="block text-sm font-medium mb-1">Username</label>
//           <input
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             className="w-full border rounded px-3 py-2 bg-primary text-text"
//             required
//             minLength={3}
//             maxLength={20}
//           />
//         </div>
//       )}

//       <div>
//         <label className="block text-sm font-medium mb-1">Email</label>
//         <input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="w-full border rounded px-3 py-2 bg-primary text-text"
//           required
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium mb-1">Password</label>
//         <input
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full border rounded px-3 py-2 bg-primary text-text"
//           required
//           minLength={6}
//         />
//       </div>

//       <button
//         type="submit"
//         disabled={loading}
//         className="w-full bg-darkGreen text-text py-2 px-4 rounded hover:bg-darkGreen/75 disabled:opacity-50 transition"
//       >
//         {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
//       </button>

//       <div className="text-center">
//         <p className="text-textSecondary">
//           {mode === 'login' 
//             ? "Don't have an account? " 
//             : "Already have an account? "}
//           <button
//             type="button"
//             onClick={() => router.push(mode === 'login' ? '/register' : '/login')}
//             className="text-lightGreen hover:underline"
//           >
//             {mode === 'login' ? 'Sign up' : 'Sign in'}
//           </button>
//         </p>
//       </div>
//     </form>
//   );
// }
// // src/app/components/AuthForm.tsx - Fixed version
"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  mode: AuthMode;
  onSuccess?: () => void;
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        // Step 1: Sign up user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              display_name: username,
            }
          }
        });

        if (authError) throw authError;

        // Step 2: Wait for user confirmation via email
        if (authData.user && !authData.user.email_confirmed_at) {
          toast.success('Registration successful! Please check your email to verify your account.');
          router.push('/login');
          return;
        }

        // Step 3: Create profile if email is auto-confirmed
        if (authData.user && authData.user.email_confirmed_at) {
          await createUserProfile(authData.user.id, username);
          toast.success('Account created successfully!');
          onSuccess?.();
          router.push('/snippets');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success('Login successful!');
        onSuccess?.();
        router.push('/snippets');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'An error occurred');
      } else {
        toast.error('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (userId: string, username: string) => {
    const { error } = await supabase.from('profiles').insert([
      {
        id: userId,
        username: username,
        bio: '',
        avatar_url: '',
        created_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error('Profile creation error:', error);
      // Don't throw here as user is already authenticated
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-textSecondary mt-2">
          {mode === 'login' 
            ? 'Sign in to your Snippetly account' 
            : 'Join the Snippetly community'}
        </p>
      </div>

      {mode === 'register' && (
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-primary text-text"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            title="Username can only contain letters, numbers, and underscores"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2 bg-primary text-text"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 bg-primary text-text"
          required
          minLength={6}
        />
        {mode === 'register' && (
          <p className="text-xs text-textSecondary mt-1">
            Minimum 6 characters
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-darkGreen text-text py-2 px-4 rounded hover:bg-darkGreen/75 disabled:opacity-50 transition"
      >
        {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
      </button>

      <div className="text-center">
        <p className="text-textSecondary">
          {mode === 'login' 
            ? "Don't have an account? " 
            : "Already have an account? "}
          <button
            type="button"
            onClick={() => router.push(mode === 'login' ? '/register' : '/login')}
            className="text-lightGreen hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </form>
  );
}