---
name: project-file-structure
description: Reglas y convenciones de estructura de archivos del proyecto ERP-Frontend. Obligatorio seguir para mantener la consistencia.
---

# Estructura del Proyecto ERP-Frontend

Cuando trabajes en este proyecto, debes respetar estrictamente la siguiente estructura de directorios y archivos. Esta arquitectura fue diseñada para separar la capa de red, la capa de acciones (Server Actions de Next.js), las interfaces y la interfaz de usuario.

## 📂 `src/app/`
Esta carpeta contiene el enrutador de Next.js (App Router) y la lógica de negocio específica de la aplicación.

*   `src/app/(account)/`: Rutas relacionadas con la cuenta, como `/login`.
*   `src/app/(home)/`: Módulos principales del ERP a los que se accede una vez autenticado (ej. `accounting`, `products`, `sales`, `stock`, `users`, `warehouses`, etc.).
    *   **Componentes de Dominio:** Cada página/módulo tiene su propia carpeta de `components/`.
    *   **Modales y Acciones UI:** Dentro de esa carpeta de componentes, debe existir una carpeta `actions/` (`src/app/(home)/[modulo]/components/actions/`). Aquí es donde se definen generalmente los componentes de modales de creación, edición, eliminación o cualquier otra acción interactiva de esa vista.
*   `src/app/actions/`: Acciones de servidor (Server Actions) de Next.js (`*.actions.ts`). Actúan como intermediarios entre los componentes del cliente y los servicios.
*   `src/app/services/`: Clases o funciones de servicio (`*.service.ts`) que realizan peticiones HTTP al backend (APIs). También puede incluir carpetas específicas para agrupar servicios complejos (ej. `location_services`).
*   `src/app/types/`: Tipos de TypeScript e interfaces. Maneja las entidades espejadas entre backend y frontend:
    *   `backendTypes/`: Tipos que reflejan exactamente la estructura de los datos tal cual vienen o van hacia el backend (ej. snake_case).
    *   `frontendTypes/`: Entidades espejadas de los `backendTypes`, pero adaptadas para el uso amigable dentro de React (ej. camelCase, tipos extendidos para la UI).
    *   `mappers/`: Funciones traductoras (mappers) que convierten un `backendType` a un `frontendType` (ej. `mapAccount`) y viceversa (ej. `mapAccountToCreate`). Siempre que la API devuelva o reciba un dato, **DEBE** pasar por su respectivo mapper.

## 📂 `src/` (Raíz de código fuente)
Contiene elementos globales y reutilizables que no están atados a una ruta específica.

*   `src/components/`: Componentes de React genéricos y reutilizables en toda la aplicación (ej. `GenericDataGrid.tsx`, `GenericTabs.tsx`). Los componentes específicos de un dominio o ruta deben ir dentro de su respectiva carpeta en `src/app/(home)/.../components/`.
*   `src/contexts/`: Contextos de React (React Context API) para el manejo de estado global.
*   `src/lib/`: Utilidades genéricas, configuración de proxy (`proxy.ts`), helpers de almacenamiento local (`storage`), y utilidades diversas (`utils`, `printer`).

## 🛣️ Enrutamiento y Navegación (Routing)
Cuando agregues una nueva página o módulo dentro de `src/app/(home)/`:
1. **Generación de Rutas:** Debes ejecutar obligatoriamente el comando `npm run genroutes`.
2. **Datos Personalizados:** Debes agregar la nueva ruta al archivo `src/app/lib/routes/customData.ts`. A esta ruta se le debe asignar un ícono de DevExtreme (puedes buscar iconos relevantes usando la herramienta `dxdocs` o en la documentación de DevExtreme) y asignarle una propiedad `position` acorde para ubicarla en el menú.
3. **Archivo Auto-generado:** **NUNCA** debes modificar manualmente el archivo `src/app/lib/routes/generated-routes.ts`, ya que su contenido se sobreescribe completamente al ejecutar el generador.

## 📜 Convenciones de Nomenclatura
*   **Servicios:** `[entidad].service.ts` (ej. `accounts.service.ts`).
*   **Acciones de Servidor:** `[entidad].actions.ts` (ej. `auth.actions.ts`).
*   **Mappers:** `[entidad].mapper.ts` (ej. `accounts.mapper.ts`).
*   **Componentes Generales:** PascalCase (ej. `GenericDataGrid.tsx`).
*   **Carpetas de módulos:** camelCase o lowercase (ej. `keysManager`, `products`).

### Tipos e Interfaces (Types/Interfaces)
La nomenclatura de los tipos de TypeScript e interfaces debe seguir el patrón `[Estructura][Contexto][Nombre]`:
*   **Estructura:**
    *   `T` para definirlos usando `type`
    *   `I` para definirlos usando `interface`
*   **Contexto:**
    *   `B` si pertenece al Backend (`backendTypes`)
    *   `F` si pertenece al Frontend (`frontendTypes`)
*   **Ejemplos:**
    *   `IBList`: Interfaz del Backend (Interface + Backend + List)
    *   `IFList`: Interfaz del Frontend (Interface + Frontend + List)
    *   `TFCategories`: Tipo del Frontend (Type + Frontend + Categories)

Sigue este formato en todas tus creaciones y modificaciones para preservar la consistencia y escalabilidad del proyecto.
