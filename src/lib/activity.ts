import type {
  ActivityEntry,
  ActivityType,
  Employee,
  EmployeeInput,
  Leave,
  Raise,
} from '../types'
import { createId } from './id'
import { formatCurrency } from './format'
import { formatShortDate } from './dates'
import { CONTRACT_LABEL, LEAVE_STATUS_LABEL, LEAVE_TYPE_LABEL, STATUS_LABEL } from './labels'

export const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  alta: 'Alta',
  datos: 'Datos generales',
  estatus: 'Estatus',
  archivado: 'Archivado',
  reactivacion: 'Reactivación',
  aumento: 'Aumento salarial',
  permiso: 'Permiso',
  permiso_estatus: 'Estatus de permiso',
  permiso_baja: 'Permiso eliminado',
}

export const ACTIVITY_TONE: Record<ActivityType, string> = {
  alta: 'success',
  datos: 'info',
  estatus: 'info',
  archivado: 'warning',
  reactivacion: 'success',
  aumento: 'success',
  permiso: 'info',
  permiso_estatus: 'neutral',
  permiso_baja: 'danger',
}

/** Editable fields that leave a trace in the audit trail, with their Spanish labels. */
const TRACKED_FIELDS: { key: keyof EmployeeInput; label: string; type: ActivityType }[] = [
  { key: 'employeeNumber', label: 'Número de empleado', type: 'datos' },
  { key: 'firstName', label: 'Nombre(s)', type: 'datos' },
  { key: 'lastName', label: 'Apellidos', type: 'datos' },
  { key: 'email', label: 'Correo electrónico', type: 'datos' },
  { key: 'phone', label: 'Teléfono', type: 'datos' },
  { key: 'birthDate', label: 'Fecha de nacimiento', type: 'datos' },
  { key: 'hireDate', label: 'Fecha de ingreso', type: 'datos' },
  { key: 'department', label: 'Departamento', type: 'datos' },
  { key: 'position', label: 'Puesto', type: 'datos' },
  { key: 'contractType', label: 'Tipo de contrato', type: 'datos' },
  { key: 'salary', label: 'Salario', type: 'datos' },
  { key: 'status', label: 'Estatus', type: 'estatus' },
]

export function createActivityEntry(
  type: ActivityType,
  description: string,
  extra: Pick<ActivityEntry, 'field' | 'previousValue' | 'newValue'> = {},
  at: string = new Date().toISOString(),
): ActivityEntry {
  return { id: createId('act'), at, type, description, ...extra }
}

/** Appends entries to an employee's audit trail. */
export function withActivity(employee: Employee, ...entries: ActivityEntry[]): Employee {
  return { ...employee, activity: [...(employee.activity ?? []), ...entries] }
}

/** One entry per field changed by an edit of the employee's general data. */
export function diffEmployee(previous: Employee, next: EmployeeInput): ActivityEntry[] {
  return TRACKED_FIELDS.flatMap(({ key, label, type }) => {
    const before = formatFieldValue(key, previous[key])
    const after = formatFieldValue(key, next[key])
    if (before === after) return []
    const description =
      type === 'estatus'
        ? `El estatus cambió de ${before} a ${after}.`
        : `Se modificó ${label.toLowerCase()}.`
    return [createActivityEntry(type, description, { field: label, previousValue: before, newValue: after })]
  })
}

export function raiseActivity(raise: Raise): ActivityEntry {
  return createActivityEntry(
    'aumento',
    `Aumento aplicado con fecha ${formatShortDate(raise.effectiveDate)}: ${raise.reason}`,
    {
      field: 'Salario',
      previousValue: formatCurrency(raise.previousSalary),
      newValue: formatCurrency(raise.newSalary),
    },
    raise.createdAt,
  )
}

export function leaveActivity(leave: Leave): ActivityEntry {
  return createActivityEntry(
    'permiso',
    `Permiso ${LEAVE_TYPE_LABEL[leave.type].toLowerCase()} del ${formatShortDate(
      leave.startDate,
    )} al ${formatShortDate(leave.endDate)}: ${leave.reason}`,
    { field: 'Estatus del permiso', newValue: LEAVE_STATUS_LABEL[leave.status] },
    leave.createdAt,
  )
}

/**
 * Rebuilds the audit trail of a record saved before the trail existed, so the leaves and
 * raises already registered keep showing up in the employee's history.
 */
export function deriveActivity(employee: Omit<Employee, 'activity'>): ActivityEntry[] {
  const entries: ActivityEntry[] = [
    createActivityEntry(
      'alta',
      `Alta del colaborador con fecha de ingreso ${formatShortDate(employee.hireDate)}.`,
      { field: 'Salario inicial', newValue: formatCurrency(initialSalary(employee)) },
      `${employee.hireDate}T08:00:00.000Z`,
    ),
    ...employee.raises.map((raise) => raiseActivity(raise)),
    ...employee.leaves.map((leave) => leaveActivity(leave)),
  ]

  if (employee.archivedAt) {
    entries.push(
      createActivityEntry(
        'archivado',
        'El expediente fue archivado y dejó de aparecer en el listado activo.',
        {},
        employee.archivedAt,
      ),
    )
  }

  return sortActivity(entries)
}

/** Most recent movement first. */
export function sortActivity(entries: ActivityEntry[]): ActivityEntry[] {
  return [...entries].sort((a, b) => b.at.localeCompare(a.at))
}

function initialSalary(employee: Omit<Employee, 'activity'>): number {
  const sorted = [...employee.raises].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))
  return sorted.length > 0 ? sorted[0].previousSalary : employee.salary
}

function formatFieldValue(key: keyof EmployeeInput, value: EmployeeInput[keyof EmployeeInput]): string {
  if (key === 'salary') return formatCurrency(Number(value))
  if (key === 'status') return STATUS_LABEL[value as Employee['status']]
  if (key === 'contractType') return CONTRACT_LABEL[value as Employee['contractType']]
  if (key === 'birthDate' || key === 'hireDate') return formatShortDate(String(value))
  return String(value)
}
