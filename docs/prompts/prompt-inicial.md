# Prompt inicial (versión 1)

**Fecha:** 21 de septiembre de 2026
**Herramienta:** Claude Code (Claude CLI)
**Propósito:** generar la primera versión de la aplicación.

Transcripción literal del prompt enviado:

---

Necesito desarrollar una aplicación web para un sistema de control de recursos humanos.

Contexto del caso:
Las organizaciones requieren llevar un control eficiente de la información de sus
colaboradores para facilitar la administración del personal y apoyar la toma de
decisiones. La aplicación debe permitir registrar y administrar empleados, gestionar
algunos de los procesos más comunes del área de recursos humanos y facilitar la consulta
de información relevante sobre cada colaborador.

La aplicación debe cumplir con los siguientes atributos:
- Registrar, consultar, modificar y eliminar empleados.
- Gestionar permisos del personal, considerando al menos permisos con goce de sueldo y
  permisos sin goce de sueldo.
- Registrar aumentos salariales y mantener actualizado el salario vigente del empleado.
- Calcular y mostrar automáticamente la antigüedad de cada colaborador a partir de su
  fecha de ingreso.
- Presentar la información de forma organizada y mediante una interfaz clara y fácil de
  utilizar.

La aplicación debe considerar las siguientes restricciones:
- No permitir registrar empleados con información obligatoria incompleta.
- Validar la consistencia de la información capturada (por ejemplo, fechas, salarios o
  permisos).

Requisitos técnicos:
- React con Vite y TypeScript.
- Persistencia en localStorage del navegador. Sin backend ni base de datos remota.
- La interfaz debe estar en español. El código, en inglés.
- Se desplegará como sitio estático en GitHub Pages, en la ruta /reto4-rh-uveg/.
- Incluye entre 6 y 10 empleados de ejemplo con fechas de ingreso variadas.

Genera el proyecto completo y funcional.
