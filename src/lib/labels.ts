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
