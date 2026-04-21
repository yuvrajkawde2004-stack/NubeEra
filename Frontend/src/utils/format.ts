/**
 * Formats a decimal number of hours into a YouTube-style duration string (e.g., 1:30:00 or 15:00).
 */
export const formatYouTubeDuration = (hours: number): string => {
  if (!hours || hours <= 0) return '0:00';
  
  const totalSeconds = Math.round(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const mStr = h > 0 ? m.toString().padStart(2, '0') : m.toString();
  const sStr = s.toString().padStart(2, '0');

  if (h > 0) {
    return `${h}:${mStr}:${sStr}`;
  }
  return `${mStr}:${sStr}`;
};

/**
 * Parses a YouTube-style duration string (H:MM:SS or M:SS) back into a decimal number of hours.
 */
export const parseYouTubeDuration = (str: string): number => {
  if (!str) return 0;
  
  const parts = str.split(':').map(Number);
  let hours = 0;
  
  if (parts.length === 3) {
    // H:MM:SS
    hours = parts[0] + parts[1] / 60 + parts[2] / 3600;
  } else if (parts.length === 2) {
    // MM:SS
    hours = parts[0] / 60 + parts[1] / 3600;
  } else if (parts.length === 1) {
    // Treat as minutes if no colon
    hours = parts[0] / 60;
  }
  
  return Number(hours.toFixed(4));
};
