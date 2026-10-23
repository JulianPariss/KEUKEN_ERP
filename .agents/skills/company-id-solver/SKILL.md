---
name: company-id-solver
description: Guía obligatoria para solucionar el error "Debe indicar company_id en la solicitud" asegurando el envío del companyId/company_id desde el AuthContext a los servicios API.
---

# Guía de Resolución: Envío Obligatorio de `company_id` (Company ID Solver)

Esta skill documenta el patrón obligatorio para resolver errores del tipo:
> *"Debe indicar company_id en la solicitud: el actor es superadmin y el token incluye varias compañías; hay que elegir en cuál operar."*

Este error ocurre cuando un token de autenticación contiene permisos o acceso a múltiples compañías (por ejemplo, para usuarios con rol `superadmin` o multi-empresa) y la API requiere conocer explícitamente sobre qué compañía (`company_id`) debe ejecutarse la operación.

---

## 1. Patrón en los Servicios (Service Layer)

En cada método de `@repo/erp-services/**/*.service.ts`:

1. **Aceptar `companyId?: string`** como parámetro adicional (o requerido) en los métodos de la API (`getAll`, `getById`, `create`, `update`, `delete`).
2. **Incluir `company_id` como Query Parameter (`?company_id=${encodeURIComponent(companyId)}`)** en la URL de las peticiones HTTP (`GET`, `POST`, `PATCH`, `PUT`, `DELETE`).
3. **Pasar `companyId` en el contexto de `apiFetch`** (`{ token, companyId }`) para inyectar `X-Company-Id`.
4. **Para peticiones `POST` / `PATCH` / `PUT` / `DELETE`**, adjuntar también `company_id` en el body JSON si el endpoint lo requiere.

### Ejemplo de Implementación en Servicio:

```typescript
import { apiFetch, EXAMPLE_URL } from "@repo/erp-api-client";

export const exampleEntityService = {
    async getAll(token: string, companyId?: string): Promise<IFListV2<IFEntity>> {
        const url = companyId
            ? `${EXAMPLE_URL}?company_id=${encodeURIComponent(companyId)}`
            : EXAMPLE_URL;

        return apiFetch(
            url,
            { method: "GET" },
            "No se pudieron obtener los registros",
            { token, companyId }
        );
    },

    async create(data: IFEntityCreate, token: string, companyId?: string): Promise<any> {
        const mappedData = mapEntityToCreate(data);
        const targetCompanyId = companyId || data.companyId;
        const payload = targetCompanyId
            ? { ...mappedData, company_id: targetCompanyId }
            : mappedData;
        const url = targetCompanyId
            ? `${EXAMPLE_URL}?company_id=${encodeURIComponent(targetCompanyId)}`
            : EXAMPLE_URL;

        return apiFetch(
            url,
            { method: "POST", body: JSON.stringify(payload) },
            "No se pudo crear el registro",
            { token, companyId: targetCompanyId }
        );
    },

    async delete(id: string, token: string, companyId?: string): Promise<any> {
        const url = companyId
            ? `${EXAMPLE_URL}/${id}?company_id=${encodeURIComponent(companyId)}`
            : `${EXAMPLE_URL}/${id}`;

        return apiFetch(
            url,
            {
                method: "DELETE",
                ...(companyId ? { body: JSON.stringify({ company_id: companyId }) } : {}),
            },
            "No se pudo eliminar el registro",
            { token, companyId }
        );
    },
};
```

---

## 2. Patrón en Componentes React / Hooks (Client Side)

En todos los componentes React (`*Client.tsx`, modales, formularios, hooks):

1. **Obtener la compañía activa desde `useAuth()`**:
   ```typescript
   const { token, currentCompany } = useAuth();
   ```
2. **Pasar `currentCompany?.id`** al invocar cualquiera de los métodos del servicio:
   ```typescript
   // En CustomStore o useEffect (Load):
   const response = await exampleEntityService.getAll(token, currentCompany?.id);

   // En Handlers de eliminación/edición/creación:
   await exampleEntityService.delete(id, token, currentCompany?.id);
   await exampleEntityService.create(formData, token, currentCompany?.id);
   await exampleEntityService.update(id, updateData, token, currentCompany?.id);
   ```
3. **Incluir `currentCompany?.id` en las dependencias de `useMemo` o `useEffect`**:
   ```typescript
   const dataSource = useMemo(() => {
       return new CustomStore({
           key: 'id',
           load: async () => {
               const response = await exampleEntityService.getAll(token, currentCompany?.id);
               return { data: response.items, totalCount: response.metadata.totalItems };
           }
       });
   }, [refreshVersion, token, currentCompany?.id]);
   ```

---

## 3. Checklist de Verificación para Agentes

Cuando ocurra un error de `company_id`:
- [ ] ¿El método del servicio acepta el parámetro `companyId`?
- [ ] ¿La URL de la petición incluye `?company_id=${companyId}`?
- [ ] ¿Se pasa `{ token, companyId }` al contexto de `apiFetch`?
- [ ] ¿El componente consumidor extrae `currentCompany` de `useAuth()`?
- [ ] ¿El componente pasa `currentCompany?.id` a la llamada del servicio?
- [ ] ¿El arreglo de dependencias (`useMemo` / `useEffect`) incluye `currentCompany?.id`?
