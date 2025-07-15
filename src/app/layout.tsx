import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "sonner";
<<<<<<< HEAD
import ClientLayout from "./components/ClientLayout";
import { AuthProvider } from "@/lib/auth-context";

=======
import NavBar from "@/app/components/NavBar";
import { UserProvider } from "@/app/context/UserContext";
>>>>>>> f246f67 (Save local changes before rebase)

export const metadata = {
  title: "Snippetly - Your AI-powered Snippet Brain",
  description:
    "Discover, save and share reusable code snippets. Like Spotify but for devs.",
  openGraph: {
    title: "Discover, save and share reusable code snippets.",
  },
};

// function Navigation() {
//   return (
//     <nav className="flex items-center space-x-6">
//       <Link
//         href="/"
//         className="flex items-center gap-2 text-text hover:text-lightGreen transition-colors"
//       >
//         <Home className="w-4 h-4" />
//         <span className="hidden sm:inline">Home</span>
//       </Link>
//       <Link
//         href="/snippets"
//         className="flex items-center gap-2 text-text hover:text-lightGreen transition-colors"
//       >
//         <Search className="w-4 h-4" />
//         <span className="hidden sm:inline">Browse</span>
//       </Link>
//       <Link
//         href="/snippets/create"
//         className="flex items-center gap-2 px-3 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
//       >
//         <Plus className="w-4 h-4" />
//         <span className="hidden sm:inline">Create</span>
//       </Link>
//     </nav>
//   );
// }
// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang="en">
//       <body className="flex flex-col min-h-screen bg-primary text-text">
//         <Toaster richColors />
//         <header className="px-6 py-4 border-b border-textSecondary">
//           <div className="max-w-7xl mx-auto flex items-center justify-between">
//             <Link href="/" className="flex items-center gap-2">
//               <Code className="w-6 h-6 text-lightGreen" />
//               <span className="text-xl font-bold">Snippetly</span>
//             </Link>
//             <Navigation />
//           </div>
//         </header>
//         <main className="flex-grow container mx-auto px-4 py-6">
//           {children}
//         </main>
//         <footer className="px-6 py-4 border-t text-center text-neutral-500">
//           &copy; {new Date().getFullYear()} Snippetly. All rights reserved.
//         </footer>
//       </body>
//     </html>
//   );
// }
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-primary text-text">
        <Toaster richColors />
        <UserProvider>
          <NavBar />
          <main className="flex-grow container mx-auto px-4 py-6">
            {children}
          </main>
          <footer className="px-6 py-4 border-t text-center text-neutral-500">
            &copy; {new Date().getFullYear()} Snippetly. All rights reserved.
          </footer>
        </UserProvider>
      </body>
    </html>
  );
}