import { MetadataRoute } from 'next';
import { supabasePublic } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://snippetly.vercel.app';
  
  // Get recent public snippets for sitemap
  const { data: snippets } = await supabasePublic
    .from('snippets')
    .select('id, updated_at')
    .order('updated_at', { ascending: false })
    .limit(1000);

  const snippetUrls = snippets?.map((snippet) => ({
    url: `${baseUrl}/snippets/${snippet.id}`,
    lastModified: new Date(snippet.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/snippets`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...snippetUrls,
  ];
}