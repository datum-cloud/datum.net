/**
 * Truncate a string to a maximum number of characters without cutting words
 * @param str - The input string
 * @param maxChar - Maximum number of characters
 * @param suffix - Suffix to append if truncated
 * @returns Truncated
 */
function truncate(str = '', maxChar = 100, suffix = '...'): string {
  return str.length < maxChar
    ? str
    : `${str.slice(0, str.slice(0, maxChar - suffix.length).lastIndexOf(' '))}${suffix}`;
}

/**
 * Truncate a string to a maximum number of words
 * @param str - The input string
 * @param maxWords - Maximum number of words to keep
 * @param suffix - Suffix to append if truncated (default '...')
 * @returns Truncated string
 */
function truncateByWords(str = '', maxWords = 10, suffix = '...'): string {
  const words = str.trim().split(/\s+/);
  if (words.length <= maxWords) return str;
  return words.slice(0, maxWords).join(' ') + suffix;
}

/**
 * Remove all header tags (h1 to h6) from the given HTML content
 * @param html - The HTML content
 * @returns HTML content without header tags
 */
async function removeHeaderTags(
  html: string | Promise<string> = Promise.resolve('')
): Promise<string> {
  const resolvedHtml = await html;
  return resolvedHtml.replace(/<h[1-6]>.*?<\/h[1-6]>/gi, '').trim();
}

/**
 * Generate a text excerpt from HTML content without HTML tags
 * @param html - The HTML content
 * @param maxChar - Maximum number of characters for the excerpt
 * @param suffix - Suffix to append if truncated
 * @returns Excerpt string
 */
async function stripTags(
  html: string | Promise<string> = Promise.resolve(''),
  maxChar: number = 0,
  suffix: string = ''
): Promise<string> {
  const resolvedHtml = await html;
  const textContent = resolvedHtml
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Decode ampersands
    .replace(/&lt;/g, '<') // Decode less than
    .replace(/&gt;/g, '>') // Decode greater than
    .replace(/&quot;/g, '"') // Decode quotes
    .replace(/&#39;/g, "'") // Decode apostrophes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  if (maxChar <= 0) {
    return textContent;
  }

  return truncate(textContent, maxChar, suffix);
}

/**
 * Generates a random string of specified length
 * @param length - The desired length of the random string
 * @returns Random string containing lowercase letters and numbers
 */
const generateRandomString = (length: number): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
};

export { truncate, truncateByWords, removeHeaderTags, stripTags, generateRandomString };
