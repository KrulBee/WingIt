// Utility functions for handling timezone conversions
// Render servers run in UTC, but we want to display times in user's local timezone

/**
 * Convert UTC timestamp to user's local timezone
 * @param utcTimestamp - UTC timestamp string from backend
 * @returns Date object in user's local timezone
 */
export const convertUTCToLocal = (utcTimestamp: string): Date => {
  return new Date(utcTimestamp);
};

/**
 * Convert local date to UTC for sending to backend
 * @param localDate - Date in user's local timezone
 * @returns UTC timestamp string
 */
export const convertLocalToUTC = (localDate: Date): string => {
  return localDate.toISOString();
};

/**
 * Format date for Vietnamese locale with proper timezone handling
 * @param timestamp - UTC timestamp string from backend
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string in Vietnamese
 */
export const formatDateVietnamese = (
  timestamp: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  const date = convertUTCToLocal(timestamp);
  return date.toLocaleDateString('vi-VN', {
    ...options,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
};

/**
 * Format date for join date display (without time)
 * @param timestamp - UTC timestamp string from backend
 * @returns Formatted date string
 */
export const formatJoinDate = (timestamp: string): string => {
  return formatDateVietnamese(timestamp, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param timestamp - UTC timestamp string from backend
 * @returns Relative time string in Vietnamese
 */
export const formatRelativeTime = (timestamp: string): string => {
  const date = convertUTCToLocal(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Vừa xong';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ngày trước`;
  } else {
    return formatDateVietnamese(timestamp, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

/**
 * Get user's current timezone
 * @returns User's timezone string (e.g., "Asia/Ho_Chi_Minh")
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
