# Reporte de Estado: Migración de `@repo/access` y Vinculación de Módulos de Licencia

Fecha: 28 de Octubre de 2026

---

## 1. Resumen Ejecutivo de lo Realizado

### 1.1 Creación y desacople del paquete `@repo/access` (`packages/access`)
- Se extrajo toda la lógica de permisos, licencias y capacidades que residía en `apps/erp-next/src/app/lib/access` hacia el nuevo paquete compartido `packages/access` (`@repo/access`).
- Se crearon:
  - `AccessContext.tsx`: Provee `AccessProvider` y `useAccess` desacoplados de Next.js.
  - `AccessGate.tsx`: Componente de compuerta declarativo que soporta tanto `capability` como `module` (`<AccessGate module="catalog">`). Si la empresa no posee el módulo o la licencia está bloqueada, renderiza automáticamente `ModuleLockFallback` (o el fallback provisto).
  - `ModuleLockFallback.tsx`: Banner/fallback estandarizado que informa de forma amigable que el módulo no se encuentra contratado en la empresa actual.
  - `access.definitions.ts`: Mapeo maestro de permisos, rutas y vistas.
  - `access.capabilities.ts`: Registro canónico de capacidades funcionales organizadas por módulo (`module.catalog`, `module.core`, `module.commercial`, etc.).
  - `access.constants.ts`: Constantes de permisos de backend incluyendo `brands` y `modifyBrands`.
  - `access.helper.ts`: Funciones puras de verificación (`canRenderRoute`, `canDo`, `canView`, `hasModule`, `hasScope`, `scopeMatches`, `isLicenseLocked`, `evaluateAccess`, `canAccess`).
  - `useGridColumns.ts`: Hook para columnas de DevExtreme restringidas por capacidad.

### 1.2 Limpieza de re-exports y alias en `apps/erp-next`
- Se actualizaron **53 archivos** en `apps/erp-next` eliminando imports con alias (`@/app/lib/...`) y re-exports intermedios.
- Todos los componentes ahora importan directamente desde `@repo/access`.
- Se eliminaron definitivamente las carpetas y archivos legacy:
  - `apps/erp-next/src/app/lib/access/`
  - `apps/erp-next/src/app/lib/utils/permission.helper.ts`
  - `apps/erp-next/src/app/lib/constants/permissions.constants.ts`
  - `apps/erp-next/src/app/lib/permissions/` (`getPermissions.tsx`, `getModules.ts`)
- En `apps/erp-next/src/contexts/AuthContext.tsx`, `AuthProvider` alimenta e integra en tiempo real `<AccessProvider>` con las licencias, módulos, permisos y scopes efectivos actuales.

### 1.3 Consumo de `@repo/access` en `packages/product-ui`
- Se enlazó `@repo/access` en `packages/product-ui/package.json`.
- Se migraron los clientes y componentes (`brandsClient`, `categoriesClient`, `combos`, `itemList`, `presentationsList`, `productsList`, `saleBillingModesClient`, `uomCategoriesClient`, `uomsClient`) para consumir `canDo` y `PERMISSIONS_CONSTANTS` directamente de `@repo/access`.
- Se protegió el acceso a nivel de componente con `<AccessGate module="catalog">` en:
  - `ProductTabsV2` (`packages/product-ui/src/components/tabs/tabsV2.tsx`)
  - `ProductTabs` (`packages/product-ui/src/components/tabs/tabs.tsx`)
  - `ProductDetailView` (`packages/product-ui/src/productDetail/ProductDetailView.tsx`)
  - `CombosClient` (`packages/product-ui/src/combos/index.tsx`)

### 1.4 Mapeo maestro de Módulos (`TFProductModuleCode`) y Rutas
Se actualizó `packages/access/src/access.definitions.ts` y `access.helper.ts`:
- **Algoritmo de resolución de rutas en `canRenderRoute`**: Se ordenan las rutas por longitud descendente para que rutas anidadas más específicas (como `/accounting/cashRegisters` o `/products/brands`) tengan precedencia sobre sus rutas padre (`/accounting` o `/products`).
- Vinculación exacta de los 10 módulos:

| Módulo (`TFProductModuleCode`) | Rutas y Vistas Controladas | Componentes / Directorios |
|---|---|---|
| **`catalog`** | `/products`, `/products/combos`, `/products/productDetail`, `/productsv2` | `packages/product-ui/src/productsv2`, `packages/product-ui/src/productDetail`, `packages/product-ui/src/combos` |
| **`core`** | `/structure` (branches, logisticCenters, establishments), `/system` (audit, keysManager), `/companies`, `/users`, `/products/uom-categories`, `/products/categories`, `/products/uoms`, `/products/brands` | `apps/erp-next/src/app/(home)/structure`, `/system`, `/companies`, `/users`, `packages/product-ui/src/uom-categories`, `/categories`, `/uoms`, `/brands` |
| **`commercial`** | `/priceLists` (y todas sus subrutas), `/products/saleBillingModes`, `/customers`, `/audiences` | `apps/erp-next/src/app/(home)/priceLists`, `/customers`, `/audiences`, `packages/product-ui/src/saleBillingModes` |
| **`procurement`** | `/providers` (articleHandling, metadata), `/stock` (consignments, serial-numbers) | `apps/erp-next/src/app/(home)/providers`, `apps/erp-next/src/app/(home)/stock` |
| **`logistics`** | `/localization` (cities, countries, currencies, states, taxCategories), `/delivery` (routes, vehicles, zones) | `apps/erp-next/src/app/(home)/localization`, `apps/erp-next/src/app/(home)/delivery` |
| **`wms`** | `/warehouses` | `apps/erp-next/src/app/(home)/warehouses` |
| **`accounting`** | `/accounting`, `/accounting/documents`, `/accounting/periods` | `apps/erp-next/src/app/(home)/accounting` |
| **`treasury`** | `/accounting/cashRegisters` | `apps/erp-next/src/app/(home)/accounting/cashRegisters` |
| **`billing`** | `/accounting/taxes` | `apps/erp-next/src/app/(home)/accounting/taxes` |
| **`maps`** | `/mapa` | `apps/erp-next/src/app/(home)/mapa` |

---

## 2. Estado de Compilación y Verificación

- `pnpm --filter @repo/access exec tsc --noEmit`: **0 errores**
- `pnpm --filter @repo/product-ui run type-check`: **0 errores**
- `pnpm --filter @repo/api-contracts --filter @repo/erp-services run type-check`: **0 errores**
- `pnpm --filter erp-next exec tsc --noEmit`: **0 errores**

---

## 3. Próximos Pasos para Mañana

1. **Protección a nivel de componente en `product-ui` para el resto de módulos**:
   - Envolver `packages/product-ui/src/brands/brandsClient.tsx` con `<AccessGate module="core">`.
   - Envolver `packages/product-ui/src/categories/categoriesClient.tsx` con `<AccessGate module="core">`.
   - Envolver `packages/product-ui/src/uom-categories/uomCategoriesClient.tsx` con `<AccessGate module="core">`.
   - Envolver `packages/product-ui/src/uoms/uomsClient.tsx` con `<AccessGate module="core">`.
   - Envolver `packages/product-ui/src/saleBillingModes/saleBillingModesClient.tsx` con `<AccessGate module="commercial">`.
2. **Definición de Capacidades Granulares y Columnas**:
   - Definir qué botones, columnas de grilla o acciones específicas se bloquean o pasan a modo preview según el módulo o plan de licencia.

---

## 4. Prompt para Reanudar la Sesión Mañana

Copia y pega el siguiente bloque en la nueva sesión para retomar inmediatamente el trabajo:

```markdown
Hola, continuamos con la vinculación de módulos de licencia (TFProductModuleCode) y componentes/vistas entre apps/erp-next y packages/product-ui usando el nuevo paquete @repo/access.

Por favor lee el reporte en apps/erp-next/req/REPORTE_MIGRACION_ACCESS_Y_MODULOS.md para ver el estado exacto en que quedó todo:
- El paquete @repo/access ya está operativo y sin errores de TypeScript.
- ROUTE_VIEW_MAP y VIEW_TO_BACKEND_MODULE_MAP ya tienen vinculadas todas las rutas con sus módulos respectivos (catalog, core, commercial, procurement, logistics, wms, accounting, treasury, billing, maps).
- En product-ui ya protegimos con <AccessGate module="catalog"> los componentes de catálogo (productsv2, productDetail, combos).

El siguiente paso es:
1. Envolver con <AccessGate module="core"> los componentes restantes de product-ui pertenecientes a "core": brandsClient, categoriesClient, uomsClient y uomCategoriesClient.
2. Envolver con <AccessGate module="commercial"> el componente saleBillingModesClient.
3. Verificar si hay componentes o páginas en apps/erp-next que requieran protección declarativa con <AccessGate> o ajuste en las cards de secciones del home.
4. Ejecutar el chequeo de tipos general para validar que todo siga en 0 errores.
```

