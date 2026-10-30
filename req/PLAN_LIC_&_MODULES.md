# Plan de Acción: Licencias & Módulos (`@repo/access`)

Fecha: 29 de Octubre de 2026  
Referencia: `REPORTE_MIGRACION_ACCESS_Y_MODULOS.md`

---

## Contexto

La migración de lógica de acceso a `packages/access` (`@repo/access`) y el mapeo de los 10 `TFProductModuleCode` a rutas/vistas **ya está hecho** en submódulos:

- `packages` @ commit de refactor licences/modules
- `erp-next` @ commit de refactor licences/modules

Quedó frenado el cierre de protección declarativa con `<AccessGate>` en clients de `product-ui` fuera de `catalog`, y el consumo granular de capabilities.

### Estado vs reporte

| Ítem | Estado |
|---|---|
| Paquete `@repo/access` | Hecho |
| Limpieza de `lib/access` en erp-next | Hecho |
| `AuthProvider` → `AccessProvider` | Hecho |
| `ROUTE_VIEW_MAP` + `VIEW_TO_BACKEND_MODULE_MAP` (10 módulos) | Hecho |
| Guards de ruta (`proxy`, sidebar, home sections) | Hecho vía `canRenderRoute` |
| `AccessGate module="catalog"` en product-ui | Hecho (tabs, tabsV2, productDetail, combos) |
| `AccessGate` en brands / categories / uoms / uom-categories (`catalog`) + saleBillingModes | Hecho (Fase 1; maestros reasignados a catalog) |
| Cobertura declarativa por módulo en segmentos erp-next | Hecho (Fase 2) |
| Uso de capabilities granulares / `useGridColumns` | Piloto hecho (Fase 3 — treasury) |
| Skill `permissions-system` | Hecho (Fase 4 → `@repo/access`) |
| `ModuleLockFallback` con tokens design system | Hecho (Fase 4) |
| `mapaView` sin permisos vacíos | Hecho (Fase 4 → `mapa`) |
| Validación Fase 5 (tests + wiring + fix superadmin) | Hecho (smoke browser pendiente) |

---

## Fase 1 — Cerrar el trabajo frenado

1. [x] Envolver con `<AccessGate module="catalog">` (maestros de producto; **no** son `core`):
   - `packages/product-ui/src/brands/brandsClient.tsx`
   - `packages/product-ui/src/categories/categoriesClient.tsx`
   - `packages/product-ui/src/uoms/uomsClient.tsx`
   - `packages/product-ui/src/uom-categories/uomCategoriesClient.tsx`
2. [x] Envolver con `<AccessGate module="commercial">`:
   - `packages/product-ui/src/saleBillingModes/saleBillingModesClient.tsx`
3. [x] Type-check: `@repo/access`, `@repo/product-ui` (0 errores).

Patrón: copiar de combos/productDetail — return del componente envuelto en el gate (fallback default = `ModuleLockFallback`).

**Estado:** hecho (29/10/2026)

---

## Fase 2 — Cobertura declarativa en erp-next

Criterio: si el usuario puede llegar a la URL (bookmark, race de cookie de licencia), debe ver `ModuleLockFallback` y no una pantalla rota o vacía.

**Enfoque:** helper `ModuleAccessLayout` (`src/components/ModuleAccessLayout.tsx`) + `layout.tsx` por segmento de ruta.  
No se puso un layout único en `/accounting` porque mezcla módulos (`accounting` / `treasury` / `billing`).  
No se puso layout en `/products` porque mezcla `catalog` / `core` / `commercial` (ya cubiertos en product-ui, Fase 1).

### Prioridad alta

| Módulo | Cobertura | Estado |
|---|---|---|
| `accounting` | `accounting/page.tsx` + `documents/layout.tsx` + `periods/layout.tsx` | [x] Hecho |
| `treasury` | `accounting/cashRegisters/layout.tsx` | [x] Hecho |
| `billing` | `accounting/taxes/layout.tsx` | [x] Hecho |
| `wms` | `warehouses/layout.tsx` | [x] Hecho |
| `maps` | `mapa/layout.tsx` | [x] Hecho |

### Prioridad media

| Módulo | Cobertura | Estado |
|---|---|---|
| `commercial` | `priceLists/layout.tsx`, `customers/layout.tsx`, `audiences/layout.tsx` | [x] Hecho |
| `procurement` | `providers/layout.tsx`, `stock/layout.tsx` | [x] Hecho |
| `logistics` | `localization/layout.tsx`, `delivery/layout.tsx` | [x] Hecho |

### Opcional (core)

| Módulo | Cobertura | Estado |
|---|---|---|
| `core` | `structure/layout.tsx`, `system/layout.tsx`, `companies/layout.tsx`, `users/layout.tsx` | [x] Hecho |

### Ya cubierto por Fase 1 (sin layout de segmento)

- `catalog`: `/products`, `/productsv2`, combos, productDetail, brands, categories, uoms, uom-categories → AccessGate en product-ui
- `commercial` (saleBillingModes): AccessGate en product-ui
- `core` (solo): structure, system, companies, users — **sin** maestros `/products/*`

### Verificación

- [x] Type-check `erp-next` (`tsc --noEmit`): 0 errores

**Estado:** hecho (29/10/2026)

---

## Fase 3 — Capacidades granulares

### 3.1 Matriz piloto — `treasury` / Cajas Registradoras

| Elemento UI | Capability | Deny behavior |
|---|---|---|
| Alta / Editar / Eliminar (toolbar + row actions) | `treasury.cashRegisters.modify` | hide (`previewEnabled: false`) |
| Acción “Rendir caja” + modal de rendición | `treasury.cashRegisters.settlement` | hide |
| Columna `parentCashRegisterId` (Caja Padre) | `treasury.cashRegisters.hierarchy` | **preview** solo lectura (`previewEnabled: true`) |
| Campo Caja Padre en modal | `treasury.cashRegisters.hierarchy` | visible deshabilitado / oculto si no aplica |

Capabilities nuevas en `access.capabilities.ts`:
- [x] `treasury.cashRegisters.hierarchy` (`previewEnabled: true`)
- [x] `treasury.cashRegisters.settlement` (`previewEnabled: false`)

### 3.2 Implementación piloto

1. [x] Dominio piloto: **treasury** (`cashRegistersClient` + `cashRegisterModal`)
2. [x] `useAccess().canAccess(...)` en lugar de `canDo` + `PERMISSIONS_CONSTANTS` para acciones
3. [x] `useGridColumns` + `capability` en columna jerarquía
4. [x] `<AccessGate capability="...">` envolviendo modales de alta/edición y rendición
5. [x] Type-check `@repo/access` + `erp-next`: 0 errores

### 3.3 Propagación (pendiente de validar UX del piloto)

Replicar el mismo patrón en otros dominios solo después de smoke manual hide vs preview:

- [ ] `catalog` — botones modify + columnas sensibles en products/combos
- [ ] `billing` / `accounting` — acciones y columnas de impuestos / libro
- [ ] `wms` — acciones de depósitos / inventario
- [ ] Resto según prioridad de negocio

**Estado:** piloto treasury hecho (29/10/2026) — propagación pendiente

---

## Fase 4 — Higiene / docs

1. [x] Actualizar `apps/erp-next/.agents/skills/permissions-system/SKILL.md` → `@repo/access` (ejemplos treasury, ModuleAccessLayout, sin paths legacy).
2. [x] Actualizar `REPORTE_MIGRACION_ACCESS_Y_MODULOS.md` (Fases 1–4) — este plan sigue siendo la fuente de verdad operativa.
3. [x] `ModuleLockFallback`: tokens `text-main` / `bg-primary-900/40` / `border-main/20` / `rounded-dx` / icono `dx-icon-lock`.
4. [x] `mapaView`: ya no es `[]`. Se agregó `MASTER_PERMISSIONS.mapa` (provisional: `delivery:routes:read|write`) y `mapaView: ["mapa"]`. `maps.view` ahora exige permiso `mapa`. Sustituir cuando existan scopes `maps:*` en backend.

**Estado:** hecho (29/10/2026)

---

## Fase 5 — Validación funcional (checklist)

### 5.1 Wiring verificado (código)

| Ítem | Evidencia | Estado |
|---|---|---|
| Menú / home cards ocultan secciones | `navSidebar.tsx` + `clientAllowedSections.tsx` filtran con `canRenderRoute(..., companyLicense)` | [x] Wiring OK |
| Proxy → `/refused` en deep-link | `proxy.ts` llama `canRenderRoute`; si false → redirect `/refused` | [x] Wiring OK |
| product-ui → `ModuleLockFallback` | `AccessGate module=` en catalog/core/commercial clients | [x] Wiring OK |
| Layouts erp-next → `ModuleLockFallback` | `ModuleAccessLayout` en todos los segmentos Fase 2 | [x] Wiring OK |
| Cambio de empresa sin reload | `changeCompany` → `refreshProfileContext` actualiza `companyLicense` + cookies + `AccessProvider` | [x] Wiring OK |
| Superadmin / `licenseBypass` | Fix en `canRenderRoute` + `evaluateAccess` (alineado con `AccessGate`) | [x] Fix + tests |

### 5.2 Tests automatizados

Suite: `packages/access/src/__tests__/fase5.access.test.ts`  
Comando: `pnpm --filter @repo/access run test:fase5` → **13/13 pass** (29/10/2026)

Cubre: módulo ausente, lockout→refused, treasury vs accounting anidado, licenseBypass, superadmin, permisos granulares, preview hierarchy, module_disabled.

### 5.3 Fix encontrado en validación

`canRenderRoute` / `evaluateAccess` **no** salteaban lockout/módulo para rol `superadmin` (solo `licenseBypass`), mientras `AccessGate` sí. Quedaban inconsistentes menú/proxy vs UI. Corregido en `access.helper.ts`.

### 5.4 Smoke manual en browser (checklist operativo)

Con empresa **A** (sin módulo X) y empresa **B** (con módulo X), mismo usuario no-superadmin:

- [ ] Menú / home: sección de X oculta en A, visible en B
- [ ] Deep-link a ruta de X en A → `/refused` (proxy)
- [ ] Si el proxy se bypassa (cookie vieja): product-ui / layout muestran `ModuleLockFallback`
- [ ] Switch A→B en header: menú y gates se recalculan sin F5
- [ ] Usuario `superadmin` o licencia con `licenseBypass`: no queda bloqueado
- [ ] Cajas: usuario solo-view ve columna Caja Padre en preview; sin botón Rendir/Alta

**Estado:** validación automatizada + wiring hechos (29/10/2026). Smoke browser pendiente de entorno con dos empresas/licencias.

---

## Orden de ejecución sugerido

1. [x] Fase 1 (gates core + commercial en product-ui)
2. [x] Type-check Fase 1
3. [x] Fase 2 (layouts por módulo en erp-next)
4. [x] Fase 3 piloto treasury (capabilities + useGridColumns)
5. [x] Fase 4 (docs / ModuleLockFallback / mapaView)
6. [x] Fase 5 automatizada (tests + fix superadmin)
7. [ ] Smoke browser §5.4
8. [ ] Propagar capabilities (3.3) tras validar UX hide vs preview
