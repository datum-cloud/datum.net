// src/utils/urlUtils.ts

const INTERNAL_HOSTS = new Set(['datum.net', 'www.datum.net']);

/**
 * Whether an href should open in a new tab.
 * Same-tab: relative paths, hashes, mailto, tel, and exactly datum.net / www.datum.net.
 * @param href - Link target from markdown or raw HTML
 * @returns True when the link leaves the main Datum site
 */
export const isExternalHref = (href: string): boolean => {
  const trimmed = href.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith('//')) {
    try {
      return !isInternalHost(new URL(`https:${trimmed}`).hostname);
    } catch {
      return false;
    }
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return false;
  }

  const protocol = url.protocol.toLowerCase();
  if (protocol === 'mailto:' || protocol === 'tel:') return false;
  if (protocol !== 'http:' && protocol !== 'https:') return false;

  return !isInternalHost(url.hostname);
};

const isInternalHost = (hostname: string): boolean => INTERNAL_HOSTS.has(hostname.toLowerCase());
