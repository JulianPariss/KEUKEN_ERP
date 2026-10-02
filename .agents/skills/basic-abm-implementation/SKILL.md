---
name: basic-abm-implementation
description: Guía y pasos obligatorios para implementar un ABM (Alta, Baja, Modificación) o CRUD básico dentro del sistema, asegurando que se respeten la arquitectura y convenciones del proyecto.
---

# Implementación de un ABM Básico

Esta skill debe ejecutarse cuando el usuario solicite la creación de una nueva página o módulo que requiera un ABM (Alta, Baja y Modificación) básico.

## 1. Requisitos Iniciales (Prompt)
Para comenzar la creación de la nueva página, se debe contar con la siguiente información suministrada en el prompt inicial:
- **Estructura del backend:** Campos, tipos de datos y relaciones de la entidad.
- **Ruta deseada:** Donde debe alojarse en el frontend.
- **Parámetros:** Cualquier otro requerimiento o parámetro relevante para el ABM.

## 2. Tipos de Datos (Types)
A partir de la estructura proporcionada para el backend, debes crear las interfaces y tipos necesarios en la carpeta `src/app/types/`:

> [!IMPORTANT]
> **Antes de crear los tipos e interfaces:** existen tipos comunes entre diferentes endpoints/servicios ya definidos. Siempre verifica si la estructura solicitada coincide o puede extender de las ya definidas en `src/app/types/backendTypes/general.types.ts` y `src/app/types/frontendTypes/general.types.ts` para evitar duplicar código.

- **Backend:** Crea los tipos del backend en `src/app/types/backendTypes/` (ej. `IB[Entidad]`, `IB[Entidad]Create`, respetando snake_case si así viene).
- **Frontend:** Crea los tipos del frontend en `src/app/types/frontendTypes/` (ej. `IF[Entidad]`, respetando camelCase).

## 3. Mappers

> [!IMPORTANT]
> **Antes de definir el mapper:** así como con los tipos, verifica si los mapeos necesarios ya se encuentran cubiertos en `src/app/types/mappers/general.mapper.ts`.

Crea los mappers básicos en `src/app/types/mappers/` para transformar la información entre los tipos de Backend y Frontend:
- Una función para mapear de Backend a Frontend (ej. `map[Entidad]`).
- Una función para mapear de Frontend a Backend en creación/edición (ej. `map[Entidad]ToCreate`).

## 4. Servicios
Crea el archivo de servicio en `src/app/services/` (o una subcarpeta correspondiente a su dominio) llamado `[entidad].service.ts`.
Este archivo debe contener los métodos básicos de CRUD (getAll, create, update, delete) llamando a la API y utilizando los mappers creados en el paso anterior.

## 5. Estructura de la Vista (Componentes y Páginas)
Debes crear un nuevo folder con el nombre de la entidad dentro de la estructura indicada. Si no hubo una estructura indicada en el prompt, por defecto se creará dentro de `src/app/(home)/`.

### Archivos Principales
Dentro de este nuevo folder (ej. `src/app/(home)/[mi_entidad]/`), debes crear la estructura básica de página:
- `page.tsx`: Server Component que expone la vista.
- `index.tsx` (o un `[entidad]Client.tsx`): Client Component con la lógica de UI, que comúnmente contiene un DataGrid (DevExtreme) y consume los servicios.
*(Usa como ejemplo la estructura de `src/app/(home)/providers/cities` para la creación del page y el grid).*

### Componentes y Acciones (Modales)
Dentro de la carpeta de la vista, crea una subcarpeta `components/actions/`.
Aquí se deben definir los modales de creación, edición y/o eliminación correspondientes a la entidad.
*(Usa como ejemplo la estructura de `src/app/(home)/accounting/components/actions/` para ver cómo estructurar estos modales).*

## 6. Generación y Configuración de Rutas
Por último, debes correr todo el procedimiento ya definido en la skill `project-file-structure` para la creación de rutas:
1. Agrega la información de la nueva ruta al archivo `src/app/lib/routes/customData.ts` (asignando un ícono y posición en el menú).
2. Ejecuta el comando de generación de rutas correspondiente (`npm run genroutes`).
