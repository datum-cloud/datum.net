// src/utils/youtube.ts
/** Default homepage “Zac explain” embed (must pass {@link sanitizeYoutubeEmbedUrlForIframe}). */
export const HOMEPAGE_FEATURE_VIDEO_EMBED_URL =
  'https://www.youtube.com/embed/AJpcgirSndk?si=iSh6tmAyFphBgQsd&autoplay=1&mute=1';

const YT_ID_RE = /^[\w-]{11}$/;

function stripToVideoId(raw: string): string | null {
  const id = raw.split('&')[0].split('?')[0];
  if (!id || !YT_ID_RE.test(id)) return null;
  return id;
}

export interface ToYouTubeEmbedUrlOptions {
  autoplay?: boolean;
  mute?: boolean;
}

/**
 * Turns a public YouTube URL into a safe embed URL, or null if not YouTube / unsupported.
 * @param url - watch, youtu.be, shorts, or embed URL
 */
export function toYouTubeEmbedUrl(
  url: string | undefined,
  options?: ToYouTubeEmbedUrlOptions
): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  let id: string | null = null;

  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      id = stripToVideoId(u.pathname.split('/').filter(Boolean)[0] ?? '');
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (u.pathname.startsWith('/embed/')) {
        id = stripToVideoId(u.pathname.slice('/embed/'.length));
      } else if (u.pathname.startsWith('/shorts/')) {
        id = stripToVideoId(u.pathname.slice('/shorts/'.length));
      } else if (u.pathname === '/watch' || u.pathname.startsWith('/watch')) {
        id = stripToVideoId(u.searchParams.get('v') ?? '');
      }
    }
  } catch {
    return null;
  }

  if (!id) return null;

  const base = `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
  const params = new URLSearchParams();
  if (options?.autoplay) params.set('autoplay', '1');
  if (options?.mute) params.set('mute', '1');
  const q = params.toString();
  return q ? `${base}?${q}` : base;
}

/**
 * Normalizes a public YouTube URL to a standard {@code watch} URL for opening in a new tab.
 */
export function toYouTubeWatchUrl(url: string | undefined): string | null {
  const embed = toYouTubeEmbedUrl(url, {});
  if (!embed) return null;
  try {
    const u = new URL(embed);
    const raw = u.pathname.replace(/^\/embed\//, '').split('/')[0] ?? '';
    const id = stripToVideoId(raw);
    if (!id) return null;
    return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
  } catch {
    return null;
  }
}

/**
 * Client or server: only allow our iframe to load known YouTube embed origins.
 * @param url - Full embed URL including optional query
 */
export function sanitizeYoutubeEmbedUrlForIframe(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return null;
    const host = u.hostname.replace(/^www\./, '');
    if (host !== 'youtube.com' && host !== 'youtube-nocookie.com') return null;
    if (!u.pathname.startsWith('/embed/')) return null;
    const after = u.pathname.slice('/embed/'.length);
    if (!after || !/^[\w-]{11}/.test(after)) return null;
    return url;
  } catch {
    return null;
  }
}
