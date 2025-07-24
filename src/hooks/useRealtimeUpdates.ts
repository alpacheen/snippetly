// src/hooks/useRealtimeUpdates.ts
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useRealtimeSnippets() {
  const [snippets, setSnippets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchSnippets = async () => {
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching snippets:', error);
        toast.error('Failed to load snippets');
      } else {
        setSnippets(data || []);
      }
      setLoading(false);
    };

    fetchSnippets();

    // Set up real-time subscription
    const channel = supabase
      .channel('snippets_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'snippets'
        },
        (payload) => {
          console.log('New snippet:', payload.new);
          setSnippets(current => [payload.new as any, ...current]);
          toast.success(`New snippet: "${(payload.new as any).title}"`);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'snippets'
        },
        (payload) => {
          console.log('Updated snippet:', payload.new);
          setSnippets(current =>
            current.map(snippet =>
              snippet.id === (payload.new as any).id ? payload.new as any : snippet
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'snippets'
        },
        (payload) => {
          console.log('Deleted snippet:', payload.old);
          setSnippets(current =>
            current.filter(snippet => snippet.id !== (payload.old as any).id)
          );
          toast.info('A snippet was deleted');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { snippets, loading };
}

export function useRealtimeComments(snippetId: string) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!snippetId) return;

    // Initial fetch
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('snippet_id', snippetId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching comments:', error);
      } else {
        setComments(data || []);
      }
      setLoading(false);
    };

    fetchComments();

    // Set up real-time subscription for this snippet's comments
    const channel = supabase
      .channel(`comments_${snippetId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `snippet_id=eq.${snippetId}`
        },
        async (payload) => {
          // Fetch the complete comment with profile data
          const { data: commentData } = await supabase
            .from('comments')
            .select(`
              *,
              profiles:user_id (
                username,
                avatar_url
              )
            `)
            .eq('id', (payload.new as any).id)
            .single();

          if (commentData) {
            setComments(current => [commentData, ...current]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [snippetId]);

  return { comments, loading };
}