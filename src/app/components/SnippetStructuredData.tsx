export function SnippetStructuredData({
  snippet,
}: {
  snippet: {
    id: string;
    title: string;
    description?: string;
    language: string;
    created_at: string;
    updated_at?: string;
    author?: { username: string };
  };
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: snippet.title,
    description: snippet.description,
    programmingLanguage: snippet.language,
    codeRepository: `${process.env.NEXT_PUBLIC_BASE_URL}/snippets/${snippet.id}`,
    author: {
      "@type": "Person",
      name: snippet.author?.username || "Anonymous",
    },
    dateCreated: snippet.created_at,
    dateModified: snippet.updated_at,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
