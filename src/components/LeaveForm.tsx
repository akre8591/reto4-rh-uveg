import { useState } from 'react'
import type { Employee, LeaveInput, LeaveType } from '../types'
import { LEAVE_TYPE_LABEL } from '../lib/labels'
import { daysBetween } from '../lib/dates'
import { hasErrors, validateLeave, type Errors } from '../lib/validation'
import { Field, Modal } from './ui'

interface Props {
  employee: Employee
  onSubmit: (input: LeaveInput) => void
  onClose: () => void
}

export function LeaveForm({ employee, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<LeaveInput>({
    type: 'con_goce',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'pendiente',
  })
  const [errors, setErrors] = useState<Errors<LeaveInput>>({})

  const update = <K extends keyof LeaveInput>(key: K, value: LeaveInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const days =
    form.startDate && form.endDate && form.endDate >= form.startDate
      ? daysBetween(form.startDate, form.endDate)
      : 0

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors = validateLeave(form, employee)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return
    onSubmit({ ...form, reason: form.reason.trim() })
  }

  return (
    <Modal
      title="Registrar permiso"
      subtitle={`Colaborador: ${employee.firstName} ${employee.lastName}`}
      onClose={onClose}
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Tipo de permiso" htmlFor="leaveType" required>
          <select
            id="leaveType"
            value={form.type}
            onChange={(event) => update('type', event.target.value as LeaveType)}
          >
            {Object.entries(LEAVE_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <div className="form__grid form__grid--two">
          <Field label="Fecha de inicio" htmlFor="startDate" required error={errors.startDate}>
            <input
              id="startDate"
              type="date"
              min={employee.hireDate}
              value={form.startDate}
              onChange={(event) => update('startDate', event.target.value)}
            />
          </Field>

          <Field
            label="Fecha de término"
            htmlFor="endDate"
            required
            error={errors.endDate}
            hint={days > 0 ? `Duración: ${days} ${days === 1 ? 'día' : 'días'}.` : undefined}
          >
            <input
              id="endDate"
              type="date"
              min={form.startDate || employee.hireDate}
              value={form.endDate}
              onChange={(event) => update('endDate', event.target.value)}
            />
          </Field>
        </div>

        <Field label="Motivo" htmlFor="reason" required error={errors.reason}>
          <textarea
            id="reason"
            rows={3}
            value={form.reason}
            placeholder="Describe el motivo del permiso"
            onChange={(event) => update('reason', event.target.value)}
          />
        </Field>

        <Field label="Estatus inicial" htmlFor="leaveStatus">
          <select
            id="leaveStatus"
            value={form.status}
            onChange={(event) => update('status', event.target.value as LeaveInput['status'])}
          >
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </Field>

        <div className="form__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button button--primary">
            Registrar permiso
          </button>
        </div>
      </form>
    </Modal>
  )
}
