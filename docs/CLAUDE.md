# Sistema de Control de Recursos Humanos — Reto 4 (UVEG)

Proyecto académico. Módulo: Introducción a la Inteligencia Artificial y Ciencia de Datos.
Autor: Diego Casas Alvarado (matrícula 26019358). Asesora: Guadalupe Carmona Arroyo.

---

## ⚠️ REGLA DE PROCESO — LEER ANTES DE ESCRIBIR CÓDIGO

Este proyecto **no se construye de una sola vez**. La actividad académica evalúa el
*proceso de mejora* documentado entre la primera versión y la versión final, no la calidad
del resultado obtenido con el primer prompt.

1. **No implementes nada que no esté en el alcance de la iteración activa** (ver "Plan de
   iteraciones"). La iteración activa la indica el usuario al inicio de cada instrucción;
   si no la indica, pregúntale antes de escribir código.
2. **No te adelantes** a implementar lo marcado como `PENDIENTE — iteración N`, aunque lo
   veas listado abajo y aunque sea trivial. Adelantarse destruye la evidencia del proceso.
3. Si detectas una carencia que corresponde a una iteración posterior, **menciónala pero no
   la implementes**.
4. **Nunca reescribas el historial de git** (no `squash`, `rebase -i`, `--amend` ni
   `push --force`). El historial de commits ES la evidencia fechada del proceso.

---

## Semblanza del caso

Las organizaciones requieren llevar un control eficiente de la información de sus
colaboradores para facilitar la administración del personal y apoyar la toma de
decisiones. Actualmente muchos de estos controles se llevan en hojas de cálculo dispersas,
sin validaciones ni trazabilidad, lo que provoca datos duplicados, inconsistencias en
salarios y permisos, y pérdida de información histórica.

**Objetivo**: desarrollar, empleando herramientas de desarrollo asistido por inteligencia
artificial, una aplicación web que permita administrar la información del personal de una
organización, gestionando empleados, permisos y cambios salariales, y facilitando la
consulta de información relevante sobre cada colaborador.

Los atributos y restricciones siguientes constituyen **los criterios objetivos de
evaluación** del proyecto en cada una de sus versiones.

---

## Atributos

### Mínimos (obligatorios, definidos por la actividad)

| ID | Atributo | Estado en v1 |
|----|----------|--------------|
| M1 | Registrar, consultar, modificar y eliminar empleados | Cumple |
| M2 | Gestionar permisos con goce y sin goce de sueldo | Cumple |
| M3 | Registrar aumentos salariales y mantener el salario vigente | Cumple |
| M4 | Calcular y mostrar automáticamente la antigüedad | Cumple |
| M5 | Presentar la información de forma organizada y clara | Cumple |

### Adicionales (propuestos por el estudiante)

| ID | Atributo | Estado en v1 | Justificación |
|----|----------|--------------|---------------|
| A1 | **Bitácora de cambios por empleado**: todo cambio de salario, permiso o datos queda registrado con fecha y tipo de movimiento | Parcial — registra aumentos y permisos, pero **no** las ediciones de datos | Aporta trazabilidad y permite auditar las decisiones de RH. Sin historial completo, un sistema de personal no puede justificar cómo llegó al estado actual de un colaborador. |
| A2 | **Panel de indicadores**: plantilla, nómina, antigüedad promedio, permisos pendientes y distribución por departamento | Cumple | El caso declara que la aplicación debe apoyar la toma de decisiones; la agregación convierte los datos en información. |
| A3 | **Búsqueda y filtros avanzados combinables**: nombre, departamento, **tipo de permiso** y **rango de antigüedad** | Parcial — faltan tipo de permiso y rango de antigüedad | Permite consultar la información de forma eficiente conforme crece la plantilla, reforzando M5. |

---

## Restricciones

### Mínimas (obligatorias, definidas por la actividad)

| ID | Restricción | Estado en v1 |
|----|-------------|--------------|
| R1 | No permitir registrar empleados con información obligatoria incompleta | Cumple — valida los 9 campos con mensajes propios |
| R2 | Validar la consistencia de la información capturada | Cumple — fecha futura, edad mínima, salario, fechas de permiso y traslapes |

### Adicionales (propuestas por el estudiante)

| ID | Restricción | Estado en v1 | Justificación |
|----|-------------|--------------|---------------|
| R3 | **Unicidad de identificador**: número de empleado y correo no duplicados | Cumple — al crear y al editar | Evita registros duplicados del mismo colaborador, que derivan en errores de nómina y reportes de plantilla inflados. |
| R4 | **Protección al eliminar**: la baja se registra como archivado y conserva el historial | Parcial — confirma y advierte, pero **borra definitivamente** | La eliminación de un expediente es irreversible y destruye información que puede requerirse para efectos laborales. Se prefiere archivar sobre borrar. |
| R5 | **Reglas de negocio de aumentos**: nuevo salario mayor al vigente y confirmación explícita por encima del 20% | Parcial — valida el mínimo, **no** el umbral superior | Un aumento por debajo del salario vigente es un error de captura; el umbral previene errores de dedo con impacto directo en nómina. |

---

## Plan de iteraciones

Derivado de la evaluación de la v1 (`docs/evaluacion-v1.md`). Se atiende primero lo que
compromete la integridad de la información, después la trazabilidad y al final la
explotación de los datos.

| Iteración | Alcance | Criterio de priorización |
|-----------|---------|--------------------------|
| **1 — Reglas de negocio y protección de datos** | R5: confirmación explícita para incrementos superiores al 20%.<br>R4: sustituir el borrado destructivo por archivado que conserve permisos y aumentos. | Son las dos carencias con consecuencias irreversibles: un aumento mal capturado afecta la nómina y un borrado destruye historial laboral que no se puede recuperar. |
| **2 — Trazabilidad** | A1: extender la bitácora a **todos** los cambios (datos generales, departamento, puesto, estatus), no solo aumentos y permisos. | Una vez protegida la información, el siguiente hueco es no poder auditar quién cambió qué y cuándo. Depende de la iteración 1 porque el archivado necesita historial que conservar. |
| **3 — Consulta y toma de decisiones** | A3: filtros por tipo de permiso y por rango de antigüedad.<br>Mejora adicional: saldo de días de vacaciones por colaborador según antigüedad. | Con datos confiables y trazables, se completa la explotación de la información, que es el objetivo declarado del caso. |

El saldo de vacaciones se documenta como **mejora funcional de valor añadido**, no como
corrección de un incumplimiento: M2 cumple literalmente lo que la semblanza le exige.

---

## Stack y convenciones técnicas

- **React + Vite + TypeScript**. Persistencia en `localStorage` (`rh-uveg:employees:v1`).
- Repositorio `akre8591/reto4-rh-uveg`; URL pública
  `https://akre8591.github.io/reto4-rh-uveg/`; `base: '/reto4-rh-uveg/'` en `vite.config`.
- Interfaz en español, código en inglés. Sin librerías de UI externas.
- Si una iteración cambia la forma de los datos guardados, **versionar la clave de
  `localStorage`** o migrar lo existente: los datos de la v1 no deben romper la app.

## Convenciones de commit

Un commit por cambio significativo, con prefijo de etapa: `iter1:`, `iter2:`, `iter3:`.
Cada iteración debe tener al menos un commit propio y fechado, en días distintos. Al
cerrar cada versión, etiquetarla (`git tag`).

## Estructura de evidencias

```
docs/
  evaluacion-v1.md        evaluacion-final.md
  bitacora-mejoras.md
  prompts/prompt-inicial.md    prompts/prompt-final.md
  evidencias/v1/  iter1/  iter2/  iter3/  final/
```
