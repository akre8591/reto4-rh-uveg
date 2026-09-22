import { useState } from 'react'
import type { Employee, EmployeeInput } from '../types'
import { CONTRACT_LABEL, DEPARTMENTS, STATUS_LABEL } from '../lib/labels'
import { todayISO } from '../lib/dates'
import { hasErrors, validateEmployee, type Errors } from '../lib/validation'
import { Field, Modal } from './ui'

interface Props {
  employees: Employee[]
  employee?: Employee
  onSubmit: (input: EmployeeInput) => void
  onClose: () => void
}

function emptyForm(): EmployeeInput {
  return {
    employeeNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    hireDate: '',
    department: DEPARTMENTS[1],
    position: '',
    contractType: 'tiempo_completo',
    salary: 0,
    status: 'activo',
  }
}

export function EmployeeForm({ employees, employee, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<EmployeeInput>(() =>
    employee
      ? {
          employeeNumber: employee.employeeNumber,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          birthDate: employee.birthDate,
          hireDate: employee.hireDate,
          department: employee.department,
          position: employee.position,
          contractType: employee.contractType,
          salary: employee.salary,
          status: employee.status,
        }
      : emptyForm(),
  )
  const [errors, setErrors] = useState<Errors<EmployeeInput>>({})

  const update = <K extends keyof EmployeeInput>(key: K, value: EmployeeInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors = validateEmployee(form, employees, employee?.id)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return
    onSubmit({
      ...form,
      employeeNumber: form.employeeNumber.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      position: form.position.trim(),
    })
  }

  return (
    <Modal
      wide
      title={employee ? 'Editar colaborador' : 'Registrar colaborador'}
      subtitle="Los campos marcados con * son obligatorios."
      onClose={onClose}
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="form__grid">
          <Field label="Número de empleado" htmlFor="employeeNumber" required error={errors.employeeNumber}>
            <input
              id="employeeNumber"
              type="text"
              value={form.employeeNumber}
              placeholder="RH-010"
              onChange={(event) => update('employeeNumber', event.target.value)}
            />
          </Field>

          <Field label="Estatus" htmlFor="status">
            <select
              id="status"
              value={form.status}
              onChange={(event) => update('status', event.target.value as Employee['status'])}
            >
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Nombre(s)" htmlFor="firstName" required error={errors.firstName}>
            <input
              id="firstName"
              type="text"
              value={form.firstName}
              onChange={(event) => update('firstName', event.target.value)}
            />
          </Field>

          <Field label="Apellidos" htmlFor="lastName" required error={errors.lastName}>
            <input
              id="lastName"
              type="text"
              value={form.lastName}
              onChange={(event) => update('lastName', event.target.value)}
            />
          </Field>

          <Field label="Correo electrónico" htmlFor="email" required error={errors.email}>
            <input
              id="email"
              type="email"
              value={form.email}
              placeholder="nombre@empresa.mx"
              onChange={(event) => update('email', event.target.value)}
            />
          </Field>

          <Field
            label="Teléfono"
            htmlFor="phone"
            required
            error={errors.phone}
            hint="10 dígitos, sin espacios."
          >
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.phone}
              onChange={(event) => update('phone', event.target.value.replace(/\D/g, ''))}
            />
          </Field>

          <Field label="Fecha de nacimiento" htmlFor="birthDate" required error={errors.birthDate}>
            <input
              id="birthDate"
              type="date"
              max={todayISO()}
              value={form.birthDate}
              onChange={(event) => update('birthDate', event.target.value)}
            />
          </Field>

          <Field
            label="Fecha de ingreso"
            htmlFor="hireDate"
            required
            error={errors.hireDate}
            hint="Se usa para calcular la antigüedad."
          >
            <input
              id="hireDate"
              type="date"
              max={todayISO()}
              value={form.hireDate}
              onChange={(event) => update('hireDate', event.target.value)}
            />
          </Field>

          <Field label="Departamento" htmlFor="department" required error={errors.department}>
            <select
              id="department"
              value={form.department}
              onChange={(event) => update('department', event.target.value)}
            >
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Puesto" htmlFor="position" required error={errors.position}>
            <input
              id="position"
              type="text"
              value={form.position}
              onChange={(event) => update('position', event.target.value)}
            />
          </Field>

          <Field label="Tipo de contrato" htmlFor="contractType">
            <select
              id="contractType"
              value={form.contractType}
              onChange={(event) =>
                update('contractType', event.target.value as Employee['contractType'])
              }
            >
              {Object.entries(CONTRACT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Salario mensual (MXN)"
            htmlFor="salary"
            required
            error={errors.salary}
            hint={employee ? 'Los aumentos se registran desde el expediente.' : undefined}
          >
            <input
              id="salary"
              type="number"
              min={1}
              step={100}
              value={Number.isFinite(form.salary) && form.salary !== 0 ? form.salary : ''}
              onChange={(event) => update('salary', Number(event.target.value))}
            />
          </Field>
        </div>

        <div className="form__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button button--primary">
            {employee ? 'Guardar cambios' : 'Registrar colaborador'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
