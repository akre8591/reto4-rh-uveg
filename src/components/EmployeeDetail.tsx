import { useMemo, useState } from 'react'
import type { Employee, LeaveStatus } from '../types'
import {
  CONTRACT_LABEL,
  LEAVE_STATUS_LABEL,
  LEAVE_TYPE_LABEL,
  STATUS_LABEL,
} from '../lib/labels'
import { calculateSeniority, daysBetween, formatDate, formatShortDate } from '../lib/dates'
import { formatCurrency, formatPercent, fullName, initials } from '../lib/format'
import { Badge, ConfirmDialog, EmptyState } from './ui'

interface Props {
  employee: Employee
  onBack: () => void
  onEdit: () => void
  onAddLeave: () => void
  onAddRaise: () => void
  onChangeLeaveStatus: (leaveId: string, status: LeaveStatus) => void
  onRemoveLeave: (leaveId: string) => void
}

const STATUS_TONE: Record<LeaveStatus, string> = {
  pendiente: 'warning',
  aprobado: 'success',
  rechazado: 'danger',
}

export function EmployeeDetail({
  employee,
  onBack,
  onEdit,
  onAddLeave,
  onAddRaise,
  onChangeLeaveStatus,
  onRemoveLeave,
}: Props) {
  const [tab, setTab] = useState<'permisos' | 'aumentos'>('permisos')
  const [leaveToDelete, setLeaveToDelete] = useState<string | null>(null)

  const seniority = useMemo(() => calculateSeniority(employee.hireDate), [employee.hireDate])

  const leaves = useMemo(
    () => [...employee.leaves].sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [employee.leaves],
  )
  const raises = useMemo(
    () => [...employee.raises].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate)),
    [employee.raises],
  )

  const paidDays = leaves
    .filter((leave) => leave.type === 'con_goce' && leave.status === 'aprobado')
    .reduce((total, leave) => total + daysBetween(leave.startDate, leave.endDate), 0)
  const unpaidDays = leaves
    .filter((leave) => leave.type === 'sin_goce' && leave.status === 'aprobado')
    .reduce((total, leave) => total + daysBetween(leave.startDate, leave.endDate), 0)

  const initialSalary = raises.length > 0 ? raises[raises.length - 1].previousSalary : employee.salary
  const totalGrowth =
    initialSalary > 0 ? ((employee.salary - initialSalary) / initialSalary) * 100 : 0

  return (
    <section className="detail">
      <button type="button" className="button button--link" onClick={onBack}>
        ← Volver al listado
      </button>

      <header className="detail__header">
        <div className="detail__identity">
          <div className="avatar avatar--lg" aria-hidden="true">
            {initials(employee)}
          </div>
          <div>
            <h2>{fullName(employee)}</h2>
            <p className="detail__position">
              {employee.position} · {employee.department}
            </p>
            <div className="detail__badges">
              <Badge tone={employee.status === 'activo' ? 'success' : 'neutral'}>
                {STATUS_LABEL[employee.status]}
              </Badge>
              <Badge tone="info">{CONTRACT_LABEL[employee.contractType]}</Badge>
              <Badge tone="neutral">{employee.employeeNumber}</Badge>
            </div>
          </div>
        </div>
        <div className="detail__actions">
          <button type="button" className="button button--ghost" onClick={onEdit}>
            Editar datos
          </button>
          <button type="button" className="button button--secondary" onClick={onAddLeave}>
            Nuevo permiso
          </button>
          <button type="button" className="button button--primary" onClick={onAddRaise}>
            Nuevo aumento
          </button>
        </div>
      </header>

      <div className="stat-grid">
        <article className="stat-card">
          <p className="stat-card__label">Antigüedad</p>
          <p className="stat-card__value">{seniority.label}</p>
          <p className="stat-card__meta">
            Ingreso: {formatDate(employee.hireDate)} · {seniority.totalDays} días
          </p>
        </article>
        <article className="stat-card">
          <p className="stat-card__label">Salario vigente</p>
          <p className="stat-card__value">{formatCurrency(employee.salary)}</p>
          <p className="stat-card__meta">
            {raises.length > 0
              ? `${raises.length} aumento(s) · ${formatPercent(totalGrowth)} acumulado`
              : 'Sin aumentos registrados'}
          </p>
        </article>
        <article className="stat-card">
          <p className="stat-card__label">Días con goce</p>
          <p className="stat-card__value">{paidDays}</p>
          <p className="stat-card__meta">Permisos aprobados</p>
        </article>
        <article className="stat-card">
          <p className="stat-card__label">Días sin goce</p>
          <p className="stat-card__value">{unpaidDays}</p>
          <p className="stat-card__meta">Permisos aprobados</p>
        </article>
      </div>

      <div className="panel">
        <h3 className="panel__title">Información general</h3>
        <dl className="data-list">
          <div>
            <dt>Correo electrónico</dt>
            <dd>{employee.email}</dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{employee.phone}</dd>
          </div>
          <div>
            <dt>Fecha de nacimiento</dt>
            <dd>{formatDate(employee.birthDate)}</dd>
          </div>
          <div>
            <dt>Fecha de ingreso</dt>
            <dd>{formatDate(employee.hireDate)}</dd>
          </div>
          <div>
            <dt>Departamento</dt>
            <dd>{employee.department}</dd>
          </div>
          <div>
            <dt>Tipo de contrato</dt>
            <dd>{CONTRACT_LABEL[employee.contractType]}</dd>
          </div>
        </dl>
      </div>

      <div className="panel">
        <div className="tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'permisos'}
            className={`tab${tab === 'permisos' ? ' tab--active' : ''}`}
            onClick={() => setTab('permisos')}
          >
            Permisos ({leaves.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'aumentos'}
            className={`tab${tab === 'aumentos' ? ' tab--active' : ''}`}
            onClick={() => setTab('aumentos')}
          >
            Aumentos ({raises.length})
          </button>
        </div>

        {tab === 'permisos' ? (
          leaves.length === 0 ? (
            <EmptyState
              title="Sin permisos registrados"
              message="Registra un permiso con o sin goce de sueldo para este colaborador."
            />
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Periodo</th>
                    <th>Días</th>
                    <th>Motivo</th>
                    <th>Estatus</th>
                    <th aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>
                        <Badge tone={leave.type === 'con_goce' ? 'info' : 'warning'}>
                          {LEAVE_TYPE_LABEL[leave.type]}
                        </Badge>
                      </td>
                      <td>
                        {formatShortDate(leave.startDate)} — {formatShortDate(leave.endDate)}
                      </td>
                      <td>{daysBetween(leave.startDate, leave.endDate)}</td>
                      <td className="table__reason">{leave.reason}</td>
                      <td>
                        <select
                          className="select-inline"
                          value={leave.status}
                          aria-label={`Estatus del permiso del ${formatShortDate(leave.startDate)}`}
                          onChange={(event) =>
                            onChangeLeaveStatus(leave.id, event.target.value as LeaveStatus)
                          }
                        >
                          {Object.entries(LEAVE_STATUS_LABEL).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <span className={`status-dot status-dot--${STATUS_TONE[leave.status]}`} />
                      </td>
                      <td className="table__actions">
                        <button
                          type="button"
                          className="button button--tiny button--danger-ghost"
                          onClick={() => setLeaveToDelete(leave.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : raises.length === 0 ? (
          <EmptyState
            title="Sin aumentos registrados"
            message="Al registrar un aumento se actualiza automáticamente el salario vigente."
          />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Salario anterior</th>
                  <th>Nuevo salario</th>
                  <th>Incremento</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {raises.map((raise) => {
                  const diff = raise.newSalary - raise.previousSalary
                  const percent = raise.previousSalary > 0 ? (diff / raise.previousSalary) * 100 : 0
                  return (
                    <tr key={raise.id}>
                      <td>{formatShortDate(raise.effectiveDate)}</td>
                      <td>{formatCurrency(raise.previousSalary)}</td>
                      <td>
                        <strong>{formatCurrency(raise.newSalary)}</strong>
                      </td>
                      <td className="text-positive">
                        {formatCurrency(diff)} ({formatPercent(percent)})
                      </td>
                      <td className="table__reason">{raise.reason}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {leaveToDelete ? (
        <ConfirmDialog
          title="Eliminar permiso"
          message="¿Deseas eliminar este permiso? Esta acción no se puede deshacer."
          onCancel={() => setLeaveToDelete(null)}
          onConfirm={() => {
            onRemoveLeave(leaveToDelete)
            setLeaveToDelete(null)
          }}
        />
      ) : null}
    </section>
  )
}
