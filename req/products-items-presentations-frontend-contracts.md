---
last_modified: 2026-10-14
---

# Products / Items / Presentations — handoff FE (compacto)

Contrato para **actualizar entidades TypeScript** del catálogo. Prefijo: `/api/v1`. Auth Bearer (o API Key).

> `.guide/` está en `.gitignore` (uso local / agente FE).  
> Fuente de verdad: `src/api/schemas/requests.py` + response models en `src/api/routes/products/products.py`.  
> Guía UI/pantallas extendida: `.guide/products-frontend-requirements.md`. Combos: `.guide/combos-frontend-contracts.md`.

---

## 1. Modelo

```
Product (common.product)
  └── Item / SKU (common.item)
        └── Presentation (common.item_presentation)
```

| Entidad | Tabla | Rol |
|---------|-------|-----|
| `Product` | `common.product` | Plantilla comercial (nombre, clasificación, UoM, modo venta, impuestos, handling defaults) |
| `Item` | `common.item` | Variante física / SKU (costo, dual UoM, recipe/composition, overrides handling) |
| `Presentation` | `common.item_presentation` | Máscara de venta (barcode, UoM, ratio, packaging, magnitud, fragilidad) |

Clasificaciones (`code` de `GET /products/classifications`): `MP` · `SE` · `PRODUCTO` · `COMBO` · `ENVASE` · `SERVICIO`  
(Enviar `code`, no `name`. La API también acepta alias legados y normaliza.)

---

## 2. Scopes

| Recurso | Read | Write |
|---------|------|-------|
| Producto | `products:products:read` | `products:products:write` |
| Ítem | `products:items:read` | `products:items:write` |
| Presentación | `products:presentations:read` | `products:presentations:write` |

`POST/PATCH .../full` exige el **trio** write (+ procurement read si el endpoint lo declara).

---

## 3. Endpoints núcleo

Base montaje: `/api/v1/products` (router prefix `/products`).

### 3.1 Producto

| Método | Path | Scope | Notas |
|--------|------|-------|-------|
| `GET` | `/products/` | products:read | Listado cabeceras (`limit`/`offset`/`company_id`/`include_inactive`) |
| `POST` | `/products/` | products:write | Alta solo cabecera (`company_id` en body) |
| `GET` | `/products/{product_id}` | products:read | Detalle cabecera |
| `PATCH` | `/products/{product_id}` | products:write | Patch parcial |
| `DELETE` | `/products/{product_id}` | products:write | Soft delete |
| `GET` | `/products/full` | products:read | Listado anidado (pesado; no para combos) |
| `GET` | `/products/{product_id}/full` | products:read | Snapshot ficha (ítems + presentaciones + cost/suppliers/platforms/media) |
| `POST` | `/products/full?company_id=` | write trio | Alta atómica |
| `PATCH` | `/products/{product_id}/full` | write trio | **Replace-all** del snapshot |
| `GET` | `/products/options` | products:read | Combobox |
| `GET` | `/products/classifications` | products:read | Catálogo clasificación |

### 3.2 Ítem

| Método | Path | Scope | Notas |
|--------|------|-------|-------|
| `GET` | `/products/items` | items:read | Listado |
| `GET` | `/products/items/options` | items:read | Combobox (`product_id?`, `q`, `limit`, `offset`, `company_id?`) |
| `POST` | `/products/item` | items:write | Alta (alias `POST /products/items`) |
| `GET` | `/products/item/{item_id}` | items:read | Detalle (sin `composition_data` / `recipe_data` → usar `/full`) |
| `PATCH` | `/products/item/{item_id}` | items:write | Alias `PATCH /products/items/{item_id}` |
| `DELETE` | `/products/items/{item_id}` | items:write | Soft delete |
| `GET` | `/products/item-by-sku/{sku}` | items:read | Lookup por SKU |
| `GET` | `/products/item/{item_id}/presentations` | presentations:read | Presentaciones del ítem |

### 3.3 Presentación

| Método | Path | Scope | Notas |
|--------|------|-------|-------|
| `GET` | `/products/presentations/list` | presentations:read | Listado plano paginado |
| `POST` | `/products/presentation` | presentations:write | Alta |
| `GET` | `/products/presentation/{presentation_id}` | presentations:read | Detalle |
| `PATCH` | `/products/presentation/{presentation_id}` | presentations:write | Patch |
| `DELETE` | `/products/presentations/{presentation_id}` | presentations:write | Soft delete |
| `GET` | `/products/item/by-barcode/{barcode}` | presentations:read | Lookup por barcode |
| `GET` | `/products/packaging-levels` | presentations:read | Catálogo niveles |

### 3.4 Catálogos de apoyo (misma base)

| Uso | Path |
|-----|------|
| Modos venta | `GET /products/sale-billing-modes` (+ `{id}`; write solo superadmin) |
| Marcas | `GET\|POST /products/brands`, `GET\|PATCH\|DELETE /products/brands/{brand_id}` |
| Categorías | `GET /products/categories`, `POST /products/category`, `GET\|PATCH /products/category/{id}`, `DELETE /products/categories/{id}`, `POST .../restore` |
| UoM | `GET /products/uoms`, `POST /products/uom`, `GET\|PATCH /products/uom/{id}`, `DELETE /products/uoms/{id}` |
| UoM categories | `GET /products/uom-categories`, CRUD `uom-category` |
| Utils | `GET /products/convert-uom`, `GET /products/dual-uom-preview` |

### 3.5 Rutas hermanas (otro prefix)

| Uso | Path |
|-----|------|
| Media | `/api/v1/items/{item_id}/media` (+ `/resolve`, `/reorder`, `/{media_id}`) |
| Plataformas | `/api/v1/item-commercial-platforms/items/{item_id}/platforms` |
| Handling | `/api/v1/products/handling/...`, `GET /products/{id}/handling-profile` |

---

## 4. Tipos TypeScript (contrato FE)

Snake_case estricto. Ítem/presentación: `extra=forbid` → enviar `name` en ítem = **422**.

### 4.1 Enums / aliases

```ts
type ProcurementType = "BUY" | "MANUFACTURE" | "BOTH";
type CostMethod = "standard" | "average" | "fifo" | "avco"; // API acepta estos strings
type SaleBillingModeCode = "by_unit" | "by_weight" | "by_weight_and_unit" | string;
type PackagingLevelCode = "UNIDAD" | "CAJA" | string; // ver GET packaging-levels
```

### 4.2 Product — write

```ts
/** POST /products/ (incluye company_id). En /full el company va por query/actor. */
type ProductCreate = {
  name: string;
  classification: string;          // code catálogo: PRODUCTO, MP, SE, COMBO, ENVASE, SERVICIO
  sku_prefix: string;
  uom_id: string;                  // UUID
  company_id: string;              // solo en POST /products/; omitir en payload de /full
  procurement_type?: ProcurementType | null; // default BUY
  sale_billing_mode_id?: string | null;
  sale_billing_mode_code?: SaleBillingModeCode | null; // si no hay id
  default_sec_uom_id?: string | null; // req si modo.requires_secondary_uom
  category_id?: string | null;
  brand_id?: string | null;        // UUID o code de marca
  currency_id?: string | null;     // omitido → moneda base company
  tax_ids?: string[] | null;
  active?: boolean;                // default true
  default_logistics_profile_id?: string | null;
  default_temperature_class_id?: string | null;
  default_hazard_class_id?: string | null;
  default_segregation_group_id?: string | null;
  handling_notes?: string | null;
};

/** PATCH /products/{id} — todos opcionales */
type ProductUpdate = Partial<Omit<ProductCreate, "company_id">>;
```

### 4.3 Product — read (`ProductResponse`)

```ts
type SaleBillingModeEmbed = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  is_dual_uom: boolean;
  billing_uom_category_id: string;
  billing_uom_category_name?: string | null;
  secondary_uom_category_id?: string | null;
  secondary_uom_category_name?: string | null;
  requires_secondary_uom: boolean;
  active: boolean;
};

type Product = {
  id: string;
  name: string;
  classification: string;
  classification_name?: string | null;
  /** En respuesta se llama `prefix` (no sku_prefix). */
  prefix: string;
  uom_id?: string | null;
  uom_name?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  category_parent_id?: string | null;
  category_parent_name?: string | null;
  active?: boolean | null;
  company_id?: string | null;
  brand_id?: string | null;
  brand_code?: string | null;
  brand_name?: string | null;
  currency_id?: string | null;
  currency_iso_code?: string | null;
  sale_billing_mode_id?: string | null;
  sale_billing_mode?: SaleBillingModeEmbed | null;
  default_sec_uom_id?: string | null;
  default_sec_uom_name?: string | null;
  tax_ids?: string[] | null;
  procurement_type?: ProcurementType | null;
  default_logistics_profile_id?: string | null;
  default_logistics_profile_code?: string | null;
  default_logistics_profile_name?: string | null;
  default_temperature_class_id?: string | null;
  default_temperature_class_code?: string | null;
  default_hazard_class_id?: string | null;
  default_hazard_class_code?: string | null;
  default_segregation_group_id?: string | null;
  default_segregation_group_code?: string | null;
  handling_notes?: string | null;
  // recovery (X-Recovery-Mode): deleted_at?, deleted_by_name?
};
```

### 4.4 Item — write

```ts
type ItemCreate = {
  product_id: string;
  sku: string;
  company_id?: string | null;      // omitido → se infiere del producto
  item_name?: string | null;       // NUNCA enviar `name`
  cost_method?: CostMethod | string; // default "standard"
  is_dual_uom?: boolean;           // default false
  sec_uom_id?: string | null;
  uom_ratio?: number | string | null;
  attributes?: Record<string, unknown>;
  recipe_data?: RecipeData | null;
  composition_data?: CompositionData | null; // obligatorio si product es COMBO
  weight?: number | string | null; // default 0
  volume?: number | string | null;
  pallet_units?: number | string | null;
  pallet_uom_id?: string | null;
  min_days_to_expiry_reception?: number | null;
  min_days_to_expiry_order?: number | null;
  currency_id?: string | null;
  active?: boolean;
  is_inventory_item?: boolean | null; // null = heredar (SERVICIO → false)
  requires_expiry?: boolean;       // default false
  is_serializable?: boolean;
  is_consignment_item?: boolean;
  logistics_profile_id?: string | null;
  temperature_class_id?: string | null;
  hazard_class_id?: string | null;
  segregation_group_id?: string | null;
};

type ItemUpdate = Partial<Omit<ItemCreate, "product_id" | "company_id">>;

type RecipeData = {
  production_time_minutes?: number;
  ingredients: Array<{ item_id: string; quantity: number; unit?: string }>;
};

type CompositionData = {
  combo_type: "FIXED" | "DYNAMIC";
  fixed_components?: Array<{ item_id: string; quantity: number }>;
  dynamic_selection?: {
    label: string;
    min_qty: number;
    max_qty: number;
    allowed_item_ids: string[];
  };
};
```

### 4.5 Item — read (`ItemResponse` / `ItemFullResponse`)

```ts
type ItemSupplierRead = {
  id: string;
  supplier_id: string;
  supplier_sku?: string | null;
  reference_price?: number | null;       // DEPRECATED (ADR 0012)
  last_purchase_price?: number | null;   // solo lectura
  currency_id?: string | null;
  delivery_lead_time?: number;
  priority?: number;
  active?: boolean;
};

type ItemCostInfoRead = {
  standard_price?: number | null;
  last_purchase_price?: number | null;   // solo lectura
  last_supplier_id?: string | null;
  last_purchase_date?: string | null;
  updated_at?: string | null;
  currency_id?: string | null;
};

type ItemPlatformEntry = {
  id: string;                      // id del vínculo
  commercial_platform_id: string;
  code: string;
  name: string;
  platform_active: boolean;
  include_in_default_populate?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type Item = {
  id: string;
  product_id: string;
  product_name?: string | null;
  item_name?: string | null;       // efectivo (override o herencia)
  sku: string;
  item_display_name?: string | null; // solo lectura UI
  active: boolean;
  cost_method?: string | null;
  is_dual_uom?: boolean | null;
  attributes?: Record<string, unknown> | null;
  weight?: number | null;
  volume?: number | null;
  pallet_units?: number | null;
  pallet_uom_id?: string | null;
  min_days_to_expiry_reception?: number | null;
  min_days_to_expiry_order?: number | null;
  is_inventory_item?: boolean | null;
  requires_expiry?: boolean | null;
  is_serializable?: boolean | null;
  is_consignment_item?: boolean | null;
  currency_id?: string | null;
  currency_iso_code?: string | null;
  suppliers?: ItemSupplierRead[] | null;
  logistics_profile_id?: string | null;
  logistics_profile_code?: string | null;
  temperature_class_id?: string | null;
  temperature_class_code?: string | null;
  hazard_class_id?: string | null;
  hazard_class_code?: string | null;
  segregation_group_id?: string | null;
  segregation_group_code?: string | null;
};

/** Solo en GET .../full (ItemFullResponse) */
type ItemFull = Item & {
  presentations: Presentation[];
  sec_uom_id?: string | null;
  sec_uom_name?: string | null;
  uom_ratio?: number | null;
  recipe_data?: RecipeData | null;
  composition_data?: CompositionData | null;
  cost_info?: ItemCostInfoRead | null;
  suppliers: ItemSupplierRead[];
  platforms: ItemPlatformEntry[];
  media: unknown[]; // ver .guide/item-media-frontend-contracts.md
};
```

### 4.6 Presentation — write

```ts
/** POST /products/presentation */
type PresentationCreate = {
  item_id: string;
  name: string;
  barcode?: string | null;
  uom_id: string;
  uom_ratio: number | string;
  packaging_level_id?: string | null;
  packaging_level_code?: PackagingLevelCode | null; // default UNIDAD
  is_primary?: boolean;            // default false
  active?: boolean;
  magnitude?: number | string | null;      // > 0 si se carga
  magnitude_uom_id?: string | null;
  magnitude_category_id?: string | null;
  fragility_class_id?: string | null;
};

type PresentationUpdate = Partial<Omit<PresentationCreate, "item_id">>;

/**
 * Dentro de POST /products/full → items[].presentations
 * Nota: en full create, `barcode` es string requerido por schema payload.
 */
type PresentationFullCreate = {
  name: string;
  barcode: string;
  uom_id: string;
  uom_ratio: number | string;
  packaging_level_id?: string | null;
  packaging_level_code?: PackagingLevelCode | null;
  is_primary?: boolean;
  active?: boolean;
  magnitude?: number | string | null;
  magnitude_uom_id?: string | null;
  magnitude_category_id?: string | null;
  fragility_class_id?: string | null;
};

/** Dentro de PATCH .../full */
type PresentationFullUpdate = PresentationFullCreate & {
  id?: string; // ausente = crear
};
```

### 4.7 Presentation — read (`PresentationResponse`)

```ts
type Presentation = {
  id: string;
  name: string;
  barcode?: string | null;
  uom_id?: string | null;
  uom_name?: string | null;
  ratio?: number | null;           // alias legacy de lectura
  factor?: number | null;
  uom_ratio?: number | null;
  origin_info?: string | null;
  active: boolean;
  is_primary: boolean;
  packaging_level_id?: string | null;
  packaging_level_code?: string | null;
  packaging_level_name?: string | null;
  gs1_code?: string | null;
  item_id?: string | null;
  item_sku?: string | null;
  item_name?: string | null;
  item_display_name?: string | null;
  product_id?: string | null;
  product_code?: string | null;    // sku_prefix del producto
  product_name?: string | null;
  magnitude?: number | null;
  magnitude_uom_id?: string | null;
  magnitude_uom_name?: string | null;
  magnitude_category_id?: string | null;
  magnitude_category_name?: string | null;
  fragility_class_id?: string | null;
  fragility_class_code?: string | null;
  fragility_class_name?: string | null;
};
```

### 4.8 ProductFull

```ts
type ItemCostInfoWrite = { standard_price?: number | string | null };

type ItemSupplierFullWrite = {
  id?: string;
  supplier_id: string;
  supplier_sku?: string | null;
  reference_price?: number | string; // DEPRECATED
  currency_id?: string | null;
  delivery_lead_time?: number;
  priority?: number;
  active?: boolean;
};

type ItemFullCreate = Omit<ItemCreate, "product_id" | "company_id"> & {
  presentations?: PresentationFullCreate[];
  cost_info?: ItemCostInfoWrite | null;
  suppliers?: ItemSupplierFullWrite[];
  /** omitido ≈ auto-populate; [] ≈ ninguna */
  platform_ids?: string[] | null;
};

type ProductFullCreate = {
  product: Omit<ProductCreate, "company_id">;
  items: ItemFullCreate[];
};

type ItemFullUpdate = {
  id?: string;                     // ausente = crear
  sku: string;
  item_name?: string | null;
  cost_method?: string;
  is_dual_uom?: boolean;
  sec_uom_id?: string | null;
  uom_ratio?: number | string | null;
  attributes?: Record<string, unknown> | null;
  recipe_data?: RecipeData | null;
  composition_data?: CompositionData | null;
  weight?: number | string | null;
  volume?: number | string | null;
  pallet_units?: number | string | null;
  pallet_uom_id?: string | null;
  min_days_to_expiry_reception?: number | null;
  min_days_to_expiry_order?: number | null;
  currency_id?: string | null;
  active?: boolean;
  is_inventory_item?: boolean | null;
  requires_expiry?: boolean;
  is_serializable?: boolean;
  is_consignment_item?: boolean;
  logistics_profile_id?: string | null;
  temperature_class_id?: string | null;
  hazard_class_id?: string | null;
  segregation_group_id?: string | null;
  presentations?: PresentationFullUpdate[];
  cost_info?: ItemCostInfoWrite | null;
  suppliers?: ItemSupplierFullWrite[];
  platform_ids?: string[];         // replace-all (default [])
};

type ProductFullUpdate = {
  product: ProductUpdate;
  items: ItemFullUpdate[];         // omitidos del array → soft-delete
};

type ProductFull = Product & { items: ItemFull[] };
```

### 4.9 Catálogos auxiliares (mínimo)

```ts
type ProductClassification = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  active: boolean;
};

type PackagingLevel = {
  id: string;
  code: string;
  name: string;
  gs1_code?: string | null;
  is_base: boolean;
  is_orderable: boolean;
  active: boolean;
  description?: string | null;
};

type SaleBillingMode = SaleBillingModeEmbed & {
  created_at?: string | null;
  updated_at?: string | null;
};

type PageMeta = {
  total_items: number;
  total_pages: number;
  current_page: number;
  limit: number;
  offset: number;
};

type Paginated<T> = { items: T[]; metadata: PageMeta };

type OptionItem = {
  id: string;
  code?: string | null;
  label: string;
  meta?: Record<string, string | number | boolean | null> | null;
};
```

---

## 5. Mapeo write ↔ read (trampas FE)

| Write | Read | Nota |
|-------|------|------|
| `sku_prefix` | `prefix` | Renombre en respuesta producto |
| `item_name` | `item_name` + `item_display_name` | No enviar `name` en ítem |
| `uom_ratio` (presentation) | `uom_ratio` / `ratio` / `factor` | Preferir `uom_ratio` |
| `platform_ids` (write) | `platforms` (read) | Full create: omit vs `[]` distinto |
| `cost_info.standard_price` | `cost_info.*` | `last_purchase_*` solo lectura |
| — | `composition_data` / `recipe_data` | Solo en `/full`, no en `GET /item/{id}` |

---

## 6. Semántica PATCH full

1. `GET /products/{id}/full`
2. Editar snapshot local (conservar `id` de entidades que se mantienen)
3. `PATCH /products/{id}/full` con **snapshot completo**
4. Ítems/presentaciones omitidos del array se soft-deletean

No usar `/full` como patch parcial de un campo.

---

## 7. Errores útiles

```ts
type ApiErrorDetail = { code?: string; message: string; reasons?: unknown; used_by?: unknown };
// 400/409 → { detail: ApiErrorDetail | string | array }
```

| HTTP | Uso |
|------|-----|
| 400 | Negocio (modo/UoM, classification, composition, magnitude) |
| 403 | Scope |
| 404 | No encontrado / otra company |
| 409 | En uso (categoría, UoM, presentación referenciada) |
| 422 | Schema / `extra=forbid` / UUID inválido |

---

## 8. Checklist actualización entidades FE

- [ ] `Product` read con `prefix` (no solo `sku_prefix`)
- [ ] `Product` write con handling defaults + `tax_ids` + `procurement_type`
- [ ] `Item` write: `item_name`, flags WMS (`requires_expiry`, `is_serializable`, `is_consignment_item`, `is_inventory_item`)
- [ ] `Item` forbid `name`
- [ ] `Presentation` con packaging + magnitude trio + `fragility_class_id` + `is_primary`
- [ ] `ProductFull` / `ItemFull` con `cost_info`, `suppliers`, `platform_ids`/`platforms`, `media`
- [ ] Separar tipos create granular vs full (barcode requerido en full create payload)
- [ ] Options tipados con `OptionItem`; no cargar `/full` para selects

Referencia código: `ProductCreateRequest` / `ItemCreateRequest` / `PresentationCreateRequest` / `ProductFullCreateRequest` en `src/api/schemas/requests.py`; responses en `src/api/routes/products/products.py`.
