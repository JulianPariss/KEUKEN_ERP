---
name: soft-delete-updates-requireds
description: Guía obligatoria para implementar el filtro de elementos inactivos y la gestión de soft-delete en los listados del sistema.
---

# Guía para la Gestión de Soft-Delete e Items Inactivos

Para mantener consistencia en la visualización de registros activos/inactivos y eliminados a lo largo de la aplicación, se ha establecido un patrón estándar para consumir y renderizar información utilizando el parámetro `include_inactive`.

## 1. Reglas Generales de Negocio

*   **is_deleted vs active:** 
    *   **DELETE (Soft Delete):** Realiza un borrado lógico en la base de datos marcando el registro con `is_deleted = true`.
    *   **PATCH (Desactivación):** Permite cambiar el estado lógico del campo `active` (habilitado/deshabilitado). Desactivar un ítem no equivale a eliminarlo.
    *   **Filtro permanente:** Todas las consultas del listado deben combinar sus parámetros con `is_deleted = false` (nunca mostrar elementos borrados en los listados estándar).
*   **Cascada de Inactivos:** Si un registro padre (ej. País) está inactivo, los selectores e interfaces de carga de los hijos (ej. Provincias) deben excluirlo para prevenir relaciones inconsistentes.

---

## 2. Consumo en Contextos y Servicios

### Exponer `includeInactive` en el AuthContext
El permiso de visualización de ítems inactivos depende del rol del usuario. Si el usuario es un `superadmin`, tiene permitido ver registros inactivos.

1.  En `AuthContext.tsx`, se expone la propiedad:
    ```typescript
    const includeInactive = user?.roles?.includes('superadmin') || false;
    ```
2.  Cualquier componente de tipo listado consume esta bandera mediante el hook `useAuth()`:
    ```typescript
    const { token, includeInactive } = useAuth();
    ```

### Llamadas a Servicios (APIs)
*   **Listados Principales:** Solo los componentes de grilla/listado principal consumen `includeInactive`:
    ```typescript
    // En countriesClient.tsx (Listado Principal):
    const response = await countriesService.getAll(token, includeInactive);
    ```
*   **Selectores y Formularios de Creación:** **NUNCA** utilices `includeInactive` ni envíes cabeceras de `recoveryMode` (`X-Recovery-Mode: true`) en modales de creación o selectores desplegables de dependencias. Estos deben llamar al servicio deshabilitando el modo recuperación (`{ recoveryMode: false }`) para que solo traiga elementos activos y no eliminados:
    ```typescript
    // En customerModal.tsx o statesClient.tsx (Formulario / Selector de dependencias):
    countriesService.getAll(token, false, true); // Traerá únicamente países activos sin cabeceras de recoveryMode
    ```

---

## 3. Comportamiento en Grillas (GenericDataGrid)

Cuando un listado incluye elementos inactivos (`active === false`), se deben restringir las operaciones que el usuario puede realizar sobre ellos.

### Restricción de Acciones por Fila
*   **Elementos Activos:** Tienen permitidas las acciones de edición (`edit`) y eliminación (`trash`) si el usuario posee los permisos necesarios (`canModify`).
*   **Elementos Inactivos:** Quedan de solo lectura (sin ninguna opción disponible en su columna de acciones).

### Patrón de Implementación en React

1.  **Desactivar los botones nativos del Grid:**
    ```tsx
    editing={{
        allowAdding: canModify,
        allowUpdating: false, // Desactivar editar en línea / botón nativo
        allowDeleting: false, // Desactivar eliminar nativo
        useIcons: true,
        onAdd: () => { ... }
    }}
    ```

2.  **Definir acciones personalizadas condicionales:**
    Utiliza el array de `actions` y define la visibilidad de cada botón evaluando el campo `active` de la fila:
    ```tsx
    const actions = useMemo(() => [
        {
            icon: "edit",
            hint: "Editar",
            onClick: (data: any) => {
                setSelectedCountry(data);
                setIsModalOpen(true);
            },
            visible: (e: any) => e.active && canModify, // Solo visible si está activo
        },
        {
            icon: "trash",
            hint: "Eliminar",
            onClick: (data: any) => handleRowRemoved(data),
            visible: (e: any) => e.active && canModify, // Solo visible si está activo
        }
    ], [canModify]);
    ```

3.  **Vincular al Grid:**
    ```tsx
    <GenericDataGrid
        ...
        editing={...}
        actions={actions}
    />
    ```

4.  **Ocultar la columna "Activo" si no se visualizan inactivos:**
    Si el usuario no tiene habilitada la visualización de inactivos (`includeInactive` es falso), no tiene sentido mostrar la columna `"active"` ("Activo"), dado que todos los elementos listados en la grilla estarán activos. Se debe controlar su visibilidad dinámicamente:
    ```tsx
    const columns: IGenericDataGridColumn[] = useMemo(() => [
        // ... otras columnas
        {
            dataField: 'active',
            caption: 'Activo',
            width: 100,
            alignment: 'center',
            visible: includeInactive, // Ocultar/Mostrar según el rol
            cellRender: (cellData: any) => (
                <div className="flex justify-center items-center h-full">
                    <CheckBox value={cellData.value} readOnly />
                </div>
            )
        }
    ], [currencies, includeInactive]); // Mantener includeInactive en las dependencias
    ```

---

## 4. Recovery Mode (Restauración de Registros Inactivos)

La funcionalidad de **Recovery Mode** permite a usuarios administradores (`superadmin`) restaurar registros inactivos directamente desde las grillas del sistema.

### Endpoint y Servicio de Restauración Genérico

El servicio genérico está en `@repo/erp-services/common.service`:

* **Método**: `POST`
* **URL**: `/api/v1/admin/recovery/{schema}/{table}/{id}/restore`
* **Tipos / mapper**: `@repo/api-contracts/erp` (`IBRestoreResponse`, `IFRestoreResponse`, `mapRestoreResponse`).

### Consumo

```typescript
import { commonService } from "@repo/erp-services/common.service";

await commonService.restore(schema, table, id, token);
```

### Implementación de referencia (package)

```typescript
import { ADMIN_URL, apiFetch } from "@repo/erp-api-client";
import {
    IBRestoreResponse,
    IFRestoreResponse,
    mapRestoreResponse,
} from "@repo/api-contracts/erp";

export const commonService = {
    async restore(
        schema: string,
        table: string,
        id: string,
        token: string
    ): Promise<IFRestoreResponse> {
        const data: IBRestoreResponse = await apiFetch(
            `${ADMIN_URL}/recovery/${schema}/${table}/${id}/restore`,
            { method: "POST" },
            "No se pudo restaurar el registro",
            { token }
        );
        return mapRestoreResponse(data);
    },
};
```

### Integración en Componentes de Grilla (ej. `citiesClient.tsx`)

1. **Validación de Rol Superadmin**:
   Obtener el objeto `user` desde `useAuth()` y validar si contiene el rol `'superadmin'`:
   ```typescript
   const { token, user } = useAuth();

   const isSuperAdmin = useMemo(() => {
       return user?.roles?.includes('superadmin') ?? false;
   }, [user]);
   ```

2. **Handler de Restauración**:
   Invocar `commonService.restore` especificando el `schema` y `table` correspondientes a la entidad, refrescar el listado incrementando `setRefreshVersion` y notificar el resultado:
   ```typescript
   const handleRestore = async (data: any) => {
       try {
           await commonService.restore('partners', 'cities', data.id, token);
           setRefreshVersion(prev => prev + 1);
           notify("Registro restaurado exitosamente", "success", 3000);
       } catch (error: any) {
           console.error("Error al restaurar:", error);
           notify(error?.message || "Error al restaurar el registro", "error", 3000);
       }
   };
   ```

3. **Inclusión de la Acción en la Grilla**:
   En el array de `actions`, añadir el botón de restauración utilizando el icono `"revert"`. Este botón debe mostrarse únicamente cuando la fila esté inactiva (`active === false`) y el usuario sea `superadmin`:
   ```typescript
    const actions = useMemo(() => [
        {
            icon: "edit",
            hint: "Editar",
            onClick: (data: any) => { ... },
            visible: (e: any) => e.active && canModify,
        },
        {
            icon: "trash",
            hint: "Eliminar",
            onClick: (data: any) => handleRowRemoved(data),
            visible: (e: any) => e.active && canModify,
        },
        {
            icon: "revert",
            hint: "Restaurar",
            onClick: (data: any) => handleRestore(data),
            visible: (e: any) => !e.active && isSuperAdmin,
        }
    ], [canModify, isSuperAdmin, token]);
   ```
