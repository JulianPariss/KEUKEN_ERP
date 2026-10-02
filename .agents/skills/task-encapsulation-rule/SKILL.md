---
name: task-encapsulation-rule
description: Regla obligatoria de encapsulamiento de tareas para agentes. Define cómo actuar ante errores o refactorizaciones fuera del alcance (scope) de la tarea original (ej. encontrar errores de tipado en otras entidades al crear un ABM).
---

# Regla de Encapsulamiento de Tareas (Task Encapsulation Rule)

Esta regla define el comportamiento esperado de los agentes de IA cuando están trabajando en una tarea específica (como la creación de un ABM, una nueva feature, o un fix de un componente) y se encuentran con problemas fuera de su alcance o *scope* original.

## 1. Mantenimiento del Scope (Encapsulamiento)
- **Foco estricto:** Si se te asignó una tarea (por ejemplo, crear un ABM para la entidad `X`), tu único objetivo y responsabilidad es completar esa tarea para la entidad `X`.
- **Ignorar errores ajenos:** Si al ejecutar compilaciones, verificaciones, linters o chequeos de tipos (TypeScript) encuentras errores en archivos, entidades o componentes que *NO* están directamente relacionados con tu tarea principal, **DEBES IGNORARLOS** en tu código y no intentar resolverlos tú mismo. Intentar arreglarlos rompe el encapsulamiento de tu tarea, alarga el tiempo de ejecución y ensucia el scope de los cambios.

## 2. Delegación a Subagentes
Para no dejar deuda técnica pero mantener tu foco, debes delegar la resolución de esos problemas a un subagente:
- **Cuándo delegar:** Inmediatamente después de detectar errores ajenos a tu tarea que impiden una compilación limpia o que son importantes de resolver.
- **Cómo delegar:**
  - Utiliza la herramienta `invoke_subagent` para lanzar un subagente (por ejemplo, el subagente `self` o uno especializado).
  - Asígnale **únicamente** la tarea de corregir esos errores específicos en las otras entidades. Dale el contexto necesario (ej. los errores de consola, los archivos afectados).
  - Continúa con tu tarea original de forma independiente. No te bloquees esperando al subagente a menos que tu propio código dependa estrictamente de esas correcciones.

## 3. Ejemplo Práctico
1. **Tarea principal:** Crear un ABM para la entidad `Usuarios`.
2. **Suceso:** Ejecutas `tsc --noEmit` para verificar tu nuevo código.
3. **Resultado:** El compilador arroja 2 errores en tu código de `Usuarios` y 5 errores de tipado en las entidades `Facturas` y `Productos` (código legacy o ajeno a ti).
4. **Acción Correcta:**
   - Arreglas exclusivamente los 2 errores en `Usuarios`.
   - Invocas a un subagente: *"He detectado errores de tipado en Facturas y Productos durante la compilación. Por favor, encárgate de corregirlos."*
   - Finalizas tu trabajo en el ABM de `Usuarios` y notificas al usuario de tu éxito y de la delegación realizada.
