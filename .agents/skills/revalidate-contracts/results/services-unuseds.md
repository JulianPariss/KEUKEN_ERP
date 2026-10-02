# Reporte de Endpoints Backend No Consumidos en Frontend (Unused Services)

- **Fecha de Generación:** 2026-09-30 18:14:24
- **Especificación OpenAPI (Backend):** `C:\Users\julia\Desktop\Proyectos\KEUKEN_UWS\apps\erp-next\.agents\skills\revalidate-contracts\contracts.json`
- **Mapeo Frontend (Pares Auditados):** `C:\Users\julia\Desktop\Proyectos\KEUKEN_UWS\apps\erp-next\.agents\skills\revalidate-contracts\audit-pairs.json`

---

## 1. Resumen Ejecutivo de Cobertura de API

| Métrica | Valor |
| :--- | :---: |
| **Total Endpoints en Backend (OpenAPI)** | **608** |
| **Endpoints Mapeados/Consumidos en Frontend** | **186** |
| **Endpoints Backend No Consumidos (`unused`)** | **439** |
| **Cobertura de Consumo en Frontend** | **30.59%** |

---

## 2. Resumen de Endpoints No Consumidos por Módulo / Categoría

| Módulo / Categoría Funcional | Cantidad de Endpoints |
| :--- | :---: |
| Productos - Handling | **27** |
| Entidades - Catálogos | **20** |
| WMS - Transferencias | **18** |
| Comercial - Pedidos de Venta | **18** |
| Contabilidad - Motor de posteo | **16** |
| WMS - Putaway ABC | **13** |
| Contabilidad - Activos fijos | **13** |
| WMS - Devoluciones y Mermas | **10** |
| Contabilidad - Inflación / RECPAM | **10** |
| Comercial - Equipos de venta | **10** |
| Entidades - Clientes | **10** |
| Metadata | **10** |
| Contabilidad - Asientos y valoración | **8** |
| Comercial - Audiencias clientes | **8** |
| Comercial - Audiencias ítems | **8** |
| WMS - Master (Ubicaciones) | **7** |
| WMS - Flujo áreas | **7** |
| Abastecimiento | **7** |
| Comprobantes - Documentos | **7** |
| Comprobantes - Workflow | **7** |
| Comercial - Listas de precios | **7** |
| Entidades - Proveedores | **7** |
| Usuarios | **6** |
| Catálogo - Publicación en plataformas | **6** |
| Catálogo - Multimedia por ítem | **6** |
| Storage - Carpeta de usuario | **6** |
| WMS - Master (Lotes) | **5** |
| WMS - Master (Putaway) | **5** |
| WMS - Consignación | **5** |
| WMS - Serial Numbers | **5** |
| WMS - Packages | **5** |
| WMS - Olas de Trabajo | **5** |
| Productos - Productos | **5** |
| Pagos - Cajas y Rendiciones | **5** |
| Contabilidad - Reportes | **5** |
| Distribución - Rutas | **5** |
| Emisión - Config | **5** |
| Configuración - Sistema | **4** |
| Productos - Ítems | **4** |
| Productos - UoM Categorías | **4** |
| Contabilidad - Medios de pago | **4** |
| Comercial - Precios Items | **4** |
| Configuración - Monedas | **4** |
| Storage - Retention policies (deployment) | **4** |
| WMS - Stock (Listados) | **3** |
| General / Sin Categoría | **3** |
| Productos - Categorías | **3** |
| Productos - Presentaciones | **3** |
| Comprobantes - Codelists | **3** |
| Contabilidad - Plan de cuentas | **3** |
| Contabilidad - FX / Diferencia de cambio | **3** |
| Contabilidad - Cuentas Corrientes | **3** |
| Contabilidad - Asientos manuales | **3** |
| Comercial - Descuentos | **3** |
| Entidades - Options | **3** |
| Storage - Retention policies | **3** |
| Configuración - Empresas | **3** |
| Configuración - API Keys | **3** |
| Admin - Recovery / Papelera | **2** |
| WMS - Master (Ubicaciones - Masivo) | **2** |
| WMS - Stock (Operaciones) | **2** |
| Productos - Catálogos | **2** |
| Productos - Options | **2** |
| Productos - Marcas | **2** |
| Productos - UoM | **2** |
| Productos - Utilidades | **2** |
| Comprobantes - Pagos | **2** |
| Contabilidad - Asientos GL | **2** |
| Comercial - Tipos de lista | **2** |
| Comercial - Rutas de venta | **2** |
| Configuración - Zonas | **2** |
| WMS - Master (Almacenes) | **1** |
| WMS - Options | **1** |
| WMS - Inventario | **1** |
| WMS - Valuación | **1** |
| Pagos - Integración | **1** |
| Contabilidad - Impuestos | **1** |
| Contabilidad - Diarios | **1** |
| Distribución - Entregas | **1** |
| Distribución - Utilidades | **1** |
| Logística - Vehículos | **1** |
| Comercial - Options | **1** |
| Comercial - Política de precios por canal | **1** |
| Configuración - Options | **1** |
| Configuración - Establecimientos | **1** |
| Configuración - Centros Logísticos | **1** |
| Configuración - Sucursales | **1** |
| **TOTAL** | **439** |

---

## 3. Inventario Detallado de Endpoints No Consumidos

### Abastecimiento (7 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/procurement/best-supplier/{item_id}` | Get Best Supplier | `get_best_supplier_api_v1_procurement_best_supplier__item_id__get` |
| `GET` | `/api/v1/procurement/calculate-effective-cost` | Calculate Effective Cost | `calculate_effective_cost_api_v1_procurement_calculate_effective_cost_get` |
| `GET` | `/api/v1/procurement/item-supplier` | List Item Suppliers | `list_item_suppliers_api_v1_procurement_item_supplier_get` |
| `POST` | `/api/v1/procurement/item-supplier` | Create Item Supplier | `create_item_supplier_api_v1_procurement_item_supplier_post` |
| `DELETE` | `/api/v1/procurement/item-supplier/{item_supplier_id}` | Delete Item Supplier | `delete_item_supplier_api_v1_procurement_item_supplier__item_supplier_id__delete` |
| `GET` | `/api/v1/procurement/item-supplier/{item_supplier_id}` | Get Item Supplier | `get_item_supplier_api_v1_procurement_item_supplier__item_supplier_id__get` |
| `PUT` | `/api/v1/procurement/item-supplier/{item_supplier_id}` | Update Item Supplier | `update_item_supplier_api_v1_procurement_item_supplier__item_supplier_id__put` |

### Admin - Recovery / Papelera (2 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/admin/recovery/purge/run` | Purga batch con retención (scope admin:recovery:restore) | `run_purge_api_v1_admin_recovery_purge_run_post` |
| `POST` | `/api/v1/admin/recovery/{schema}/{table}/{id}/purge` | Purgar fila soft-deleted (borrado FÍSICO, irreversible) | `purge_deleted_row_api_v1_admin_recovery__schema___table___id__purge_post` |

### Catálogo - Multimedia por ítem (6 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/items/{item_id}/media` | List Item Media | `list_item_media_api_v1_items__item_id__media_get` |
| `POST` | `/api/v1/items/{item_id}/media` | Upload Item Media | `upload_item_media_api_v1_items__item_id__media_post` |
| `POST` | `/api/v1/items/{item_id}/media/reorder` | Reorder Item Media | `reorder_item_media_api_v1_items__item_id__media_reorder_post` |
| `GET` | `/api/v1/items/{item_id}/media/resolve` | Resolve Item Media | `resolve_item_media_api_v1_items__item_id__media_resolve_get` |
| `DELETE` | `/api/v1/items/{item_id}/media/{media_id}` | Delete Item Media | `delete_item_media_api_v1_items__item_id__media__media_id__delete` |
| `PATCH` | `/api/v1/items/{item_id}/media/{media_id}` | Patch Item Media | `patch_item_media_api_v1_items__item_id__media__media_id__patch` |

### Catálogo - Publicación en plataformas (6 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/item-commercial-platforms/items/{item_id}/platforms` | Lista plataformas asociadas a un ítem | `list_item_platforms_endpoint_api_v1_item_commercial_platforms_items__item_id__platforms_get` |
| `POST` | `/api/v1/item-commercial-platforms/items/{item_id}/platforms` | Reemplaza las plataformas asociadas a un ítem | `set_item_platforms_endpoint_api_v1_item_commercial_platforms_items__item_id__platforms_post` |
| `POST` | `/api/v1/item-commercial-platforms/items/{item_id}/platforms/populate` | Populate del ítem según plataformas con include_in_default_populate | `populate_item_platforms_endpoint_api_v1_item_commercial_platforms_items__item_id__platforms_populate_post` |
| `DELETE` | `/api/v1/item-commercial-platforms/items/{item_id}/platforms/{platform_id}` | Elimina la asociación ítem-plataforma (DELETE físico) | `remove_item_platform_endpoint_api_v1_item_commercial_platforms_items__item_id__platforms__platform_id__delete` |
| `POST` | `/api/v1/item-commercial-platforms/platforms/{platform_id}/items` | Reemplaza los ítems asociados a una plataforma | `set_platform_items_endpoint_api_v1_item_commercial_platforms_platforms__platform_id__items_post` |
| `POST` | `/api/v1/item-commercial-platforms/platforms/{platform_id}/items/populate` | Asocia todos los ítems de la compañía a la plataforma | `populate_platform_items_endpoint_api_v1_item_commercial_platforms_platforms__platform_id__items_populate_post` |

### Comercial - Audiencias clientes (8 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/commercial/customer-clusters/{cluster_id}` | Eliminar cluster de clientes (soft delete) | `delete_customer_cluster_api_v1_commercial_customer_clusters__cluster_id__delete` |
| `GET` | `/api/v1/commercial/customer-clusters/{cluster_id}` | Detalle de cluster de clientes | `get_customer_cluster_api_v1_commercial_customer_clusters__cluster_id__get` |
| `DELETE` | `/api/v1/commercial/customer-clusters/{cluster_id}/exclusions/{customer_id}` | Revertir exclusión de un cliente | `unexclude_customer_cluster_member_api_v1_commercial_customer_clusters__cluster_id__exclusions__customer_id__delete` |
| `POST` | `/api/v1/commercial/customer-clusters/{cluster_id}/exclusions/{customer_id}` | Excluir cliente del cluster | `exclude_customer_cluster_member_api_v1_commercial_customer_clusters__cluster_id__exclusions__customer_id__post` |
| `DELETE` | `/api/v1/commercial/customer-clusters/{cluster_id}/members` | Quitar miembros del cluster (bulk) | `delete_customer_cluster_members_bulk_api_v1_commercial_customer_clusters__cluster_id__members_delete` |
| `POST` | `/api/v1/commercial/customer-clusters/{cluster_id}/members` | Agregar miembros al cluster (bulk) | `add_customer_cluster_members_api_v1_commercial_customer_clusters__cluster_id__members_post` |
| `DELETE` | `/api/v1/commercial/customer-clusters/{cluster_id}/members/{customer_id}` | Quitar miembro del cluster | `delete_customer_cluster_member_api_v1_commercial_customer_clusters__cluster_id__members__customer_id__delete` |
| `POST` | `/api/v1/commercial/customer-clusters/{cluster_id}/snapshot` | Snapshot diario de membresía (analítica) | `snapshot_customer_cluster_endpoint_api_v1_commercial_customer_clusters__cluster_id__snapshot_post` |

### Comercial - Audiencias ítems (8 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/commercial/item-clusters/{cluster_id}` | Eliminar cluster de ítems (soft delete) | `delete_item_cluster_api_v1_commercial_item_clusters__cluster_id__delete` |
| `GET` | `/api/v1/commercial/item-clusters/{cluster_id}` | Detalle cluster de ítems | `get_item_cluster_api_v1_commercial_item_clusters__cluster_id__get` |
| `DELETE` | `/api/v1/commercial/item-clusters/{cluster_id}/exclusions/{item_id}` | Revertir exclusión de un ítem | `unexclude_item_cluster_member_api_v1_commercial_item_clusters__cluster_id__exclusions__item_id__delete` |
| `POST` | `/api/v1/commercial/item-clusters/{cluster_id}/exclusions/{item_id}` | Excluir ítem del cluster | `exclude_item_cluster_member_api_v1_commercial_item_clusters__cluster_id__exclusions__item_id__post` |
| `DELETE` | `/api/v1/commercial/item-clusters/{cluster_id}/members` | Quitar ítems del cluster (bulk) | `delete_item_cluster_members_bulk_api_v1_commercial_item_clusters__cluster_id__members_delete` |
| `POST` | `/api/v1/commercial/item-clusters/{cluster_id}/members` | Agregar ítems al cluster (bulk) | `add_item_cluster_members_api_v1_commercial_item_clusters__cluster_id__members_post` |
| `DELETE` | `/api/v1/commercial/item-clusters/{cluster_id}/members/{item_id}` | Quitar ítem del cluster | `delete_item_cluster_member_api_v1_commercial_item_clusters__cluster_id__members__item_id__delete` |
| `POST` | `/api/v1/commercial/item-clusters/{cluster_id}/refresh` | Recalcular ítems del cluster | `refresh_item_cluster_endpoint_api_v1_commercial_item_clusters__cluster_id__refresh_post` |

### Comercial - Descuentos (3 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/commercial/discount-definitions` | Listar definiciones de descuento (paginado) | `list_discount_definitions_api_v1_commercial_discount_definitions_get` |
| `POST` | `/api/v1/commercial/discount-definitions` | Create Discount Definition | `create_discount_definition_api_v1_commercial_discount_definitions_post` |
| `PATCH` | `/api/v1/commercial/discount-definitions/{definition_id}` | Patch Discount Definition | `patch_discount_definition_api_v1_commercial_discount_definitions__definition_id__patch` |

### Comercial - Equipos de venta (10 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/commercial/sales-teams` | Listar equipos de venta (paginado) | `list_sales_teams_api_v1_commercial_sales_teams_get` |
| `POST` | `/api/v1/commercial/sales-teams` | Crear equipo de venta | `create_sales_team_api_v1_commercial_sales_teams_post` |
| `GET` | `/api/v1/commercial/sales-teams/options` | Opciones livianas de equipos de venta (combobox) | `sales_teams_options_api_v1_commercial_sales_teams_options_get` |
| `GET` | `/api/v1/commercial/sales-teams/tree` | Árbol de equipos de venta | `sales_teams_tree_api_v1_commercial_sales_teams_tree_get` |
| `DELETE` | `/api/v1/commercial/sales-teams/{team_id}` | Eliminar (soft delete) equipo de venta | `delete_sales_team_api_v1_commercial_sales_teams__team_id__delete` |
| `GET` | `/api/v1/commercial/sales-teams/{team_id}` | Detalle de un equipo de venta | `get_sales_team_api_v1_commercial_sales_teams__team_id__get` |
| `PATCH` | `/api/v1/commercial/sales-teams/{team_id}` | Editar equipo de venta | `update_sales_team_api_v1_commercial_sales_teams__team_id__patch` |
| `POST` | `/api/v1/commercial/sales-teams/{team_id}/members` | Agregar o actualizar miembro del equipo | `upsert_sales_team_member_api_v1_commercial_sales_teams__team_id__members_post` |
| `DELETE` | `/api/v1/commercial/sales-teams/{team_id}/members/{user_id}` | Eliminar (soft) miembro del equipo | `delete_sales_team_member_api_v1_commercial_sales_teams__team_id__members__user_id__delete` |
| `PATCH` | `/api/v1/commercial/sales-teams/{team_id}/members/{user_id}` | Editar miembro del equipo | `update_sales_team_member_api_v1_commercial_sales_teams__team_id__members__user_id__patch` |

### Comercial - Listas de precios (7 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/commercial/price/{pricelist_id}/{item_id}` | Cotizar: precio de venta de un ítem en una lista (con márgenes) | `get_item_price_api_v1_commercial_price__pricelist_id___item_id__get` |
| `PUT` | `/api/v1/commercial/pricelist-sale-terms` | Upsert términos comerciales por producto/ítem (múltiplo de venta) | `upsert_pricelist_sale_terms_api_v1_commercial_pricelist_sale_terms_put` |
| `DELETE` | `/api/v1/commercial/pricelist-sale-terms/{terms_id}` | Eliminar términos comerciales (múltiplo) por ID | `delete_pricelist_sale_terms_api_v1_commercial_pricelist_sale_terms__terms_id__delete` |
| `DELETE` | `/api/v1/commercial/pricelists/{pricelist_id}` | Eliminar lista de precios (soft delete) | `delete_pricelist_api_v1_commercial_pricelists__pricelist_id__delete` |
| `PATCH` | `/api/v1/commercial/pricelists/{pricelist_id}` | Actualizar lista de precios (parcial) | `update_pricelist_api_v1_commercial_pricelists__pricelist_id__patch` |
| `GET` | `/api/v1/commercial/pricelists/{pricelist_id}/full` | Lista completa: cabecera + precios calculados por ítem (paginado) | `get_pricelist_full_api_v1_commercial_pricelists__pricelist_id__full_get` |
| `POST` | `/api/v1/commercial/pricelists/{pricelist_id}/recalculate` | Recalcular precios publicados de todos los ítems | `recalculate_pricelist_api_v1_commercial_pricelists__pricelist_id__recalculate_post` |

### Comercial - Options (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/commercial/pricelists/options` | Opciones livianas de listas de precios (combobox) | `list_pricelist_options_endpoint_api_v1_commercial_pricelists_options_get` |

### Comercial - Pedidos de Venta (18 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/commercial/backorders` | Cola de backorders (G5b) | `list_backorders_queue_api_v1_commercial_backorders_get` |
| `POST` | `/api/v1/commercial/backorders` | Alta manual de backorder (G5b) | `create_manual_backorder_api_v1_commercial_backorders_post` |
| `PATCH` | `/api/v1/commercial/backorders/{backorder_id}` | Actualizar promise_date/notes de backorder (G5b) | `patch_sale_order_backorder_api_v1_commercial_backorders__backorder_id__patch` |
| `POST` | `/api/v1/commercial/backorders/{backorder_id}/cancel` | Cerrar faltante (cancelar backorder G5b) | `cancel_sale_order_backorder_api_v1_commercial_backorders__backorder_id__cancel_post` |
| `PATCH` | `/api/v1/commercial/sale-orders/bulk/priority` | Actualizar prioridad de picking en varios pedidos | `bulk_patch_sale_orders_priority_api_v1_commercial_sale_orders_bulk_priority_patch` |
| `PATCH` | `/api/v1/commercial/sale-orders/{sale_order_id}` | Actualizar prioridad de picking de un pedido | `patch_sale_order_priority_api_v1_commercial_sale_orders__sale_order_id__patch` |
| `GET` | `/api/v1/commercial/sale-orders/{sale_order_id}/backorders` | Listar backorders del pedido (G5b) | `list_sale_order_backorders_api_v1_commercial_sale_orders__sale_order_id__backorders_get` |
| `POST` | `/api/v1/commercial/sale-orders/{sale_order_id}/cancel` | Cancelar pedido | `cancel_sale_order_api_v1_commercial_sale_orders__sale_order_id__cancel_post` |
| `POST` | `/api/v1/commercial/sale-orders/{sale_order_id}/confirm` | Confirmar pedido (draft/sent → sale) + PREP según circuito | `confirm_sale_order_api_v1_commercial_sale_orders__sale_order_id__confirm_post` |
| `POST` | `/api/v1/commercial/sale-orders/{sale_order_id}/generate-prep` | Generar PREP desde SO confirmado (idempotente) | `generate_prep_for_sale_order_api_v1_commercial_sale_orders__sale_order_id__generate_prep_post` |
| `PATCH` | `/api/v1/commercial/sale-orders/{sale_order_id}/header` | Actualizar cabecera de pedido (delivery_date, sucursal, zonas, condición IVA, lista) | `patch_sale_order_header_api_v1_commercial_sale_orders__sale_order_id__header_patch` |
| `POST` | `/api/v1/commercial/sale-orders/{sale_order_id}/lines` | Crear línea de pedido | `create_sale_order_line_api_v1_commercial_sale_orders__sale_order_id__lines_post` |
| `DELETE` | `/api/v1/commercial/sale-orders/{sale_order_id}/lines/{line_id}` | Eliminar línea de pedido | `delete_sale_order_line_api_v1_commercial_sale_orders__sale_order_id__lines__line_id__delete` |
| `PATCH` | `/api/v1/commercial/sale-orders/{sale_order_id}/lines/{line_id}` | Actualizar línea de pedido (parcial) | `patch_sale_order_line_api_v1_commercial_sale_orders__sale_order_id__lines__line_id__patch` |
| `GET` | `/api/v1/commercial/sale-orders/{sale_order_id}/price-options/{item_id}` | Precios del ítem en lista regular y negociables del pedido | `get_sale_order_price_options_api_v1_commercial_sale_orders__sale_order_id__price_options__item_id__get` |
| `GET` | `/api/v1/commercial/sale-orders/{sale_order_id}/pricing-context` | Contexto de precios del pedido (regular + pool negociable) | `get_sale_order_pricing_context_api_v1_commercial_sale_orders__sale_order_id__pricing_context_get` |
| `GET` | `/api/v1/sales-orders/full-data` | Listar pedidos con líneas (full-data) | `list_sale_orders_full_data_api_v1_sales_orders_full_data_get` |
| `GET` | `/api/v1/sales-orders/{sale_order_id}/details` | Detalle de un pedido con líneas | `get_sale_order_details_api_v1_sales_orders__sale_order_id__details_get` |

### Comercial - Política de precios por canal (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/commercial/pricing-channel-policies` | Listar políticas canal → lista de precios | `list_pricing_channel_policies_api_v1_commercial_pricing_channel_policies_get` |

### Comercial - Precios Items (4 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/commercial/pricelist-items` | Añadir regla de precio a una lista | `create_pricelist_item_api_v1_commercial_pricelist_items_post` |
| `PATCH` | `/api/v1/commercial/pricelist-items/bulk` | Guardado masivo de reglas de precio (transaccional) | `bulk_patch_pricelist_items_api_v1_commercial_pricelist_items_bulk_patch` |
| `DELETE` | `/api/v1/commercial/pricelist-items/{item_rule_id}` | Eliminar regla de precio | `delete_pricelist_item_api_v1_commercial_pricelist_items__item_rule_id__delete` |
| `PATCH` | `/api/v1/commercial/pricelist-items/{item_rule_id}` | Actualizar regla de precio | `update_pricelist_item_api_v1_commercial_pricelist_items__item_rule_id__patch` |

### Comercial - Rutas de venta (2 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/commercial/sales-routes/{sales_route_id}/customers` | List Sales Route Customers | `list_sales_route_customers_api_v1_commercial_sales_routes__sales_route_id__customers_get` |
| `POST` | `/api/v1/commercial/sales-routes/{sales_route_id}/customers` | Upsert Sales Route Customer | `upsert_sales_route_customer_api_v1_commercial_sales_routes__sales_route_id__customers_post` |

### Comercial - Tipos de lista (2 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/commercial/pricelist-types/{type_id}` | Eliminar tipo de lista (soft delete) | `delete_pricelist_type_api_v1_commercial_pricelist_types__type_id__delete` |
| `GET` | `/api/v1/commercial/pricelist-types/{type_id}` | Obtener tipo de lista por ID | `get_pricelist_type_api_v1_commercial_pricelist_types__type_id__get` |

### Comprobantes - Codelists (3 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/documents/codelists/document-types` | List Document Types | `list_document_types_api_v1_documents_codelists_document_types_get` |
| `GET` | `/api/v1/documents/codelists/id-types` | List Id Types | `list_id_types_api_v1_documents_codelists_id_types_get` |
| `GET` | `/api/v1/documents/codelists/unit-codes` | List Unit Codes | `list_unit_codes_api_v1_documents_codelists_unit_codes_get` |

### Comprobantes - Documentos (7 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/documents/` | Crear comprobante (factura, remito 270, NC, …) | `create_document_api_v1_documents__post` |
| `GET` | `/api/v1/documents/{document_id}` | Obtener comprobante (incluye source_links) | `get_document_api_v1_documents__document_id__get` |
| `PATCH` | `/api/v1/documents/{document_id}` | Update Document | `update_document_api_v1_documents__document_id__patch` |
| `POST` | `/api/v1/documents/{document_id}/cancel` | Cancel Document | `cancel_document_api_v1_documents__document_id__cancel_post` |
| `GET` | `/api/v1/documents/{document_id}/full` | Get Document Full | `get_document_full_api_v1_documents__document_id__full_get` |
| `POST` | `/api/v1/documents/{document_id}/payment-schedule:expand` | Generar plan de cuotas desde términos/reglas (solo ventas) | `expand_document_payment_schedule_api_v1_documents__document_id__payment_schedule_expand_post` |
| `POST` | `/api/v1/documents/{document_id}/source-links` | Agregar source_links a un documento existente | `add_document_source_links_api_v1_documents__document_id__source_links_post` |

### Comprobantes - Pagos (2 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/documents/{document_id}/payments` | Listar pagos e imputaciones de un documento | `list_payments_api_v1_documents__document_id__payments_get` |
| `POST` | `/api/v1/documents/{document_id}/payments` | Registrar un pago parcial (con imputación opcional) | `create_payment_api_v1_documents__document_id__payments_post` |

### Comprobantes - Workflow (7 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/documents/{document_id}/authorize` | Autorizar documento (CAE externo) + GL tipado (G11a) | `authorize_document_api_v1_documents__document_id__authorize_post` |
| `POST` | `/api/v1/documents/{document_id}/mark-delivered` | Marcar factura prepaid como entregada (prepaid → direct_invoice) | `mark_delivered_api_v1_documents__document_id__mark_delivered_post` |
| `POST` | `/api/v1/documents/{document_id}/mark-paid` | Marcar documento como pagado (sin registrar pagos) | `mark_paid_api_v1_documents__document_id__mark_paid_post` |
| `POST` | `/api/v1/documents/{document_id}/reject` | Reject Document | `reject_document_api_v1_documents__document_id__reject_post` |
| `POST` | `/api/v1/documents/{document_id}/request-cae` | Solicitar CAE vía Cloud Function (G11b bridge) | `request_cae_document_api_v1_documents__document_id__request_cae_post` |
| `POST` | `/api/v1/documents/{document_id}/send` | Send Document | `send_document_api_v1_documents__document_id__send_post` |
| `POST` | `/api/v1/documents/{document_id}/validate` | Validate Document | `validate_document_api_v1_documents__document_id__validate_post` |

### Configuración - API Keys (3 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/common/companies/{company_id}/api-keys` | Create Api Key | `create_api_key_api_v1_common_companies__company_id__api_keys_post` |
| `DELETE` | `/api/v1/common/companies/{company_id}/api-keys/{key_id}` | Delete Api Key | `delete_api_key_api_v1_common_companies__company_id__api_keys__key_id__delete` |
| `PATCH` | `/api/v1/common/companies/{company_id}/api-keys/{key_id}` | Patch Api Key | `patch_api_key_api_v1_common_companies__company_id__api_keys__key_id__patch` |

### Configuración - Centros Logísticos (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/common/logistics-centers/{logistics_center_id}` | Delete Logistics Center | `delete_logistics_center_api_v1_common_logistics_centers__logistics_center_id__delete` |

### Configuración - Empresas (3 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/common/companies/{company_id}` | Delete Company | `delete_company_api_v1_common_companies__company_id__delete` |
| `GET` | `/api/v1/common/companies/{company_id}` | Get Company | `get_company_api_v1_common_companies__company_id__get` |
| `PATCH` | `/api/v1/common/companies/{company_id}` | Update Company | `update_company_api_v1_common_companies__company_id__patch` |

### Configuración - Establecimientos (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/common/establishments/{establishment_id}` | Delete Establishment | `delete_establishment_api_v1_common_establishments__establishment_id__delete` |

### Configuración - Monedas (4 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/common/companies/{company_id}/currency-rates` | List Company Currency Rates | `list_company_currency_rates_api_v1_common_companies__company_id__currency_rates_get` |
| `PUT` | `/api/v1/common/companies/{company_id}/currency-rates` | Upsert Company Currency Rate | `upsert_company_currency_rate_api_v1_common_companies__company_id__currency_rates_put` |
| `DELETE` | `/api/v1/common/currencies/{currency_id}` | Delete Currency | `delete_currency_api_v1_common_currencies__currency_id__delete` |
| `GET` | `/api/v1/common/currencies/{currency_id}` | Get Currency | `get_currency_api_v1_common_currencies__currency_id__get` |

### Configuración - Options (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/common/zones/options` | Opciones livianas de zonas (combobox, sin polígonos) | `list_zone_options_endpoint_api_v1_common_zones_options_get` |

### Configuración - Sistema (4 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/system/settings/export` | Exportar todas las settings a CSV (secrets como '***') | `export_settings_api_v1_system_settings_export_get` |
| `DELETE` | `/api/v1/system/settings/{key}` | Eliminar una setting | `delete_setting_api_v1_system_settings__key__delete` |
| `GET` | `/api/v1/system/settings/{key}` | Detalle de una setting | `get_setting_detail_api_v1_system_settings__key__get` |
| `GET` | `/api/v1/system/settings/{key}/test` | Probar conectividad/validez de una setting (bucket, OSM, etc.) | `test_setting_api_v1_system_settings__key__test_get` |

### Configuración - Sucursales (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/common/branches/{branch_id}` | Delete Branch | `delete_branch_api_v1_common_branches__branch_id__delete` |

### Configuración - Zonas (2 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/common/zones/{zone_id}` | Delete Zone | `delete_zone_api_v1_common_zones__zone_id__delete` |
| `GET` | `/api/v1/common/zones/{zone_id}` | Get Zone | `get_zone_api_v1_common_zones__zone_id__get` |

### Contabilidad - Activos fijos (13 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/accounting/fixed-assets` | Listar activos fijos | `list_fixed_assets_api_v1_accounting_fixed_assets_get` |
| `POST` | `/api/v1/accounting/fixed-assets` | Registrar activo fijo (borrador) | `create_fixed_asset_api_v1_accounting_fixed_assets_post` |
| `GET` | `/api/v1/accounting/fixed-assets/categories` | Listar categorías de activos fijos | `list_fixed_asset_categories_api_v1_accounting_fixed_assets_categories_get` |
| `POST` | `/api/v1/accounting/fixed-assets/categories` | Crear categoría de activos fijos | `create_fixed_asset_category_api_v1_accounting_fixed_assets_categories_post` |
| `GET` | `/api/v1/accounting/fixed-assets/categories/{category_id}` | Detalle de categoría | `get_fixed_asset_category_api_v1_accounting_fixed_assets_categories__category_id__get` |
| `PATCH` | `/api/v1/accounting/fixed-assets/categories/{category_id}` | Actualizar categoría | `patch_fixed_asset_category_api_v1_accounting_fixed_assets_categories__category_id__patch` |
| `POST` | `/api/v1/accounting/fixed-assets/depreciations/run` | Ejecutar amortización mensual (batch) | `run_fixed_asset_depreciation_batch_api_v1_accounting_fixed_assets_depreciations_run_post` |
| `GET` | `/api/v1/accounting/fixed-assets/{asset_id}` | Detalle de activo fijo | `get_fixed_asset_api_v1_accounting_fixed_assets__asset_id__get` |
| `PATCH` | `/api/v1/accounting/fixed-assets/{asset_id}` | Actualizar activo en borrador | `patch_fixed_asset_api_v1_accounting_fixed_assets__asset_id__patch` |
| `POST` | `/api/v1/accounting/fixed-assets/{asset_id}/capitalize` | Capitalizar activo (alta contable) | `capitalize_fixed_asset_api_v1_accounting_fixed_assets__asset_id__capitalize_post` |
| `GET` | `/api/v1/accounting/fixed-assets/{asset_id}/depreciations` | Listar amortizaciones del activo | `list_fixed_asset_depreciations_api_v1_accounting_fixed_assets__asset_id__depreciations_get` |
| `POST` | `/api/v1/accounting/fixed-assets/{asset_id}/depreciations` | Registrar amortización manual | `create_fixed_asset_depreciation_api_v1_accounting_fixed_assets__asset_id__depreciations_post` |
| `POST` | `/api/v1/accounting/fixed-assets/{asset_id}/depreciations/{depreciation_id}/reverse` | Reversar amortización | `reverse_fixed_asset_depreciation_api_v1_accounting_fixed_assets__asset_id__depreciations__depreciation_id__reverse_post` |

### Contabilidad - Asientos GL (2 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/accounting/gl/entries` | Listar asientos contables (paginado) | `list_gl_entries_api_v1_accounting_gl_entries_get` |
| `GET` | `/api/v1/accounting/gl/entries/{move_id}` | Detalle de asiento (ruta canónica /gl/) | `get_gl_entry_api_v1_accounting_gl_entries__move_id__get` |

### Contabilidad - Asientos manuales (3 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/accounting/entries/{move_id}` | Obtener detalle de un asiento contable | `get_journal_entry_api_v1_accounting_entries__move_id__get` |
| `POST` | `/api/v1/accounting/entries/{move_id}/post` | Postear asiento (manual) | `post_manual_entry_api_v1_accounting_entries__move_id__post_post` |
| `POST` | `/api/v1/accounting/journals/{journal_id}/entries` | Crear asiento manual (opcionalmente postear) | `create_manual_entry_api_v1_accounting_journals__journal_id__entries_post` |

### Contabilidad - Asientos y valoración (8 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/accounting/balances/{dimension}` | Calcular saldos por dimensión | `get_balance_by_dimension_api_v1_accounting_balances__dimension__get` |
| `POST` | `/api/v1/accounting/entries/inbound` | Generar asiento contable para entrada | `generate_inbound_entry_api_v1_accounting_entries_inbound_post` |
| `POST` | `/api/v1/accounting/entries/inventory-adjustment` | Generar asiento contable para ajuste de inventario | `generate_inventory_adjustment_entry_api_v1_accounting_entries_inventory_adjustment_post` |
| `POST` | `/api/v1/accounting/entries/outbound` | Generar asiento contable para salida | `generate_outbound_entry_api_v1_accounting_entries_outbound_post` |
| `GET` | `/api/v1/accounting/mappings/products/{product_id}` | Resolver cuentas contables de producto | `resolve_product_accounts_api_v1_accounting_mappings_products__product_id__get` |
| `GET` | `/api/v1/accounting/pmp/simulate` | Simular Precio Medio Ponderado (PMP) | `simulate_pmp_api_v1_accounting_pmp_simulate_get` |
| `GET` | `/api/v1/accounting/valuation/layers/{item_id}` | Listar capas de valoración (Kardex) | `get_valuation_layers_api_v1_accounting_valuation_layers__item_id__get` |
| `GET` | `/api/v1/accounting/valuation/report/{company_id}` | Reporte de valoración de inventario | `get_valuation_report_api_v1_accounting_valuation_report__company_id__get` |

### Contabilidad - Cuentas Corrientes (3 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/accounting/current-accounts/{cc_id}/adjustments` | Registrar ajuste manual en Cuenta Corriente | `record_adjustment_api_v1_accounting_current_accounts__cc_id__adjustments_post` |
| `GET` | `/api/v1/accounting/current-accounts/{cc_id}/balance` | Consultar saldo de Cuenta Corriente | `get_cc_balance_api_v1_accounting_current_accounts__cc_id__balance_get` |
| `GET` | `/api/v1/accounting/current-accounts/{cc_id}/statement` | Resumen de cuenta (Movimientos) | `get_cc_statement_api_v1_accounting_current_accounts__cc_id__statement_get` |

### Contabilidad - Diarios (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/accounting/journals` | Listar diarios contables | `list_account_journals_api_v1_accounting_journals_get` |

### Contabilidad - FX / Diferencia de cambio (3 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/accounting/fx/company-config` | Config FX de la compañía | `get_company_fx_config_api_v1_accounting_fx_company_config_get` |
| `PATCH` | `/api/v1/accounting/fx/company-config` | Actualizar config FX | `patch_company_fx_config_api_v1_accounting_fx_company_config_patch` |
| `POST` | `/api/v1/accounting/fx/revaluations/run` | Simular o postear revalúo FX | `run_fx_revaluation_endpoint_api_v1_accounting_fx_revaluations_run_post` |

### Contabilidad - Impuestos (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/accounting/taxes/{tax_id}` | Obtener un impuesto contable | `get_account_tax_api_v1_accounting_taxes__tax_id__get` |

### Contabilidad - Inflación / RECPAM (10 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/accounting/inflation/adjustments/run` | Simular o postear ajuste por inflación (RECPAM) | `run_inflation_adjustment_endpoint_api_v1_accounting_inflation_adjustments_run_post` |
| `GET` | `/api/v1/accounting/inflation/company-config` | Config inflación/RECPAM de la compañía | `get_company_inflation_config_api_v1_accounting_inflation_company_config_get` |
| `PATCH` | `/api/v1/accounting/inflation/company-config` | Actualizar config inflación/RECPAM | `patch_company_inflation_config_api_v1_accounting_inflation_company_config_patch` |
| `GET` | `/api/v1/accounting/inflation/index-types` | Listar tipos de índice de inflación | `list_inflation_index_types_api_v1_accounting_inflation_index_types_get` |
| `POST` | `/api/v1/accounting/inflation/index-types` | Crear tipo de índice | `create_inflation_index_type_api_v1_accounting_inflation_index_types_post` |
| `GET` | `/api/v1/accounting/inflation/index-types/{index_type_id}` | Detalle tipo de índice | `get_inflation_index_type_api_v1_accounting_inflation_index_types__index_type_id__get` |
| `PATCH` | `/api/v1/accounting/inflation/index-types/{index_type_id}` | Actualizar tipo de índice | `patch_inflation_index_type_api_v1_accounting_inflation_index_types__index_type_id__patch` |
| `GET` | `/api/v1/accounting/inflation/index-types/{index_type_id}/values` | Listar coeficientes mensuales de un índice | `list_inflation_index_values_api_v1_accounting_inflation_index_types__index_type_id__values_get` |
| `POST` | `/api/v1/accounting/inflation/index-types/{index_type_id}/values` | Cargar coeficiente mensual | `create_inflation_index_value_api_v1_accounting_inflation_index_types__index_type_id__values_post` |
| `PATCH` | `/api/v1/accounting/inflation/index-values/{value_id}` | Actualizar coeficiente | `patch_inflation_index_value_api_v1_accounting_inflation_index_values__value_id__patch` |

### Contabilidad - Medios de pago (4 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/accounting/payment-methods` | Listar métodos de pago | `list_payment_methods_api_v1_accounting_payment_methods_get` |
| `POST` | `/api/v1/accounting/payment-methods` | Crear método de pago | `create_payment_method_api_v1_accounting_payment_methods_post` |
| `GET` | `/api/v1/accounting/payment-methods/{payment_method_id}` | Detalle método de pago | `get_payment_method_api_v1_accounting_payment_methods__payment_method_id__get` |
| `PATCH` | `/api/v1/accounting/payment-methods/{payment_method_id}` | Actualizar método de pago (gl_account_id, name, active, note) | `patch_payment_method_api_v1_accounting_payment_methods__payment_method_id__patch` |

### Contabilidad - Motor de posteo (16 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/accounting/document-types` | Listar tipos de comprobante contable | `list_document_types_api_v1_accounting_document_types_get` |
| `POST` | `/api/v1/accounting/document-types` | Crear tipo de comprobante contable | `create_document_type_api_v1_accounting_document_types_post` |
| `DELETE` | `/api/v1/accounting/document-types/{document_type_id}` | Borrar lógicamente un tipo de comprobante | `delete_document_type_api_v1_accounting_document_types__document_type_id__delete` |
| `GET` | `/api/v1/accounting/document-types/{document_type_id}` | Obtener tipo de comprobante | `get_document_type_api_v1_accounting_document_types__document_type_id__get` |
| `PATCH` | `/api/v1/accounting/document-types/{document_type_id}` | Actualizar tipo de comprobante (timing / regenerate) | `patch_document_type_api_v1_accounting_document_types__document_type_id__patch` |
| `GET` | `/api/v1/accounting/document-types/{document_type_id}/allowed-accounts` | Listar cuentas/ramas habilitadas | `list_allowed_accounts_api_v1_accounting_document_types__document_type_id__allowed_accounts_get` |
| `POST` | `/api/v1/accounting/document-types/{document_type_id}/allowed-accounts` | Habilitar cuenta o rama para un tipo | `create_allowed_account_api_v1_accounting_document_types__document_type_id__allowed_accounts_post` |
| `DELETE` | `/api/v1/accounting/document-types/{document_type_id}/allowed-accounts/{allowed_id}` | Quitar habilitación de cuenta/rama | `delete_allowed_account_api_v1_accounting_document_types__document_type_id__allowed_accounts__allowed_id__delete` |
| `POST` | `/api/v1/accounting/gl/entries/{move_id}/reverse` | Revertir asiento posted (espejo) | `reverse_gl_entry_api_v1_accounting_gl_entries__move_id__reverse_post` |
| `GET` | `/api/v1/accounting/move-templates` | Listar plantillas de asiento | `list_move_templates_api_v1_accounting_move_templates_get` |
| `POST` | `/api/v1/accounting/move-templates` | Crear plantilla de asiento con líneas | `create_move_template_api_v1_accounting_move_templates_post` |
| `DELETE` | `/api/v1/accounting/move-templates/{template_id}` | Borrar lógicamente una plantilla | `delete_move_template_api_v1_accounting_move_templates__template_id__delete` |
| `GET` | `/api/v1/accounting/move-templates/{template_id}` | Detalle de plantilla de asiento | `get_move_template_api_v1_accounting_move_templates__template_id__get` |
| `GET` | `/api/v1/accounting/postings` | Listar estado de posteo GL de documentos | `list_postings_api_v1_accounting_postings_get` |
| `POST` | `/api/v1/accounting/postings/documents/{document_id}/regenerate` | Regenerar asiento GL (reverse + post) | `regenerate_posting_api_v1_accounting_postings_documents__document_id__regenerate_post` |
| `POST` | `/api/v1/accounting/postings/run` | Drenar cola async de posteo GL | `run_postings_api_v1_accounting_postings_run_post` |

### Contabilidad - Plan de cuentas (3 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/accounting/gl/accounts/{account_id}` | Eliminar o deprecar cuenta contable | `delete_chart_account_api_v1_accounting_gl_accounts__account_id__delete` |
| `GET` | `/api/v1/accounting/gl/accounts/{account_id}` | Obtener una cuenta del Plan de Cuentas por id | `get_chart_account_api_v1_accounting_gl_accounts__account_id__get` |
| `GET` | `/api/v1/accounting/gl/accounts/{account_id}/references` | Referencias a una cuenta (previo a borrar) | `get_chart_account_references_api_v1_accounting_gl_accounts__account_id__references_get` |

### Contabilidad - Reportes (5 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/accounting/gl/reports/balance-sheet` | Estado de Situación Patrimonial | `get_balance_sheet_api_v1_accounting_gl_reports_balance_sheet_get` |
| `GET` | `/api/v1/accounting/gl/reports/income-statement` | Estado de Resultados (P&L) | `get_income_statement_api_v1_accounting_gl_reports_income_statement_get` |
| `GET` | `/api/v1/accounting/gl/reports/journal` | Libro Diario | `get_general_journal_api_v1_accounting_gl_reports_journal_get` |
| `GET` | `/api/v1/accounting/gl/reports/ledger` | Libro Mayor | `get_general_ledger_api_v1_accounting_gl_reports_ledger_get` |
| `GET` | `/api/v1/accounting/gl/reports/trial-balance` | Balance de Sumas y Saldos | `get_trial_balance_api_v1_accounting_gl_reports_trial_balance_get` |

### Distribución - Entregas (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/delivery/transfer/{transfer_id}/delivered` | Confirmar POD (entrega física) + soft-flip prepaid (G13) | `mark_delivered_api_v1_delivery_transfer__transfer_id__delivered_post` |

### Distribución - Rutas (5 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/delivery/routes/{route_id}` | Delete Route | `delete_route_api_v1_delivery_routes__route_id__delete` |
| `PATCH` | `/api/v1/delivery/routes/{route_id}` | Update Route | `update_route_api_v1_delivery_routes__route_id__patch` |
| `POST` | `/api/v1/delivery/routes/{route_id}/assign` | Assign To Route | `assign_to_route_api_v1_delivery_routes__route_id__assign_post` |
| `POST` | `/api/v1/delivery/routes/{route_id}/close` | Cerrar hoja de ruta (G14 ROUTE_CLOSE) | `close_route_api_v1_delivery_routes__route_id__close_post` |
| `POST` | `/api/v1/delivery/routes/{route_id}/start` | Start Route | `start_route_api_v1_delivery_routes__route_id__start_post` |

### Distribución - Utilidades (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/delivery/validate-capacity` | Validate Capacity | `validate_capacity_api_v1_delivery_validate_capacity_post` |

### Emisión - Config (5 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/issuance-config/` | Upsert issuance_config en el scope indicado | `upsert_config_api_v1_issuance_config__post` |
| `POST` | `/api/v1/issuance-config/advise-facturas` | Proponer facturas según circuito (F4) | `advise_facturas_endpoint_api_v1_issuance_config_advise_facturas_post` |
| `GET` | `/api/v1/issuance-config/amount-rules` | Listar factura_amount_rule activas de la compañía | `list_amount_rules_api_v1_issuance_config_amount_rules_get` |
| `POST` | `/api/v1/issuance-config/amount-rules` | Upsert factura_amount_rule (desactiva la activa del mismo iva_condition) | `upsert_amount_rule_api_v1_issuance_config_amount_rules_post` |
| `GET` | `/api/v1/issuance-config/resolve` | Resolver issuance_config (cascada address→customer→company) | `resolve_config_api_v1_issuance_config_resolve_get` |

### Entidades - Catálogos (20 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/partners/cities/{city_id}` | Eliminar o desactivar ciudad/localidad | `deactivate_city_api_v1_partners_cities__city_id__delete` |
| `GET` | `/api/v1/partners/cities/{city_id}` | Obtener ciudad/localidad | `get_city_api_v1_partners_cities__city_id__get` |
| `PATCH` | `/api/v1/partners/commercial-platforms/{platform_id}` | Actualizar plataforma comercial | `update_commercial_platform_api_v1_partners_commercial_platforms__platform_id__patch` |
| `DELETE` | `/api/v1/partners/countries/{country_id}` | Eliminar o desactivar país | `deactivate_country_api_v1_partners_countries__country_id__delete` |
| `GET` | `/api/v1/partners/countries/{country_id}` | Obtener país | `get_country_api_v1_partners_countries__country_id__get` |
| `DELETE` | `/api/v1/partners/payment-methods/{payment_method_id}` | Desactivar método de pago | `deactivate_payment_method_api_v1_partners_payment_methods__payment_method_id__delete` |
| `GET` | `/api/v1/partners/payment-methods/{payment_method_id}` | Obtener método de pago | `get_payment_method_api_v1_partners_payment_methods__payment_method_id__get` |
| `GET` | `/api/v1/partners/payment-term-applicability-rules` | Listar reglas de aplicabilidad | `list_applicability_rules_api_v1_partners_payment_term_applicability_rules_get` |
| `POST` | `/api/v1/partners/payment-term-applicability-rules` | Crear regla de aplicabilidad de plan | `create_applicability_rule_api_v1_partners_payment_term_applicability_rules_post` |
| `DELETE` | `/api/v1/partners/payment-term-applicability-rules/{rule_id}` | Eliminar regla de aplicabilidad | `delete_applicability_rule_api_v1_partners_payment_term_applicability_rules__rule_id__delete` |
| `PATCH` | `/api/v1/partners/payment-term-applicability-rules/{rule_id}` | Actualizar regla de aplicabilidad | `patch_applicability_rule_api_v1_partners_payment_term_applicability_rules__rule_id__patch` |
| `GET` | `/api/v1/partners/payment-terms/effective` | Vista efectiva: planes asignados + reglas (UI) | `get_payment_terms_effective_api_v1_partners_payment_terms_effective_get` |
| `POST` | `/api/v1/partners/payment-terms/resolve` | Resolver planes de pago (motor de reglas) | `resolve_payment_terms_api_v1_partners_payment_terms_resolve_post` |
| `DELETE` | `/api/v1/partners/payment-terms/{payment_term_id}` | Desactivar condición de pago | `deactivate_payment_term_api_v1_partners_payment_terms__payment_term_id__delete` |
| `GET` | `/api/v1/partners/payment-terms/{payment_term_id}` | Obtener condición de pago | `get_payment_term_api_v1_partners_payment_terms__payment_term_id__get` |
| `GET` | `/api/v1/partners/price-segments` | Listar segmentos de precio | `list_price_segments_api_v1_partners_price_segments_get` |
| `DELETE` | `/api/v1/partners/states/{state_id}` | Eliminar o desactivar estado/provincia | `deactivate_state_api_v1_partners_states__state_id__delete` |
| `GET` | `/api/v1/partners/states/{state_id}` | Obtener estado/provincia | `get_state_api_v1_partners_states__state_id__get` |
| `DELETE` | `/api/v1/partners/tax-categories/{country_tax_scheme_id}` | Desactivar categoría impositiva localizada | `deactivate_partner_tax_category_api_v1_partners_tax_categories__country_tax_scheme_id__delete` |
| `GET` | `/api/v1/partners/tax-categories/{country_tax_scheme_id}` | Obtener categoría impositiva localizada | `get_partner_tax_category_api_v1_partners_tax_categories__country_tax_scheme_id__get` |

### Entidades - Clientes (10 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/partners/customers/full` | Listar clientes completos (paginado) | `list_customers_full_api_v1_partners_customers_full_get` |
| `DELETE` | `/api/v1/partners/customers/{customer_id}` | Eliminar cliente | `delete_customer_api_v1_partners_customers__customer_id__delete` |
| `GET` | `/api/v1/partners/customers/{customer_id}/addresses` | Listar direcciones de un cliente | `list_customer_addresses_api_v1_partners_customers__customer_id__addresses_get` |
| `GET` | `/api/v1/partners/customers/{customer_id}/addresses/{address_id}/payment-terms` | Planes efectivos para sucursal (override o herencia) | `list_customer_address_payment_terms_api_v1_partners_customers__customer_id__addresses__address_id__payment_terms_get` |
| `PUT` | `/api/v1/partners/customers/{customer_id}/addresses/{address_id}/payment-terms` | Override de planes por sucursal (vacío = heredar) | `put_customer_address_payment_terms_api_v1_partners_customers__customer_id__addresses__address_id__payment_terms_put` |
| `GET` | `/api/v1/partners/customers/{customer_id}/payment-terms` | Planes de pago asignados al cliente | `list_customer_payment_terms_api_v1_partners_customers__customer_id__payment_terms_get` |
| `PUT` | `/api/v1/partners/customers/{customer_id}/payment-terms` | Reemplazar planes de pago del cliente | `put_customer_payment_terms_api_v1_partners_customers__customer_id__payment_terms_put` |
| `DELETE` | `/api/v1/partners/customers/{customer_id}/payment-terms/{payment_term_id}` | Quitar plan del cliente | `delete_customer_payment_term_item_api_v1_partners_customers__customer_id__payment_terms__payment_term_id__delete` |
| `POST` | `/api/v1/partners/customers/{customer_id}/payment-terms/{payment_term_id}` | Agregar plan al cliente | `post_customer_payment_term_item_api_v1_partners_customers__customer_id__payment_terms__payment_term_id__post` |
| `POST` | `/api/v1/partners/customers/{customer_id}/restore` | Restaurar cliente eliminado (rol dbadmin / superadmin) | `restore_customer_api_v1_partners_customers__customer_id__restore_post` |

### Entidades - Options (3 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/partners/customers/options` | Opciones livianas de clientes (combobox) | `list_customer_options_endpoint_api_v1_partners_customers_options_get` |
| `GET` | `/api/v1/partners/payment-terms/options` | Opciones livianas de condiciones de pago (combobox) | `list_payment_term_options_endpoint_api_v1_partners_payment_terms_options_get` |
| `GET` | `/api/v1/partners/suppliers/options` | Opciones livianas de proveedores (combobox) | `list_supplier_options_endpoint_api_v1_partners_suppliers_options_get` |

### Entidades - Proveedores (7 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/partners/supplier` | Create Supplier | `create_supplier_api_v1_partners_supplier_post` |
| `GET` | `/api/v1/partners/suppliers` | Listar proveedores (paginado) | `list_suppliers_api_v1_partners_suppliers_get` |
| `GET` | `/api/v1/partners/suppliers/full` | Listar proveedores completos (paginado) | `list_suppliers_full_api_v1_partners_suppliers_full_get` |
| `DELETE` | `/api/v1/partners/suppliers/{supplier_id}` | Delete Supplier | `delete_supplier_api_v1_partners_suppliers__supplier_id__delete` |
| `GET` | `/api/v1/partners/suppliers/{supplier_id}` | Get Supplier | `get_supplier_api_v1_partners_suppliers__supplier_id__get` |
| `PATCH` | `/api/v1/partners/suppliers/{supplier_id}` | Update Supplier | `update_supplier_api_v1_partners_suppliers__supplier_id__patch` |
| `GET` | `/api/v1/partners/suppliers/{supplier_id}/full` | Proveedor completo (cabecera ampliada) | `get_supplier_full_api_v1_partners_suppliers__supplier_id__full_get` |

### General / Sin Categoría (3 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/` | Root | `root__get` |
| `GET` | `/api/v1/wms/expiry-consolidated` | Get Expiry Consolidated | `get_expiry_consolidated_api_v1_wms_expiry_consolidated_get` |
| `GET` | `/api/v1/wms/stock-with-expiry-by-location` | Get Stock With Expiry By Location | `get_stock_with_expiry_by_location_api_v1_wms_stock_with_expiry_by_location_get` |

### Logística - Vehículos (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/vehicles/{vehicle_id}` | Delete Vehicle | `delete_vehicle_api_v1_vehicles__vehicle_id__delete` |

### Metadata (10 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/metadata/attributes` | Crear atributo en el catálogo | `create_metadata_attribute_api_v1_metadata_attributes_post` |
| `DELETE` | `/api/v1/metadata/attributes/{attribute_id}` | Desactivar atributo (active=false) | `delete_metadata_attribute_api_v1_metadata_attributes__attribute_id__delete` |
| `GET` | `/api/v1/metadata/attributes/{attribute_id}` | Obtener atributo por ID | `get_metadata_attribute_api_v1_metadata_attributes__attribute_id__get` |
| `PATCH` | `/api/v1/metadata/attributes/{attribute_id}` | Actualizar atributo (code inmutable) | `update_metadata_attribute_api_v1_metadata_attributes__attribute_id__patch` |
| `POST` | `/api/v1/metadata/attributes/{attribute_id}/rename` | Renombrar code con transferencia de datos | `rename_metadata_attribute_api_v1_metadata_attributes__attribute_id__rename_post` |
| `POST` | `/api/v1/metadata/groups` | Crear grupo del catálogo | `create_metadata_group_api_v1_metadata_groups_post` |
| `PATCH` | `/api/v1/metadata/groups/{group_id}` | Actualizar grupo (code inmutable) | `update_metadata_group_api_v1_metadata_groups__group_id__patch` |
| `GET` | `/api/v1/metadata/values/{entity_type}/{entity_id}` | Obtener valores metadata de una entidad | `get_metadata_values_api_v1_metadata_values__entity_type___entity_id__get` |
| `PUT` | `/api/v1/metadata/values/{entity_type}/{entity_id}` | Guardar valores metadata (batch atómico) | `put_metadata_values_api_v1_metadata_values__entity_type___entity_id__put` |
| `DELETE` | `/api/v1/metadata/values/{entity_type}/{entity_id}/{attribute_code}` | Eliminar una clave del JSONB metadata | `delete_metadata_value_api_v1_metadata_values__entity_type___entity_id___attribute_code__delete` |

### Pagos - Cajas y Rendiciones (5 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/payments/cash-registers/types` | Listar tipos de caja | `list_cash_register_types_api_v1_payments_cash_registers_types_get` |
| `DELETE` | `/api/v1/payments/cash-registers/{cash_register_id}` | Eliminar caja | `delete_cash_register_api_v1_payments_cash_registers__cash_register_id__delete` |
| `GET` | `/api/v1/payments/cash-registers/{cash_register_id}` | Obtener detalle de caja | `get_cash_register_api_v1_payments_cash_registers__cash_register_id__get` |
| `GET` | `/api/v1/payments/cash-registers/{cash_register_id}/balance` | Saldo de caja | `get_cash_register_balance_api_v1_payments_cash_registers__cash_register_id__balance_get` |
| `POST` | `/api/v1/payments/cash-registers/{cash_register_id}/settlement` | Realizar rendición de caja | `cash_register_settlement_api_v1_payments_cash_registers__cash_register_id__settlement_post` |

### Pagos - Integración (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/payments/documents/{document_id}/mark-paid` | Alias: marcar documento como pagado (mismo contrato que /documents) | `mark_document_paid_alias_api_v1_payments_documents__document_id__mark_paid_post` |

### Productos - Categorías (3 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/products/categories/{category_id}` | Delete Category | `delete_category_api_v1_products_categories__category_id__delete` |
| `GET` | `/api/v1/products/category/{category_id}` | Get Category | `get_category_api_v1_products_category__category_id__get` |
| `POST` | `/api/v1/products/category/{category_id}/restore` | Restaurar categoría de producto eliminada | `restore_category_api_v1_products_category__category_id__restore_post` |

### Productos - Catálogos (2 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/products/sale-billing-modes/{mode_id}` | Soft delete de modo de venta/facturación | `deactivate_sale_billing_mode_catalog_api_v1_products_sale_billing_modes__mode_id__delete` |
| `GET` | `/api/v1/products/sale-billing-modes/{mode_id}` | Detalle de modo de venta/facturación | `get_sale_billing_mode_catalog_api_v1_products_sale_billing_modes__mode_id__get` |

### Productos - Handling (27 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/items/{item_id}/handling-profile` | Obtener el perfil de manejo efectivo de un ítem | `get_item_handling_profile_api_v1_items__item_id__handling_profile_get` |
| `GET` | `/api/v1/presentations/{presentation_id}/handling-profile` | Obtener el perfil de manejo efectivo de una presentación | `get_presentation_handling_profile_api_v1_presentations__presentation_id__handling_profile_get` |
| `GET` | `/api/v1/products/handling/catalogs` | Listar los 4 catálogos handling de la compañía en una sola respuesta | `list_all_catalogs_api_v1_products_handling_catalogs_get` |
| `GET` | `/api/v1/products/handling/compatibility-rules` | Listar reglas de compatibilidad (fragilidad) | `list_compatibility_rules_api_v1_products_handling_compatibility_rules_get` |
| `POST` | `/api/v1/products/handling/compatibility-rules` | Alta regla de compatibilidad | `create_compatibility_rule_api_v1_products_handling_compatibility_rules_post` |
| `DELETE` | `/api/v1/products/handling/compatibility-rules/{rule_id}` | Eliminar regla de compatibilidad | `delete_compatibility_rule_api_v1_products_handling_compatibility_rules__rule_id__delete` |
| `PATCH` | `/api/v1/products/handling/compatibility-rules/{rule_id}` | Actualizar regla de compatibilidad | `patch_compatibility_rule_api_v1_products_handling_compatibility_rules__rule_id__patch` |
| `GET` | `/api/v1/products/handling/fragility-classes/options` | Opciones livianas de clases de fragilidad (combobox) | `list_fragility_class_options_api_v1_products_handling_fragility_classes_options_get` |
| `DELETE` | `/api/v1/products/handling/fragility-classes/{class_id}` | Soft delete de clase de fragilidad de envase | `delete_fragility_class_api_v1_products_handling_fragility_classes__class_id__delete` |
| `GET` | `/api/v1/products/handling/hazard-classes/options` | Opciones livianas de clases de peligro (combobox) | `list_hazard_class_options_api_v1_products_handling_hazard_classes_options_get` |
| `DELETE` | `/api/v1/products/handling/hazard-classes/{class_id}` | Soft delete de clase de peligro ADR/IATA | `delete_hazard_class_api_v1_products_handling_hazard_classes__class_id__delete` |
| `GET` | `/api/v1/products/handling/logistics-profiles` | Listar circuitos logísticos de la compañía | `list_logistics_profiles_api_v1_products_handling_logistics_profiles_get` |
| `POST` | `/api/v1/products/handling/logistics-profiles` | Crear un circuito logístico | `create_logistics_profile_api_v1_products_handling_logistics_profiles_post` |
| `GET` | `/api/v1/products/handling/logistics-profiles/options` | Opciones livianas de circuitos logísticos (combobox) | `list_logistics_profile_options_api_v1_products_handling_logistics_profiles_options_get` |
| `DELETE` | `/api/v1/products/handling/logistics-profiles/{profile_id}` | Soft delete de un circuito logístico | `delete_logistics_profile_api_v1_products_handling_logistics_profiles__profile_id__delete` |
| `PATCH` | `/api/v1/products/handling/logistics-profiles/{profile_id}` | Actualizar parcialmente un circuito logístico | `patch_logistics_profile_api_v1_products_handling_logistics_profiles__profile_id__patch` |
| `GET` | `/api/v1/products/handling/segregation-groups/options` | Opciones livianas de grupos de segregación (combobox) | `list_segregation_group_options_api_v1_products_handling_segregation_groups_options_get` |
| `DELETE` | `/api/v1/products/handling/segregation-groups/{class_id}` | Soft delete de grupo de segregación | `delete_segregation_group_api_v1_products_handling_segregation_groups__class_id__delete` |
| `GET` | `/api/v1/products/handling/segregation-rules` | Listar reglas de segregación | `list_segregation_rules_api_v1_products_handling_segregation_rules_get` |
| `POST` | `/api/v1/products/handling/segregation-rules` | Alta regla de segregación | `create_segregation_rule_api_v1_products_handling_segregation_rules_post` |
| `GET` | `/api/v1/products/handling/segregation-rules/matrix` | Matriz grupo×grupo de severidades | `segregation_rules_matrix_api_v1_products_handling_segregation_rules_matrix_get` |
| `PUT` | `/api/v1/products/handling/segregation-rules/matrix` | Upsert de celda en matriz grupo×grupo | `upsert_segregation_matrix_cell_api_v1_products_handling_segregation_rules_matrix_put` |
| `DELETE` | `/api/v1/products/handling/segregation-rules/{rule_id}` | Eliminar regla de segregación | `delete_segregation_rule_api_v1_products_handling_segregation_rules__rule_id__delete` |
| `PATCH` | `/api/v1/products/handling/segregation-rules/{rule_id}` | Actualizar regla de segregación | `patch_segregation_rule_api_v1_products_handling_segregation_rules__rule_id__patch` |
| `GET` | `/api/v1/products/handling/temperature-classes/options` | Opciones livianas de clases de temperatura (combobox) | `list_temperature_class_options_api_v1_products_handling_temperature_classes_options_get` |
| `DELETE` | `/api/v1/products/handling/temperature-classes/{class_id}` | Soft delete de clase de cadena de frío | `delete_temperature_class_api_v1_products_handling_temperature_classes__class_id__delete` |
| `GET` | `/api/v1/products/{product_id}/handling-profile` | Obtener el perfil de manejo efectivo de un producto | `get_product_handling_profile_api_v1_products__product_id__handling_profile_get` |

### Productos - Marcas (2 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/products/brands/{brand_id}` | Delete Product Brand | `delete_product_brand_api_v1_products_brands__brand_id__delete` |
| `GET` | `/api/v1/products/brands/{brand_id}` | Obtener marca por UUID o código | `get_product_brand_api_v1_products_brands__brand_id__get` |

### Productos - Options (2 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/products/items/options` | Opciones livianas de ítems/SKU (combobox) | `list_item_options_endpoint_api_v1_products_items_options_get` |
| `GET` | `/api/v1/products/options` | Opciones livianas de productos (combobox) | `list_product_options_endpoint_api_v1_products_options_get` |

### Productos - Presentaciones (3 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/products/item/by-barcode/{barcode}` | Get Presentation By Barcode | `get_presentation_by_barcode_api_v1_products_item_by_barcode__barcode__get` |
| `GET` | `/api/v1/products/presentation/{presentation_id}` | Get Presentation | `get_presentation_api_v1_products_presentation__presentation_id__get` |
| `DELETE` | `/api/v1/products/presentations/{presentation_id}` | Delete Presentation | `delete_presentation_api_v1_products_presentations__presentation_id__delete` |

### Productos - Productos (5 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/products/full` | List Products Full | `list_products_full_api_v1_products_full_get` |
| `POST` | `/api/v1/products/full` | Create Product Full | `create_product_full_api_v1_products_full_post` |
| `DELETE` | `/api/v1/products/{product_id}` | Delete Product | `delete_product_api_v1_products__product_id__delete` |
| `GET` | `/api/v1/products/{product_id}/full` | Get Product Full | `get_product_full_api_v1_products__product_id__full_get` |
| `PATCH` | `/api/v1/products/{product_id}/full` | Update Product Full | `update_product_full_api_v1_products__product_id__full_patch` |

### Productos - UoM (2 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/products/uom/{uom_id}` | Get Uom | `get_uom_api_v1_products_uom__uom_id__get` |
| `DELETE` | `/api/v1/products/uoms/{uom_id}` | Delete Uom | `delete_uom_api_v1_products_uoms__uom_id__delete` |

### Productos - UoM Categorías (4 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/products/uom-categories/{category_id}` | Delete Uom Category | `delete_uom_category_api_v1_products_uom_categories__category_id__delete` |
| `POST` | `/api/v1/products/uom-category` | Create Uom Category | `create_uom_category_api_v1_products_uom_category_post` |
| `GET` | `/api/v1/products/uom-category/{category_id}` | Get Uom Category | `get_uom_category_api_v1_products_uom_category__category_id__get` |
| `PATCH` | `/api/v1/products/uom-category/{category_id}` | Update Uom Category | `update_uom_category_api_v1_products_uom_category__category_id__patch` |

### Productos - Utilidades (2 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/products/convert-uom` | Convert Uom | `convert_uom_api_v1_products_convert_uom_get` |
| `GET` | `/api/v1/products/dual-uom-preview` | Dual Uom Preview | `dual_uom_preview_api_v1_products_dual_uom_preview_get` |

### Productos - Ítems (4 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/products/item/{item_id}` | Get Item | `get_item_api_v1_products_item__item_id__get` |
| `POST` | `/api/v1/products/items` | Create Item Plural | `create_item_plural_api_v1_products_items_post` |
| `DELETE` | `/api/v1/products/items/{item_id}` | Delete Item | `delete_item_api_v1_products_items__item_id__delete` |
| `PATCH` | `/api/v1/products/items/{item_id}` | Update Item Plural | `update_item_plural_api_v1_products_items__item_id__patch` |

### Storage - Carpeta de usuario (6 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/storage/me/documents` | Listar archivos propios | `list_my_documents_api_v1_storage_me_documents_get` |
| `POST` | `/api/v1/storage/me/documents` | Upload directo a avatar/signature/documents/saved | `upload_my_document_api_v1_storage_me_documents_post` |
| `DELETE` | `/api/v1/storage/me/documents/{document_id}` | Soft delete de un documento propio | `delete_my_document_api_v1_storage_me_documents__document_id__delete` |
| `GET` | `/api/v1/storage/me/documents/{document_id}` | Get My Document | `get_my_document_api_v1_storage_me_documents__document_id__get` |
| `GET` | `/api/v1/storage/me/documents/{document_id}/download` | Descargar binario de un documento propio | `download_my_document_api_v1_storage_me_documents__document_id__download_get` |
| `POST` | `/api/v1/storage/me/exports` | Generar export en servidor y persistirlo en users/{code}/exports/ | `export_my_document_api_v1_storage_me_exports_post` |

### Storage - Retention policies (3 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/common/companies` | Crear política de retención para la compañía (con override opcional por user) | `create_policy_api_v1_common_companies_post` |
| `DELETE` | `/api/v1/common/companies/{policy_id}` | Eliminar una política de retención | `delete_policy_api_v1_common_companies__policy_id__delete` |
| `PUT` | `/api/v1/common/companies/{policy_id}` | Editar TTL/active de una política existente | `update_policy_api_v1_common_companies__policy_id__put` |

### Storage - Retention policies (deployment) (4 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/system/storage/retention-policies` | Listar políticas globales (company_id = NULL) | `list_global_policies_api_v1_system_storage_retention_policies_get` |
| `POST` | `/api/v1/system/storage/retention-policies` | Crear política global (company_id = NULL) | `create_global_policy_api_v1_system_storage_retention_policies_post` |
| `DELETE` | `/api/v1/system/storage/retention-policies/{policy_id}` | Delete Global Policy | `delete_global_policy_api_v1_system_storage_retention_policies__policy_id__delete` |
| `PUT` | `/api/v1/system/storage/retention-policies/{policy_id}` | Update Global Policy | `update_global_policy_api_v1_system_storage_retention_policies__policy_id__put` |

### Usuarios (6 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/users/accountants` | Listar contadores | `list_accountants_api_v1_users_accountants_get` |
| `GET` | `/api/v1/users/admins` | Listar administradores | `list_admins_api_v1_users_admins_get` |
| `GET` | `/api/v1/users/drivers` | Listar conductores | `list_drivers_api_v1_users_drivers_get` |
| `GET` | `/api/v1/users/drivers/options` | Opciones livianas de conductores (combobox) | `list_drivers_options_api_v1_users_drivers_options_get` |
| `GET` | `/api/v1/users/salesmen` | Listar vendedores | `list_salesmen_api_v1_users_salesmen_get` |
| `GET` | `/api/v1/users/salesmen/options` | Opciones livianas de vendedores (combobox) | `list_salesmen_options_api_v1_users_salesmen_options_get` |

### WMS - Consignación (5 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/wms/consignments` | Listar consignaciones | `list_consignments_api_v1_wms_consignments_get` |
| `POST` | `/api/v1/wms/consignments` | Create Consignment | `create_consignment_api_v1_wms_consignments_post` |
| `POST` | `/api/v1/wms/consignments/expire` | Expire Consignments | `expire_consignments_api_v1_wms_consignments_expire_post` |
| `GET` | `/api/v1/wms/consignments/{consignment_id}` | Obtener consignación | `get_consignment_api_v1_wms_consignments__consignment_id__get` |
| `PATCH` | `/api/v1/wms/consignments/{consignment_id}/return` | Return Consignment | `return_consignment_api_v1_wms_consignments__consignment_id__return_patch` |

### WMS - Devoluciones y Mermas (10 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/returns/customer-return` | Crear devolución de cliente | `create_customer_return_api_v1_returns_customer_return_post` |
| `POST` | `/api/v1/returns/customer-return/{transfer_id}/add-line` | Añadir producto a devolución | `add_return_line_api_v1_returns_customer_return__transfer_id__add_line_post` |
| `POST` | `/api/v1/returns/inspect/{transfer_id}` | Inspeccionar devolución | `inspect_return_api_v1_returns_inspect__transfer_id__post` |
| `GET` | `/api/v1/returns/quarantine/{warehouse_id}` | Listar productos en cuarentena | `get_quarantine_items_api_v1_returns_quarantine__warehouse_id__get` |
| `GET` | `/api/v1/returns/reasons` | Listar motivos de devolución | `list_return_reasons_api_v1_returns_reasons_get` |
| `POST` | `/api/v1/returns/reasons` | Crear motivo de devolución | `create_return_reason_api_v1_returns_reasons_post` |
| `GET` | `/api/v1/returns/reasons/{reason_id}` | Obtener motivo de devolución | `get_return_reason_api_v1_returns_reasons__reason_id__get` |
| `PATCH` | `/api/v1/returns/reasons/{reason_id}` | Actualizar motivo de devolución | `update_return_reason_api_v1_returns_reasons__reason_id__patch` |
| `POST` | `/api/v1/returns/reasons/{reason_id}/deactivate` | Desactivar motivo de devolución | `deactivate_return_reason_api_v1_returns_reasons__reason_id__deactivate_post` |
| `POST` | `/api/v1/returns/scrap` | Registrar merma o producto desechado | `scrap_product_api_v1_returns_scrap_post` |

### WMS - Flujo áreas (7 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/wms/operational-profiles` | Listar perfiles operativos WMS | `list_operational_profiles_api_v1_wms_operational_profiles_get` |
| `GET` | `/api/v1/wms/warehouse-areas/{area_id}/handling-capabilities` | Obtener capabilities handling de un área | `get_area_handling_capabilities_api_v1_wms_warehouse_areas__area_id__handling_capabilities_get` |
| `PUT` | `/api/v1/wms/warehouse-areas/{area_id}/handling-capabilities` | Reemplazar capabilities handling de un área | `put_area_handling_capabilities_api_v1_wms_warehouse_areas__area_id__handling_capabilities_put` |
| `GET` | `/api/v1/wms/warehouses/{warehouse_id}/area-flow-routes` | Listar rutas de flujo de un almacén | `list_area_flow_routes_api_v1_wms_warehouses__warehouse_id__area_flow_routes_get` |
| `PUT` | `/api/v1/wms/warehouses/{warehouse_id}/area-flow-routes` | Crear o actualizar ruta de flujo | `upsert_area_flow_route_api_v1_wms_warehouses__warehouse_id__area_flow_routes_put` |
| `POST` | `/api/v1/wms/warehouses/{warehouse_id}/area-flow-routes/validate` | Validar flujo efectivo sin persistir | `validate_area_flow_route_api_v1_wms_warehouses__warehouse_id__area_flow_routes_validate_post` |
| `GET` | `/api/v1/wms/warehouses/{warehouse_id}/flow-readiness` | Checklist readiness area-flow del almacén (G7) | `warehouse_flow_readiness_api_v1_wms_warehouses__warehouse_id__flow_readiness_get` |

### WMS - Inventario (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/wms/inventory/{inventory_id}/confirm` | Confirm Inventory | `confirm_inventory_api_v1_wms_inventory__inventory_id__confirm_post` |

### WMS - Master (Almacenes) (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/wms/warehouses/{warehouse_id}` | Delete Warehouse | `delete_warehouse_api_v1_wms_warehouses__warehouse_id__delete` |

### WMS - Master (Lotes) (5 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/wms/batch/{batch_id}` | Delete Batch | `delete_batch_api_v1_wms_batch__batch_id__delete` |
| `GET` | `/api/v1/wms/batch/{batch_id}` | Get Batch | `get_batch_api_v1_wms_batch__batch_id__get` |
| `PATCH` | `/api/v1/wms/batch/{batch_id}` | Update Batch | `update_batch_api_v1_wms_batch__batch_id__patch` |
| `POST` | `/api/v1/wms/batches` | Create Batch | `create_batch_api_v1_wms_batches_post` |
| `GET` | `/api/v1/wms/batches/{item_id}` | List Batches | `list_batches_api_v1_wms_batches__item_id__get` |

### WMS - Master (Putaway) (5 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/wms/putaway-rules` | Listar reglas de putaway | `list_putaway_rules_api_v1_wms_putaway_rules_get` |
| `POST` | `/api/v1/wms/putaway-rules` | Crear regla de putaway | `create_putaway_rule_api_v1_wms_putaway_rules_post` |
| `DELETE` | `/api/v1/wms/putaway-rules/{rule_id}` | Eliminar regla de putaway | `delete_putaway_rule_api_v1_wms_putaway_rules__rule_id__delete` |
| `GET` | `/api/v1/wms/putaway-rules/{rule_id}` | Obtener una regla de putaway | `get_putaway_rule_api_v1_wms_putaway_rules__rule_id__get` |
| `PATCH` | `/api/v1/wms/putaway-rules/{rule_id}` | Actualizar una regla de putaway | `update_putaway_rule_api_v1_wms_putaway_rules__rule_id__patch` |

### WMS - Master (Ubicaciones - Masivo) (2 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/wms/locations/clone` | Clonación de rama jerárquica | `clone_location_api_v1_wms_locations_clone_post` |
| `DELETE` | `/api/v1/wms/locations/mass-delete` | Eliminación masiva de ubicaciones | `mass_delete_locations_api_v1_wms_locations_mass_delete_delete` |

### WMS - Master (Ubicaciones) (7 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `DELETE` | `/api/v1/wms/locations/{location_id}` | Delete Location | `delete_location_api_v1_wms_locations__location_id__delete` |
| `GET` | `/api/v1/wms/locations/{location_id}` | Get Location | `get_location_api_v1_wms_locations__location_id__get` |
| `POST` | `/api/v1/wms/locations/{location_id}/check-capacity` | Check Location Capacity | `check_location_capacity_api_v1_wms_locations__location_id__check_capacity_post` |
| `POST` | `/api/v1/wms/warehouses/{warehouse_id}/access-levels/{access_level}/assign` | Asignar access_level a una ubicación (con opción recursiva) | `assign_access_level_to_locations_api_v1_wms_warehouses__warehouse_id__access_levels__access_level__assign_post` |
| `POST` | `/api/v1/wms/warehouses/{warehouse_id}/access-levels/{access_level}/assign-by-path-pattern` | Asignar access_level por patrón de path | `assign_access_level_by_path_pattern_api_v1_wms_warehouses__warehouse_id__access_levels__access_level__assign_by_path_pattern_post` |
| `GET` | `/api/v1/wms/warehouses/{warehouse_id}/locations` | Listar ubicaciones por almacén | `list_warehouse_locations_api_v1_wms_warehouses__warehouse_id__locations_get` |
| `POST` | `/api/v1/wms/warehouses/{warehouse_id}/locations` | Crear ubicación en almacén | `create_warehouse_location_api_v1_wms_warehouses__warehouse_id__locations_post` |

### WMS - Olas de Trabajo (5 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/waves/` | Crear nueva ola de trabajo | `create_wave_api_v1_waves__post` |
| `POST` | `/api/v1/waves/{wave_id}/complete` | Completar ola de trabajo | `complete_wave_api_v1_waves__wave_id__complete_post` |
| `GET` | `/api/v1/waves/{wave_id}/picking-list` | Obtener lista de picking consolidada | `get_picking_list_api_v1_waves__wave_id__picking_list_get` |
| `POST` | `/api/v1/waves/{wave_id}/start` | Iniciar ola de trabajo | `start_wave_api_v1_waves__wave_id__start_post` |
| `POST` | `/api/v1/waves/{wave_id}/transfers` | Asignar transferencias a ola | `add_transfers_api_v1_waves__wave_id__transfers_post` |

### WMS - Options (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/wms/locations/options` | Opciones livianas de ubicaciones (combobox) | `list_location_options_endpoint_api_v1_wms_locations_options_get` |

### WMS - Packages (5 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/wms/packages` | Listar bultos | `list_packages_api_v1_wms_packages_get` |
| `POST` | `/api/v1/wms/packages` | Crear bulto de consolidación | `create_package_api_v1_wms_packages_post` |
| `GET` | `/api/v1/wms/packages/{package_id}` | Detalle de bulto | `get_package_api_v1_wms_packages__package_id__get` |
| `POST` | `/api/v1/wms/packages/{package_id}/close` | Cerrar bulto | `close_package_api_v1_wms_packages__package_id__close_post` |
| `POST` | `/api/v1/wms/packages/{package_id}/content` | Agregar contenido a bulto abierto | `add_package_content_api_v1_wms_packages__package_id__content_post` |

### WMS - Putaway ABC (13 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/wms/item-slots` | Listar slots pick-face / reserva | `list_item_slots_api_v1_wms_item_slots_get` |
| `POST` | `/api/v1/wms/item-slots` | Crear slot pick-face / reserva | `create_item_slot_api_v1_wms_item_slots_post` |
| `DELETE` | `/api/v1/wms/item-slots/{slot_id}` | Eliminar un slot (soft-delete) | `delete_item_slot_api_v1_wms_item_slots__slot_id__delete` |
| `GET` | `/api/v1/wms/item-slots/{slot_id}` | Obtener un slot | `get_item_slot_api_v1_wms_item_slots__slot_id__get` |
| `PATCH` | `/api/v1/wms/item-slots/{slot_id}` | Actualizar un slot | `patch_item_slot_api_v1_wms_item_slots__slot_id__patch` |
| `POST` | `/api/v1/wms/putaway/suggest` | Sugerir putaway rankeado | `post_putaway_suggest_api_v1_wms_putaway_suggest_post` |
| `GET` | `/api/v1/wms/putaway/suggest/{item_id}` | Sugerir ubicación de putaway (primer candidato) | `suggest_putaway_location_api_v1_wms_putaway_suggest__item_id__get` |
| `GET` | `/api/v1/wms/warehouses/{warehouse_id}/abc-classes` | Listar clases ABC del almacén | `list_abc_classes_api_v1_wms_warehouses__warehouse_id__abc_classes_get` |
| `PATCH` | `/api/v1/wms/warehouses/{warehouse_id}/abc-classes/{item_id}` | Forzar clase ABC de un ítem | `patch_abc_class_api_v1_wms_warehouses__warehouse_id__abc_classes__item_id__patch` |
| `GET` | `/api/v1/wms/warehouses/{warehouse_id}/abc-policy` | Obtener política ABC del almacén | `get_abc_policy_api_v1_wms_warehouses__warehouse_id__abc_policy_get` |
| `PATCH` | `/api/v1/wms/warehouses/{warehouse_id}/abc-policy` | Actualizar política ABC del almacén | `patch_abc_policy_api_v1_wms_warehouses__warehouse_id__abc_policy_patch` |
| `POST` | `/api/v1/wms/warehouses/{warehouse_id}/abc/recompute` | Recomputar clases ABC del almacén | `recompute_abc_api_v1_wms_warehouses__warehouse_id__abc_recompute_post` |
| `POST` | `/api/v1/wms/warehouses/{warehouse_id}/suggest-replenishment` | Sugerir reposición reserva → pick-face | `post_suggest_replenishment_api_v1_wms_warehouses__warehouse_id__suggest_replenishment_post` |

### WMS - Serial Numbers (5 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/wms/items/serialized-with-possession` | List Serialized Items With Possession | `list_serialized_items_with_possession_api_v1_wms_items_serialized_with_possession_get` |
| `GET` | `/api/v1/wms/items/{item_id}/serial-numbers` | List Serial Numbers By Item | `list_serial_numbers_by_item_api_v1_wms_items__item_id__serial_numbers_get` |
| `DELETE` | `/api/v1/wms/serial-numbers/{serial_id}` | Soft Delete Serial Number | `soft_delete_serial_number_api_v1_wms_serial_numbers__serial_id__delete` |
| `PATCH` | `/api/v1/wms/serial-numbers/{serial_id}` | Update Serial Number | `update_serial_number_api_v1_wms_serial_numbers__serial_id__patch` |
| `GET` | `/api/v1/wms/serial-numbers/{serial_number}` | Get Serial Number Traceability | `get_serial_number_traceability_api_v1_wms_serial_numbers__serial_number__get` |

### WMS - Stock (Listados) (3 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/wms/stock-lots` | List Stock By Lots | `list_stock_by_lots_api_v1_wms_stock_lots_get` |
| `GET` | `/api/v1/wms/stock-path/{path_query}` | Get Stock By Path | `get_stock_by_path_api_v1_wms_stock_path__path_query__get` |
| `GET` | `/api/v1/wms/stock/{location_id}/{item_id}` | Get Stock | `get_stock_api_v1_wms_stock__location_id___item_id__get` |

### WMS - Stock (Operaciones) (2 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/wms/suggest-pick` | Sugerir picking FEFO sin reservar | `suggest_pick_api_v1_wms_suggest_pick_post` |
| `POST` | `/api/v1/wms/transfer/{transfer_id}/confirm` | Confirm Transfer | `confirm_transfer_api_v1_wms_transfer__transfer_id__confirm_post` |

### WMS - Transferencias (18 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/transfers/` | List Transfers | `list_transfers_api_v1_transfers__get` |
| `POST` | `/api/v1/transfers/` | Crear transferencia draft | `create_transfer_api_v1_transfers__post` |
| `PATCH` | `/api/v1/transfers/bulk/priority` | Bulk Patch Transfers Priority | `bulk_patch_transfers_priority_api_v1_transfers_bulk_priority_patch` |
| `POST` | `/api/v1/transfers/confirm-remitos` | Crear remitos 270 desde transfers PREP (F2) | `confirm_remitos_api_v1_transfers_confirm_remitos_post` |
| `POST` | `/api/v1/transfers/propose-remitos` | Proponer remitos 270 desde transfers PREP (F2) | `propose_remitos_api_v1_transfers_propose_remitos_post` |
| `DELETE` | `/api/v1/transfers/{transfer_id}` | Delete Transfer | `delete_transfer_api_v1_transfers__transfer_id__delete` |
| `GET` | `/api/v1/transfers/{transfer_id}` | Get Transfer | `get_transfer_api_v1_transfers__transfer_id__get` |
| `PATCH` | `/api/v1/transfers/{transfer_id}` | Update Transfer | `update_transfer_api_v1_transfers__transfer_id__patch` |
| `POST` | `/api/v1/transfers/{transfer_id}/confirm-control` | Confirmar control (EAN, visual o peso) | `confirm_control_api_v1_transfers__transfer_id__confirm_control_post` |
| `POST` | `/api/v1/transfers/{transfer_id}/handling-plan` | Plan de handling (conflictos, particiones, flujo) | `handling_plan_api_v1_transfers__transfer_id__handling_plan_post` |
| `POST` | `/api/v1/transfers/{transfer_id}/mark-prep-done` | Marcar PREP done (STAGING) sin pack/control | `mark_prep_done_api_v1_transfers__transfer_id__mark_prep_done_post` |
| `POST` | `/api/v1/transfers/{transfer_id}/packaging/done` | Finalizar etapa de packaging | `packaging_done_api_v1_transfers__transfer_id__packaging_done_post` |
| `POST` | `/api/v1/transfers/{transfer_id}/packaging/start` | Iniciar etapa de packaging | `packaging_start_api_v1_transfers__transfer_id__packaging_start_post` |
| `POST` | `/api/v1/transfers/{transfer_id}/plan-flow` | Planificar flujo pack/control de la transferencia | `plan_transfer_flow_api_v1_transfers__transfer_id__plan_flow_post` |
| `POST` | `/api/v1/transfers/{transfer_id}/report-pick-done` | Reportar pick (con faltante) de un PREP | `report_pick_done_endpoint_api_v1_transfers__transfer_id__report_pick_done_post` |
| `POST` | `/api/v1/transfers/{transfer_id}/resolve-handling` | Resolver conflicto handling (USE_SEPARATE_AREA) | `resolve_handling_api_v1_transfers__transfer_id__resolve_handling_post` |
| `POST` | `/api/v1/transfers/{transfer_id}/split` | Partir transferencia por conflictos HARD de handling | `split_transfer_endpoint_api_v1_transfers__transfer_id__split_post` |
| `POST` | `/api/v1/transfers/{transfer_id}/validate-handling` | Validar segregación handling de la transferencia | `validate_handling_api_v1_transfers__transfer_id__validate_handling_post` |

### WMS - Valuación (1 endpoints)

| Método | Ruta de API | Resumen / Descripción | Operation ID |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/wms/valuation/fifo-preview/{item_id}/{quantity}` | Fifo Preview | `fifo_preview_api_v1_wms_valuation_fifo_preview__item_id___quantity__get` |

