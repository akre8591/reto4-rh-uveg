# Prompt final (versión final)

**Fecha:** 28 de septiembre de 2026
**Herramienta:** Claude Code (Claude CLI)

## Nota sobre este documento

La versión final de la aplicación no se obtuvo de un solo prompt. Se construyó de forma
incremental a partir del prompt inicial documentado en `prompt-inicial.md` y de tres
iteraciones de mejora, cada una acotada a un alcance definido tras evaluar la versión
anterior. Ese proceso está documentado en `docs/bitacora-mejoras.md` y queda registrado en
el historial del repositorio con las etiquetas `v1`, `iter1`, `iter2`, `iter3` y `final`.

Lo que sigue es el **prompt consolidado**: la instrucción que reproduciría la versión final
desde cero, redactada a partir de la semblanza del caso una vez completada. Se incluye
porque la actividad solicita el prompt correspondiente a la versión final, y se acompaña de
la secuencia real de instrucciones para que la relación entre ambos sea verificable.

---

## Prompt consolidado

```
Necesito desarrollar una aplicación web para un sistema de control de recursos humanos.

Contexto del caso:
Las organizaciones requieren llevar un control eficiente de la información de sus
colaboradores para facilitar la administración del personal y apoyar la toma de
decisiones. Actualmente muchos de estos controles se llevan en hojas de cálculo
dispersas, sin validaciones ni trazabilidad, lo que provoca datos duplicados,
inconsistencias en salarios y permisos, y pérdida de información histórica.

La aplicación debe cumplir con los siguientes atributos:
- Registrar, consultar, modificar y archivar empleados.
- Gestionar permisos del personal, distinguiendo entre permisos con goce de sueldo y
  sin goce de sueldo, con estatus pendiente, aprobado o rechazado.
- Registrar aumentos salariales y mantener actualizado el salario vigente, conservando
  el historial con el monto y el porcentaje de cada incremento.
- Calcular y mostrar automáticamente la antigüedad de cada colaborador a partir de su
  fecha de ingreso.
- Presentar la información de forma organizada, con una interfaz clara y fácil de usar
  que funcione también en pantallas de teléfono.
- Mantener una bitácora por colaborador que registre todo movimiento sobre su
  expediente —alta, edición de datos, cambio de estatus, archivado, reactivación,
  aumentos y permisos— con fecha, tipo de movimiento y, cuando aplique, el valor
  anterior y el nuevo.
- Ofrecer un panel de indicadores con la plantilla total y activa, la nómina mensual,
  la antigüedad promedio, los permisos pendientes de autorización y la distribución por
  departamento.
- Permitir buscar por texto y filtrar de forma combinable por departamento, estatus,
  tipo de permiso y rango de antigüedad, además de ordenar el listado.

La aplicación debe considerar las siguientes restricciones:
- No permitir registrar empleados con información obligatoria incompleta, indicando
  qué campo falta en cada caso.
- Validar la consistencia de la información capturada: la fecha de ingreso no puede ser
  futura, el colaborador debe ser mayor de edad al ingresar, el salario debe ser mayor
  a cero, un permiso no puede terminar antes de empezar ni iniciar antes de la fecha de
  ingreso, y no puede traslaparse con otro permiso del mismo colaborador.
- No permitir dos colaboradores con el mismo número de empleado o el mismo correo, ni
  al registrar ni al editar.
- No eliminar colaboradores de forma definitiva: la baja se registra como archivado,
  conserva el expediente completo y puede revertirse; el listado debe permitir
  consultar los expedientes archivados y el panel debe excluirlos de sus indicadores.
- Un aumento salarial debe ser mayor al salario vigente, y todo incremento superior al
  20 % debe exigir una confirmación explícita que muestre el porcentaje calculado.

Requisitos técnicos:
- React con Vite y TypeScript.
- Persistencia en localStorage del navegador. Sin backend ni base de datos remota.
- La interfaz debe estar en español. El código, en inglés.
- Se desplegará como sitio estático en GitHub Pages, en la ruta /reto4-rh-uveg/.
- Incluye entre 6 y 10 empleados de ejemplo con fechas de ingreso variadas.

Genera el proyecto completo y funcional.
```

---

## Secuencia real de instrucciones

El resultado anterior se alcanzó mediante el prompt inicial y tres instrucciones de
iteración, cada una limitada a su alcance:

**Prompt inicial** (21 de septiembre) — objetivo, caso y los cinco atributos y dos
restricciones mínimos de la actividad. Texto literal en `prompt-inicial.md`.

**Iteración 1** (22 de septiembre) — "Alcance: R4 y R5. Implementa un umbral de
confirmación para incrementos salariales superiores al 20 % y sustituye el borrado
definitivo de colaboradores por un archivado que conserve el expediente y pueda
revertirse. Versiona la clave de almacenamiento si el modelo cambia."

**Iteración 2** (27 de septiembre) — "Alcance: A1. Implementa una bitácora que registre
todo cambio sobre el colaborador con fecha, tipo de movimiento y, cuando aplique, valor
anterior y nuevo, cubriendo edición de datos, cambio de estatus, archivado, reactivación,
aumentos y permisos. Reconstruye la bitácora de los expedientes existentes a partir de su
propia historia."

**Iteración 3** (27 de septiembre) — "Alcance: A3 y los detalles de pulido pendientes.
Añade filtros por tipo de permiso y por rango de antigüedad, combinables con los
existentes. Corrige la concordancia del contador de archivados y elimina las claves de
almacenamiento anteriores una vez completada la migración."
