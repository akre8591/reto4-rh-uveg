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

/** Single source of truth for the roster, persisted in localStorage. */
export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(() => loadEmployees())

  useEffect(() => {
    saveEmployees(employees)
  }, [employees])

  const addEmployee = useCallback((input: EmployeeInput): Employee => {
    const employee: Employee = { ...input, id: createId('emp'), leaves: [], raises: [] }
    setEmployees((current) => [...current, employee])
    return employee
  }, [])

  const updateEmployee = useCallback((id: string, input: EmployeeInput) => {
    setEmployees((current) =>
      current.map((employee) => (employee.id === id ? { ...employee, ...input } : employee)),
    )
  }, [])

  const removeEmployee = useCallback((id: string) => {
    setEmployees((current) => current.filter((employee) => employee.id !== id))
  }, [])

  const addLeave = useCallback((employeeId: string, input: LeaveInput) => {
    const leave: Leave = { ...input, id: createId('lv'), createdAt: new Date().toISOString() }
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === employeeId
          ? { ...employee, leaves: [...employee.leaves, leave] }
          : employee,
      ),
    )
  }, [])

  const updateLeaveStatus = useCallback(
    (employeeId: string, leaveId: string, status: LeaveStatus) => {
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === employeeId
            ? {
                ...employee,
                leaves: employee.leaves.map((leave) =>
                  leave.id === leaveId ? { ...leave, status } : leave,
                ),
              }
            : employee,
        ),
      )
    },
    [],
  )

  const removeLeave = useCallback((employeeId: string, leaveId: string) => {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === employeeId
          ? { ...employee, leaves: employee.leaves.filter((leave) => leave.id !== leaveId) }
          : employee,
      ),
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
        return { ...employee, salary: input.newSalary, raises: [...employee.raises, raise] }
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
    removeEmployee,
    addLeave,
    updateLeaveStatus,
    removeLeave,
    addRaise,
    resetData,
  }
}
