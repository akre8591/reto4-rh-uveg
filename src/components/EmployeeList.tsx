import { useMemo, useState } from 'react'
import type { Employee } from '../types'
import { DEPARTMENTS, STATUS_LABEL } from '../lib/labels'
import { calculateSeniority, formatShortDate } from '../lib/dates'
import { formatCurrency, fullName, initials } from '../lib/format'
import { Badge, EmptyState } from './ui'

interface Props {
  employees: Employee[]
  onSelect: (employee: Employee) => void
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
  onCreate: () => void
}

type SortKey = 'name' | 'hireDate' | 'salary' | 'department'

export function EmployeeList({ employees, onSelect, onEdit, onDelete, onCreate }: Props) {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('todos')
  const [status, setStatus] = useState('todos')
  const [sortKey, setSortKey] = useState<SortKey>('name')

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    const filtered = employees.filter((employee) => {
      const matchesTerm =
        term.length === 0 ||
        fullName(employee).toLowerCase().includes(term) ||
        employee.employeeNumber.toLowerCase().includes(term) ||
        employee.position.toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term)
      const matchesDepartment = department === 'todos' || employee.department === department
      const matchesStatus = status === 'todos' || employee.status === status
      return matchesTerm && matchesDepartment && matchesStatus
    })

    return filtered.sort((a, b) => {
      switch (sortKey) {
        case 'hireDate':
          return a.hireDate.localeCompare(b.hireDate)
        case 'salary':
          return b.salary - a.salary
        case 'department':
          return a.department.localeCompare(b.department, 'es')
        default:
          return fullName(a).localeCompare(fullName(b), 'es')
      }
    })
  }, [employees, search, department, status, sortKey])

  return (
    <section className="list">
      <header className="section-header">
        <div>
          <h2>Colaboradores</h2>
          <p className="section-header__meta">
            {visible.length} de {employees.length} registros
          </p>
        </div>
        <button type="button" className="button button--primary" onClick={onCreate}>
          + Registrar colaborador
        </button>
      </header>

      <div className="filters">
        <input
          type="search"
          className="filters__search"
          placeholder="Buscar por nombre, número, puesto o correo…"
          aria-label="Buscar colaborador"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          value={department}
          aria-label="Filtrar por departamento"
          onChange={(event) => setDepartment(event.target.value)}
        >
          <option value="todos">Todos los departamentos</option>
          {DEPARTMENTS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={status}
          aria-label="Filtrar por estatus"
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="todos">Todos los estatus</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={sortKey}
          aria-label="Ordenar listado"
          onChange={(event) => setSortKey(event.target.value as SortKey)}
        >
          <option value="name">Ordenar por nombre</option>
          <option value="hireDate">Ordenar por antigüedad</option>
          <option value="salary">Ordenar por salario</option>
          <option value="department">Ordenar por departamento</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No se encontraron colaboradores"
          message="Ajusta los filtros de búsqueda o registra un nuevo colaborador."
        />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Puesto</th>
                <th>Ingreso</th>
                <th>Antigüedad</th>
                <th>Salario vigente</th>
                <th>Permisos</th>
                <th>Estatus</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {visible.map((employee) => (
                <tr key={employee.id} className="table__row--clickable">
                  <td onClick={() => onSelect(employee)}>
                    <div className="cell-person">
                      <span className="avatar" aria-hidden="true">
                        {initials(employee)}
                      </span>
                      <span>
                        <strong>{fullName(employee)}</strong>
                        <small>{employee.employeeNumber} · {employee.email}</small>
                      </span>
                    </div>
                  </td>
                  <td onClick={() => onSelect(employee)}>
                    {employee.position}
                    <small className="cell-sub">{employee.department}</small>
                  </td>
                  <td onClick={() => onSelect(employee)}>{formatShortDate(employee.hireDate)}</td>
                  <td onClick={() => onSelect(employee)}>
                    {calculateSeniority(employee.hireDate).label}
                  </td>
                  <td onClick={() => onSelect(employee)}>{formatCurrency(employee.salary)}</td>
                  <td onClick={() => onSelect(employee)}>{employee.leaves.length}</td>
                  <td onClick={() => onSelect(employee)}>
                    <Badge tone={employee.status === 'activo' ? 'success' : 'neutral'}>
                      {STATUS_LABEL[employee.status]}
                    </Badge>
                  </td>
                  <td className="table__actions">
                    <button
                      type="button"
                      className="button button--tiny"
                      onClick={() => onSelect(employee)}
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      className="button button--tiny"
                      onClick={() => onEdit(employee)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="button button--tiny button--danger-ghost"
                      onClick={() => onDelete(employee)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
