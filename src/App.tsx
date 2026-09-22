import { useEffect, useState } from 'react'
import { useEmployees } from './hooks/useEmployees'
import type { Employee, EmployeeInput } from './types'
import { Dashboard } from './components/Dashboard'
import { EmployeeList } from './components/EmployeeList'
import { EmployeeDetail } from './components/EmployeeDetail'
import { EmployeeForm } from './components/EmployeeForm'
import { LeaveForm } from './components/LeaveForm'
import { RaiseForm } from './components/RaiseForm'
import { ConfirmDialog } from './components/ui'
import { fullName } from './lib/format'

type View = 'panel' | 'empleados' | 'detalle'
type Dialog = 'empleado' | 'permiso' | 'aumento' | 'archivar' | 'reiniciar' | null

export default function App() {
  const {
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
  } = useEmployees()

  const [view, setView] = useState<View>('panel')
  const [dialog, setDialog] = useState<Dialog>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const selected = employees.find((employee) => employee.id === selectedId) ?? null
  const editing = employees.find((employee) => employee.id === editingId) ?? null

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  // The detail view cannot stay open for a record that no longer exists.
  useEffect(() => {
    if (view === 'detalle' && !selected) setView('empleados')
  }, [view, selected])

  const openDetail = (employee: Employee) => {
    setSelectedId(employee.id)
    setView('detalle')
  }

  const handleEmployeeSubmit = (input: EmployeeInput) => {
    if (editing) {
      updateEmployee(editing.id, input)
      setToast('Los datos del colaborador se actualizaron correctamente.')
    } else {
      const created = addEmployee(input)
      setSelectedId(created.id)
      setToast('Colaborador registrado correctamente.')
    }
    setEditingId(null)
    setDialog(null)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__logo" aria-hidden="true">
            RH
          </span>
          <div>
            <h1>Sistema de Control de Recursos Humanos</h1>
            <p>Administración de personal, permisos y sueldos</p>
          </div>
        </div>
        <nav className="topbar__nav" aria-label="Navegación principal">
          <button
            type="button"
            className={`nav-link${view === 'panel' ? ' nav-link--active' : ''}`}
            onClick={() => setView('panel')}
          >
            Panel
          </button>
          <button
            type="button"
            className={`nav-link${view !== 'panel' ? ' nav-link--active' : ''}`}
            onClick={() => setView('empleados')}
          >
            Colaboradores
          </button>
          <button
            type="button"
            className="button button--ghost button--tiny"
            onClick={() => setDialog('reiniciar')}
          >
            Restaurar datos
          </button>
        </nav>
      </header>

      <main className="content">
        {view === 'panel' ? <Dashboard employees={employees} /> : null}

        {view === 'empleados' ? (
          <EmployeeList
            employees={employees}
            onSelect={openDetail}
            onCreate={() => {
              setEditingId(null)
              setDialog('empleado')
            }}
            onEdit={(employee) => {
              setEditingId(employee.id)
              setDialog('empleado')
            }}
            onArchive={(employee) => {
              setSelectedId(employee.id)
              setDialog('archivar')
            }}
            onRestore={(employee) => {
              restoreEmployee(employee.id)
              setToast('Colaborador reactivado. Vuelve a aparecer en el listado activo.')
            }}
          />
        ) : null}

        {view === 'detalle' && selected ? (
          <EmployeeDetail
            employee={selected}
            onBack={() => setView('empleados')}
            onEdit={() => {
              setEditingId(selected.id)
              setDialog('empleado')
            }}
            onArchive={() => setDialog('archivar')}
            onRestore={() => {
              restoreEmployee(selected.id)
              setToast('Colaborador reactivado. Vuelve a aparecer en el listado activo.')
            }}
            onAddLeave={() => setDialog('permiso')}
            onAddRaise={() => setDialog('aumento')}
            onChangeLeaveStatus={(leaveId, status) => {
              updateLeaveStatus(selected.id, leaveId, status)
              setToast('Estatus del permiso actualizado.')
            }}
            onRemoveLeave={(leaveId) => {
              removeLeave(selected.id, leaveId)
              setToast('Permiso eliminado.')
            }}
          />
        ) : null}
      </main>

      <footer className="footer">
        <p>
          Reto 4 · UVEG · Aplicación web de recursos humanos. Los datos se guardan localmente en
          este navegador.
        </p>
      </footer>

      {dialog === 'empleado' ? (
        <EmployeeForm
          employees={employees}
          employee={editing ?? undefined}
          onSubmit={handleEmployeeSubmit}
          onClose={() => {
            setEditingId(null)
            setDialog(null)
          }}
        />
      ) : null}

      {dialog === 'permiso' && selected ? (
        <LeaveForm
          employee={selected}
          onSubmit={(input) => {
            addLeave(selected.id, input)
            setDialog(null)
            setToast('Permiso registrado correctamente.')
          }}
          onClose={() => setDialog(null)}
        />
      ) : null}

      {dialog === 'aumento' && selected ? (
        <RaiseForm
          employee={selected}
          onSubmit={(input) => {
            addRaise(selected.id, input)
            setDialog(null)
            setToast('Aumento aplicado. El salario vigente fue actualizado.')
          }}
          onClose={() => setDialog(null)}
        />
      ) : null}

      {dialog === 'archivar' && selected ? (
        <ConfirmDialog
          title="Archivar colaborador"
          confirmLabel="Archivar"
          message={`¿Deseas archivar a ${fullName(selected)}? Dejará de aparecer en el listado activo, pero su expediente —permisos y aumentos incluidos— se conserva y podrá consultarse con el filtro de archivados.`}
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            archiveEmployee(selected.id)
            setDialog(null)
            setView('empleados')
            setToast('Colaborador archivado. Su expediente se conserva completo.')
          }}
        />
      ) : null}

      {dialog === 'reiniciar' ? (
        <ConfirmDialog
          title="Restaurar datos de ejemplo"
          message="Se reemplazará la información actual por el catálogo de ejemplo. Esta acción no se puede deshacer."
          confirmLabel="Restaurar"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            resetData()
            setSelectedId(null)
            setDialog(null)
            setView('panel')
            setToast('Datos de ejemplo restaurados.')
          }}
        />
      ) : null}

      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
