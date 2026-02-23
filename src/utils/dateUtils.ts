/**
 * Utility functions for handling dates in Astro
 */

/**
 * Formats a date to a human-readable string
 * @param date - The date to format (Date object or ISO string)
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @param options - Intl.DateTimeFormat options
 * @param timezone - Optional IANA timezone identifier (e.g., 'America/New_York')
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  timezone?: string
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formatOptions: Intl.DateTimeFormatOptions = {
    ...options,
  };
  if (timezone) {
    formatOptions.timeZone = timezone;
  }
  return dateObj.toLocaleDateString(locale, formatOptions);
};

/**
 * Formats a date to a short string (e.g., "Jan 1, 2023")
 * @param date - The date to format (Date object or ISO string)
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @returns Formatted date string
 */
export const formatShortDate = (date: Date | string, locale: string = 'en-US'): string => {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats a date to a long string (e.g., "January 1, 2023")
 * @param date - The date to format (Date object or ISO string)
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @returns Formatted date string
 */
export const formatLongDate = (date: Date | string, locale: string = 'en-US'): string => {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats time only
 * @param date - The date to format (Date object or ISO string)
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @param options - Intl.DateTimeFormat options for time
 * @param timezone - Optional IANA timezone identifier (e.g., 'America/New_York')
 * @returns Formatted time string
 */
export const formatTime = (
  date: Date | string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  },
  timezone?: string
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formatOptions: Intl.DateTimeFormatOptions = {
    ...options,
  };
  // Only add timeZoneName if not explicitly set in options (default to 'short')
  if (!('timeZoneName' in formatOptions)) {
    formatOptions.timeZoneName = 'short';
  } else if (formatOptions.timeZoneName === undefined) {
    // Remove timeZoneName if explicitly set to undefined
    delete formatOptions.timeZoneName;
  }
  if (timezone) {
    formatOptions.timeZone = timezone;
  }
  return dateObj.toLocaleTimeString(locale, formatOptions);
};

/**
 * Formats a date to an ISO string for datetime attributes
 * @param date - The date to format (Date object or ISO string)
 * @returns ISO date string
 */
export const formatISODate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
};

/**
 * Formats a date as a relative time string (e.g., "1 day ago", "30 minutes ago")
 * @param date - The date to format (Date object or ISO string)
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return 'just now';
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  // Less than a month (approximate)
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }

  // Less than a year
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }

  // More than a year
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

/**
 * Estimates reading time for content based on word count
 * @param content - The content to analyze (markdown/text string)
 * @param wordsPerMinute - Average reading speed (defaults to 200 words per minute)
 * @returns Object with estimated reading time in minutes and formatted string
 */
export const estimateReadingTime = (
  content: string,
  wordsPerMinute: number = 200
): { minutes: number; text: string } => {
  // Remove markdown syntax, HTML tags, and extra whitespace
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Remove markdown links, keep text
    .replace(/[#*_~`]/g, '') // Remove markdown formatting
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Count words (split by whitespace and filter empty strings)
  const words = cleanContent.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;

  // Calculate reading time
  const minutes = Math.max(1, Math.round(wordCount / wordsPerMinute));

  return {
    minutes,
    text: `${minutes} minute read`,
  };
};
