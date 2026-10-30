# Reporte de Estado: Migración de `@repo/access` y Vinculación de Módulos de Licencia

Fecha original: 28 de Octubre de 2026  
Última actualización: 29 de Octubre de 2026

> **Fuente de verdad del plan en curso:** [`PLAN_LIC_&_MODULES.md`](./PLAN_LIC_%26_MODULES.md)

---

## 1. Resumen Ejecutivo de lo Realizado

### 1.1 Creación y desacople del paquete `@repo/access` (`packages/access`)
- Se extrajo toda la lógica de permisos, licencias y capacidades que residía en `apps/erp-next/src/app/lib/access` hacia el nuevo paquete compartido `packages/access` (`@repo/access`).
- Se crearon:
  - `AccessContext.tsx`: Provee `AccessProvider` y `useAccess` desacoplados de Next.js.
  - `AccessGate.tsx`: Componente de compuerta declarativo que soporta tanto `capability` como `module` (`<AccessGate module="catalog">`). Si la empresa no posee el módulo o la licencia está bloqueada, renderiza automáticamente `ModuleLockFallback` (o el fallback provisto).
  - `ModuleLockFallback.tsx`: Banner/fallback estandarizado (tokens del design system) cuando el módulo no está contratado.
  - `access.definitions.ts`: Mapeo maestro de permisos, rutas y vistas.
  - `access.capabilities.ts`: Registro canónico de capacidades funcionales organizadas por módulo.
  - `access.constants.ts`: Constantes de permisos de backend incluyendo `brands`, `modifyBrands`, `mapa`.
  - `access.helper.ts`: Funciones puras de verificación (`canRenderRoute`, `canDo`, `canView`, `hasModule`, `hasScope`, `scopeMatches`, `isLicenseLocked`, `evaluateAccess`, `canAccess`).
  - `useGridColumns.ts`: Hook para columnas de DevExtreme restringidas por capacidad.

### 1.2 Limpieza de re-exports y alias en `apps/erp-next`
- Se actualizaron los consumidores en `apps/erp-next` eliminando imports con alias (`@/app/lib/...`) y re-exports intermedios.
- Todos los componentes importan directamente desde `@repo/access`.
- Se eliminaron las carpetas y archivos legacy (`lib/access`, `permission.helper`, `permissions.constants`, `lib/permissions`).
- En `AuthContext.tsx`, `AuthProvider` alimenta `<AccessProvider>` con licencias, módulos, permisos y scopes efectivos.

### 1.3 Consumo de `@repo/access` en `packages/product-ui`
- Catalog: `<AccessGate module="catalog">` en tabs, tabsV2, productDetail, combos, brands, categories, uoms, uom-categories.
- Commercial: `<AccessGate module="commercial">` en saleBillingModes.
- Nota: los maestros `/products/brands|categories|uoms|uom-categories` pertenecen a **catalog**, no a **core**.

### 1.4 Mapeo maestro de Módulos (`TFProductModuleCode`) y Rutas
`ROUTE_VIEW_MAP` + `VIEW_TO_BACKEND_MODULE_MAP` vinculan los 10 módulos (`catalog`, `core`, `commercial`, `procurement`, `logistics`, `wms`, `accounting`, `treasury`, `billing`, `maps`).  
`canRenderRoute` resuelve rutas por longitud descendente (rutas anidadas tienen precedencia).

### 1.5 Fase 2 — Layouts declarativos en erp-next
Helper `ModuleAccessLayout` + `layout.tsx` por segmento (accounting/treasury/billing/wms/maps/commercial/procurement/logistics/core).

### 1.6 Fase 3 — Piloto de capacidades granulares (treasury)
- Capabilities: `treasury.cashRegisters.modify`, `.settlement`, `.hierarchy` (preview).
- `cashRegistersClient` usa `useAccess`, `useGridColumns` y `<AccessGate capability>`.

### 1.7 Fase 4 — Higiene / docs
- Skill `permissions-system` actualizada a `@repo/access`.
- `ModuleLockFallback` alineado a tokens (`text-main`, `bg-primary-*`, `border-main`, `rounded-dx`).
- `mapaView` ya no usa `[]`: permiso `mapa` (provisional vía `delivery:routes:read`).

---

## 2. Estado de Compilación y Verificación

Validado durante Fases 1–4:

- `pnpm --filter @repo/access run type-check`: **0 errores**
- `pnpm --filter @repo/product-ui run type-check`: **0 errores**
- `pnpm --filter erp-next exec tsc --noEmit`: **0 errores**

---

### 1.8 Fase 5 — Validación

- Suite `pnpm --filter @repo/access run test:fase5` (13 tests).
- Fix: `canRenderRoute` / `evaluateAccess` alineados con `AccessGate` para `superadmin`.
- Smoke browser con dos empresas: ver §5.4 del plan.

---

## 3. Pendiente

Ver checklist vivo en [`PLAN_LIC_&_MODULES.md`](./PLAN_LIC_%26_MODULES.md):

- Smoke browser §5.4.
- Propagar patrón de capabilities (Fase 3.3) tras validar UX hide vs preview.
- Cuando existan scopes backend `maps:*`, reemplazar el mapeo provisional de `MASTER_PERMISSIONS.mapa`.

---

## 4. Prompt para Retomar

```markdown
Hola, continuamos con licencias/módulos/@repo/access.
Leé apps/erp-next/req/PLAN_LIC_&_MODULES.md (fuente de verdad).
Fases 1–5 (automatizada) hechas. Siguiente: smoke browser §5.4 o propagar capabilities (3.3).
```
