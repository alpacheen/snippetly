// import "./globals.css";
// import { ReactNode } from "react";
// import ClientLayout from "@/app/components/ClientLayout";
// import type { Metadata, Viewport } from "next";

// export const metadata: Metadata = {
//   metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
//   title: "Snippetly - Your AI-powered Snippet Brain",
//   description: "Discover, save and share reusable code snippets. Like Spotify but for devs.",
//   openGraph: {
//     title: "Snippetly - Your AI-powered Snippet Brain",
//     description: "Discover, save and share reusable code snippets. Like Spotify but for devs.",
//     type: "website",
//     images: [
//       {
//         url: "/api/og?title=Snippetly",
//         width: 1200,
//         height: 630,
//         alt: "Snippetly - Your AI-powered Snippet Brain",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Snippetly - Your AI-powered Snippet Brain",
//     description: "Discover, save and share reusable code snippets. Like Spotify but for devs.",
//     images: ["/api/og?title=Snippetly"],
//   },
//   keywords: ["code", "snippets", "programming", "development", "sharing", "ai"],
//   authors: [{ name: "Snippetly Team" }],
//   robots: {
//     index: true,
//     follow: true,
//   },
// };

// export const viewport: Viewport = {
//   width: 'device-width',
//   initialScale: 1,
//   themeColor: '#231f20',
// };

// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang="en">
//       <head>
//         {/* Basic favicon only */}
//         <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💻</text></svg>" />
//       </head>
//       <body className="flex flex-col min-h-screen bg-primary text-text antialiased">
//         <ClientLayout>
//           {children}
//         </ClientLayout>
//       </body>
//     </html>
//   );
// }
import "./globals.css";
import { ReactNode } from "react";
import ClientLayout from "@/app/components/ClientLayout";
import type { Metadata, Viewport } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Snippetly - Your Code Library",
    template: "%s | Snippetly"
  },
  description: "Discover, save and share code snippets. The developer's go-to code library with AI-powered search and explanations.",
  keywords: ["code snippets", "programming", "developer tools", "code sharing", "javascript", "python", "react", "coding", "software development"],
  authors: [{ name: "Snippetly Team" }],
  creator: "Snippetly",
  publisher: "Snippetly",
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Snippetly",
    title: "Snippetly - Your Code Library",
    description: "Discover, save and share code snippets. The developer's go-to code library.",
    images: [
      {
        url: "/api/og?title=Snippetly",
        width: 1200,
        height: 630,
        alt: "Snippetly - Your Code Library",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Snippetly - Your Code Library",
    description: "Discover, save and share code snippets. The developer's go-to code library.",
    images: ["/api/og?title=Snippetly"],
    creator: "@snippetly",
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  verification: {
    // Add your verification codes when ready
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  
  alternates: {
    canonical: baseUrl,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#A8DAB5' },
    { media: '(prefers-color-scheme: dark)', color: '#231f20' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        
        {/* Favicon */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💻</text></svg>" />
        
        {/* Manifest for PWA features (optional) */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Performance hints */}
        <link rel="dns-prefetch" href="https://api.supabase.co" />
      </head>
      <body className="flex flex-col min-h-screen bg-primary text-text antialiased" suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
        
        {/* Analytics (add when ready) */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Add Google Analytics or your preferred analytics */}
          </>
        )}
      </body>
    </html>
  );
}