// src/lib/analytics.ts
export interface AnalyticsEvent {
    name: string;
    properties?: Record<string, any>;
    userId?: string;
  }
  
  class Analytics {
    private isEnabled: boolean;
  
    constructor() {
      this.isEnabled = process.env.NODE_ENV === 'production';
    }
  
    // Track page views
    pageView(path: string, title?: string) {
      if (!this.isEnabled) return;
      
      // Google Analytics 4
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_title: title,
          page_location: window.location.href,
        });
      }
      
      // Log for debugging
      console.log('Page view:', { path, title });
    }
  
    // Track custom events
    track(event: AnalyticsEvent) {
      if (!this.isEnabled) return;
  
      // Google Analytics 4
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event.name, {
          ...event.properties,
          user_id: event.userId,
        });
      }
  
      // Simple analytics storage for MVP
      this.storeEvent(event);
    }
  
    // Store events locally for basic analytics
    private storeEvent(event: AnalyticsEvent) {
      try {
        const events = JSON.parse(localStorage.getItem('snippetly_events') || '[]');
        events.push({
          ...event,
          timestamp: new Date().toISOString(),
          session_id: this.getSessionId(),
        });
        
        // Keep only last 100 events
        if (events.length > 100) {
          events.splice(0, events.length - 100);
        }
        
        localStorage.setItem('snippetly_events', JSON.stringify(events));
      } catch (error) {
        console.error('Failed to store analytics event:', error);
      }
    }
  
    private getSessionId(): string {
      let sessionId = sessionStorage.getItem('snippetly_session');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('snippetly_session', sessionId);
      }
      return sessionId;
    }
  
    // Snippet-specific tracking
    snippetViewed(snippetId: string, language: string, userId?: string) {
      this.track({
        name: 'snippet_viewed',
        properties: {
          snippet_id: snippetId,
          language,
        },
        userId,
      });
    }
  
    snippetCopied(snippetId: string, language: string, userId?: string) {
      this.track({
        name: 'snippet_copied',
        properties: {
          snippet_id: snippetId,
          language,
        },
        userId,
      });
    }
  
    snippetCreated(snippetId: string, language: string, tags: string[], userId?: string) {
      this.track({
        name: 'snippet_created',
        properties: {
          snippet_id: snippetId,
          language,
          tags,
          tag_count: tags.length,
        },
        userId,
      });
    }
  
    snippetRated(snippetId: string, rating: number, userId?: string) {
      this.track({
        name: 'snippet_rated',
        properties: {
          snippet_id: snippetId,
          rating,
        },
        userId,
      });
    }
  
    searchPerformed(query: string, resultsCount: number, userId?: string) {
      this.track({
        name: 'search_performed',
        properties: {
          query,
          results_count: resultsCount,
          query_length: query.length,
        },
        userId,
      });
    }
  
    userSignedUp(method: 'email' | 'github' | 'google', userId: string) {
      this.track({
        name: 'user_signed_up',
        properties: {
          method,
        },
        userId,
      });
    }
  
    // Get basic analytics data for admin dashboard
    getLocalAnalytics() {
      try {
        const events = JSON.parse(localStorage.getItem('snippetly_events') || '[]');
        return this.processEvents(events);
      } catch (error) {
        console.error('Failed to get analytics:', error);
        return null;
      }
    }
  
    private processEvents(events: any[]) {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
      const recentEvents = events.filter(e => new Date(e.timestamp) > last24h);
      const weekEvents = events.filter(e => new Date(e.timestamp) > last7d);
  
      return {
        total_events: events.length,
        events_24h: recentEvents.length,
        events_7d: weekEvents.length,
        top_events: this.getTopEvents(weekEvents),
        popular_languages: this.getPopularLanguages(weekEvents),
        search_queries: this.getSearchQueries(weekEvents),
      };
    }
  
    private getTopEvents(events: any[]) {
      const eventCounts = events.reduce((acc, event) => {
        acc[event.name] = (acc[event.name] || 0) + 1;
        return acc;
      }, {});
  
      return Object.entries(eventCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
    }
  
    private getPopularLanguages(events: any[]) {
      const languageCounts = events
        .filter(e => e.properties?.language)
        .reduce((acc, event) => {
          const lang = event.properties.language;
          acc[lang] = (acc[lang] || 0) + 1;
          return acc;
        }, {});
  
      return Object.entries(languageCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([language, count]) => ({ language, count }));
    }
  
    private getSearchQueries(events: any[]) {
      return events
        .filter(e => e.name === 'search_performed')
        .map(e => e.properties.query)
        .filter(Boolean)
        .slice(-10);
    }
  }
  
  // Global analytics instance
  export const analytics = new Analytics();
  
  // React hook for tracking
  export function useAnalytics() {
    return {
      trackPageView: analytics.pageView.bind(analytics),
      track: analytics.track.bind(analytics),
      snippetViewed: analytics.snippetViewed.bind(analytics),
      snippetCopied: analytics.snippetCopied.bind(analytics),
      snippetCreated: analytics.snippetCreated.bind(analytics),
      snippetRated: analytics.snippetRated.bind(analytics),
      searchPerformed: analytics.searchPerformed.bind(analytics),
      userSignedUp: analytics.userSignedUp.bind(analytics),
    };
  }
  
  // Google Analytics types
  declare global {
    interface Window {
      gtag: (
        command: 'config' | 'event',
        targetId: string,
        config?: Record<string, any>
      ) => void;
    }
  }