export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function isSameDay(a: string, b: string): boolean {
  return a.split('T')[0] === b.split('T')[0];
}

export function hoursSince(timestamp: string): number {
  const diff = Date.now() - new Date(timestamp).getTime();
  return diff / 1000 / 3600;
}

export function formatTimestamp(ts: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
}

export function formatDate(ts: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(ts));
}

export function formatTime(ts: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
}

export function getLast30Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export function getLast90Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

