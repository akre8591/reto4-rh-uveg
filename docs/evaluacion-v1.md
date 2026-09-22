# Evaluación de la versión 1

**Fecha de evaluación:** 22 de septiembre de 2026
**Versión evaluada:** tag `v1` (commit `06dc6fc`)
**URL evaluada:** https://akre8591.github.io/reto4-rh-uveg/

Evaluación del grado de cumplimiento de los atributos y restricciones establecidos en la
semblanza del caso, realizada sobre la primera versión generada a partir del prompt
inicial, antes de aplicar cualquier mejora.

**Método.** Se ejecutaron 21 casos de prueba sobre la aplicación desplegada, cubriendo
tanto el uso esperado como casos límite pensados para forzar el incumplimiento de cada
restricción. Cada caso quedó documentado con captura de pantalla en
`docs/evidencias/v1/`. La evaluación no se limita a verificar la existencia de cada
atributo, sino la profundidad con que cubre lo que la semblanza le exige.

Estados posibles: **Cumple** · **Cumple parcialmente** · **No cumple**

## Atributos

| ID | Atributo | Estado | Evidencia | Observación |
|----|----------|--------|-----------|-------------|
| M1 | Registrar, consultar, modificar y eliminar empleados | Cumple | 02, 03, 05, 16 | Las cuatro operaciones están disponibles. La edición aplica las mismas validaciones que el alta, lo que se verificó al intentar asignar un correo ya usado. |
| M2 | Permisos con goce y sin goce de sueldo | Cumple | 03, 13, 14, 15 | Distingue ambos tipos, con estatus pendiente, aprobado y rechazado, y acumula días por tipo en la ficha del colaborador. No lleva saldo de días disponibles, lo cual excede lo que el atributo exige. |
| M3 | Aumentos salariales y salario vigente | Cumple | 04, 10, 12 | Mantiene el salario vigente actualizado y conserva el historial con monto y porcentaje de incremento. Valida además el orden cronológico de los aumentos. |
| M4 | Antigüedad calculada automáticamente | Cumple | 01, 02, 03 | Se calcula en años, meses y días desde la fecha de ingreso, y alimenta la antigüedad promedio del panel. |
| M5 | Interfaz clara y organizada | Cumple | 01, 02, 18, 19 | Navegación en dos secciones, tabla legible y fichas estructuradas. En 375 px de ancho no se produce desbordamiento horizontal. |
| A1 | Bitácora de cambios por empleado | **Cumple parcialmente** | 04, 21 | Registra aumentos y permisos con fecha, pero la edición de los datos del colaborador (puesto, departamento, correo, estatus) no deja ningún rastro. La ficha solo ofrece las pestañas "Permisos" y "Aumentos". |
| A2 | Panel de indicadores | Cumple | 01 | Presenta plantilla total y activos, nómina mensual, antigüedad promedio, permisos por autorizar, distribución por departamento y ranking de antigüedad. |
| A3 | Búsqueda y filtros avanzados | **Cumple parcialmente** | 02 | Incluye búsqueda por texto, filtro por departamento, filtro por estatus y cuatro criterios de ordenamiento. Faltan los dos filtros restantes que define la semblanza: por tipo de permiso y por rango de antigüedad. |

## Restricciones

| ID | Restricción | Estado | Evidencia | Observación |
|----|-------------|--------|-----------|-------------|
| R1 | No permitir registro con información obligatoria incompleta | Cumple | 06 | Al enviar el formulario vacío se generan nueve mensajes de error, uno por cada campo obligatorio, con validación propia y no delegada al navegador. |
| R2 | Consistencia de fechas, salarios y permisos | Cumple | 07, 08, 09, 13, 14, 15 | Rechaza fecha de ingreso futura, edad menor a 18 años al ingresar, salario igual o menor a cero, nombre en blanco, permisos con término anterior al inicio, permisos previos a la fecha de ingreso y permisos traslapados con otro ya registrado. |
| R3 | Unicidad de número de empleado y correo | Cumple | 07, 16 | Detecta duplicados tanto al registrar como al editar un colaborador existente. |
| R4 | Protección al eliminar | **Cumple parcialmente** | 17, 20 | Muestra un modal de confirmación que advierte expresamente que se borrarán los permisos y aumentos del colaborador. Sin embargo, al confirmar el registro se elimina de forma definitiva y su historial se pierde; no existe la opción de archivado que exige la semblanza. |
| R5 | Reglas de negocio de aumentos salariales | **Cumple parcialmente** | 10, 11 | Rechaza correctamente un aumento igual o menor al salario vigente. No aplica ningún umbral superior: se registró un incremento de $24,500 a $50,000 (+104 %) sin advertencia ni confirmación adicional. |

## Resumen

De los trece elementos evaluados, **nueve se cumplen por completo y cuatro parcialmente;
ninguno queda sin cumplir**. Las cuatro carencias son A1, A3, R4 y R5.

## Hallazgos y dificultades detectadas

El resultado más relevante de esta evaluación es que la herramienta de desarrollo asistido
por inteligencia artificial cubrió, a partir de un prompt que solo enunciaba los cinco
atributos y las dos restricciones mínimas, varios elementos que la semblanza había
planteado como adicionales. El panel de indicadores y la unicidad de identificadores se
implementaron sin haber sido solicitados, y el sistema de validaciones fue más extenso de
lo previsto: incorpora reglas que el prompt nunca mencionó, como la edad mínima de ingreso
o la detección de permisos traslapados.

Las carencias detectadas siguen un patrón consistente: la herramienta resolvió con
solvencia las reglas que pueden deducirse de la estructura de los datos —una fecha no puede
ser futura, un periodo no puede terminar antes de empezar, un identificador no debería
repetirse—, pero no anticipó las reglas que dependen del criterio del negocio y que nadie
le enunció: hasta qué porcentaje un aumento es razonable sin autorización adicional, si la
baja de un colaborador debe conservar su expediente, o qué cambios deben quedar auditados.
Esa distinción entre lo que se infiere de los datos y lo que solo se conoce desde el
dominio es la que define el margen de mejora de las siguientes iteraciones.

En el plano metodológico, la dificultad principal fue que la evaluación no podía limitarse
a comprobar si cada funcionalidad existía. Verificar A3 exigió contrastar los filtros
disponibles contra los cuatro que la semblanza define; verificar R4 exigió confirmar la
eliminación y comprobar qué ocurría con el historial; y verificar R5 exigió distinguir
entre un rechazo por falta de datos obligatorios y un rechazo por la regla de negocio que
se estaba probando. Sin ese nivel de detalle, tres de las cuatro carencias habrían pasado
por cumplidas.
