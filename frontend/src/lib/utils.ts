/**
 * Generates a unique 5-character alphanumeric ID for meeting links
 * Uses uppercase letters and numbers (excluding similar looking characters like 0/O, 1/I)
 */
export function generateMeetingId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Creates a Jitsi meeting link with the given meeting ID
 */
export function createJitsiLink(meetingId: string): string {
  return `https://meet.jit.si/${meetingId}`;
}

/**
 * Formats a date string to a readable format
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formats time from a date string
 */
export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
