import "./globals.css";
import { ReactNode } from "react";
import ClientLayout from "@/app/components/ClientLayout";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "Snippetly - Your AI-powered Snippet Brain",
  description: "Discover, save and share reusable code snippets. Like Spotify but for devs.",
  openGraph: {
    title: "Snippetly - Your AI-powered Snippet Brain",
    description: "Discover, save and share reusable code snippets. Like Spotify but for devs.",
    type: "website",
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
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#231f20',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Basic favicon only */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💻</text></svg>" />
      </head>
      <body className="flex flex-col min-h-screen bg-primary text-text antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
