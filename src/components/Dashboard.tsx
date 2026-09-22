import { useMemo } from 'react'
import type { Employee } from '../types'
import { calculateSeniority, daysBetween, formatShortDate, todayISO } from '../lib/dates'
import { formatCurrency, fullName } from '../lib/format'
import { LEAVE_TYPE_LABEL } from '../lib/labels'
import { Badge, EmptyState } from './ui'

export function Dashboard({ employees }: { employees: Employee[] }) {
  const today = todayISO()

  const stats = useMemo(() => {
    const active = employees.filter((employee) => employee.status === 'activo')
    const payroll = active.reduce((total, employee) => total + employee.salary, 0)
    const averageSeniority =
      employees.length > 0
        ? employees.reduce(
            (total, employee) => total + calculateSeniority(employee.hireDate).totalDays,
            0,
          ) / employees.length
        : 0

    const allLeaves = employees.flatMap((employee) =>
      employee.leaves.map((leave) => ({ leave, employee })),
    )
    const currentLeaves = allLeaves.filter(
      ({ leave }) =>
        leave.status === 'aprobado' && leave.startDate <= today && leave.endDate >= today,
    )
    const pendingLeaves = allLeaves.filter(({ leave }) => leave.status === 'pendiente')

    const byDepartment = new Map<string, number>()
    for (const employee of employees) {
      byDepartment.set(employee.department, (byDepartment.get(employee.department) ?? 0) + 1)
    }

    const longestTenure = [...employees].sort((a, b) => a.hireDate.localeCompare(b.hireDate))

    return {
      total: employees.length,
      active: active.length,
      payroll,
      averageSeniorityYears: averageSeniority / 365.25,
      currentLeaves,
      pendingLeaves,
      byDepartment: [...byDepartment.entries()].sort((a, b) => b[1] - a[1]),
      longestTenure: longestTenure.slice(0, 5),
    }
  }, [employees, today])

  const maxByDepartment = stats.byDepartment[0]?.[1] ?? 1

  return (
    <section className="dashboard">
      <header className="section-header">
        <div>
          <h2>Panel general</h2>
          <p className="section-header__meta">Resumen del personal al {formatShortDate(today)}</p>
        </div>
      </header>

      <div className="stat-grid">
        <article className="stat-card">
          <p className="stat-card__label">Colaboradores</p>
          <p className="stat-card__value">{stats.total}</p>
          <p className="stat-card__meta">{stats.active} activos</p>
        </article>
        <article className="stat-card">
          <p className="stat-card__label">Nómina mensual activa</p>
          <p className="stat-card__value">{formatCurrency(stats.payroll)}</p>
          <p className="stat-card__meta">
            Promedio {formatCurrency(stats.active > 0 ? stats.payroll / stats.active : 0)}
          </p>
        </article>
        <article className="stat-card">
          <p className="stat-card__label">Antigüedad promedio</p>
          <p className="stat-card__value">{stats.averageSeniorityYears.toFixed(1)} años</p>
          <p className="stat-card__meta">Calculada desde la fecha de ingreso</p>
        </article>
        <article className="stat-card">
          <p className="stat-card__label">Permisos por autorizar</p>
          <p className="stat-card__value">{stats.pendingLeaves.length}</p>
          <p className="stat-card__meta">{stats.currentLeaves.length} en curso hoy</p>
        </article>
      </div>

      <div className="dashboard__columns">
        <div className="panel">
          <h3 className="panel__title">Personal por departamento</h3>
          <ul className="bar-list">
            {stats.byDepartment.map(([department, count]) => (
              <li key={department}>
                <div className="bar-list__head">
                  <span>{department}</span>
                  <strong>{count}</strong>
                </div>
                <div className="bar-list__track">
                  <div
                    className="bar-list__fill"
                    style={{ width: `${(count / maxByDepartment) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3 className="panel__title">Mayor antigüedad</h3>
          <ul className="ranking">
            {stats.longestTenure.map((employee, index) => (
              <li key={employee.id}>
                <span className="ranking__position">{index + 1}</span>
                <span>
                  <strong>{fullName(employee)}</strong>
                  <small>
                    {calculateSeniority(employee.hireDate).label} · desde{' '}
                    {formatShortDate(employee.hireDate)}
                  </small>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel">
        <h3 className="panel__title">Permisos pendientes de autorización</h3>
        {stats.pendingLeaves.length === 0 ? (
          <EmptyState
            title="No hay permisos pendientes"
            message="Todos los permisos registrados ya fueron autorizados o rechazados."
          />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Tipo</th>
                  <th>Periodo</th>
                  <th>Días</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {stats.pendingLeaves.map(({ leave, employee }) => (
                  <tr key={leave.id}>
                    <td>{fullName(employee)}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
