/**
 * String utility functions
 */

/**
 * URL regex pattern matching http/https URLs
 */
const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

/**
 * Extracts URLs from a string and returns them with their positions
 * @param text - The text to search for URLs
 * @returns Array of objects with URL and position information
 */
export const findUrls = (text: string): Array<{ url: string; start: number; end: number }> => {
  const urls: Array<{ url: string; start: number; end: number }> = [];
  let match;

  while ((match = URL_PATTERN.exec(text)) !== null) {
    urls.push({
      url: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return urls;
};

/**
 * Checks if a string contains a URL
 * @param text - The text to check
 * @returns True if the text contains a URL
 */
export const hasUrl = (text: string): boolean => {
  return URL_PATTERN.test(text);
};

/**
 * Converts URLs in a string to <a> tags
 * @param text - The text to process
 * @returns An array of strings and { url: string, href: string } objects for rendering
 */
export const convertUrlsToLinks = (
  text: string
): Array<{ type: 'text'; content: string } | { type: 'link'; content: string; href: string }> => {
  const urls = findUrls(text);
  const result: Array<
    { type: 'text'; content: string } | { type: 'link'; content: string; href: string }
  > = [];
  let lastIndex = 0;

  for (const { url, start, end } of urls) {
    // Add text before the URL
    if (start > lastIndex) {
      result.push({ type: 'text', content: text.slice(lastIndex, start) });
    }

    // Add the URL as a link
    result.push({ type: 'link', content: url, href: url });
    lastIndex = end;
  }

  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    result.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return result;
};
