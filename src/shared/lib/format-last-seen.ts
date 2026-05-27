const ONLINE_THRESHOLD_MS = 3 * 60 * 1000;

const formatTime = (date: Date): string =>
  date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  });

const isSameDay = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const parseLastSeenAt = (lastSeenAt: string): Date | null => {
  const seenAt = new Date(lastSeenAt);
  if (Number.isNaN(seenAt.getTime())) {
    return null;
  }

  return seenAt;
};

export const formatLastSeen = (
  lastSeenAt?: string | null,
  isOnline?: boolean
): string => {
  if (isOnline) {
    return "в сети";
  }

  if (!lastSeenAt) {
    return "давно";
  }

  const seenAt = parseLastSeenAt(lastSeenAt);
  if (!seenAt) {
    return "давно";
  }

  const now = new Date();
  const diffMs = now.getTime() - seenAt.getTime();

  if (diffMs < ONLINE_THRESHOLD_MS) {
    return "в сети";
  }

  if (isSameDay(seenAt, now)) {
    return `был(а) в сети сегодня в ${formatTime(seenAt)}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(seenAt, yesterday)) {
    return `был(а) в сети вчера в ${formatTime(seenAt)}`;
  }

  return `был(а) в сети ${seenAt.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })}`;
};

export const isUserOnline = (
  lastSeenAt?: string | null,
  isOnline?: boolean
): boolean => {
  if (isOnline) {
    return true;
  }

  if (!lastSeenAt) {
    return false;
  }

  const seenAt = parseLastSeenAt(lastSeenAt);
  if (!seenAt) {
    return false;
  }

  return Date.now() - seenAt.getTime() < ONLINE_THRESHOLD_MS;
};
