export type EmployeeStatus = 'activo' | 'inactivo'

export type LeaveType = 'con_goce' | 'sin_goce'

export type LeaveStatus = 'pendiente' | 'aprobado' | 'rechazado'

export interface Leave {
  id: string
  type: LeaveType
  startDate: string // ISO yyyy-mm-dd
  endDate: string // ISO yyyy-mm-dd
  reason: string
  status: LeaveStatus
  createdAt: string
}

export interface Raise {
  id: string
  effectiveDate: string // ISO yyyy-mm-dd
  previousSalary: number
  newSalary: number
  reason: string
  createdAt: string
}

/** Kinds of movement recorded in an employee's audit trail. */
export type ActivityType =
  | 'alta'
  | 'datos'
  | 'estatus'
  | 'archivado'
  | 'reactivacion'
  | 'aumento'
  | 'permiso'
  | 'permiso_estatus'
  | 'permiso_baja'

export interface ActivityEntry {
  id: string
  /** ISO timestamp of the movement. */
  at: string
  type: ActivityType
  /** Human readable summary of the movement, in Spanish. */
  description: string
  /** Name of the affected field, when the movement changed a single value. */
  field?: string
  previousValue?: string
  newValue?: string
}

export interface Employee {
  id: string
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate: string
  hireDate: string
  department: string
  position: string
  contractType: 'tiempo_completo' | 'medio_tiempo' | 'temporal'
  salary: number
  status: EmployeeStatus
  /** ISO timestamp of the archiving, or null while the record is active. */
  archivedAt: string | null
  leaves: Leave[]
  raises: Raise[]
  /** Audit trail of every movement registered for this employee. */
  activity: ActivityEntry[]
}

export type EmployeeInput = Omit<
  Employee,
  'id' | 'leaves' | 'raises' | 'archivedAt' | 'activity'
>

export type LeaveInput = Omit<Leave, 'id' | 'createdAt'>

export type RaiseInput = Pick<Raise, 'effectiveDate' | 'newSalary' | 'reason'>

export interface Seniority {
  years: number
  months: number
  days: number
  totalDays: number
  label: string
}
