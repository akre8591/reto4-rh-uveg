# Sistema de Control de Recursos Humanos (Reto 4 · UVEG)

Aplicación web para administrar la información del personal de una organización: altas,
consultas, modificaciones y bajas de colaboradores, gestión de permisos con y sin goce de
sueldo, registro de aumentos salariales y cálculo automático de la antigüedad.

**Stack:** React 18 + Vite + TypeScript. La información se guarda en el `localStorage` del
navegador; no existe backend ni base de datos remota.

## Funcionalidad

- **Panel general:** plantilla total y activa, nómina mensual, antigüedad promedio,
  distribución por departamento, ranking de mayor antigüedad y permisos por autorizar. Los
  expedientes archivados quedan fuera de estos indicadores.
- **Colaboradores:** listado con búsqueda por nombre, número, puesto o correo y filtros
  combinables por departamento, estatus, tipo de permiso y rango de antigüedad, además de
  la vista de expedientes archivados; ordenamiento por nombre, antigüedad, salario o
  departamento.
- **Altas, cambios y bajas:** formulario validado. La baja no elimina el expediente: lo
  archiva conservando permisos, aumentos y bitácora, y puede reactivarse.
- **Bitácora por colaborador:** registra todo movimiento sobre el expediente —alta, cambios
  de datos, cambio de estatus, archivado, reactivación, aumentos y permisos— con su fecha,
  el tipo de movimiento y, cuando aplica, el valor anterior y el nuevo.
- **Permisos:** registro de permisos *con goce* y *sin goce* de sueldo, con periodo, motivo y
  estatus (pendiente / aprobado / rechazado). Se acumulan los días autorizados de cada tipo.
- **Aumentos salariales:** cada aumento guarda el salario anterior, el nuevo, el porcentaje de
  incremento y el motivo, y actualiza automáticamente el salario vigente del colaborador.
  Todo incremento superior al 20 % exige una confirmación explícita que muestra el porcentaje
  calculado.
- **Antigüedad:** se calcula en años, meses y días a partir de la fecha de ingreso.

## Validaciones

| Ámbito | Regla |
| --- | --- |
| Empleado | Todos los campos obligatorios deben capturarse (número, nombre, apellidos, correo, teléfono, fechas, departamento, puesto y salario). |
| Empleado | Número de empleado y correo electrónico únicos, tanto al registrar como al editar; correo con formato válido; teléfono de 10 dígitos. |
| Empleado | Fecha de nacimiento anterior a hoy; fecha de ingreso no futura, posterior al nacimiento y con al menos 18 años cumplidos al ingresar. |
| Empleado | Salario mayor a cero y dentro del máximo permitido. |
| Empleado | La baja nunca es definitiva: se registra como archivado, conserva el expediente completo y es reversible. |
| Permisos | Fecha de término no anterior al inicio; inicio no anterior a la fecha de ingreso; duración máxima de 365 días; sin traslape con otros permisos no rechazados; motivo obligatorio. |
| Aumentos | Fecha no futura, no anterior al ingreso ni anterior al último aumento registrado; el nuevo salario debe ser mayor al vigente; motivo obligatorio. |
| Aumentos | Un incremento superior al 20 % respecto al salario vigente requiere confirmación explícita antes de aplicarse. |

## Datos de ejemplo

La aplicación se inicializa con 9 colaboradores con fechas de ingreso entre 2012 y 2026, junto
con permisos y aumentos de muestra. El botón **Restaurar datos** de la barra superior vuelve a
cargar este catálogo.

La información se guarda bajo la clave `rh-uveg:employees:v3`. Las versiones anteriores de la
clave se migran automáticamente al abrir la aplicación, de modo que los datos capturados con
versiones previas no se pierden.

## Ejecución local

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # compilación de producción en dist/
npm run preview  # vista previa de la compilación
```

## Despliegue en GitHub Pages

El proyecto está configurado con `base: '/reto4-rh-uveg/'`. El flujo de trabajo
`.github/workflows/deploy.yml` compila y publica el sitio en cada push a `main`. En el
repositorio, en **Settings → Pages**, selecciona *Source: GitHub Actions*.

URL resultante: `https://<usuario>.github.io/reto4-rh-uveg/`

## Estructura

```
src/
  components/   Vistas y componentes de interfaz (panel, listado, expediente, formularios)
  hooks/        useEmployees: estado central y persistencia
  lib/          fechas, formatos, etiquetas, validaciones, almacenamiento y datos de ejemplo
  types/        modelos de dominio (Employee, Leave, Raise)
```

## Documentación del proceso

La aplicación se construyó de forma incremental: una primera versión generada a partir de un
prompt inicial y tres iteraciones de mejora acotadas, cada una posterior a una evaluación de
la versión anterior. El recorrido queda registrado en las etiquetas `v1`, `iter1`, `iter2`,
`iter3` y `final` del repositorio, y está documentado en:

```
docs/
  prompts/prompt-inicial.md    Prompt con el que se generó la primera versión
  prompts/prompt-final.md      Prompt consolidado y secuencia real de instrucciones
  evaluacion-v1.md             Evaluación de la primera versión
  bitacora-mejoras.md          Las tres iteraciones: qué requería mejora y qué resultó
  evaluacion-final.md          Evaluación de la versión final y comparación con la v1
  evidencias/                  Capturas de pantalla de cada versión evaluada
```
