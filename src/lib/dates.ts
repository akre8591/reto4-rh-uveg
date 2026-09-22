import type { Seniority } from '../types'

/** Today as an ISO yyyy-mm-dd string, using the local timezone. */
export function todayISO(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

/** Parses an ISO yyyy-mm-dd string as a local date (avoids UTC shifting). */
export function parseISO(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

export function isValidISODate(value: string): boolean {
  return parseISO(value) !== null
}

export function formatDate(value: string): string {
  const date = parseISO(value)
  if (!date) return '—'
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShortDate(value: string): string {
  const date = parseISO(value)
  if (!date) return '—'
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Inclusive number of calendar days between two ISO dates. */
export function daysBetween(startISO: string, endISO: string): number {
  const start = parseISO(startISO)
  const end = parseISO(endISO)
  if (!start || !end) return 0
  const diff = end.getTime() - start.getTime()
  return Math.floor(diff / 86400000) + 1
}

/** Calendar difference (years, months, days) between a hire date and today. */
export function calculateSeniority(hireDateISO: string, referenceISO = todayISO()): Seniority {
  const start = parseISO(hireDateISO)
  const reference = parseISO(referenceISO)
  const empty: Seniority = { years: 0, months: 0, days: 0, totalDays: 0, label: '—' }
  if (!start || !reference || start > reference) return empty

  let years = reference.getFullYear() - start.getFullYear()
  let months = reference.getMonth() - start.getMonth()
  let days = reference.getDate() - start.getDate()

  if (days < 0) {
    months -= 1
    const previousMonth = new Date(reference.getFullYear(), reference.getMonth(), 0)
    days += previousMonth.getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  const totalDays = Math.floor((reference.getTime() - start.getTime()) / 86400000)
  return { years, months, days, totalDays, label: seniorityLabel(years, months, days) }
}

function seniorityLabel(years: number, months: number, days: number): string {
  const parts: string[] = []
  if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`)
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`)
  if (parts.length === 0) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`)
  return parts.join(' y ')
}

/** True when the two ranges share at least one day. */
export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart <= bEnd && bStart <= aEnd
}
