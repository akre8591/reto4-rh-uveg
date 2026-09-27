import { useCallback, useEffect, useState } from 'react'
import type {
  Employee,
  EmployeeInput,
  Leave,
  LeaveInput,
  LeaveStatus,
  Raise,
  RaiseInput,
} from '../types'
import { clearEmployees, createId, loadEmployees, saveEmployees } from '../lib/storage'
import { SEED_EMPLOYEES } from '../lib/seed'
import {
  createActivityEntry,
  diffEmployee,
  leaveActivity,
  raiseActivity,
  withActivity,
} from '../lib/activity'
import { LEAVE_STATUS_LABEL, LEAVE_TYPE_LABEL } from '../lib/labels'
import { formatShortDate } from '../lib/dates'
import { formatCurrency } from '../lib/format'

/** Single source of truth for the roster, persisted in localStorage. */
export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(() => loadEmployees())

  useEffect(() => {
    saveEmployees(employees)
  }, [employees])

  const addEmployee = useCallback((input: EmployeeInput): Employee => {
    const employee: Employee = {
      ...input,
      id: createId('emp'),
      archivedAt: null,
      leaves: [],
      raises: [],
      activity: [
        createActivityEntry(
          'alta',
          `Alta del colaborador con fecha de ingreso ${formatShortDate(input.hireDate)}.`,
          { field: 'Salario inicial', newValue: formatCurrency(input.salary) },
        ),
      ],
    }
    setEmployees((current) => [...current, employee])
    return employee
  }, [])

  /** Updates the general data and records one audit entry per field that changed. */
  const updateEmployee = useCallback((id: string, input: EmployeeInput) => {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === id
          ? withActivity({ ...employee, ...input }, ...diffEmployee(employee, input))
          : employee,
      ),
    )
  }, [])

  /**
   * Archives a colleague: the record leaves the active roster but keeps its whole file
   * (leaves and raises included). Nothing is deleted from storage, and the employment
   * status is left untouched so it still reflects the situation at the time of the leave.
   */
  const archiveEmployee = useCallback((id: string) => {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === id
          ? withActivity(
              { ...employee, archivedAt: new Date().toISOString() },
              createActivityEntry(
                'archivado',
                'El expediente fue archivado y dejó de aparecer en el listado activo.',
              ),
            )
          : employee,
      ),
    )
  }, [])

  const restoreEmployee = useCallback((id: string) => {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === id
          ? withActivity(
              { ...employee, archivedAt: null },
              createActivityEntry(
                'reactivacion',
                'El expediente fue reactivado y volvió al listado activo.',
              ),
            )
          : employee,
      ),
    )
  }, [])

  const addLeave = useCallback((employeeId: string, input: LeaveInput) => {
    const leave: Leave = { ...input, id: createId('lv'), createdAt: new Date().toISOString() }
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === employeeId
          ? withActivity(
              { ...employee, leaves: [...employee.leaves, leave] },
              leaveActivity(leave),
            )
          : employee,
      ),
    )
  }, [])

  const updateLeaveStatus = useCallback(
    (employeeId: string, leaveId: string, status: LeaveStatus) => {
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === employeeId
            ? recordLeaveStatusChange(employee, leaveId, status)
            : employee,
        ),
      )
    },
    [],
  )

  const removeLeave = useCallback((employeeId: string, leaveId: string) => {
    setEmployees((current) =>
      current.map((employee) => {
        if (employee.id !== employeeId) return employee
        const removed = employee.leaves.find((leave) => leave.id === leaveId)
        const entries = removed
          ? [
              createActivityEntry(
                'permiso_baja',
                `Se eliminó el permiso ${LEAVE_TYPE_LABEL[removed.type].toLowerCase()} del ${formatShortDate(
                  removed.startDate,
                )} al ${formatShortDate(removed.endDate)}.`,
              ),
            ]
          : []
        return withActivity(
          { ...employee, leaves: employee.leaves.filter((leave) => leave.id !== leaveId) },
          ...entries,
        )
      }),
    )
  }, [])

  /** Registers a raise and keeps the employee's current salary in sync. */
  const addRaise = useCallback((employeeId: string, input: RaiseInput) => {
    setEmployees((current) =>
      current.map((employee) => {
        if (employee.id !== employeeId) return employee
        const raise: Raise = {
          id: createId('rs'),
          effectiveDate: input.effectiveDate,
          previousSalary: employee.salary,
          newSalary: input.newSalary,
          reason: input.reason,
          createdAt: new Date().toISOString(),
        }
        return withActivity(
          { ...employee, salary: input.newSalary, raises: [...employee.raises, raise] },
          raiseActivity(raise),
        )
      }),
    )
  }, [])

  const resetData = useCallback(() => {
    clearEmployees()
    setEmployees(SEED_EMPLOYEES)
  }, [])

  return {
    employees,
    addEmployee,
    updateEmployee,
    archiveEmployee,
    restoreEmployee,
    addLeave,
    updateLeaveStatus,
    removeLeave,
    addRaise,
    resetData,
  }
}

/** Applies a new status to a leave and records the change in the audit trail. */
function recordLeaveStatusChange(
  employee: Employee,
  leaveId: string,
  status: LeaveStatus,
): Employee {
  const leave = employee.leaves.find((item) => item.id === leaveId)
  if (!leave || leave.status === status) return employee

  return withActivity(
    {
      ...employee,
      leaves: employee.leaves.map((item) =>
        item.id === leaveId ? { ...item, status } : item,
      ),
    },
    createActivityEntry(
      'permiso_estatus',
      `El permiso del ${formatShortDate(leave.startDate)} al ${formatShortDate(
        leave.endDate,
      )} cambió de estatus.`,
      {
        field: 'Estatus del permiso',
        previousValue: LEAVE_STATUS_LABEL[leave.status],
        newValue: LEAVE_STATUS_LABEL[status],
      },
    ),
  )
}
