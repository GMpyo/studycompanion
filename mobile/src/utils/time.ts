export function isCanonicalIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const time = Date.parse(value);

  return Number.isFinite(time) && new Date(time).toISOString() === value;
}

export function isChronologicalIsoRange(startedAt: unknown, completedAt: unknown): boolean {
  return (
    isCanonicalIsoTimestamp(startedAt) &&
    isCanonicalIsoTimestamp(completedAt) &&
    Date.parse(startedAt) <= Date.parse(completedAt)
  );
}

export function localDateKey(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}분`;
  }

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
}
