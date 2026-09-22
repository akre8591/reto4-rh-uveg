import { useState } from 'react'
import type { Employee, RaiseInput } from '../types'
import { formatCurrency, formatPercent } from '../lib/format'
import { todayISO } from '../lib/dates'
import {
  RAISE_CONFIRMATION_THRESHOLD,
  hasErrors,
  raiseIncreasePercent,
  requiresRaiseConfirmation,
  validateRaise,
  type Errors,
} from '../lib/validation'
import { ConfirmDialog, Field, Modal } from './ui'

interface Props {
  employee: Employee
  onSubmit: (input: RaiseInput) => void
  onClose: () => void
}

export function RaiseForm({ employee, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<RaiseInput>({
    effectiveDate: todayISO(),
    newSalary: 0,
    reason: '',
  })
  const [errors, setErrors] = useState<Errors<RaiseInput>>({})
  // Raise waiting for an explicit confirmation because it exceeds the threshold.
  const [pendingRaise, setPendingRaise] = useState<RaiseInput | null>(null)

  const update = <K extends keyof RaiseInput>(key: K, value: RaiseInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const increase = form.newSalary > employee.salary ? form.newSalary - employee.salary : 0
  const percent = increase > 0 ? raiseIncreasePercent(employee.salary, form.newSalary) : 0
  const needsConfirmation = requiresRaiseConfirmation(employee.salary, form.newSalary)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors = validateRaise(form, employee)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return
    const raise = { ...form, reason: form.reason.trim() }
    // Increases above the threshold are usually typing errors: ask before applying.
    if (requiresRaiseConfirmation(employee.salary, raise.newSalary)) {
      setPendingRaise(raise)
      return
    }
    onSubmit(raise)
  }

  if (pendingRaise) {
    return (
      <ConfirmDialog
        title="Confirmar aumento superior al umbral"
        confirmLabel="Sí, aplicar el aumento"
        message={`El incremento de ${formatCurrency(employee.salary)} a ${formatCurrency(
          pendingRaise.newSalary,
        )} representa un ${formatPercent(
          raiseIncreasePercent(employee.salary, pendingRaise.newSalary),
        )}, por encima del ${RAISE_CONFIRMATION_THRESHOLD} % permitido sin confirmación. Verifica que la cantidad sea correcta antes de continuar.`}
        onCancel={() => setPendingRaise(null)}
        onConfirm={() => {
          const confirmed = pendingRaise
          setPendingRaise(null)
          onSubmit(confirmed)
        }}
      />
    )
  }

  return (
    <Modal
      title="Registrar aumento salarial"
      subtitle={`Salario vigente: ${formatCurrency(employee.salary)}`}
      onClose={onClose}
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="form__grid form__grid--two">
          <Field
            label="Fecha de aplicación"
            htmlFor="effectiveDate"
            required
            error={errors.effectiveDate}
          >
            <input
              id="effectiveDate"
              type="date"
              min={employee.hireDate}
              max={todayISO()}
              value={form.effectiveDate}
              onChange={(event) => update('effectiveDate', event.target.value)}
            />
          </Field>

          <Field
            label="Nuevo salario (MXN)"
            htmlFor="newSalary"
            required
            error={errors.newSalary}
            hint={
              increase > 0
                ? `Incremento de ${formatCurrency(increase)} (${formatPercent(percent)}).${
                    needsConfirmation
                      ? ` Supera el ${RAISE_CONFIRMATION_THRESHOLD} %: se pedirá confirmación.`
                      : ''
                  }`
                : 'Debe ser mayor al salario vigente.'
            }
          >
            <input
              id="newSalary"
              type="number"
              min={employee.salary + 1}
              step={100}
              value={form.newSalary || ''}
              onChange={(event) => update('newSalary', Number(event.target.value))}
            />
          </Field>
        </div>

        <Field label="Motivo del aumento" htmlFor="raiseReason" required error={errors.reason}>
          <textarea
            id="raiseReason"
            rows={3}
            value={form.reason}
            placeholder="Promoción, revisión anual, desempeño…"
            onChange={(event) => update('reason', event.target.value)}
          />
        </Field>

        <div className="form__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button button--primary">
            Aplicar aumento
          </button>
        </div>
      </form>
    </Modal>
  )
}
