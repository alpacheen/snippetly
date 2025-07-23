// "use client";

// import { ReactNode, useState } from "react";
// import Link from "next/link";
// import { Code, Plus, Search, Home, LogOut, LogIn } from "lucide-react";
// import { useAuth } from "@/lib/auth-context";
// import AuthModal from "./AuthModal";

// interface ClientLayoutProps {
//   children: ReactNode;
// }

// function Navigation() {
//   const { user, signOut } = useAuth();
//   const [showAuthModal, setShowAuthModal] = useState(false);

//   return (
//     <>
//       <nav className="flex items-center space-x-6">
//         <Link
//           href="/"
//           className="flex items-center gap-2 text-text hover:text-lightGreen transition-colors"
//         >
//           <Home className="w-4 h-4" />
//           <span className="hidden sm:inline">Home</span>
//         </Link>
//         <Link
//           href="/snippets"
//           className="flex items-center gap-2 text-text hover:text-lightGreen transition-colors"
//         >
//           <Search className="w-4 h-4" />
//           <span className="hidden sm:inline">Browse</span>
//         </Link>

//         {user ? (
//           <>
//             <Link
//               href="/snippets/create"
//               className="flex items-center gap-2 px-3 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
//             >
//               <Plus className="w-4 h-4" />
//               <span className="hidden sm:inline">Create</span>
//             </Link>
//             <div className="flex items-center gap-2">
//               <span className="text-text text-sm hidden md:inline">
//                 {user.user_metadata?.display_name || user.email}
//               </span>
//               <button
//                 onClick={signOut}
//                 className="flex items-center gap-2 text-textSecondary hover:text-text transition-colors"
//               >
//                 <LogOut className="w-4 h-4" />
//                 <span className="hidden sm:inline">Sign Out</span>
//               </button>
//             </div>
//           </>
//         ) : (
//           <button
//             onClick={() => setShowAuthModal(true)}
//             className="flex items-center gap-2 px-3 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
//           >
//             <LogIn className="w-4 h-4" />
//             <span className="hidden sm:inline">Sign In</span>
//           </button>
//         )}
//       </nav>

//       <AuthModal
//         isOpen={showAuthModal}
//         onClose={() => setShowAuthModal(false)}
//       />
//     </>
//   );
// }

// export default function ClientLayout({ children }: ClientLayoutProps) {
//   return (
//     <>
//       <header className="px-6 py-4 border-b border-textSecondary">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <Link href="/" className="flex items-center gap-2">
//             <Code className="w-6 h-6 text-lightGreen" />
//             <span className="text-xl font-bold">Snippetly</span>
//           </Link>
//           <Navigation />
//         </div>
//       </header>
//       <main className="flex-grow container mx-auto px-4 py-6">{children}</main>
//       <footer className="px-6 py-4 border-t border-textSecondary text-center text-textSecondary">
//         &copy; {new Date().getFullYear()} Snippetly. All rights reserved.
//       </footer>
//     </>
//   );
"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";
import NavBar from "@/app/components/NavBar";
import { AuthProvider } from "@/lib/auth-context";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

// Custom error fallback for the main app
function AppErrorFallback({ error, retry }: { error?: Error; retry: () => void }) {
  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <header className="px-6 py-4 border-b border-textSecondary">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-text">Snippetly</h1>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-brand-secondary rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-xl font-bold text-text mb-2">
            Something went wrong
          </h1>
          
          <p className="text-textSecondary mb-6">
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-left">
              <p className="text-sm font-medium text-red-800 mb-2">Error Details:</p>
              <p className="text-xs text-red-600 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={retry}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-textSecondary text-text rounded-lg hover:bg-textSecondary/10 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </button>
          </div>
        </div>
      </main>
      
      <footer className="px-6 py-4 border-t border-textSecondary text-center text-textSecondary">
        &copy; {new Date().getFullYear()} Snippetly. All rights reserved.
      </footer>
    </div>
  );
}

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ErrorBoundary fallback={AppErrorFallback}>
      <Toaster 
        richColors 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-primary)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-textSecondary)',
          },
        }}
      />
      <AuthProvider>
        <ErrorBoundary>
          <NavBar />
        </ErrorBoundary>
        <main className="flex-grow container mx-auto px-4 py-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <footer className="px-6 py-4 border-t border-textSecondary text-center text-textSecondary">
          &copy; {new Date().getFullYear()} Snippetly. All rights reserved.
        </footer>
      </AuthProvider>
    </ErrorBoundary>
  );
}