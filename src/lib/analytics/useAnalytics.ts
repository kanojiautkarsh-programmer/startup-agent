'use client';

import { useEffect, useCallback } from 'react';
import { analytics } from './index';

export function useAnalytics() {
  useEffect(() => {
    analytics.init();
  }, []);

  const trackPageView = useCallback((page?: string) => {
    analytics.trackPageView(page);
  }, []);

  const trackFeature = useCallback((feature: string, metadata?: Record<string, any>) => {
    analytics.trackFeature(feature, metadata);
  }, []);

  const trackAIChat = useCallback((model: string, messageLength: number) => {
    analytics.trackAIChat(model, messageLength);
  }, []);

  const trackDocumentUpload = useCallback((fileName: string, fileSize: number, source: string) => {
    analytics.trackDocumentUpload(fileName, fileSize, source);
  }, []);

  const trackGoalAction = useCallback((action: 'created' | 'completed', goalTitle: string) => {
    analytics.trackGoalAction(action, goalTitle);
  }, []);

  const trackIntegration = useCallback((provider: string, action: 'connected' | 'disconnected') => {
    analytics.trackIntegration(provider, action);
  }, []);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    analytics.trackSearch(query, resultsCount);
  }, []);

  const trackButtonClick = useCallback((buttonName: string, location?: string) => {
    analytics.trackButtonClick(buttonName, location || window.location.pathname);
  }, []);

  const trackFormSubmit = useCallback((formName: string, success: boolean) => {
    analytics.trackFormSubmit(formName, success);
  }, []);

  const trackError = useCallback((error: string, context?: string) => {
    analytics.trackError(error, context);
  }, []);

  return {
    trackPageView,
    trackFeature,
    trackAIChat,
    trackDocumentUpload,
    trackGoalAction,
    trackIntegration,
    trackSearch,
    trackButtonClick,
    trackFormSubmit,
    trackError,
    getAnalytics: analytics.getAnalytics.bind(analytics)
  };
}

export function withPageTracking() {
  useEffect(() => {
    analytics.init();
    analytics.trackPageView();
  }, []);
}
