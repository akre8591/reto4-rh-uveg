import type { Employee } from '../types'
import { SEED_EMPLOYEES } from './seed'

const STORAGE_KEY = 'rh-uveg:employees:v1'

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

/** Reads the roster from localStorage, seeding it the first time. */
export function loadEmployees(): Employee[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      saveEmployees(SEED_EMPLOYEES)
      return SEED_EMPLOYEES
    }
    const parsed: unknown = JSON.parse(raw)
    if (!isEmployeeArray(parsed)) return SEED_EMPLOYEES
    // Older records may lack the collections; normalize them.
    return parsed.map((employee) => ({
      ...employee,
      leaves: employee.leaves ?? [],
      raises: employee.raises ?? [],
    }))
  } catch {
    return SEED_EMPLOYEES
  }
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
  } catch {
    // Ignored on purpose.
  }
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
