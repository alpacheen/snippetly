// import "./globals.css";
// import { ReactNode } from "react";
// import { Toaster } from "sonner";
// import NavBar from "@/app/components/NavBar";
// import { AuthProvider } from "@/lib/auth-context";

// export const metadata = {
//   title: "Snippetly - Your AI-powered Snippet Brain",
//   description:
//     "Discover, save and share reusable code snippets. Like Spotify but for devs.",
//   openGraph: {
//     title: "Discover, save and share reusable code snippets.",
//   },
// };

// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang="en">
//       <body className="flex flex-col min-h-screen bg-primary text-text">
//         <Toaster richColors />
//         <AuthProvider>
//           <NavBar />
//           <main className="flex-grow container mx-auto px-4 py-6">
//             {children}
//           </main>
//           <footer className="px-6 py-4 border-t text-center text-neutral-500">
//             &copy; {new Date().getFullYear()} Snippetly. All rights reserved.
//           </footer>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }
import "./globals.css";
import { ReactNode } from "react";
import ClientLayout from "@/app/components/ClientLayout";

export const metadata = {
  title: "Snippetly - Your AI-powered Snippet Brain",
  description:
    "Discover, save and share reusable code snippets. Like Spotify but for devs.",
  openGraph: {
    title: "Snippetly - Your AI-powered Snippet Brain",
    description: "Discover, save and share reusable code snippets. Like Spotify but for devs.",
    type: "website",
    url: "https://snippetly.dev",
    images: [
      {
        url: "/api/og?title=Snippetly",
        width: 1200,
        height: 630,
        alt: "Snippetly - Your AI-powered Snippet Brain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Snippetly - Your AI-powered Snippet Brain",
    description: "Discover, save and share reusable code snippets. Like Spotify but for devs.",
    images: ["/api/og?title=Snippetly"],
  },
  keywords: ["code", "snippets", "programming", "development", "sharing", "ai"],
  authors: [{ name: "Snippetly Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#231f20" />
      </head>
      <body className="flex flex-col min-h-screen bg-primary text-text antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}