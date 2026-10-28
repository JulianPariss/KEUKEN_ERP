---
name: permissions-system
description: Guía integral sobre el sistema unificado de acceso (Licencias, Módulos y Permisos), registro de capacidades (capabilities), guards de rutas y filtrado granular de UI.
---

# Sistema Unificado de Acceso: Licencias, Módulos y Permisos

Esta skill documenta el sistema de control de acceso de la aplicación ERP. El modelo implementa un filtrado en cascada de 3 capas:

```
[ 1. Licencias de Empresa ] ───► [ 2. Módulos de Empresa ] ───► [ 3. Permisos de Usuario ] ───► Render UI
```

---

## 1. Estructura de Archivos del Sistema

Toda la lógica de acceso está centralizada en:  
📁 **`src/app/lib/access/`**

- `index.ts`: Barrel export principal (`canAccess`, `useAccess`, `AccessGate`, `useGridColumns`, `canDo`, `canView`, etc.).
- `access.types.ts`: Tipos principales (`ICapabilityRule`, `IAccessContext`, `IAccessEvaluation`, `TFPermissionsConfig`, `TFMeLicenseField`, `TFProductModuleCode`, etc.).
- `access.definitions.ts`: Definición de `MASTER_PERMISSIONS`, `AUTHORITY_HIERARCHY`, `ROUTE_VIEW_MAP`, y `VIEW_TO_BACKEND_MODULE_MAP`.
- `access.constants.ts`: Agrupadores de permisos (`PERMISSIONS_CONSTANTS`).
- `access.capabilities.ts`: Registro central de Capacidades (`CAPABILITIES`) con soporte de `previewEnabled`.
- `access.helper.ts`: Funciones de evaluación puras (`hasModule`, `isLicenseLocked`, `canAccess`, `evaluateAccess`, `canDo`, `canView`, `canRenderRoute`).
- `useAccess.ts`: Hook reactivo para Client Components.
- `AccessGate.tsx`: Componente wrapper declarativo para proteger bloques y botones.
- `useGridColumns.ts`: Hook para filtrar y preparar columnas de `GenericDataGrid` de `@repo/devextreme`.

*(Nota: Los archivos heredados en `src/app/lib/constants/permissions.constants.ts`, `src/app/lib/utils/permission.helper.ts`, y `src/app/lib/permissions/` re-exportan desde `src/app/lib/access` para retrocompatibilidad total).*

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

En `src/app/lib/access/access.capabilities.ts`, cada capacidad (etiqueta) define sus requisitos:

```typescript
export const CAPABILITIES = {
    'accounting.multiCurrency': {
        module: 'accounting',
        licensePlan: ['finanzas', 'full'],
        permission: { action: 'view', keys: ['currencies'] },
        previewEnabled: false,
    },
    'cashRegisters.modify': {
        module: 'treasury',
        permission: { action: 'modify', keys: ['cashRegisters'] },
        previewEnabled: false,
    },
    'inventory.batchTracking': {
        module: 'wms',
        licensePlan: ['deposito', 'full'],
        permission: { action: 'modify', keys: ['warehouses'] },
        previewEnabled: false,
    }
} as const satisfies Record<string, ICapabilityRule>;
```

### Propiedad `previewEnabled`:
- **`false` (por defecto)**: Si la empresa o usuario no tiene acceso, el elemento se **oculta completamente** de la UI.
- **`true`**: El elemento se muestra en modo **preview/deshabilitado** (para fines de upsell o demostración).

---

## 4. Consumo en la UI según Granularidad

### A. Nivel Macro: Rutas y Middleware (`proxy.ts` / Menú)
`canRenderRoute(pathname, userPermissions, companyLicense)` evalúa tanto el lockout de licencia, como si el módulo de producto está activo para la empresa, y los permisos del usuario.

En `navSidebar.tsx`:
```tsx
const { user, companyLicense } = useAuth();
const routes = useMemo(() => {
    return initialRoutes.filter(route => 
        canRenderRoute(route.path, user?.roles || [], companyLicense)
    );
}, [initialRoutes, user, companyLicense]);
```

### B. Nivel Meso: Bloques y Botones (`<AccessGate>` o `useAccess`)
```tsx
import { AccessGate, useAccess } from "@/app/lib/access";

// Forma declarativa:
<AccessGate capability="cashRegisters.modify">
    <Button text="Nueva Caja" onClick={openModal} />
</AccessGate>

// Forma imperativa:
const { canAccess } = useAccess();
if (canAccess('cashRegisters.modify')) { ... }
```

### C. Nivel Micro: Columnas de `GenericDataGrid`
En conjunto con el wrapper de DevExtreme:

```tsx
import { useGridColumns, IAccessGridColumn } from "@/app/lib/access";

const columns = useGridColumns([
    { dataField: "id", caption: "ID" },
    { dataField: "name", caption: "Nombre" },
    {
        dataField: "settlementCurrency",
        caption: "Moneda de Liquidación",
        capability: "accounting.multiCurrency" // Se ocultará o entrará en preview automáticamente
    }
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
    visible={canAccess("cashRegisters.modify")}
/>
```

---

## 5. Reactividad al Cambiar de Empresa (`changeCompany`)

En `AuthContext.tsx`, al invocar `changeCompany(empresa)`:
1. Se invoca `refreshProfileContext(empresa.id)` llamando a `GET /auth/me?company_id=...`.
2. Se actualiza reactivamente `companyLicense` y `permissions` en el estado de React y en cookies.
3. Todas las grillas (`useGridColumns`), formularios y el menú lateral recalculan inmediatamente su visibilidad sin requerir recargar la página.
