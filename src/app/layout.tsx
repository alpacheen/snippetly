import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Snippetly - Your AI-powered Snippet Brain",
  description:
    "Discover, save and share reusable code snippets. Like Spotify but for devs.",
  openGraph: {
    title: "Discover, save and share reusable code snippets.",
  },
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <header className="px-6 py-4 border-b">
          <div className="text-xl font-bold">Snippetly</div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="px-6 py-4 border-t text-center text-neutral-500">
          &copy; {new Date().getFullYear()} Snippetly. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
