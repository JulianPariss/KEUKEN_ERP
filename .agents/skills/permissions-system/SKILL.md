---
name: permissions-system
description: Guía integral sobre el sistema unificado de acceso (Licencias, Módulos y Permisos), registro de capacidades (capabilities), guards de rutas y filtrado granular de UI.
---

# Sistema Unificado de Acceso: Licencias, Módulos y Permisos

Esta skill documenta el sistema de control de acceso de la aplicación ERP. El modelo implementa un filtrado en cascada de 3 capas:

```
[ 1. Licencias de Empresa ] ───► [ 2. Módulos de Empresa ] ───► [ 3. Permisos de Usuario ] ───► Render UI
```

Fuente de verdad operativa del plan: `apps/erp-next/req/PLAN_LIC_&_MODULES.md`.

---

## 1. Estructura de Archivos del Sistema

Toda la lógica de acceso está centralizada en el paquete compartido:  
📁 **`packages/access`** (`@repo/access`)

- `index.ts`: Barrel export principal (`canAccess`, `useAccess`, `AccessGate`, `useGridColumns`, `canDo`, `canView`, etc.).
- `access.types.ts`: Tipos principales (`ICapabilityRule`, `IAccessContext`, `IAccessEvaluation`, `TFPermissionsConfig`, `TFMeLicenseField`, `TFProductModuleCode`, etc.).
- `access.definitions.ts`: Definición de `MASTER_PERMISSIONS`, `AUTHORITY_HIERARCHY`, `ROUTE_VIEW_MAP`, y `VIEW_TO_BACKEND_MODULE_MAP`.
- `access.constants.ts`: Agrupadores de permisos (`PERMISSIONS_CONSTANTS`).
- `access.capabilities.ts`: Registro central de Capacidades (`CAPABILITIES`) con soporte de `previewEnabled`.
- `access.helper.ts`: Funciones de evaluación puras (`hasModule`, `isLicenseLocked`, `canAccess`, `evaluateAccess`, `canDo`, `canView`, `canRenderRoute`).
- `AccessContext.tsx` / `useAccess.ts`: Provider + hook reactivo para Client Components.
- `AccessGate.tsx`: Componente wrapper declarativo (`module` y/o `capability`).
- `ModuleLockFallback.tsx`: Fallback UI cuando el módulo no está contratado.
- `useGridColumns.ts`: Hook para filtrar/preparar columnas de `GenericDataGrid` (`@repo/devextreme`).

### Integración en apps

- **`apps/erp-next`**: importa desde `@repo/access`. `AuthProvider` alimenta `<AccessProvider>`. Segmentos de ruta usan `ModuleAccessLayout` (`src/components/ModuleAccessLayout.tsx`).
- **`packages/product-ui`**: importa `canDo`, `PERMISSIONS_CONSTANTS`, `AccessGate` desde `@repo/access`.

> **No usar** paths legacy `src/app/lib/access`, `permission.helper.ts` ni `permissions.constants.ts` — fueron eliminados.

---

## 2. Los 3 Niveles de la Cascada

1. **Licencia de Empresa (`MeLicenseField`)**:
   Obtenida en `GET /auth/me` con la compañía operativa actual. Contiene el plan comercial (`operacion`, `deposito`, `finanzas`, `full`), vigencia, días de gracia, cuotas (`quotas`), y `license_bypass`.
   - Si la licencia está en **Lockout** (`status === 'revoked'`, `grace_ended`, `not_yet_valid`), la UI se bloquea (candado) salvo usuarios con `license_bypass`.

2. **Módulo de Producto (`ProductModuleCode`)**:
   Define qué módulos de producto (`catalog`, `wms`, `accounting`, `treasury`, `commercial`, `logistics`, `procurement`, `billing`, `maps`, `legacy`, `core`) tiene activos la empresa.
   - Si la empresa no tiene el módulo contratado, ninguna ruta, acción ni campo de ese módulo se muestra.

3. **Permisos y Jerarquía de Usuario**:
   Roles y scopes efectivos (`view`, `modify`, `extract`), evaluando jerarquías automáticas (`admin` = nivel 1, `superadmin` = nivel 2).

---

## 3. Registro de Capacidades (Capabilities)

En `packages/access/src/access.capabilities.ts`, cada capacidad (etiqueta) define sus requisitos:

```typescript
export const CAPABILITIES = {
    'treasury.cashRegisters.modify': {
        module: 'treasury',
        permission: { action: 'modify', keys: ['cashRegisters'] },
        previewEnabled: false,
    },
    'treasury.cashRegisters.hierarchy': {
        module: 'treasury',
        permission: { action: 'modify', keys: ['cashRegisters'] },
        previewEnabled: true, // columna en preview si no tiene modify
    },
    'maps.view': {
        module: 'maps',
        permission: { action: 'view', keys: ['mapa'] },
        previewEnabled: false,
    },
} as const satisfies Record<string, ICapabilityRule>;
```

### Propiedad `previewEnabled`:
- **`false` (por defecto)**: Si la empresa o usuario no tiene acceso, el elemento se **oculta completamente** de la UI.
- **`true`**: El elemento se muestra en modo **preview/deshabilitado** (para fines de upsell o demostración).

---

## 4. Consumo en la UI según Granularidad

### A. Nivel Macro: Rutas y Middleware (`proxy.ts` / Menú / Layouts)
`canRenderRoute(pathname, userPermissions, companyLicense)` evalúa lockout de licencia, módulo de producto y permisos de usuario.

Segmentos de dominio en erp-next usan:

```tsx
import ModuleAccessLayout from '@/components/ModuleAccessLayout';

export default function WarehousesLayout({ children }: { children: ReactNode }) {
    return <ModuleAccessLayout module="wms">{children}</ModuleAccessLayout>;
}
```

En `navSidebar.tsx` / home sections:
```tsx
import { canRenderRoute } from "@repo/access";

const routes = initialRoutes.filter(route =>
    canRenderRoute(route.path, userPermissions, companyLicense)
);
```

### B. Nivel Meso: Bloques y Botones (`<AccessGate>` o `useAccess`)
```tsx
import { AccessGate, useAccess } from "@repo/access";

// Forma declarativa:
<AccessGate capability="treasury.cashRegisters.modify">
    <Button text="Nueva Caja" onClick={openModal} />
</AccessGate>

// Forma imperativa:
const { canAccess } = useAccess();
if (canAccess('treasury.cashRegisters.modify')) { ... }
```

### C. Nivel Micro: Columnas de `GenericDataGrid`
```tsx
import { useGridColumns, IAccessGridColumn } from "@repo/access";

const columns = useGridColumns([
    { dataField: "id", caption: "ID" },
    { dataField: "name", caption: "Nombre" },
    {
        dataField: "parentCashRegisterId",
        caption: "Caja Padre",
        capability: "treasury.cashRegisters.hierarchy",
    },
]);

return <GenericDataGrid columns={columns} dataSource={data} />;
```

### D. Nivel Micro: Inputs de Formularios DevExtreme
```tsx
const { canAccess } = useAccess();

<SimpleItem
    dataField="parentCashRegisterId"
    label={{ text: "Caja Padre" }}
    editorType="dxSelectBox"
    visible={canAccess("treasury.cashRegisters.hierarchy")}
    editorOptions={{ disabled: !canAccess("treasury.cashRegisters.hierarchy") }}
/>
```

---

## 5. Reactividad al Cambiar de Empresa (`changeCompany`)

En `AuthContext.tsx`, al invocar `changeCompany(empresa)`:
1. Se invoca `refreshProfileContext(empresa.id)` llamando a `GET /auth/me?company_id=...`.
2. Se actualiza reactivamente `companyLicense` y `permissions` en el estado de React y en cookies.
3. Todas las grillas (`useGridColumns`), formularios, `AccessGate` y el menú lateral recalculan inmediatamente su visibilidad sin requerir recargar la página.
