import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

interface CopyEvent {
  snippetId: string;
  timestamp: string;
  textLength: number;
  userAgent?: string;
  country?: string;
}

// Extend NextRequest to include Vercel-specific properties
interface VercelNextRequest extends NextRequest {
  geo?: {
    country?: string;
    region?: string;
    city?: string;
  };
  ip?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CopyEvent = await request.json();
    const { snippetId, timestamp, textLength } = body;

    // Validate input
    if (!snippetId || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user info if available
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        userId = user?.id;
      } catch {
        // Anonymous usage is fine
      }
    }

    // Get request metadata (Vercel-specific properties)
    const vercelRequest = request as VercelNextRequest;
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const country = vercelRequest.geo?.country || 'Unknown';
    const ip = vercelRequest.ip || request.headers.get('x-forwarded-for') || 'Unknown';

    // Store analytics event (fire and forget)
    supabase
      .from('snippet_analytics')
      .insert({
        snippet_id: snippetId,
        event_type: 'copy',
        user_id: userId,
        metadata: {
          textLength,
          userAgent,
          country,
          ip: typeof ip === 'string' ? ip.slice(0, -1) + 'x' : 'Unknown', // Anonymize last IP octet
          timestamp,
        },
        created_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.warn('Analytics insert failed:', error);
      });

    // Also increment snippet copy count
    supabase
      .rpc('increment_snippet_copies', { snippet_id: snippetId })
      .then(({ error }) => {
        if (error) console.warn('Copy count increment failed:', error);
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    // Return success anyway - don't break user experience for analytics
    return NextResponse.json({ success: true });
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}