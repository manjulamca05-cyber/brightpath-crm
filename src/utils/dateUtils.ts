// ==============================================================================
// BrightPath CRM — Date & Time Utilities
// Local timezone conversion, overdue date math, and relative timestamps
// ==============================================================================

import type { FollowupStatus } from '../types/database';

/**
 * Strict Overdue Calculation:
 * An item is overdue ONLY when status === 'pending' AND due_at < current time
 */
export function isFollowupOverdue(dueAt: string, status: FollowupStatus | string): boolean {
  if (status !== 'pending') return false;
  const dueDate = new Date(dueAt);
  if (isNaN(dueDate.getTime())) return false;
  return dueDate.getTime() < Date.now();
}

/**
 * Formats an ISO date string to user's localized date & time
 * Example: "Oct 24, 2026, 03:30 PM"
 */
export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Formats an ISO date string to user's localized date only
 * Example: "Oct 24, 2026"
 */
export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Calculates human-readable relative time string
 */
export function getRelativeTimeDescription(dueAt: string, status: FollowupStatus | string): string {
  const d = new Date(dueAt);
  if (isNaN(d.getTime())) return '';

  const now = Date.now();
  const diffMs = d.getTime() - now;
  const isPast = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const diffMins = Math.round(absDiff / (1000 * 60));
  const diffHours = Math.round(absDiff / (1000 * 60 * 60));
  const diffDays = Math.round(absDiff / (1000 * 60 * 60 * 24));

  if (status === 'completed') {
    return `Completed`;
  }

  if (status === 'cancelled') {
    return 'Cancelled';
  }

  if (isPast) {
    if (diffMins < 60) {
      return `Overdue by ${diffMins} min${diffMins === 1 ? '' : 's'}`;
    }
    if (diffHours < 24) {
      return `Overdue by ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
    }
    return `Overdue by ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  }

  // Future / upcoming
  if (diffMins < 60) {
    return `Due in ${diffMins} min${diffMins === 1 ? '' : 's'}`;
  }
  if (diffHours < 24) {
    return `Due in ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  }
  if (diffDays === 1) {
    return `Due tomorrow`;
  }
  return `Due in ${diffDays} days`;
}

/**
 * Convert Date to HTML datetime-local input string (YYYY-MM-DDTHH:mm)
 */
export function toDatetimeLocalInputString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const mins = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${mins}`;
}

/**
 * Generate preset Date objects for quick scheduling buttons
 */
export function getPresetDate(preset: 'plus2hours' | 'tomorrow10am' | 'in2days' | 'nextmonday'): Date {
  const d = new Date();
  switch (preset) {
    case 'plus2hours':
      d.setHours(d.getHours() + 2);
      d.setMinutes(0, 0, 0);
      return d;
    case 'tomorrow10am':
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      return d;
    case 'in2days':
      d.setDate(d.getDate() + 2);
      d.setHours(11, 0, 0, 0);
      return d;
    case 'nextmonday': {
      const day = d.getDay();
      const distance = (8 - day) % 7 || 7;
      d.setDate(d.getDate() + distance);
      d.setHours(10, 0, 0, 0);
      return d;
    }
  }
}
