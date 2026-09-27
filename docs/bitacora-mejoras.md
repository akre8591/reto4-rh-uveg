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
elimina después de migrar, por lo que permanece como dato residual; una posible ambigüedad
de terminología en torno a la acción de reactivar un expediente, que conviene revisar; y el
contador del encabezado no concuerda en número cuando hay un solo registro archivado.

Se deja constancia además de una decisión de diseño: archivar solicita confirmación y
reactivar no. La asimetría es deliberada, porque archivar retira al colaborador de las
vistas y los indicadores mientras que reactivar lo devuelve a ellas sin pérdida posible.

---

## Iteración 2 — Trazabilidad

**Fecha:** 27 de septiembre de 2026
**Alcance:** A1 (bitácora completa de cambios)
**Evidencias:** `docs/evidencias/iter2/`

### Qué requería mejora

La evaluación de la versión 1 calificó A1 como cumplido parcialmente: el expediente
conservaba el historial de permisos y de aumentos salariales, pero modificar los datos de
un colaborador —su puesto, departamento, correo, teléfono o estatus— no dejaba ningún
rastro. Una bitácora que solo cubre dos de los movimientos posibles no permite auditar
cómo llegó un expediente a su estado actual, que es precisamente lo que la semblanza
espera de este atributo.

A esa carencia se sumó otra originada en la iteración anterior. Al sustituir el borrado
por el archivado, se incorporaron dos operaciones nuevas —archivar y reactivar— que
tampoco quedaban registradas en ningún sitio: el expediente mostraba la fecha del último
archivado, pero no permitía saber cuántas veces había ocurrido ni cuándo se había
revertido. La mejora introducida en la iteración 1 amplió, sin proponérselo, el alcance de
la carencia que esta iteración debía resolver.

### Qué cambios se realizaron

**Modelo de datos.** Se incorporó al colaborador una colección de movimientos, cada uno
con identificador, fecha y hora, tipo, descripción y, cuando aplica, el campo afectado con
su valor anterior y su valor nuevo. Se definieron nueve tipos de movimiento: alta, cambio
de datos generales, cambio de estatus, archivado, reactivación, aumento salarial, alta de
permiso, cambio de estatus de permiso y eliminación de permiso.

**Detección de cambios.** Un módulo nuevo se encarga de comparar la versión anterior de un
colaborador con la editada y emitir una entrada por cada uno de los doce campos editables
que haya cambiado, en lugar de una sola entrada genérica de "se editó el expediente". Los
valores se presentan ya formateados según su naturaleza —el salario como moneda, las
fechas en formato local, el estatus y el tipo de contrato con su etiqueta legible—, de modo
que la bitácora sea comprensible para quien la consulta y no un volcado técnico. La
generación de identificadores se extrajo a su propio módulo para romper un ciclo de
importación entre el almacenamiento y la bitácora.

**Registro de operaciones.** Se instrumentaron todas las operaciones que modifican un
expediente. Se cuidó un caso particular: cambiar el estatus de un permiso por el mismo
valor que ya tenía no genera ninguna entrada, para que la bitácora registre cambios reales
y no interacciones sin efecto.

**Presentación.** La bitácora se expone como una tercera pestaña del expediente, con el
movimiento más reciente primero y un distintivo de color por tipo, junto a las pestañas de
permisos y aumentos que ya existían.

**Compatibilidad de los datos existentes.** La clave de almacenamiento pasó a una tercera
versión. La lectura recorre las claves anteriores en orden y, para cada expediente que no
tenga bitácora, la reconstruye a partir de su propia historia: un asiento de alta con la
fecha de ingreso y el salario inicial, más un asiento por cada aumento y cada permiso ya
registrados. Así, un expediente creado con cualquiera de las versiones anteriores llega a
la versión final con una bitácora coherente en lugar de una vacía.

### Qué resultados se obtuvieron

Se ejecutaron dieciséis casos de prueba sobre la aplicación, cubriendo el atributo
intervenido, la compatibilidad de los datos y las restricciones de la iteración anterior.

La pestaña de bitácora aparece en el expediente con el conteo de movimientos, y los
colaboradores de ejemplo llegan con su historial ya reconstruido (evidencia 01). Editar el
puesto genera una entrada que indica el campo afectado y muestra el valor anterior junto al
nuevo (evidencia 02); editar dos campos en la misma operación genera dos entradas
independientes, una por campo, en lugar de una sola entrada agregada (evidencia 03).

Las operaciones introducidas en la iteración anterior quedan ahora registradas: archivar
produce su asiento (evidencia 04) y reactivar el suyo (evidencia 05), con lo que la
carencia que había abierto esa iteración queda cerrada. Los aumentos salariales se
registran con el salario anterior y el nuevo (evidencia 06), y los permisos generan asiento
tanto al darse de alta como al cambiar de estatus, indicando el estatus previo y el
posterior (evidencia 07). Cambiar el estatus de un permiso por el mismo valor no genera
ninguna entrada, como se buscaba. La eliminación de un permiso deja constancia del hecho
aunque el permiso desaparezca de su pestaña (evidencia 08), de modo que la operación sigue
siendo auditable. El alta de un colaborador nuevo abre su bitácora con el asiento
correspondiente y su salario inicial (evidencia 09).

Sobre la compatibilidad se probaron los dos escenarios posibles. Un conjunto de datos
guardado por la primera versión, que salta dos versiones de formato, se migra conservando
sus registros y con la bitácora reconstruida a partir de su historial (evidencia 10); lo
mismo ocurre con datos guardados por la versión intermedia (evidencia 13). La bitácora
persiste correctamente después de recargar la aplicación (evidencia 12).

Finalmente, se comprobó que la restricción de umbral introducida en la iteración anterior
sigue operando: un aumento superior al veinte por ciento continúa exigiendo confirmación
explícita con el porcentaje calculado (evidencia 11). La compilación de TypeScript se
ejecuta sin errores.

### Observaciones pendientes

La bitácora reconstruida solo puede derivarse de lo que quedó guardado, de modo que los
movimientos que la versión anterior nunca registró —un archivado posteriormente revertido,
por ejemplo— no pueden recuperarse. Es una limitación inherente a la reconstrucción
retroactiva y conviene enunciarla en lugar de dar a entender que la bitácora cubre toda la
historia previa del expediente. Por la misma razón, los asientos reconstruidos llevan una
hora convencional, ya que las versiones anteriores solo guardaban la fecha.

Se mantiene, además, la observación de la iteración anterior sobre la clave de
almacenamiento previa, que sigue sin eliminarse tras la migración.

---

## Iteración 3 — Consulta y refinamiento

**Fecha:** 27 de septiembre de 2026
**Alcance:** A3 (filtros faltantes) y los detalles de pulido arrastrados
**Evidencias:** `docs/evidencias/iter3/`

### Qué requería mejora

La evaluación de la versión 1 calificó A3 como cumplido parcialmente. La semblanza define
cuatro criterios de consulta —nombre, departamento, tipo de permiso y rango de
antigüedad— y la aplicación resolvía los dos primeros mediante una búsqueda por texto y un
filtro por departamento, pero no ofrecía forma alguna de responder preguntas como qué
colaboradores han solicitado permisos sin goce de sueldo o cuáles superan los diez años en
la organización. Al tratarse del atributo que sostiene la consulta de información, su
cumplimiento parcial limitaba el objetivo declarado del caso.

A esa carencia se sumaron los tres detalles que las verificaciones de las iteraciones
anteriores habían dejado anotados: las claves de almacenamiento de versiones previas
permanecían en el navegador después de migrar los datos, el contador de expedientes
archivados no concordaba en número cuando había uno solo, y quedaba por revisar una posible
ambigüedad en la terminología de la acción de reactivar.

### Qué cambios se realizaron

**Filtros de consulta.** Se definieron cinco rangos de antigüedad —menos de un año, de uno
a tres, de tres a cinco, de cinco a diez y más de diez— como un catálogo, en años cumplidos
sobre la fecha de ingreso, de modo que el criterio sea el mismo que ya emplea el cálculo de
antigüedad del expediente. Sobre esa base se añadieron dos controles al listado: uno que
filtra por tipo de permiso, mostrando a los colaboradores que tengan al menos un permiso
con goce o sin goce de sueldo según lo elegido, y otro que filtra por rango de antigüedad.

Ambos se incorporaron al mismo cálculo que ya resolvía los filtros existentes, de manera
que se combinan entre sí y con la búsqueda por texto, el departamento, el estatus, el
estado de archivado y el ordenamiento. La rejilla de controles se convirtió en un diseño
adaptable, porque con siete controles la disposición fija se rompía en pantallas
estrechas.

**Pulido.** El contador del encabezado concuerda ahora en número. La migración de datos
elimina las claves de versiones anteriores una vez completada, en lugar de dejarlas como
residuo, y lo mismo ocurre al restaurar los datos de ejemplo.

**Revisión de la terminología.** Al ir a corregir la ambigüedad anotada se encontró que la
premisa era imprecisa: ninguna vista llamaba "Restaurar" a la reactivación de un
colaborador —el listado y el expediente decían "Reactivar" en ambos casos—. El término
aparecía únicamente en la acción de la barra superior que repone los datos de ejemplo, que
es una operación distinta y probablemente el origen de la confusión. Se unificó en los dos
sentidos: la acción sobre el colaborador se llama "Reactivar" en todas las vistas, y la de
la barra superior pasó a llamarse "Restaurar datos de ejemplo", que describe con precisión
lo que hace.

### Qué resultados se obtuvieron

Se ejecutaron doce casos de prueba, cubriendo los filtros nuevos, sus combinaciones, los
tres detalles de pulido y las restricciones introducidas en las iteraciones anteriores.

El listado presenta ahora los siete controles de consulta. El filtro por tipo de permiso
devuelve tres colaboradores para permisos sin goce de sueldo y otros tres para permisos con
goce, en ambos casos los que efectivamente tienen un permiso de ese tipo registrado
(evidencias 02 y 03). El filtro por antigüedad devuelve dos colaboradores con más de diez
años y uno con menos de un año, lo que coincide con las fechas de ingreso de la plantilla
(evidencias 04 y 05). Combinar ambos filtros reduce el resultado a un único colaborador, el
que cumple las dos condiciones a la vez (evidencia 06), y la combinación sigue funcionando
al añadir la búsqueda por texto (evidencia 07).

Sobre el pulido, el contador muestra "1 archivado" con un registro y "2 archivados" con dos
(evidencia 08); la acción aparece como "Reactivar" tanto en el listado como en el
expediente (evidencia 09); y al cargar la aplicación con datos guardados bajo las dos
claves anteriores, la migración toma la más reciente, reconstruye la bitácora y deja
únicamente la clave vigente en el navegador (evidencia 10).

Finalmente se comprobó que las mejoras anteriores siguen operando: la bitácora continúa
presente en el expediente con su historial (evidencia 11) y el umbral de confirmación de
aumentos sigue exigiendo autorización explícita por encima del veinte por ciento
(evidencia 12). La compilación de TypeScript se ejecuta sin errores.

Con esta iteración, los ocho atributos y las cinco restricciones establecidos en la
semblanza del caso quedan cumplidos por completo.

### Observación sobre el alcance

Durante la planeación se contempló incorporar además un control de saldo de días de
vacaciones por colaborador, conforme a los días que corresponden según la antigüedad. Se
decidió no incluirlo: no corresponde a ninguna carencia de la semblanza —el atributo de
gestión de permisos se cumple en los términos en que fue definido— y su incorporación
habría competido con el tiempo destinado a verificar y documentar lo ya construido. Se deja
enunciado como línea de evolución posible de la aplicación.
