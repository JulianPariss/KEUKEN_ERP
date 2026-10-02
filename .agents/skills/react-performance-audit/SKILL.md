---
name: react-performance-audit
description: Proceso de auditoría para revisar carpetas y componentes en busca de mejoras de rendimiento y buenas prácticas, basándose estrictamente en la skill vercel-react-best-practices.
---

# Auditoría de Rendimiento de Componentes (React/Next.js)

Esta skill define el proceso estructurado y obligatorio que un agente debe seguir cuando el usuario le solicite "revisar una carpeta en busca de mejoras" o "auditar el rendimiento" basándose en las mejores prácticas de Vercel.

## Flujo de Trabajo Obligatorio

1. **Revisión de Base**:
   El agente debe tener presentes en todo momento las categorías y reglas críticas de la skill `vercel-react-best-practices`. Si no las recuerda en su totalidad, debe leer dicha skill primero.

2. **Mapeo de la Carpeta Objetivo**:
   Explora la carpeta indicada por el usuario y lista los componentes (`.tsx`) y lógicas (`.ts`, `.hooks.ts`, etc.) principales involucrados.

3. **Inspección Código por Código**:
   Lee el contenido de los archivos y somételos a un escrutinio buscando violaciones a las reglas, prestando especial atención a:
   - **Waterfalls (Crítico)**: Revisa dependencias de `await` en serie. ¿Pueden usarse `Promise.all`?
   - **Bundle y Carga (Crítico)**: Revisa imports. ¿Hay imports de archivos "barrel"? ¿Se pueden usar imports dinámicos?
   - **Re-renders (Medio)**: Revisa dependencias en `useEffect`/`useCallback`, uso de primitivos vs objetos, estados innecesarios para cálculos que pueden ser variables derivadas.
   - **Optimizaciones de JS y DOM (Medio-Bajo)**: Bucles poco óptimos, renders condicionales con `&&` (preferir ternarios), agrupamiento de clases CSS.

4. **Elaboración del Reporte**:
   En lugar de aplicar cambios drásticos de golpe, el agente debe armar un resumen organizado (por ejemplo, en un artefacto markdown o listado claro) que contenga:
   - Nombre del Archivo.
   - Regla de Vercel infringida o a mejorar.
   - Impacto de la mejora (Crítico, Alto, Medio, Bajo).
   - Breve propuesta (Código actual vs. Código optimizado).

5. **Confirmación**:
   Una vez entregado el reporte, pregúntale al usuario si desea que apliques automáticamente los cambios sugeridos, o si prefiere hacerlo archivo por archivo.
