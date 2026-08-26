/**
 * Formats an ISO date string into a user-friendly relative timestamp.
 * Examples: "Just now", "5 min ago", "2 hr ago", "Yesterday", "Aug 24", "Aug 24, 2025"
 */
export function formatRelativeTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Future timestamp guard
  if (diffSeconds < 0) {
    return "Just now";
  }

  // Under 1 minute
  if (diffMinutes < 1) {
    return "Just now";
  }

  // Under 60 minutes
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  // Same day (under 24 hours and same calendar day)
  const isSameDay =
    now.getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear();

  if (isSameDay) {
    if (diffHours < 12) {
      return `${diffHours} hr ago`;
    }
    return "Today";
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    yesterday.getDate() === date.getDate() &&
    yesterday.getMonth() === date.getMonth() &&
    yesterday.getFullYear() === date.getFullYear();

  if (isYesterday) {
    return "Yesterday";
  }

  // Under 7 days
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  // Same calendar year (e.g. "Aug 24")
  const isSameYear = now.getFullYear() === date.getFullYear();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = monthNames[date.getMonth()];
  const day = date.getDate();

  if (isSameYear) {
    return `${month} ${day}`;
  }

  // Different year (e.g. "Aug 24, 2025")
  return `${month} ${day}, ${date.getFullYear()}`;
}
