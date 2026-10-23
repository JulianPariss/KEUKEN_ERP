---
name: migration-api-consumption
description: Guía y pasos obligatorios para migrar servicios existentes al cliente centralizado apiFetch y auditar el consumo dinámico de errores en la UI.
---

# Instructivo de Migración de Servicios a `apiFetch`

Este documento sirve como guía paso a paso para migrar cualquier servicio en `@repo/erp-services` al cliente HTTP centralizado `apiFetch` de `@repo/erp-api-client`.

## Objetivo de la Migración
Eliminar el uso directo de `fetch` y la evaluación manual de `!response.ok` en favor de `apiFetch`, el cual:
1. Inyecta automáticamente los headers (incluyendo `companyId` y tokens).
2. Procesa automáticamente los errores del backend extrayendo los mensajes nativos.
3. Deserializa automáticamente la respuesta JSON.

---

## Pasos para Migrar un Método

### 1. Actualizar las Importaciones
Reemplaza la importación de `getOperationalHeaders` por `apiFetch`. Si el servicio necesita mapear datos, mantén los mappers.

**Antes:**
```typescript
import { getOperationalHeaders } from "@repo/erp-api-client"; // legacy
```

**Después:**
```typescript
import { apiFetch } from "@repo/erp-api-client";
```

### 2. Modificar la Llamada HTTP
Localiza el bloque donde se realiza el `fetch`.

**Antes:**
```typescript
const response = await fetch(`${ENTITY_URL}?company_id=${companyId}`, {
    method: "GET",
    headers: getOperationalHeaders(token, companyId),
});

if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudieron obtener los datos`);
}

const data: IBListV2<IBEntity> = await response.json();
```

**Después:**
```typescript
const data: IBListV2<IBEntity> = await apiFetch(
    `${ENTITY_URL}?company_id=${companyId}`, // URL
    {
        method: "GET", 
        // Ya NO es necesario pasar headers, apiFetch los inyecta internamente 
        // PERO necesitamos pasarle el token y companyId a apiFetch
    },
    "No se pudieron obtener los datos", // Mensaje de fallback
    { token, companyId } // Parámetros para getOperationalHeaders
);
```

#### Firma estándar de `apiFetch`:
```typescript
apiFetch<TReturn>(
    url: string,
    options: RequestInit,
    fallbackMessage?: string,
    headerContext?: { token?: string, companyId?: string, branchId?: string, recoveryOptions?: IOperationalHeaderOptions }
)
```

### 3. Eliminar código redundante
Al usar `apiFetch`:
- **Elimina** el bloque `if (!response.ok) { ... }`.
- **Elimina** la llamada manual a `await response.json()`.
- **Elimina** la inyección manual de `headers: getOperationalHeaders(...)` dentro de `RequestInit`.

### 4. Ejemplo Completo: `getAll`

**ESTADO ANTERIOR (Legacy):**
```typescript
async getAll(token: string, companyId: string): Promise<IFListV2<IFEntity>> {
    try {
        const response = await fetch(`${API_URL}?company_id=${companyId}`, {
            method: "GET",
            headers: getOperationalHeaders(token, companyId),
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: Error al obtener registros`);
        }

        const data: IBListV2<IBEntity> = await response.json();
        return mapListV2(data);
    } catch (error) {
        console.error("Error en getAll:", error);
        throw error;
    }
}
```

**NUEVO ESTADO (Migrado):**
```typescript
async getAll(token: string, companyId: string): Promise<IFListV2<IFEntity>> {
    try {
        const data: IBListV2<IBEntity> = await apiFetch(
            `${API_URL}?company_id=${companyId}`,
            { method: "GET" },
            "Error al obtener registros",
            { token, companyId }
        );
        
        return mapListV2(data);
    } catch (error) {
        console.error("Error en getAll:", error);
        throw error;
    }
}
```

### 5. Consideraciones Especiales (Payloads POST/PATCH)
Para métodos que envían cuerpo (`body`), simplemente agrégalo al objeto `options`.

```typescript
const data: IBEntity = await apiFetch(
    API_URL,
    { 
        method: "POST",
        body: JSON.stringify(mappedData)
    },
    "Error al crear el registro",
    { token, companyId }
);
```

---

## Consumo de Excepciones en Componentes UI (Modales / Acciones / Formularios)

Al consumir servicios migrados a `apiFetch` dentro de un componente React (modales de creación/edición, vistas o Server Actions), **evita mostrar notificaciones con textos estáticos/hardcodeados**.

En su lugar, consume dinámicamente `error.message`, el cual contiene el mensaje real retornado por el backend o el fallback predeterminado generado por `apiFetch`:

### Ejemplo Práctico (Formulario Modal ej. `zoneCreation.tsx`):

**Antes (Texto hardcodeado que oculta la causa devuelta por el servidor):**
```typescript
} catch (error) {
    console.error("Error saving zone:", error);
    notify("Error al guardar la zona", "error", 3000);
}
```

**Después (Consumiendo el mensaje del helper / ApiError):**
```typescript
} catch (error: any) {
    console.error("Error saving zone:", error);
    const errorMessage = error instanceof Error && error.message 
        ? error.message 
        : "Error al guardar la zona";
    notify(errorMessage, "error", 3000);
}
```

### Inspección de Detalles Avanzados (`ApiError`)
Si el componente necesita reaccionar a códigos HTTP específicos (ej. 422 de validación o 403 sin permisos):

```typescript
import { ApiError } from "@repo/erp-api-client";

} catch (error: any) {
    console.error("Error en la operación:", error);

    if (error instanceof ApiError) {
        notify(error.message, "error", 3000);

        if (error.status === 422) {
            console.log("Detalles de validación:", error.rawDetails);
        }
    } else {
        notify(error?.message || "Ocurrió un error inesperado", "error", 3000);
    }
}
```
