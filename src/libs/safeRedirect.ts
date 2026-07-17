/**
 * Restricts redirect targets to same-origin relative paths, rejecting
 * absolute URLs, protocol-relative URLs (//evil.com), and backslash tricks
 * that browsers can interpret as protocol-relative.
 */
export function safeRedirect(path: string | null | undefined, fallback = '/'): string {
  if (!path) return fallback;
  if (!path.startsWith('/')) return fallback;
  if (path.startsWith('//') || path.startsWith('/\\')) return fallback;
  if (path.includes('://')) return fallback;
  return path;
}
