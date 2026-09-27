import type { Employee } from '../types'
import { SEED_EMPLOYEES } from './seed'
import { deriveActivity } from './activity'

export { createId } from './id'

const STORAGE_KEY = 'rh-uveg:employees:v3'
/**
 * Keys used by previous versions, newest first. Their contents are migrated once instead
 * of being discarded: v1 predates archiving, v2 predates the audit trail.
 */
const LEGACY_STORAGE_KEYS = ['rh-uveg:employees:v2', 'rh-uveg:employees:v1']

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

    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacyRaw = window.localStorage.getItem(legacyKey)
      if (!legacyRaw) continue
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
  return employees.map((employee) => {
    const record = {
      ...employee,
      leaves: employee.leaves ?? [],
      raises: employee.raises ?? [],
      archivedAt: employee.archivedAt ?? null,
    }
    // Records saved before the audit trail existed get one rebuilt from their own history.
    return { ...record, activity: employee.activity ?? deriveActivity(record) }
  })
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
    for (const legacyKey of LEGACY_STORAGE_KEYS) window.localStorage.removeItem(legacyKey)
  } catch {
    // Ignored on purpose.
  }
}
