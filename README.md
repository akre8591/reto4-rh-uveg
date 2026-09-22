# Sistema de Control de Recursos Humanos (Reto 4 · UVEG)

Aplicación web para administrar la información del personal de una organización: altas,
consultas, modificaciones y bajas de colaboradores, gestión de permisos con y sin goce de
sueldo, registro de aumentos salariales y cálculo automático de la antigüedad.

**Stack:** React 18 + Vite + TypeScript. La información se guarda en el `localStorage` del
navegador; no existe backend ni base de datos remota.

## Funcionalidad

- **Panel general:** totales de personal, nómina mensual activa, antigüedad promedio,
  distribución por departamento, ranking de mayor antigüedad y permisos por autorizar.
- **Colaboradores:** listado con búsqueda por nombre, número, puesto o correo; filtros por
  departamento y estatus; ordenamiento por nombre, antigüedad, salario o departamento.
- **Altas, cambios y bajas:** formulario validado con confirmación antes de eliminar.
- **Permisos:** registro de permisos *con goce* y *sin goce* de sueldo, con periodo, motivo y
  estatus (pendiente / aprobado / rechazado). Se acumulan los días autorizados de cada tipo.
- **Aumentos salariales:** cada aumento guarda el salario anterior, el nuevo, el porcentaje de
  incremento y el motivo, y actualiza automáticamente el salario vigente del colaborador.
- **Antigüedad:** se calcula en años, meses y días a partir de la fecha de ingreso.

## Validaciones

| Ámbito | Regla |
| --- | --- |
| Empleado | Todos los campos obligatorios deben capturarse (número, nombre, apellidos, correo, teléfono, fechas, departamento, puesto y salario). |
| Empleado | Número de empleado y correo electrónico únicos; correo con formato válido; teléfono de 10 dígitos. |
| Empleado | Fecha de nacimiento anterior a hoy; fecha de ingreso no futura, posterior al nacimiento y con al menos 18 años cumplidos al ingresar. |
| Empleado | Salario mayor a cero y dentro del máximo permitido. |
| Permisos | Fecha de término no anterior al inicio; inicio no anterior a la fecha de ingreso; duración máxima de 365 días; sin traslape con otros permisos no rechazados; motivo obligatorio. |
| Aumentos | Fecha no futura, no anterior al ingreso ni anterior al último aumento registrado; el nuevo salario debe ser mayor al vigente; motivo obligatorio. |

## Datos de ejemplo

La aplicación se inicializa con 9 colaboradores con fechas de ingreso entre 2012 y 2026, junto
con permisos y aumentos de muestra. El botón **Restaurar datos** de la barra superior vuelve a
cargar este catálogo.

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
