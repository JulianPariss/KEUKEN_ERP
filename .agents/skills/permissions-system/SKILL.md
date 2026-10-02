---
name: permissions-system
description: Guía sobre cómo funciona el sistema de permisos y módulos de la aplicación, y los pasos para registrar nuevas rutas o acciones protegidas.
---

# Sistema de Permisos y Módulos - ERP-Frontend

Esta skill documenta el sistema de permisos del proyecto, explicando su funcionamiento, convenciones y el proceso a seguir para registrar o modificar permisos en el frontend.

## Archivos Clave del Sistema

El sistema de permisos se compone principalmente de cuatro archivos:

1. `src/app/lib/permissions/getPermissions.tsx`: Es el corazón del sistema. Define los permisos maestros, los tipos de acciones (así como las exclusividades de autoridad como `maxAuthority` y `onlyMaxAuthority`), y cómo las vistas (views) y rutas se relacionan con los permisos del backend.
2. `src/app/lib/constants/permissions.constants.ts`: Define agrupaciones o constantes que asocian llaves abstractas de modificación/vista con arreglos de `TBackendPermissionKey` definidos en `getPermissions.tsx`.
3. `src/app/lib/permissions/getModules.ts`: Define los módulos principales (ej. `products`, `wms`, `users`, etc.) a los que pertenecen las vistas.
4. `src/app/lib/utils/permission.helper.ts`: Contiene las funciones utilitarias necesarias para evaluar si un componente se debe renderizar, si una acción se puede realizar o si una ruta es accesible.

## Conceptos Core

### 1. Master Permissions (`MASTER_PERMISSIONS`)
Es un diccionario donde cada llave (ej. `products`, `users`, `warehouses`, `currencies`) representa un `TBackendPermissionKey`. 
Cada permiso maestro define un `label` y un `backendMap` que vincula las acciones (`view`, `modify`, `extract`) a los strings exactos que el backend devuelve o a una estructura de configuración detallada por autoridad.

### 2. Jerarquía de Autoridades (`TMaxAuthority`)
El sistema soporta una jerarquía implícita para roles de alta autoridad que simplifican el control de acceso en frontend:
- **Roles y Niveles**: Se definen en `AUTHORITY_HIERARCHY`:
  - `admin`: Nivel de jerarquía 1.
  - `superadmin`: Nivel de jerarquía 2.
- **Bypass Automático**: Si un usuario tiene la autoridad necesaria para una acción o vista (y no está denegado por exclusividad), los helpers le concederán acceso automáticamente (bypass) sin requerir que el usuario posea explícitamente todos los strings de permisos de backend.

### 3. Propiedades de Bypass (`maxAuthority` y `onlyMaxAuthority`)
Al configurar vistas o acciones en `backendMap` o `viewPermissionsRequireds`, puedes pasar un objeto de configuración (`IActionPermissionConfig` / `IViewPermissionConfig`):
- `keys`: El arreglo de strings de permisos backend requeridos (ej. `['common:currencies:read']`).
- `maxAuthority` (opcional): La autoridad requerida (`'admin'` o `'superadmin'`) para poder activar el bypass.
  - Si un usuario tiene un rol con jerarquía igual o superior a `maxAuthority`, tendrá acceso por bypass.
  - Si no se define `maxAuthority`, por defecto cualquier usuario con rol `admin` o `superadmin` tendrá bypass estándar para esa acción/vista.
- `onlyMaxAuthority` (opcional, boolean):
  - **`false` (o no definido)**: Bypass estándar. Si el usuario cumple con la jerarquía de `maxAuthority`, accede inmediatamente. Si no, se evalúan sus permisos textuales normales del backend (es decir, un usuario común con el permiso de backend también puede acceder).
  - **`true`**: Exclusividad de Autoridad. Solo los usuarios con un nivel de jerarquía igual o superior a `maxAuthority` pueden realizar la acción. Los permisos comunes del backend son ignorados por completo.

### 4. Acciones (`TPermissionAction`)
Las acciones permitidas por defecto son:
- `view`: Ver o leer información.
- `modify`: Crear, editar o eliminar información.
- `extract`: Exportar o extraer información.

### 5. Vistas (`TViewPermissionKey`)
Agrupan diferentes módulos o dominios para una pantalla. Por ejemplo, `productosView` agrupa permisos de `products`, `items`, `presentations`, `categories`, `uoms` y `brands`. 
Se definen en `viewPermissionsRequireds`.

### 6. Rutas (`ROUTE_VIEW_MAP`)
Asocia una ruta del sistema (ej. `/products`) con un `TViewPermissionKey` (ej. `productosView`). Esto sirve para bloquear o permitir el acceso a las pantallas desde el sistema de enrutamiento o los guards.

### 7. Constants (`PERMISSIONS_CONSTANTS`)
Se utiliza para agrupar permisos por contextos específicos de la aplicación. Por ejemplo, `modifyProducts` requiere permisos para `products`, `items` y `presentations`.

## Funciones Auxiliares (Helpers)

El archivo `permission.helper.ts` exporta funciones cruciales que **debes utilizar** para validar permisos en la UI:

- **`canDo(action, keys, permissions)`**: Permite validar si un usuario puede realizar una acción (`view`, `modify`, `extract`) sobre uno o más `TBackendPermissionKey`. Útil para esconder botones de editar, crear o eliminar. **Evalúa de forma automática la jerarquía y bypass de autoridades.**
- **`canView(viewKey, permissions)`**: Permite validar si un usuario tiene acceso de `view` a todas las dependencias de un `TViewPermissionKey` (evaluando jerarquías y exclusividades).
- **`canRenderRoute(pathname, userPermissions, companyId)`**: Valida si el string de ruta actual es accesible por el usuario (tomando en cuenta jerarquías y si el módulo está habilitado para la compañía). Usado comúnmente en Guards o validaciones de Layout.
- **`mapPermissionsToFrontend(permissionsArray)`**: Parsea la lista de roles/permisos del usuario y devuelve un `TFPermissionsConfig`. Adjunta la lista cruda bajo la propiedad no enumerable `__rawPermissions` para que sea consumida por los helpers en runtime de manera transparente.
- **`checkPerCategory`**: Función base para comprobar accesos, incluyendo el soporte de comodines (`*`, `all`).

---

## Integración y Transmisión de Roles de Autoridad

> [!NOTE]
> Los roles `admin` y `superadmin` no se reciben por un canal o campo separado. **Llegan dentro del mismo arreglo plano de permisos (`string[]`)** que el resto de las credenciales de backend (ej. `['admin', 'common:currencies:read']`).
> 
> El sistema de permisos en `permission.helper.ts` se encarga de identificar automáticamente estos strings para construir la jerarquía en runtime y aplicar las reglas de bypass de manera transparente.

---

## Manejo de Permisos en Server Components

En Next.js Server Components, no podemos usar el hook de React `useAuth` ni el contexto. Para validar accesos en el servidor (ej. renderizar listas de rutas de primer nivel en `page.tsx` o layouts), debemos extraer los permisos de la cookie del cliente de forma segura.

### Protocolo de Extracción Segura
La cookie que guarda los permisos se llama `'permissions'`. Dado que en el cliente se serializa y codifica con URI, **debemos decodificarla y parsearla dentro de un bloque `try-catch`** para evitar fallos de compilación o crashes en el servidor si la cookie está corrupta o vacía.

```typescript
import { cookies } from "next/headers";
import { canRenderRoute } from "@/app/lib/utils/permission.helper";

export default async function HomeServerComponent() {
  const cookieStore = await cookies();
  let userPermissions: string[] = [];

  try {
    const permissionsCookie = cookieStore.get('permissions')?.value;
    if (permissionsCookie) {
      // Decodificación y parseo seguro
      userPermissions = JSON.parse(decodeURIComponent(permissionsCookie));
    }

    if (!Array.isArray(userPermissions)) {
      userPermissions = [];
    }
  } catch (error) {
    console.error("Error al leer los permisos desde la cookie en el servidor:", error);
    userPermissions = [];
  }

  // Filtrado seguro usando los helpers del sistema
  const allowedRoutes = getFirstLevelRoutes().filter(route => 
    canRenderRoute(route.path, userPermissions)
  );

  // ...
}
```

---

## Proceso para Agregar una Nueva Ruta o Módulo

Si requieres agregar una nueva sección, dominio o ruta protegida al sistema, sigue estrictamente este proceso:

### Paso 1: Definir los Permisos Maestros (si es un nuevo dominio)
En `src/app/lib/permissions/getPermissions.tsx`, agrega la nueva llave dentro de `MASTER_PERMISSIONS` mapeando los endpoints/permisos del backend.

Puedes definir el mapeo de dos formas:

#### A) Mapeo Plano (Retrocompatible)
Usa strings directos cuando no requieras exclusividades especiales (el bypass estándar de `admin` y `superadmin` operará por defecto).
```typescript
nuevoDominio: {
    label: 'Gestión de Nuevo Dominio',
    backendMap: {
        view: ['dominio:entidad:read'],
        modify: ['dominio:entidad:write'],
        extract: [] as string[],
    }
}
```

#### B) Mapeo Avanzado con Bypass y Exclusividad
Usa el objeto de configuración cuando desees limitar accesos o asociar autoridades específicas.

> [!TIP]
> **Ejemplo Real (Monedas - Currencies):**
> Para configurar la vista y modificación de monedas con exclusividad:
> - Visualización accesible por usuario común con permiso de lectura, o bypassable por `admin` en adelante (`onlyMaxAuthority: false`).
> - Modificación (Creación/Edición/Baja) accesible **únicamente** por `superadmin` (`onlyMaxAuthority: true`), bloqueando incluso a usuarios comunes que tengan el permiso de escritura del backend.
>
> ```typescript
> currencies: {
>   label: 'Monedas',
>   backendMap: {
>     view: {
>       keys: ['common:currencies:read'],
>       maxAuthority: 'admin',
>       onlyMaxAuthority: false, // Bypass estándar
>     },
>     modify: {
>       keys: ['common:currencies:write'],
>       maxAuthority: 'superadmin',
>       onlyMaxAuthority: true,  // Exclusividad estricta de jerarquía
>     },
>     extract: [] as string[]
>   }
> }
> ```

### Paso 2: Crear el View Permission (si es una nueva pantalla)
1. Agrega el nuevo key en el type `TViewPermissionKey` (ej. `currenciesView`).
2. Agrégalo en `viewPermissionsRequireds` indicando qué dependencias de backend necesita (puede ser un arreglo de dependencias plano o un objeto configurador `IViewPermissionConfig`):
```typescript
currenciesView: [
    "currencies"
]
```

### Paso 3: Mapear la Ruta a la Vista
En el objeto `ROUTE_VIEW_MAP`, asocia la ruta de frontend con tu nueva vista:
```typescript
'/providers/currencies': 'currenciesView',
```

### Paso 4: Asociar la Vista a un Módulo
En `VIEW_TO_MODULE_MAP`, asocia tu vista al módulo maestro correspondiente:
```typescript
currenciesView: 'common',
```

### Paso 5: Actualizar Constants (Opcional)
Si necesitas usar agrupadores en botones, modales o acciones aisladas, ve a `src/app/lib/constants/permissions.constants.ts` y agrega el agrupador:
```typescript
modifyCurrencies: ['currencies']
```

---

## Reglas y Convenciones Generales

> [!IMPORTANT]
> **Prohibido realizar checks manuales de roles**: Nunca escribas código en la UI, páginas de cliente o Server Components como `user?.roles?.includes('admin')` o similar para bypassar visualizaciones o botones. Toda la lógica de bypass, niveles y jerarquías es manejada automáticamente por `canDo`, `canView` y `canRenderRoute`. Esto mantiene las reglas de seguridad centralizadas en `getPermissions.tsx` y facilita auditorías y refactorizaciones.

- **Nunca quemar strings de permisos** directamente en los componentes. Siempre usar el sistema de permisos a través de constantes y helpers.
- **Mantener Typescript Seguro**: Al agregar llaves a `MASTER_PERMISSIONS`, se integran automáticamente a `TBackendPermissionKey`. Asegúrate de usar casting limpio y no romper los types derivados.
- Si una ruta agrupa múltiples permisos, **desglosarlos correctamente** en `viewPermissionsRequireds`.
