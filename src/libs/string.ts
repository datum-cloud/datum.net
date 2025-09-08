function truncate(str = '', maxChar = 100, suffix = '...'): string {
  return str.length < maxChar
    ? str
    : `${str.slice(0, str.slice(0, maxChar - suffix.length).lastIndexOf(' '))}${suffix}`;
}

function excerpt(html = '', maxChar = 150, suffix = '...'): string {
  // Remove HTML tags and decode HTML entities
  const textContent = html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Decode ampersands
    .replace(/&lt;/g, '<') // Decode less than
    .replace(/&gt;/g, '>') // Decode greater than
    .replace(/&quot;/g, '"') // Decode quotes
    .replace(/&#39;/g, "'") // Decode apostrophes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return truncate(textContent, maxChar, suffix);
}

export { truncate, excerpt };
