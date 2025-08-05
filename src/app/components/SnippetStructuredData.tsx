export function EnhancedSnippetStructuredData({
  snippet,
}: {
  snippet: {
    id: string;
    title: string;
    description?: string;
    language: string;
    tags?: string[];
    created_at: string;
    updated_at?: string;
    rating?: number;
    ratings_count?: number;
    author?: { username: string };
  };
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://snippetly.vercel.app";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": `${baseUrl}/snippets/${snippet.id}`,
    name: snippet.title,
    description: snippet.description,
    programmingLanguage: {
      "@type": "ComputerLanguage",
      name: snippet.language,
    },
    codeRepository: `${baseUrl}/snippets/${snippet.id}`,
    author: {
      "@type": "Person",
      name: snippet.author?.username || "Anonymous",
      url: snippet.author
        ? `${baseUrl}/profile/${snippet.author.username}`
        : undefined,
    },
    dateCreated: snippet.created_at,
    dateModified: snippet.updated_at || snippet.created_at,
    keywords: snippet.tags?.join(", "),
    aggregateRating:
      snippet.rating && snippet.ratings_count
        ? {
            "@type": "AggregateRating",
            ratingValue: snippet.rating,
            ratingCount: snippet.ratings_count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    publisher: {
      "@type": "Organization",
      name: "Snippetly",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/snippets/${snippet.id}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
