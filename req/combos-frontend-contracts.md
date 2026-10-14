---
last_modified: 2026-10-14
---

# Combos — handoff FE (compacto)

ABM de productos tipo **COMBO** (kits/packs). Prefijo: `/api/v1`. Auth Bearer (o API Key).

> No es combobox `/options` ni “combos pricing” comerciales.  
> `.guide/` está en `.gitignore` (uso local / agente FE).

---

## 1. Entidades

```
Product (classification='COMBO')
  └── Item (composition_data JSONB)   ← estructura del kit
        └── refs → otros Item (UUID, misma company)
```

No hay tablas BOM. La composición vive en `common.item.composition_data`.

| Entidad | Tabla | Rol en ABM |
|---------|-------|------------|
| `Product` | `common.product` | Cabecera: `classification=COMBO`, `procurement_type` (recomendado `BUY`) |
| `Item` | `common.item` | SKU del pack + `composition_data` (FIXED / DYNAMIC) |
| `ProductClassification` | `common.product_classification` | Catálogo por compañía; code a enviar: **`COMBO`** |
| Componente | `common.item` | Ítems existentes referenciados por UUID en la composición |

Códigos de clasificación reales: `MP` · `SE` · `PRODUCTO` · `COMBO` · `ENVASE` · `SERVICIO`  
(Usar `code` de `GET /products/classifications`, no el `name`.)

---

## 2. Permisos (scopes)

| Acción | Scope |
|--------|-------|
| Listar / get producto, classifications, options producto | `products:products:read` |
| Crear / patch / delete producto | `products:products:write` |
| Listar / get ítem, options ítem | `products:items:read` |
| Crear / patch / delete ítem (+ `composition_data`) | `products:items:write` |
| Presentaciones (si el wizard usa `/full`) | `products:presentations:read` / `write` |
| `POST/PATCH .../full` | `products:products:write` + `products:items:write` + `products:presentations:write` (+ procurement read si el endpoint lo exige) |

UI: ocultar escritura si falta scope; manejar `403`.

---

## 3. Endpoints (mínimo ABM)

Base: `/products`

### Cabecera producto
| Método | Path | Scope | Notas |
|--------|------|-------|-------|
| `GET` | `/products/classifications?company_id?` | products:read | Array `{ id, company_id, code, name, active }` |
| `GET` | `/products/options` | products:read | Combobox productos |
| `POST` | `/products/` | products:write | Alta cabecera COMBO |
| `GET` | `/products/{id}` | products:read | Cabecera (sin composition) |
| `PATCH` | `/products/{id}` | products:write | Patch cabecera |
| `DELETE` | `/products/{id}` | products:write | Soft delete |
| `GET` | `/products/{id}/full` | products:read | **Leer composition** (`items[].composition_data`) |
| `POST` | `/products/full?company_id=` | write trio | Persiste composition pero **no valida** combo hoy |
| `PATCH` | `/products/{id}/full` | write trio | Idem |

### Ítem + composición
| Método | Path | Scope | Notas |
|--------|------|-------|-------|
| `GET` | `/products/items/options?product_id?&q&limit&offset&company_id?` | items:read | Selector de componentes |
| `POST` | `/products/item` (alias `/products/items`) | items:write | Alta con validación **completa** de combo |
| `PATCH` | `/products/item/{id}` (alias `/items/{id}`) | items:write | Update `composition_data` (estructura sí; FKs no revalidadas del todo) |
| `GET` | `/products/item/{id}` | items:read | **No** trae `composition_data` → usar `/full` |
| `DELETE` | `/products/items/{id}` | items:write | Soft delete |

### Flujo recomendado (guardar seguro)
1. Componentes ya existen → `GET .../items/options`
2. `POST /products/` `{ classification: "COMBO", procurement_type: "BUY", ... }`
3. `POST /products/item` con `composition_data`
4. Lectura/edición UI: `GET /products/{id}/full` → editar con `PATCH /products/item/{id}`

---

## 4. Tipos (contrato FE)

```ts
type ProcurementType = "BUY" | "MANUFACTURE" | "BOTH";
type ComboType = "FIXED" | "DYNAMIC";

type ComboComponent = {
  item_id: string;   // UUID de common.item
  quantity: number;  // > 0
};

type DynamicSelection = {
  label: string;
  min_qty: number;   // int >= 0
  max_qty: number;   // >= min_qty
  allowed_item_ids: string[]; // UUIDs, no vacío
};

type CompositionData = {
  combo_type: ComboType;
  fixed_components?: ComboComponent[];     // req si FIXED; opcional si DYNAMIC
  dynamic_selection?: DynamicSelection;    // req si DYNAMIC
};

type ProductClassification = {
  id: string;
  company_id: string;
  code: string;   // usar este en create → "COMBO"
  name: string;
  active: boolean;
};

type ComboProductCreate = {
  name: string;
  classification: "COMBO";
  procurement_type?: ProcurementType; // default BUY
  sku_prefix: string;
  uom_id: string;
  sale_billing_mode_code?: string;     // ej. "by_unit"
  sale_billing_mode_id?: string;
  company_id: string;
  category_id?: string | null;
  brand_id?: string | null;
  currency_id?: string | null;
  active?: boolean;
};

type ComboItemCreate = {
  product_id: string;
  sku: string;
  company_id: string;
  item_name?: string | null;
  composition_data: CompositionData;   // obligatorio si product es COMBO
  cost_method?: string;
  is_inventory_item?: boolean | null;
  weight?: number;
  volume?: number;
  attributes?: Record<string, unknown>;
  active?: boolean;
};

type ComboItemUpdate = Partial<Omit<ComboItemCreate, "product_id" | "company_id">> & {
  composition_data?: CompositionData | null; // evitar null en COMBO
};

// En GET /products/{id}/full → items[] incluye:
// composition_data: CompositionData | null
```

### Payloads mínimos

```json
// POST /products/
{
  "name": "Pack Desayuno Premium",
  "classification": "COMBO",
  "procurement_type": "BUY",
  "sku_prefix": "PACK-DESAYUNO-",
  "uom_id": "<uuid-uom>",
  "sale_billing_mode_code": "by_unit",
  "company_id": "<uuid-company>"
}
```

```json
// POST /products/item  (FIXED)
{
  "product_id": "<uuid-combo>",
  "sku": "PACK-DESAYUNO-001",
  "company_id": "<uuid-company>",
  "composition_data": {
    "combo_type": "FIXED",
    "fixed_components": [
      { "item_id": "<uuid-comp-1>", "quantity": 1 },
      { "item_id": "<uuid-comp-2>", "quantity": 2 }
    ]
  }
}
```

```json
// POST /products/item  (DYNAMIC + fijos opcionales)
{
  "product_id": "<uuid-combo>",
  "sku": "COMBO-PROMO-001",
  "company_id": "<uuid-company>",
  "composition_data": {
    "combo_type": "DYNAMIC",
    "fixed_components": [{ "item_id": "<uuid-caja>", "quantity": 1 }],
    "dynamic_selection": {
      "label": "Elegí 2 snacks",
      "min_qty": 2,
      "max_qty": 2,
      "allowed_item_ids": ["<uuid-a>", "<uuid-b>", "<uuid-c>"]
    }
  }
}
```

---

## 5. Errores de negocio

Shape real:

```ts
type ApiErrorDetail = { code: string; message: string };
// HTTP 400 → { detail: ApiErrorDetail }
```

| `detail.code` | Cuándo |
|---------------|--------|
| `COMPOSITION_REQUIRED` | Producto COMBO sin `composition_data` en create ítem |
| `INVALID_COMPOSITION_STRUCTURE` | JSON inválido (tipo, qty, min/max, etc.) |
| `INVALID_COMBO_COMPONENT` | `item_id` inexistente o de otra company |

También: `401` sesión · `403` scope · `404` no encontrado / otra company · `422` schema.

Reglas cliente útiles: UUIDs válidos; `quantity > 0`; DYNAMIC → `max_qty >= min_qty`; componentes misma compañía; no vaciar `composition_data` en COMBO.

---

## 6. Servicios sugeridos (FE)

```
listProductClassifications(companyId?)
createComboProduct(body: ComboProductCreate)
getProduct(id)
getProductFull(id)                    // lectura composition
patchProduct(id, body)
deleteProduct(id)

listItemOptions({ companyId?, productId?, q?, limit?, offset? })
createComboItem(body: ComboItemCreate) // preferir para alta
patchComboItem(id, body: ComboItemUpdate)
deleteItem(id)
```

Checklist UI: clasificaciones → alta producto COMBO → selector componentes (`/items/options`) → editor FIXED/DYNAMIC → `POST item` → refrescar con `GET .../full`.

---

## 7. Fuera de alcance / gaps

- Explosión a pedido / WMS / disponibilidad MCM: no implementado.
- Pricing de packs / 2x1: otro dominio (`gaps_comercial.md`).
- `GET /item/{id}` no expone composition → siempre `/full` para lectura.
- `/products/.../full` no corre validadores de combo → no depender solo de full para guardar.
- Seed demo con JSON legacy (`tipo_item`, SKUs): **no** usar como contrato.

Referencia extendida: `docs/frontend/combo-guide.md` · validación: `src/logic/product_type_validation.py` · ABM productos: `.guide/products-frontend-requirements.md`.
