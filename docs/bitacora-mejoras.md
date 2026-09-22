# Bitácora del proceso de mejora

Registro de las modificaciones realizadas entre la primera versión de la aplicación y la
versión final. Cada iteración documenta qué aspecto requería mejora, con qué evidencia se
detectó, qué cambio se implementó y qué resultado se obtuvo.

La priorización de las iteraciones responde a un criterio explícito: se atiende primero lo
que compromete la integridad de la información, después la trazabilidad de los cambios y
al final la explotación de los datos para la toma de decisiones.

---

## Iteración 1 — Reglas de negocio y protección de datos

**Fecha:** 22 de septiembre de 2026
**Alcance:** R5 (umbral de confirmación en aumentos) y R4 (archivado en lugar de borrado)
**Evidencias:** `docs/evidencias/iter1/`

### Qué requería mejora

La evaluación de la versión 1 (`docs/evaluacion-v1.md`) identificó dos restricciones con
cumplimiento parcial, ambas con consecuencias irreversibles sobre la información:

**R5.** La aplicación validaba que un aumento fuera superior al salario vigente, pero no
aplicaba ningún límite superior. En la prueba documentada en la evidencia 11 de la v1 se
registró un incremento de $24,500 a $50,000 —un 104 %— sin que el sistema emitiera
advertencia alguna. En un sistema de nómina, un error de captura de esta magnitud se
propaga al salario vigente, al historial de aumentos y a los indicadores del panel sin que
nadie lo note.

**R4.** La eliminación de un colaborador mostraba una confirmación previa que advertía de
la pérdida de datos, pero al aceptarla el registro se borraba de forma definitiva junto con
sus permisos y aumentos, como muestran las evidencias 17 y 20 de la v1. La semblanza del
caso exige que la baja conserve el expediente, porque la información laboral de un
colaborador puede requerirse después de su salida.

### Qué cambios se realizaron

**R5 — Umbral de confirmación.** Se incorporó a la capa de validación una constante
`RAISE_CONFIRMATION_THRESHOLD` fijada en 20 %, junto con dos funciones que calculan el
porcentaje de incremento y determinan si un aumento requiere confirmación. El formulario de
aumentos se modificó para interrumpir el envío cuando el incremento supera ese umbral: en
lugar de aplicar el cambio, presenta un diálogo que muestra el salario anterior, el nuevo y
el porcentaje calculado, y exige una acción explícita para continuar. El campo de captura
además anticipa el aviso mientras se escribe la cantidad. Por debajo del umbral, el flujo
es idéntico al de la versión anterior, de modo que la mejora no introduce fricción en el
caso común.

La comparación se definió como estrictamente mayor, no mayor o igual: un incremento de
exactamente 20 % se aplica sin confirmación. Se trata de una decisión deliberada, porque el
umbral marca el límite de lo autorizado sin revisión, no el primer valor que la requiere.

**R4 — Archivado en lugar de borrado.** Se añadió al modelo de colaborador el campo
`archivedAt`, independiente del estatus Activo/Inactivo que ya existía. La distinción es
intencional: el estatus describe la situación laboral de la persona, mientras que el
archivado describe la situación de su expediente dentro del sistema; una baja no debe
sobrescribir el estatus con el que el colaborador dejó la organización. En consecuencia,
la operación de eliminación se sustituyó por dos operaciones reversibles, archivar y
reactivar, y ningún registro se borra del almacenamiento.

El listado incorporó un filtro propio con tres estados —solo activos, solo archivados, y
ambos—, con los activos como vista por omisión, más un distintivo visual y un contador de
archivados en el encabezado. El expediente de un colaborador archivado muestra la fecha en
que se archivó y ofrece la acción de reactivarlo. El panel de indicadores excluye a los
archivados de sus cálculos y los reporta por separado, para que la nómina y la plantilla
reflejen únicamente al personal vigente.

**Compatibilidad de los datos existentes.** Como el modelo cambió, la clave de
almacenamiento pasó de `rh-uveg:employees:v1` a `rh-uveg:employees:v2`. La lectura
contempla ambas: si solo existe la anterior, sus registros se normalizan incorporando los
campos nuevos y se guardan bajo la clave actual. Así, los datos capturados con la primera
versión siguen disponibles después de la actualización en lugar de perderse o provocar un
fallo.

### Qué resultados se obtuvieron

Se ejecutaron catorce casos de prueba sobre la aplicación, cubriendo tanto las dos
restricciones intervenidas como las que ya se cumplían, para descartar regresiones.

Sobre R5, un aumento de $24,500 a $27,000 —un 10.2 %— se aplica directamente, sin ninguna
fricción añadida (evidencia 02). Un aumento de exactamente 20 %, de $24,500 a $29,400,
también se aplica directo, lo que confirma el comportamiento estricto del umbral
(evidencia 03). Un aumento de $24,500 a $55,000 interrumpe el flujo y presenta el diálogo
de confirmación con el porcentaje calculado, +124.49 % (evidencia 04). Al cancelar, el
salario vigente permanece en $24,500 y el formulario conserva la fecha y el monto
capturados, de modo que corregir la cifra no obliga a volver a escribirla (evidencia 05).
Al confirmar, el aumento se aplica y el historial pasa a registrar dos movimientos
(evidencia 06).

Sobre R4, la confirmación de archivado describe correctamente la consecuencia de la acción:
el colaborador deja de aparecer en el listado activo pero su expediente se conserva
(evidencia 07). Tras archivar, el listado pasa de nueve a ocho registros activos y reporta
uno archivado (evidencia 08); el filtro de archivados lo recupera (evidencia 09) y su
expediente conserva íntegros el permiso y el aumento que tenía registrados (evidencia 10).
La reactivación devuelve al colaborador al listado activo, y el cambio persiste después de
recargar la aplicación (evidencia 11). El panel de indicadores, por su parte, pasa de
contar nueve colaboradores a contar ocho al archivar uno, confirmando que los archivados
quedan fuera de los cálculos de plantilla y nómina (evidencia 14).

Sobre la compatibilidad, se cargó la aplicación con un conjunto de datos guardado bajo la
clave de la versión anterior: los registros se migraron correctamente a la clave actual y
siguen accesibles con su historial de aumentos (evidencia 12).

Finalmente, se repitieron las pruebas de validación que la v1 ya superaba —número de
empleado duplicado, correo duplicado y fecha de ingreso futura— y todas continúan
rechazándose con sus mensajes correspondientes, lo que descarta regresiones introducidas
por los cambios (evidencia 13). La compilación de TypeScript se ejecuta sin errores.

### Observaciones pendientes

Tres detalles menores, detectados durante la verificación, quedan anotados para el
refinamiento de interfaz de la iteración 3: la clave de almacenamiento anterior no se
elimina después de migrar, por lo que permanece como dato residual; la acción se denomina
"Reactivar" en el listado y "Restaurar" en el expediente, lo que conviene unificar; y el
contador del encabezado no concuerda en número cuando hay un solo registro archivado.

Se deja constancia además de una decisión de diseño: archivar solicita confirmación y
reactivar no. La asimetría es deliberada, porque archivar retira al colaborador de las
vistas y los indicadores mientras que reactivar lo devuelve a ellas sin pérdida posible.

---

## Iteración 2 — Trazabilidad

**Fecha:** _(pendiente)_
**Alcance:** A1 (bitácora completa de cambios)

### Qué requería mejora

_(Pendiente)_

### Qué cambios se realizaron

_(Pendiente)_

### Qué resultados se obtuvieron

_(Pendiente)_

---

## Iteración 3 — Consulta y toma de decisiones

**Fecha:** _(pendiente)_
**Alcance:** A3 (filtros faltantes) y saldo de días de vacaciones

### Qué requería mejora

_(Pendiente)_

### Qué cambios se realizaron

_(Pendiente)_

### Qué resultados se obtuvieron

_(Pendiente)_
