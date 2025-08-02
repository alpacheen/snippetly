import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  author?: string;
  language?: string;
}

export function generateSEOMetadata({
  title = 'Snippetly - Your AI-Powered Code Library',
  description = 'Discover, save and share code snippets with AI-powered explanations. Like Spotify, but for code.',
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  tags = [],
  author,
  language,
}: SEOProps = {}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://snippetly.vercel.app';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const ogImage = image || `${baseUrl}/api/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    keywords: [
      'code snippets',
      'programming',
      'developer tools',
      'AI code analysis',
      'code sharing',
      'software development',
      language,
      ...tags,
    ].filter(Boolean),
    
    authors: author ? [{ name: author }] : [{ name: 'Snippetly Community' }],
    
    openGraph: {
      title,
      description,
      url: fullUrl,
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      siteName: 'Snippetly',
      locale: 'en_US',
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@snippetly',
    },

    alternates: {
      canonical: fullUrl,
    },

    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  };
}