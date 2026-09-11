// Helper utility for generating correct public / shared URLs for Mobile PWA access

export const DEFAULT_SHARED_APP_URL = 'https://ais-pre-2gm5cnnxd3ug7yesrd6jnx-162563188718.europe-west2.run.app';
export const DEFAULT_DEV_APP_URL = 'https://ais-dev-2gm5cnnxd3ug7yesrd6jnx-162563188718.europe-west2.run.app';

/**
 * Returns the public shared URL suitable for scanning and installing on mobile devices.
 * In AI Studio, dev containers ('ais-dev-...') require developer session cookies and
 * cause "You do not have access to this page" when opened on external phones.
 * The shared URL ('ais-pre-...') is the externally accessible endpoint.
 */
export function getSharedAppUrl(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_SHARED_APP_URL;
  }

  const currentHref = window.location.href;

  // If in AI Studio development container, convert to shared preview URL
  if (currentHref.includes('ais-dev-')) {
    return currentHref.replace('ais-dev-', 'ais-pre-');
  }

  // If running locally, return the production shared URL
  if (currentHref.startsWith('http://localhost') || currentHref.startsWith('http://127.0.0.1')) {
    return DEFAULT_SHARED_APP_URL;
  }

  return currentHref;
}

/**
 * Returns whether the current window is running inside the private dev container
 */
export function isRunningInDevContainer(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.href.includes('ais-dev-');
}
