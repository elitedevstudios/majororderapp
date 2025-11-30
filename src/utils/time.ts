/**
 * Format seconds into a human-readable time string.
 * @param seconds - Total seconds to format
 * @param options - Formatting options
 * @returns Formatted time string (e.g., "1:23:45" or "05:30")
 */
export function formatElapsedTime(
  seconds: number,
  options: { showHours?: 'always' | 'when-needed' | 'never' } = {}
): string {
  const { showHours = 'when-needed' } = options;
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = secs.toString().padStart(2, '0');

  if (showHours === 'always' || (showHours === 'when-needed' && hours > 0)) {
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }
  
  return `${paddedMinutes}:${paddedSeconds}`;
}

/**
 * Format a timestamp to a relative date string.
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative date string (e.g., "Today 2:30 PM", "Yesterday", "Dec 5")
 */
export function formatRelativeDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = date.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (dateStr === yesterdayStr) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

/**
 * Get today's date as ISO string (YYYY-MM-DD).
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if a timestamp is from today.
 */
export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp).toISOString().split('T')[0];
  return date === getToday();
}
