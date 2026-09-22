import type { Employee } from '../types'
import { SEED_EMPLOYEES } from './seed'

const STORAGE_KEY = 'rh-uveg:employees:v2'
/** Key used before the archiving feature; its contents are migrated once. */
const LEGACY_STORAGE_KEY = 'rh-uveg:employees:v1'

function isEmployeeArray(value: unknown): value is Employee[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item !== null &&
        typeof item === 'object' &&
        typeof (item as Employee).id === 'string' &&
        typeof (item as Employee).hireDate === 'string',
    )
  )
}

/**
 * Reads the roster from localStorage, seeding it the first time. Records saved by the
 * previous version are migrated to the current key instead of being discarded.
 */
export function loadEmployees(): Employee[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      return isEmployeeArray(parsed) ? normalize(parsed) : SEED_EMPLOYEES
    }

    const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacyRaw) {
      const legacy: unknown = JSON.parse(legacyRaw)
      if (isEmployeeArray(legacy)) {
        const migrated = normalize(legacy)
        saveEmployees(migrated)
        return migrated
      }
    }

    saveEmployees(SEED_EMPLOYEES)
    return SEED_EMPLOYEES
  } catch {
    return SEED_EMPLOYEES
  }
}

/** Fills in fields added after a record was saved, so older data keeps working. */
function normalize(employees: Employee[]): Employee[] {
  return employees.map((employee) => ({
    ...employee,
    leaves: employee.leaves ?? [],
    raises: employee.raises ?? [],
    archivedAt: employee.archivedAt ?? null,
  }))
}

export function saveEmployees(employees: Employee[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(employees))
  } catch {
    // Storage may be unavailable (private mode / quota); the app keeps working in memory.
  }
}

export function clearEmployees(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    // Ignored on purpose.
  }
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
