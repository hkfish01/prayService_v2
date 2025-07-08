// This is a module for Google Analytics tracking

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Type for gtag function
type GtagFunction = (
  command: string, 
  id: string, 
  config?: Record<string, string | number | boolean | object | undefined>
) => void;

// Extend the Window interface
declare global {
  interface Window {
    gtag?: GtagFunction;
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  // Only run in browser environment
  if (typeof window !== 'undefined' && window.gtag && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label: string;
  value?: string;
}) => {
  // Only run in browser environment
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      ...(value !== undefined ? { value } : {}),
    });
  }
};
