# Evaluación de la versión final

**Fecha de evaluación:** 28 de septiembre de 2026
**Versión evaluada:** tag `final`
**URL evaluada:** https://akre8591.github.io/reto4-rh-uveg/

Evaluación del grado de cumplimiento de los atributos y restricciones establecidos en la
semblanza del caso, realizada sobre la versión final de la aplicación, después de las tres
iteraciones de mejora documentadas en `docs/bitacora-mejoras.md`.

**Método.** Se repitieron los mismos casos de prueba aplicados a la versión 1, con las
mismas entradas, para que la comparación entre ambas versiones sea directa y no dependa de
la interpretación. Cada caso quedó documentado con captura de pantalla en
`docs/evidencias/final/`. Al igual que en la evaluación inicial, la revisión no se limitó a
verificar la existencia de cada atributo, sino la profundidad con que cubre lo que la
semblanza le exige.

Estados posibles: **Cumple** · **Cumple parcialmente** · **No cumple**

## Atributos

| ID | Atributo | En la v1 | Versión final | Evidencia |
|----|----------|----------|---------------|-----------|
| M1 | Registrar, consultar, modificar y eliminar empleados | Cumple | **Cumple** | 02, 03, 05, 12 |
| M2 | Permisos con goce y sin goce de sueldo | Cumple | **Cumple** | 03, 11 |
| M3 | Aumentos salariales y salario vigente | Cumple | **Cumple** | 04, 09 |
| M4 | Antigüedad calculada automáticamente | Cumple | **Cumple** | 01, 02, 03 |
| M5 | Interfaz clara y organizada | Cumple | **Cumple** | 01, 02, 17, 18 |
| A1 | Bitácora de cambios por empleado | Cumple parcialmente | **Cumple** | 13, 14 |
| A2 | Panel de indicadores | Cumple | **Cumple** | 01 |
| A3 | Búsqueda y filtros avanzados | Cumple parcialmente | **Cumple** | 02, 15, 16 |

## Restricciones

| ID | Restricción | En la v1 | Versión final | Evidencia |
|----|-------------|----------|---------------|-----------|
| R1 | Información obligatoria completa | Cumple | **Cumple** | 06 |
| R2 | Consistencia de fechas, salarios y permisos | Cumple | **Cumple** | 07, 08, 11 |
| R3 | Unicidad de número de empleado y correo | Cumple | **Cumple** | 07 |
| R4 | Protección al eliminar | Cumple parcialmente | **Cumple** | 12, 13 |
| R5 | Reglas de negocio de aumentos salariales | Cumple parcialmente | **Cumple** | 09, 10 |

## Comparación entre la propuesta inicial y el resultado final

De los trece elementos evaluados, la versión 1 cumplía nueve por completo y cuatro de
forma parcial. La versión final cumple los trece. Las cuatro diferencias corresponden
exactamente a las carencias detectadas en la evaluación inicial, y cada una fue atendida en
la iteración que le correspondía según el criterio de priorización adoptado.

**A1 — Bitácora.** La versión 1 conservaba el historial de permisos y aumentos, pero
modificar los datos de un colaborador no dejaba rastro alguno. La versión final registra
todo movimiento sobre el expediente con su fecha, el tipo de movimiento y, cuando aplica,
el valor anterior y el nuevo, incluyendo los cambios de datos, el archivado y la
reactivación. Los expedientes anteriores recibieron una bitácora reconstruida a partir de
su propia historia.

**A3 — Consulta.** La versión 1 ofrecía búsqueda por texto y filtro por departamento, dos
de los cuatro criterios que la semblanza define. La versión final incorpora los dos
restantes —tipo de permiso y rango de antigüedad— combinables entre sí y con los
existentes.

**R4 — Protección al eliminar.** La versión 1 advertía antes de borrar, pero al confirmar
destruía el expediente junto con sus permisos y aumentos. La versión final sustituye el
borrado por un archivado reversible que conserva el expediente completo, lo excluye de los
indicadores del panel y permite consultarlo mediante un filtro propio.

**R5 — Reglas de aumentos.** La versión 1 rechazaba un aumento igual o menor al salario
vigente, pero aceptaba sin advertencia un incremento del 104 %. La versión final exige una
confirmación explícita para todo incremento superior al 20 %, mostrando el porcentaje
calculado, y mantiene sin fricción el flujo de los aumentos ordinarios.

Además de las cuatro carencias, se corrigieron tres detalles de interfaz y de manejo de
datos detectados durante las verificaciones, y se comprobó en cada iteración que las
mejoras anteriores siguieran operando, de modo que ninguna introdujera regresiones.

## Conclusión de la evaluación

La versión final cumple la totalidad de los criterios objetivos establecidos en la
semblanza del caso. El recorrido entre ambas versiones permite observar el patrón que dejó
la evaluación inicial: la herramienta de desarrollo asistido por inteligencia artificial
resolvió con solvencia todo aquello que puede deducirse de la estructura de los datos —una
fecha no puede ser futura, un periodo no puede terminar antes de empezar, un identificador
no debería repetirse— e incluso incorporó atributos que el prompt inicial no solicitaba,
como el panel de indicadores. Lo que no anticipó fueron las reglas que dependen del
criterio del negocio y que nadie le enunció: hasta qué porcentaje un aumento puede
aplicarse sin autorización adicional, si la baja de un colaborador debe conservar su
expediente, o qué movimientos deben quedar auditados. Esas cuatro decisiones, que
constituyeron el contenido de las tres iteraciones, son precisamente las que requerían
conocimiento del dominio y no podían derivarse del enunciado.
