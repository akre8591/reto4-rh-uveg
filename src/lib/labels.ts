import type { Employee, LeaveStatus, LeaveType } from '../types'

export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  con_goce: 'Con goce de sueldo',
  sin_goce: 'Sin goce de sueldo',
}

export const LEAVE_STATUS_LABEL: Record<LeaveStatus, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
}

export const CONTRACT_LABEL: Record<Employee['contractType'], string> = {
  tiempo_completo: 'Tiempo completo',
  medio_tiempo: 'Medio tiempo',
  temporal: 'Temporal',
}

export const STATUS_LABEL: Record<Employee['status'], string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
}

export const DEPARTMENTS = [
  'Dirección General',
  'Recursos Humanos',
  'Finanzas',
  'Ventas',
  'Tecnologías de la Información',
  'Operaciones',
  'Mercadotecnia',
  'Atención a Clientes',
] as const

/** Seniority brackets offered by the roster filter, in completed years of service. */
export const SENIORITY_RANGES = [
  { id: 'menos-1', label: 'Menos de 1 año', minYears: 0, maxYears: 1 },
  { id: '1-3', label: 'De 1 a 3 años', minYears: 1, maxYears: 3 },
  { id: '3-5', label: 'De 3 a 5 años', minYears: 3, maxYears: 5 },
  { id: '5-10', label: 'De 5 a 10 años', minYears: 5, maxYears: 10 },
  { id: 'mas-10', label: 'Más de 10 años', minYears: 10, maxYears: null },
] as const satisfies readonly {
  id: string
  label: string
  minYears: number
  maxYears: number | null
}[]
