import { createClient } from '@/lib/supabase/client';

type EventType = 
  | 'page_view'
  | 'feature_used'
  | 'ai_chat'
  | 'document_uploaded'
  | 'goal_created'
  | 'goal_completed'
  | 'integration_connected'
  | 'integration_disconnected'
  | 'onboarding_completed'
  | 'search_performed'
  | 'export_requested'
  | 'button_clicked'
  | 'form_submitted'
  | 'error_occurred'
  | 'session_start'
  | 'session_end';

interface TrackOptions {
  event_type: EventType;
  event_data?: Record<string, any>;
  page_path?: string;
  referrer?: string;
}

class Analytics {
  private sessionId: string | null = null;
  private pageViews: number = 0;
  private eventCount: number = 0;
  private startTime: Date | null = null;
  private isTracking: boolean = false;
  private debounceTimer: NodeJS.Timeout | null = null;

  async init() {
    if (this.isTracking) return;
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    this.sessionId = this.getOrCreateSessionId();
    this.startTime = new Date();
    this.isTracking = true;

    await this.track({
      event_type: 'session_start',
      event_data: {
        session_id: this.sessionId,
        referrer: document.referrer,
        url: window.location.href
      }
    });

    this.setupAutoTrack();
    
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.saveSession();
      }
    });
  }

  private getOrCreateSessionId(): string {
    const storageKey = 'tasklyne_session_id';
    let sessionId = sessionStorage.getItem(storageKey);
    
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(storageKey, sessionId);
    }
    
    return sessionId;
  }

  private setupAutoTrack() {
    if (typeof window === 'undefined') return;

    const trackedPaths = new Set<string>();
    
    const trackPageView = () => {
      const path = window.location.pathname;
      if (!trackedPaths.has(path)) {
        trackedPaths.add(path);
        this.trackPageView();
      }
    };

    if (document.readyState === 'complete') {
      trackPageView();
    } else {
      window.addEventListener('load', trackPageView);
    }

    const debouncedTrack = this.debounce(trackPageView, 1000);
    window.addEventListener('popstate', debouncedTrack);
    
    const observer = new MutationObserver(() => {
      const newPath = window.location.pathname;
      if (!trackedPaths.has(newPath)) {
        trackedPaths.add(newPath);
        this.trackPageView();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  track(options: TrackOptions) {
    if (!this.isTracking || !options.event_type) return;

    this.eventCount++;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...options,
            session_id: this.sessionId,
            page_path: options.page_path || (typeof window !== 'undefined' ? window.location.pathname : undefined)
          }),
          keepalive: true
        });
      } catch (error) {
        console.error('Analytics track error:', error);
      }
    }, 100);
  }

  trackPageView(page?: string) {
    this.pageViews++;
    this.track({
      event_type: 'page_view',
      event_data: {
        page_views: this.pageViews
      },
      page_path: page || (typeof window !== 'undefined' ? window.location.pathname : undefined)
    });
  }

  trackFeature(feature: string, metadata?: Record<string, any>) {
    this.track({
      event_type: 'feature_used',
      event_data: { feature, ...metadata }
    });
  }

  trackAIChat(model: string, messageLength: number) {
    this.track({
      event_type: 'ai_chat',
      event_data: { model, messageLength }
    });
  }

  trackDocumentUpload(fileName: string, fileSize: number, source: string) {
    this.track({
      event_type: 'document_uploaded',
      event_data: { fileName, fileSize, source }
    });
  }

  trackGoalAction(action: 'created' | 'completed', goalTitle: string) {
    this.track({
      event_type: action === 'created' ? 'goal_created' : 'goal_completed',
      event_data: { goalTitle }
    });
  }

  trackIntegration(provider: string, action: 'connected' | 'disconnected') {
    this.track({
      event_type: action === 'connected' ? 'integration_connected' : 'integration_disconnected',
      event_data: { provider }
    });
  }

  trackSearch(query: string, resultsCount: number) {
    this.track({
      event_type: 'search_performed',
      event_data: { query, resultsCount }
    });
  }

  trackButtonClick(buttonName: string, location: string) {
    this.track({
      event_type: 'button_clicked',
      event_data: { buttonName, location }
    });
  }

  trackFormSubmit(formName: string, success: boolean) {
    this.track({
      event_type: 'form_submitted',
      event_data: { formName, success }
    });
  }

  trackError(error: string, context?: string) {
    this.track({
      event_type: 'error_occurred',
      event_data: { error, context }
    });
  }

  private async saveSession() {
    if (!this.sessionId || !this.startTime) return;

    const duration = Math.floor((Date.now() - this.startTime.getTime()) / 1000);

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'session_end',
          event_data: {
            session_id: this.sessionId,
            duration_seconds: duration,
            page_views: this.pageViews,
            events_count: this.eventCount,
            last_page: typeof window !== 'undefined' ? window.location.pathname : null
          },
          session_id: this.sessionId
        }),
        keepalive: true
      });
    } catch (error) {
      console.error('Session save error:', error);
    }
  }

  private endSession() {
    this.saveSession();
    this.isTracking = false;
  }

  private debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout | null = null;
    
    return ((...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T;
  }

  async getAnalytics(period: '7d' | '30d' | '90d' = '7d') {
    try {
      const response = await fetch(`/api/analytics/track?period=${period}`);
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
    return null;
  }
}

export const analytics = new Analytics();

export function useAnalytics() {
  return analytics;
}

export function withAnalytics<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  featureName: string
) {
  return function AnalyticsWrapper(props: P) {
    React.useEffect(() => {
      analytics.init();
      analytics.trackFeature(featureName);
    }, []);

    return React.createElement(WrappedComponent, props);
  };
}

import React from 'react';
