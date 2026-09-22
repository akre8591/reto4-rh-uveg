import type { Employee, EmployeeInput, LeaveInput, RaiseInput } from '../types'
import { daysBetween, isValidISODate, parseISO, rangesOverlap, todayISO } from './dates'

export type Errors<T> = Partial<Record<keyof T, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_PATTERN = /^\d{10}$/
const MIN_SALARY = 1
const MAX_SALARY = 1_000_000
const MIN_HIRE_AGE_YEARS = 18

/** Validates the employee form. Returns an empty object when the data is valid. */
export function validateEmployee(
  input: EmployeeInput,
  employees: Employee[],
  editingId?: string,
): Errors<EmployeeInput> {
  const errors: Errors<EmployeeInput> = {}
  const today = todayISO()

  if (!input.employeeNumber.trim()) {
    errors.employeeNumber = 'El número de empleado es obligatorio.'
  } else if (
    employees.some(
      (employee) =>
        employee.id !== editingId &&
        employee.employeeNumber.trim().toLowerCase() ===
          input.employeeNumber.trim().toLowerCase(),
    )
  ) {
    errors.employeeNumber = 'Ya existe un empleado con ese número.'
  }

  if (!input.firstName.trim()) errors.firstName = 'El nombre es obligatorio.'
  else if (input.firstName.trim().length < 2) errors.firstName = 'El nombre es demasiado corto.'

  if (!input.lastName.trim()) errors.lastName = 'Los apellidos son obligatorios.'
  else if (input.lastName.trim().length < 2) errors.lastName = 'Los apellidos son demasiado cortos.'

  if (!input.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.'
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = 'El correo electrónico no tiene un formato válido.'
  } else if (
    employees.some(
      (employee) =>
        employee.id !== editingId &&
        employee.email.trim().toLowerCase() === input.email.trim().toLowerCase(),
    )
  ) {
    errors.email = 'Ya existe un empleado con ese correo.'
  }

  if (!input.phone.trim()) {
    errors.phone = 'El teléfono es obligatorio.'
  } else if (!PHONE_PATTERN.test(input.phone.trim())) {
    errors.phone = 'El teléfono debe tener 10 dígitos.'
  }

  if (!input.birthDate) {
    errors.birthDate = 'La fecha de nacimiento es obligatoria.'
  } else if (!isValidISODate(input.birthDate)) {
    errors.birthDate = 'La fecha de nacimiento no es válida.'
  } else if (input.birthDate >= today) {
    errors.birthDate = 'La fecha de nacimiento debe ser anterior a hoy.'
  }

  if (!input.hireDate) {
    errors.hireDate = 'La fecha de ingreso es obligatoria.'
  } else if (!isValidISODate(input.hireDate)) {
    errors.hireDate = 'La fecha de ingreso no es válida.'
  } else if (input.hireDate > today) {
    errors.hireDate = 'La fecha de ingreso no puede ser futura.'
  } else if (!errors.birthDate && input.birthDate) {
    if (input.hireDate <= input.birthDate) {
      errors.hireDate = 'La fecha de ingreso debe ser posterior al nacimiento.'
    } else if (ageAt(input.birthDate, input.hireDate) < MIN_HIRE_AGE_YEARS) {
      errors.hireDate = `El colaborador debe tener al menos ${MIN_HIRE_AGE_YEARS} años al ingresar.`
    }
  }

  if (!input.department.trim()) errors.department = 'El departamento es obligatorio.'
  if (!input.position.trim()) errors.position = 'El puesto es obligatorio.'

  if (input.salary === null || input.salary === undefined || Number.isNaN(input.salary)) {
    errors.salary = 'El salario es obligatorio.'
  } else if (input.salary < MIN_SALARY) {
    errors.salary = 'El salario debe ser mayor a cero.'
  } else if (input.salary > MAX_SALARY) {
    errors.salary = 'El salario excede el máximo permitido.'
  }

  return errors
}

/** Validates a leave request against the employee's hire date and existing leaves. */
export function validateLeave(
  input: LeaveInput,
  employee: Employee,
  editingId?: string,
): Errors<LeaveInput> {
  const errors: Errors<LeaveInput> = {}

  if (!input.startDate) {
    errors.startDate = 'La fecha de inicio es obligatoria.'
  } else if (!isValidISODate(input.startDate)) {
    errors.startDate = 'La fecha de inicio no es válida.'
  } else if (input.startDate < employee.hireDate) {
    errors.startDate = 'El permiso no puede iniciar antes de la fecha de ingreso.'
  }

  if (!input.endDate) {
    errors.endDate = 'La fecha de término es obligatoria.'
  } else if (!isValidISODate(input.endDate)) {
    errors.endDate = 'La fecha de término no es válida.'
  } else if (!errors.startDate && input.endDate < input.startDate) {
    errors.endDate = 'La fecha de término no puede ser anterior al inicio.'
  } else if (!errors.startDate && daysBetween(input.startDate, input.endDate) > 365) {
    errors.endDate = 'El permiso no puede exceder 365 días.'
  }

  if (!errors.startDate && !errors.endDate) {
    const overlapping = employee.leaves.some(
      (leave) =>
        leave.id !== editingId &&
        leave.status !== 'rechazado' &&
        rangesOverlap(input.startDate, input.endDate, leave.startDate, leave.endDate),
    )
    if (overlapping) {
      errors.startDate = 'Ya existe un permiso registrado en ese periodo.'
    }
  }

  if (!input.reason.trim()) {
    errors.reason = 'El motivo es obligatorio.'
  } else if (input.reason.trim().length < 5) {
    errors.reason = 'Describe el motivo con al menos 5 caracteres.'
  }

  return errors
}

/** Validates a salary raise: it must increase the salary and be chronologically consistent. */
export function validateRaise(
  input: RaiseInput,
  employee: Employee,
  editingId?: string,
): Errors<RaiseInput> {
  const errors: Errors<RaiseInput> = {}
  const today = todayISO()

  if (!input.effectiveDate) {
    errors.effectiveDate = 'La fecha de aplicación es obligatoria.'
  } else if (!isValidISODate(input.effectiveDate)) {
    errors.effectiveDate = 'La fecha de aplicación no es válida.'
  } else if (input.effectiveDate < employee.hireDate) {
    errors.effectiveDate = 'El aumento no puede aplicarse antes de la fecha de ingreso.'
  } else if (input.effectiveDate > today) {
    errors.effectiveDate = 'La fecha de aplicación no puede ser futura.'
  } else {
    const lastRaise = [...employee.raises]
      .filter((raise) => raise.id !== editingId)
      .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))
      .at(-1)
    if (lastRaise && input.effectiveDate < lastRaise.effectiveDate) {
      errors.effectiveDate = 'Ya existe un aumento con fecha posterior a la capturada.'
    }
  }

  if (input.newSalary === null || input.newSalary === undefined || Number.isNaN(input.newSalary)) {
    errors.newSalary = 'El nuevo salario es obligatorio.'
  } else if (input.newSalary <= employee.salary) {
    errors.newSalary = 'El nuevo salario debe ser mayor al salario vigente.'
  } else if (input.newSalary > MAX_SALARY) {
    errors.newSalary = 'El nuevo salario excede el máximo permitido.'
  }

  if (!input.reason.trim()) {
    errors.reason = 'El motivo del aumento es obligatorio.'
  }

  return errors
}

export function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0
}

function ageAt(birthDateISO: string, referenceISO: string): number {
  const birth = parseISO(birthDateISO)
  const reference = parseISO(referenceISO)
  if (!birth || !reference) return 0
  let age = reference.getFullYear() - birth.getFullYear()
  const monthDiff = reference.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) age -= 1
  return age
}
