// src/services/analytics.ts

interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

class AnalyticsService {
  private enabled: boolean;
  private measurementId: string | undefined;

  constructor() {
    this.measurementId = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined);
    this.enabled = !!this.measurementId && import.meta.env.PROD;
  }

  /**
   * Track a custom event
   * @param eventName - Snake_case event name
   * @param params - Event parameters as key-value pairs
   */
  trackEvent(eventName: string, params?: EventParams): void {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] ${eventName}`, params || '(no params)');
    }

    if (this.enabled && window.gtag) {
      try {
        window.gtag('event', eventName, {
          ...params,
          send_to: this.measurementId,
        });
      } catch (error) {
        console.error('[Analytics] Failed to track event:', error);
      }
    }
  }

  /**
   * Track virtual page view (for SPAs)
   */
  trackPageView(pagePath: string, pageTitle: string): void {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] pageview`, { page_path: pagePath, page_title: pageTitle });
    }

    if (this.enabled && window.gtag) {
      try {
        window.gtag('config', this.measurementId, {
          page_path: pagePath,
          page_title: pageTitle,
        });
      } catch (error) {
        console.error('[Analytics] Failed to track pageview:', error);
      }
    }
  }
}

export const analytics = new AnalyticsService();
