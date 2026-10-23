---
name: revalidate-contracts
description: Procedimiento y herramientas para auditar, sincronizar y revalidar contratos entre TypeScript (@repo/api-contracts) y la especificación OpenAPI backend (contracts.json).
---

# Revalidación y Auditoría de Contratos API

Skill operativa para auditar y sincronizar los tipos TypeScript del backend (`backendTypes`) contra la especificación canónica OpenAPI (`contracts.json`), gestionando discrepancias y detectando cobertura de endpoints.

---

## 1. Archivos del Sistema

- **`contracts.json`**: Especificación OpenAPI 3.1.0 canónica del backend.
- **`audit-pairs.json`**: Registro central de pares a auditar (`ts_interface` en `backendTypes` vs `backend_schema` de OpenAPI).
- **`scripts/verify_contracts.py`**: Motor de auditoría. Compara tipos, imprime el estado en consola y regenera los reportes en `results/`.
- **`scripts/scan_services.py`**: Utilidad para inspeccionar llamadas y mapeo de endpoints desde `@repo/erp-api-client` + `@repo/erp-services`.
- **`results/services-gaps.md`**: Reporte global persistente con el desglose de discrepancias de todos los modelos.
- **`results/services-unuseds.md`**: Reporte de endpoints de la API backend no consumidos por el frontend.

---

## 2. Estados y Códigos de Discrepancia

### Estados Generales
- **`[OK]`**: Modelo 100% sincronizado con OpenAPI (0 diferencias en todos los códigos).
- **`[DISCREPANCIAS]`**: Modelo con divergencias pendientes de resolución frente al backend.

### Códigos de Discrepancia
| Código | Tipo de Hallazgo | Causa | Acción Correctiva |
| :---: | :--- | :--- | :--- |
| **`[E1]`** | **Faltante en TS** | Propiedad documentada en OpenAPI ausente en la interfaz `IB*`. | Declarar el campo en `backendTypes` con su tipo y nulabilidad correspondiente. |
| **`[E2]`** | **Sobrante en TS** | Propiedad presente en la interfaz `IB*` que no existe en OpenAPI. | Eliminar de `backendTypes`. *(Nota: Evitar tipos anidados inline `{ ... }`, extraerlos como interfaces independientes para evitar falsos positivos).* |
| **`[E3]`** | **Tipo Divergente** | Mismatch en el tipo primitivo (ej: `string` vs `number`). | Ajustar el tipo en `backendTypes` para coincidir con la especificación. |
| **`[E4]`** | **Nulabilidad / Opcionalidad** | Inconsistencia entre campos requeridos/opcionales o nulos (`null`). | Ajustar el modificador `?:` y la unión `\| null` en `backendTypes`. |

---

## 3. Comandos de Ejecución

Todos los comandos se corren desde la raíz del workspace:

```bash
# Auditoría global (verifica todos los modelos y actualiza services-gaps.md y services-unuseds.md)
python apps/erp-next/.agents/skills/revalidate-contracts/scripts/verify_contracts.py

# Auditoría filtrada por dominio (ej: products, accounting, audiences)
python apps/erp-next/.agents/skills/revalidate-contracts/scripts/verify_contracts.py --domain <nombre_dominio>

# Verificación de tipos TypeScript en monorepo
pnpm --filter @repo/api-contracts exec tsc --noEmit
pnpm --filter erp-next exec tsc --noEmit
```

---

## 4. Flujo de Resolución de Discrepancias

1. **Identificar Hallazgos**:
   Ejecutar `verify_contracts.py --domain <dominio>` o consultar [`results/services-gaps.md`](./results/services-gaps.md).
2. **Actualizar `backendTypes`**:
   Editar la interfaz en `packages/api-contracts/src/erp/backendTypes/` para que refleje exactamente el schema OpenAPI (`[E1]`, `[E2]`, `[E3]`, `[E4]`).
3. **Asegurar Mappers**:
   Si cambiaron nulabilidades o campos en `backendTypes`, revisar `packages/api-contracts/src/erp/mappers/` y aplicar fallbacks seguros (`?? ""`, `?? 0`, `|| []`) para evitar excepciones en runtime.
4. **Verificar y Compilar**:
   - Re-ejecutar `verify_contracts.py --domain <dominio>` hasta obtener `[OK]`.
   - Ejecutar `tsc --noEmit` en `@repo/api-contracts` y `erp-next`.

---

## 5. Registro de Modelos (`audit-pairs.json`)

Para incluir un nuevo modelo en la auditoría, agregar una entrada en la lista `pairs`:

```json
{
  "domain": "customers",
  "label": "Clientes - Maestro",
  "ts_file": "customers.types.ts",
  "ts_interface": "IBCustomer",
  "backend_schema": "PartnerResponse",
  "service_method": "customersService.getAll",
  "endpoint": "GET /api/v1/partners/customers"
}
```
