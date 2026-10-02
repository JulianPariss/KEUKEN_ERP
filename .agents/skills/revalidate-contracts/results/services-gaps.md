# Reporte de Auditoria y Revalidacion de Contratos (Frontend vs Backend)

- **Fecha:** 2026-09-30 18:14:24
- **Especificacion OpenAPI (Backend):** `C:\Users\julia\Desktop\Proyectos\KEUKEN_UWS\apps\erp-next\.agents\skills\revalidate-contracts\contracts.json`
- **Mapeos Utilizados:** `C:\Users\julia\Desktop\Proyectos\KEUKEN_UWS\apps\erp-next\.agents\skills\revalidate-contracts\audit-pairs.json`
- **Total Modelos Auditados:** 175

---

## 1. Resumen Ejecutivo y Totales

| Codigo | Categoria de Hallazgo | Total Casos |
| :---: | :--- | :---: |
| [E1] | **Campos Faltantes en Frontend** | **20** |
| [E2] | **Campos Sobrantes o Deprecados** | **11** |
| [E3] | **Discrepancias de Tipo** | **0** |
| [E4] | **Nullability & Optionality Mismatch** | **8** |

---

## 2. Modelos Auditados

| Dominio | Entidad / Etiqueta | Frontend Interface | Backend Schema | Estado |
| :--- | :--- | :--- | :--- | :---: |
| products | Productos - Ficha y Cabecera | `IBProduct` | `ProductResponse` | [OK] |
| products | Productos - Alta | `IBProductCreate` | `ProductCreateRequest` | [OK] |
| products | Productos - Edición | `IBProductUpdate` | `ProductUpdateRequest` | [OK] |
| products | Productos - Clasificación Fiscal | `IBProductClassification` | `ProductClassificationResponse` | [OK] |
| items | Ítems - Maestro | `IBItem` | `ItemResponse` | [OK] |
| items | Ítems - Alta | `IBItemCreate` | `ItemCreateRequest` | [OK] |
| items | Ítems - Edición | `IBItemUpdate` | `ItemUpdateRequest` | [OK] |
| presentations | Presentaciones - Maestro | `IBPresentation` | `PresentationResponse` | [OK] |
| presentations | Presentaciones - Alta | `IBPresentationCreate` | `PresentationCreateRequest` | [OK] |
| presentations | Presentaciones - Edición | `IBPresentationUpdate` | `PresentationUpdateRequest` | [OK] |
| brands | Marcas - Maestro | `IBBrand` | `ProductBrandResponse` | [OK] |
| brands | Marcas - Alta | `IBBrandCreate` | `ProductBrandCreateRequest` | [OK] |
| brands | Marcas - Edición | `IBBrandUpdate` | `ProductBrandUpdateRequest` | [OK] |
| categories | Categorías - Maestro | `IBCategory` | `CategoryResponse` | [OK] |
| categories | Categorías - Alta | `IBCategoryCreate` | `CategoryCreateRequest` | [OK] |
| categories | Categorías - Edición | `IBCategoryUpdate` | `CategoryUpdateRequest` | [OK] |
| saleBillingModes | Modos de Facturación - Maestro | `IBSaleBillingMode` | `SaleBillingModeResponse` | [OK] |
| saleBillingModes | Modos de Facturación - Alta | `IBSaleBillingModeCreate` | `SaleBillingModeCreateRequest` | [OK] |
| saleBillingModes | Modos de Facturación - Edición | `IBSaleBillingModeUpdate` | `SaleBillingModeUpdateRequest` | [OK] |
| uom | Unidades de Medida - Maestro | `IBUOM` | `UoMResponse` | [OK] |
| uom | Unidades de Medida - Alta | `IBUOMCreate` | `UoMCreateRequest` | [OK] |
| uom | Unidades de Medida - Edición | `IBUOMUpdate` | `UoMUpdateRequest` | [OK] |
| uom | Categorías de UoM - Maestro | `IBUoMCategory` | `UoMCategoryResponse` | [OK] |
| packagingLevel | Niveles de Empaque - Maestro | `IBPackagingLevel` | `PackagingLevelResponse` | [OK] |
| accounting | Impuestos Contables - Maestro | `IBTax` | `AccountTaxResponse` | [OK] |
| accounting | Impuestos Contables - Alta | `IBTaxCreate` | `AccountTaxCreateRequest` | [OK] |
| accounting | Impuestos Contables - Edición | `IBTaxUpdate` | `AccountTaxUpdateRequest` | [OK] |
| accounting | Plan de Cuentas - Fila | `IBAccount` | `ChartAccountResponse` | [OK] |
| accounting | Plan de Cuentas - Alta | `IBAccountCreation` | `ChartAccountCreateRequest` | [OK] |
| accounting | Plan de Cuentas - Edición | `IBAccountUpdate` | `ChartAccountUpdateRequest` | [OK] |
| accounting | Plan de Cuentas - Árbol | `IBAccountsTree` | `ChartAccountTreeNode` | [OK] |
| accounting | Plan de Cuentas - Mayor | `IBAccountLines` | `AccountLedgerLineItem` | [OK] |
| metadata | Metadatos - Atributos | `IBMetadataAttribute` | `AttributeResponse` | [OK] |
| metadata | Metadatos - Grupos | `IBMetadataGroup` | `AttributeGroupResponse` | [OK] |
| common | Restauración - Papelera | `IBRestoreResponse` | `RestoreResponse` | [OK] |
| warehouse | Almacenes - Maestro | `IWarehouseResponse` | `WarehouseResponse` | [OK] |
| warehouse | Almacenes - Alta | `IWarehouseCreate` | `WarehouseCreateRequest` | [OK] |
| warehouse | Almacenes - Edición | `IWarehouseUpdate` | `WarehouseUpdateRequest` | [OK] |
| warehouse | Ubicaciones - Maestro | `IBLocation` | `LocationResponse` | [OK] |
| warehouse | Ubicaciones - Alta Simple | `IBLocationSimpleCreation` | `LocationCreateRequest` | [OK] |
| warehouse | Ubicaciones - Edición | `IBLocationUpdate` | `LocationUpdateRequest` | [OK] |
| warehouse | Ubicaciones - Creación Masiva | `IBLocationCreation` | `LocationMassCreateRequest` | [OK] |
| warehouse | Ubicaciones - Cambio de Estado | `IBLocationStateUpdate` | `LocationStateUpdateRequest` | [OK] |
| warehouse | Ubicaciones - Ocupación | `IBLocationOccupancy` | `LocationOccupancyResponse` | [OK] |
| warehouse | Áreas de Almacén - Maestro | `IBArea` | `WarehouseAreaResponse` | [OK] |
| warehouse | Áreas de Almacén - Alta | `IBAreaCreate` | `WarehouseAreaCreateRequest` | [OK] |
| warehouse | Tipos de Área - Maestro | `IBAreaType` | `WarehouseAreaTypeResponse` | [OK] |
| warehouse | Áreas de Almacén - Asignación | `IBAreaAssignment` | `AssignAreaToSubtreeRequest` | [OK] |
| warehouse | Inventario - Maestro | `IBInventory` | `InventorySchema` | [OK] |
| warehouse | Inventario - Línea | `IBInventoryLine` | `InventoryLineSchema` | [OK] |
| warehouse | Inventario - Alta / Ajuste | `IBInventoryCreate` | `InventoryAdjustmentRequest` | [OK] |
| warehouse | Inventario - Actualización de Líneas | `IBInventoryPatch` | `InventoryLinesUpdateRequest` | [OK] |
| vehicles | Vehículos - Maestro | `IBVehicle` | `VehicleResponse` | [OK] |
| vehicles | Vehículos - Alta | `IBVehicleCreate` | `VehicleCreateRequest` | [OK] |
| vehicles | Vehículos - Edición | `IBVehicleUpdate` | `VehicleUpdateRequest` | [OK] |
| zones | Zonas - Maestro | `IBZone` | `ZoneResponse` | [OK] |
| zones | Zonas - Alta | `IBZoneCreate` | `ZoneCreateRequest` | [OK] |
| zones | Zonas - Edición | `IBZoneUpdate` | `ZoneUpdateRequest` | [OK] |
| users | Usuarios - Maestro | `IBUser` | `UserResponse` | [OK] |
| users | Usuarios - Alta | `IBUserCreate` | `UserCreateRequest` | [OK] |
| users | Usuarios - Edición | `IBUserUpdate` | `UserPatchRequest` | [OK] |
| system | Configuración del Sistema - Parámetro | `IBSystemSetting` | `SystemSettingResponse` | [OK] |
| system | Configuración del Sistema - Edición | `IBSystemSettingUpdate` | `SystemSettingUpsertRequest` | [OK] |
| system | Configuración del Sistema - Auditoría | `IBSettingsAuditResponse` | `SystemSettingAuditListResponse` | [OK] |
| userContext | Sucursales - Maestro | `IBBranch` | `BranchResponse` | [OK] |
| userContext | Sucursales - Alta | `IBBranchCreate` | `BranchCreateRequest` | [OK] |
| userContext | Sucursales - Edición | `IBBranchUpdate` | `BranchUpdateRequest` | [OK] |
| userContext | Sucursales - Detalle | `IBBranchDetail` | `BranchResponse` | [OK] |
| userContext | Establecimientos - Maestro | `IBEstablishment` | `EstablishmentResponse` | [OK] |
| userContext | Establecimientos - Alta | `IBEstablishmentCreate` | `EstablishmentCreateRequest` | [OK] |
| userContext | Establecimientos - Edición | `IBEstablishmentUpdate` | `EstablishmentUpdateRequest` | [OK] |
| userContext | Centros Logísticos - Maestro | `IBLogisticsCenter` | `LogisticsCenterResponse` | [OK] |
| userContext | Centros Logísticos - Alta | `IBLogisticsCenterCreate` | `LogisticsCenterCreateRequest` | [OK] |
| userContext | Centros Logísticos - Edición | `IBLogisticsCenterUpdate` | `LogisticsCenterUpdateRequest` | [OK] |
| userContext | Empresas - Maestro | `ICompanyResponse` | `CompanyResponse` | [OK] |
| userContext | Roles y Claves API - Lista | `IBRole` | `ApiKeyListItem` | [OK] |
| userContext | Autenticación - Login | `IBAuth` | `LoginResponse` | [OK] |
| userContext | Autenticación - Perfil | `IBProfile` | `MeResponse` | [OK] |
| routes | Rutas de Entrega - Maestro | `IBRouteResponse` | `RouteResponse` | [OK] |
| routes | Rutas de Entrega - Detalle | `IBRouteDetails` | `RouteDetailResponse` | [OK] |
| routes | Rutas de Entrega - Alta | `IBRouteCreate` | `RouteCreateRequest` | [OK] |
| salesChannels | Canales de Venta - Maestro | `IBSalesChannel` | `SalesChannelResponse` | [OK] |
| serialNumbers | Números de Serie - Maestro | `IBSerialNumber` | `SerialNumberResponse` | [OK] |
| serialNumbers | Números de Serie - Alta | `IBSerialNumberCreateRequest` | `SerialNumberCreateRequest` | [OK] |
| stock | Stock - Líneas con Ubicación | `IBStockItem` | `StockLineWithLocationResponse` | [OK] |
| stock | Stock - Por Ubicación | `IBStockByLocation` | `LocationStockResponse` | [OK] |
| stock | Stock - Reserva | `IBStockReserve` | `ReservationResponse` | [OK] |
| stock | Stock - Solicitud de Reserva | `IBStockCreate` | `StockReservationRequest` | [OK] |
| stock | Stock - Resumen | `IBStockSummaryRow` | `StockSummaryRow` | [OK] |
| fragility | Fragilidad - Maestro | `IBFragilityClass` | `FragilityClassResponse` | [OK] |
| fragility | Fragilidad - Alta | `IBFragilityClassCreate` | `FragilityClassCreate` | [OK] |
| fragility | Fragilidad - Edición | `IBFragilityClassUpdate` | `FragilityClassPatch` | [OK] |
| hazard | Peligrosidad - Maestro | `IBHazardClass` | `HazardClassResponse` | [OK] |
| hazard | Peligrosidad - Alta | `IBHazardClassCreate` | `HazardClassCreate` | [OK] |
| hazard | Peligrosidad - Edición | `IBHazardClassUpdate` | `HazardClassPatch` | [OK] |
| segregationGroups | Grupos de Segregación - Maestro | `IBSegregationGroup` | `SegregationGroupResponse` | [OK] |
| segregationGroups | Grupos de Segregación - Alta | `IBSegregationGroupCreate` | `SegregationGroupCreate` | [OK] |
| segregationGroups | Grupos de Segregación - Edición | `IBSegregationGroupUpdate` | `SegregationGroupPatch` | [OK] |
| temperature | Temperatura - Maestro | `IBTemperatureClass` | `TemperatureClassResponse` | [OK] |
| temperature | Temperatura - Alta | `IBTemperatureClassCreate` | `TemperatureClassCreate` | [OK] |
| temperature | Temperatura - Edición | `IBTemperatureClassUpdate` | `TemperatureClassPatch` | [OK] |
| logisticProfile | Perfiles Logísticos - Maestro | `IBLogisticProfile` | `LogisticsProfileResponse` | [OK] |
| logisticProfile | Perfiles Logísticos - Alta | `IBLogisticProfileCreate` | `LogisticsProfileCreate` | [OK] |
| logisticProfile | Perfiles Logísticos - Edición | `IBLogisticProfileUpdate` | `LogisticsProfilePatch` | [OK] |
| operativeProfile | Perfiles Operativos - Maestro | `IBOperativeProfile` | `OperationalProfileResponse` | [OK] |
| priceLists | Tipos de Lista de Precios - Maestro | `IBListType` | `PricelistTypeResponse` | [OK] |
| priceLists | Tipos de Lista de Precios - Alta | `IBListTypeCreate` | `PricelistTypeCreateRequest` | [OK] |
| priceLists | Tipos de Lista de Precios - Edición | `IBListTypePatch` | `PricelistTypeUpdateRequest` | [OK] |
| priceLists | Listas de Precios - Maestro | `IBPriceList` | `PricelistResponse` | [OK] |
| priceLists | Listas de Precios - Alta | `IBPriceListCreate` | `PricelistCreateRequest` | [OK] |
| priceLists | Listas de Precios - Completa | `IBPriceListFullResponse` | `PricelistFullResponse` | [OK] |
| priceLists | Listas de Precios - Ítem Alta | `IBPriceListItemCreate` | `PricelistItemCreateRequest` | [OK] |
| saleOrders | Pedidos de Venta - Detalle | `IBSaleOrderDetail` | `SaleOrderDetailResponse` | [OK] |
| saleOrders | Pedidos de Venta - Maestro | `IBSaleOrder` | `SaleOrderListItemResponse` | [OK] |
| saleOrders | Pedidos de Venta - Alta | `IBSaleOrderCreate` | `SaleOrderCreateRequest` | [OK] |
| salesRoutes | Rutas de Venta - Maestro | `IBSalesRoute` | `SalesRouteResponse` | [OK] |
| salesRoutes | Rutas de Venta - Alta | `IBSalesRouteCreate` | `SalesRouteCreateRequest` | [OK] |
| currencies | Monedas - Maestro | `IBCurrency` | `CurrencyResponse` | [OK] |
| currencies | Monedas - Alta | `IBCurrencyCreation` | `CurrencyCreateRequest` | [OK] |
| currencies | Monedas - Edición | `IBCurrencyUpdate` | `CurrencyUpdateRequest` | [OK] |
| paymentMethods | Métodos de Pago - Maestro | `IBPaymentMethod` | `src__api__routes__partners__partners__PaymentMethodResponse` | [OK] |
| paymentMethods | Métodos de Pago - Alta | `IBPaymentMethodCreation` | `src__api__routes__partners__partners__PaymentMethodCreateRequest` | [OK] |
| paymentMethods | Métodos de Pago - Edición | `IBPaymentMethodUpdate` | `src__api__routes__partners__partners__PaymentMethodUpdateRequest` | [OK] |
| paymentTerms | Términos de Pago - Maestro | `IBPaymentTerm` | `PaymentTermResponse` | [OK] |
| paymentTerms | Términos de Pago - Alta | `IBPaymentTermCreation` | `PaymentTermCreateRequest` | [OK] |
| paymentTerms | Términos de Pago - Edición | `IBPaymentTermUpdate` | `PaymentTermUpdateRequest` | [OK] |
| taxCategories | Categorías Tributarias - Maestro | `IBTaxCategory` | `PartnerTaxCategoryResponse` | [OK] |
| taxCategories | Categorías Tributarias - Alta | `IBTaxCategoryCreation` | `PartnerTaxCategoryCreateRequest` | [OK] |
| taxCategories | Categorías Tributarias - Edición | `IBTaxCategoryUpdate` | `PartnerTaxCategoryUpdateRequest` | [OK] |
| cities | Ciudades - Maestro | `IBCitie` | `CityResponse` | [OK] |
| cities | Ciudades - Alta | `IBCitieCreation` | `CityCreateRequest` | [OK] |
| cities | Ciudades - Edición | `IBCitieUpdate` | `CityUpdateRequest` | [OK] |
| countries | Países - Maestro | `IBCountry` | `CountryResponse` | [OK] |
| countries | Países - Alta | `IBCountryCreation` | `CountryCreateRequest` | [OK] |
| countries | Países - Edición | `IBCountryUpdate` | `CountryUpdateRequest` | [OK] |
| states | Provincias / Estados - Maestro | `IBState` | `StateResponse` | [OK] |
| states | Provincias / Estados - Alta | `IBStateCreation` | `StateCreateRequest` | [OK] |
| states | Provincias / Estados - Edición | `IBStateUpdate` | `StateUpdateRequest` | [OK] |
| providers | Proveedores - Maestro | `IBProvider` | `PartnerResponse` | [OK] |
| providers | Proveedores - Alta | `IBProviderCreation` | `PartnerCreateRequest` | [OK] |
| providers | Proveedores - Edición | `IBProviderUpdate` | `PartnerUpdateRequest` | [OK] |
| commercialPlatforms | Plataformas Comerciales - Maestro | `IBCommercialPlatform` | `CommercialPlatformResponse` | [OK] |
| commercialPlatforms | Plataformas Comerciales - Alta | `IBCommercialPlatformCreate` | `CommercialPlatformCreate` | [OK] |
| customers | Clientes - Maestro | `IBCustomer` | `PartnerResponse` | [OK] |
| customers | Clientes - Alta | `IBCustomerCreate` | `PartnerCreateRequest` | [OK] |
| customers | Clientes - Edición | `IBCustomerUpdate` | `CustomerUpdateRequest` | [OK] |
| customers | Clientes - Detalle Completo | `IBCustomerFull` | `CustomerFullResponse` | [OK] |
| accounting | Cajas Registradoras - Maestro | `IBCashRegister` | `CashRegisterResponse` | [OK] |
| accounting | Cajas Registradoras - Alta | `IBCashRegisterCreation` | `CashRegisterCreateRequest` | [OK] |
| accounting | Cajas Registradoras - Edición | `IBCashRegisterUpdate` | `CashRegisterUpdateRequest` | [OK] |
| accounting | Asientos Contables - Maestro | `IBJournal` | `GeneralJournalResponse` | [DISCREPANCIAS] (E1:4 E2:7 E3:0 E4:0) |
| accounting | Asientos Contables - Alta | `IBJournalEntry` | `ManualJournalEntryCreateRequest` | [DISCREPANCIAS] (E1:1 E2:0 E3:0 E4:2) |
| accounting | Períodos Contables - Maestro | `IBPeriod` | `FiscalPeriodResponse` | [DISCREPANCIAS] (E1:4 E2:0 E3:0 E4:0) |
| accounting | Períodos Contables - Alta | `IBPeriodCreation` | `FiscalPeriodCreateRequest` | [OK] |
| accounting | Períodos Contables - Edición | `IBPeriodUpdate` | `FiscalPeriodUpdateRequest` | [OK] |
| audiences | Clusters de Clientes - Maestro | `IBCustomerCluster` | `CustomerClusterResponse` | [DISCREPANCIAS] (E1:0 E2:2 E3:0 E4:1) |
| audiences | Clusters de Clientes - Alta | `IBCustomerClusterCreate` | `CustomerClusterCreateRequest` | [DISCREPANCIAS] (E1:2 E2:0 E3:0 E4:0) |
| audiences | Clusters de Clientes - Edición | `IBCustomerClusterUpdate` | `CustomerClusterUpdateRequest` | [DISCREPANCIAS] (E1:2 E2:0 E3:0 E4:0) |
| audiences | Clusters de Clientes - Miembro | `IBCustomerClusterMember` | `CustomerClusterMemberResponse` | [DISCREPANCIAS] (E1:1 E2:0 E3:0 E4:2) |
| audiences | Clusters de Ítems - Maestro | `IBItemCluster` | `ItemClusterResponse` | [DISCREPANCIAS] (E1:0 E2:2 E3:0 E4:1) |
| audiences | Clusters de Ítems - Alta | `IBItemClusterCreate` | `ItemClusterCreateRequest` | [DISCREPANCIAS] (E1:2 E2:0 E3:0 E4:0) |
| audiences | Clusters de Ítems - Edición | `IBItemClusterUpdate` | `ItemClusterUpdateRequest` | [DISCREPANCIAS] (E1:2 E2:0 E3:0 E4:0) |
| audiences | Clusters de Ítems - Miembro | `IBItemClusterMember` | `ItemClusterMemberResponse` | [DISCREPANCIAS] (E1:1 E2:0 E3:0 E4:2) |
| audiences | Reglas de Segmentación - Previsualización | `IBClusterPreviewRequest` | `CustomerClusterPreviewRequest` | [OK] |
| audiences | Reglas de Segmentación - Resultado Previsualización | `IBClusterPreviewResult` | `CustomerClusterPreviewResponse` | [OK] |
| audiences | Reglas de Segmentación - Refresco | `IBClusterRefreshResult` | `ClusterRefreshResponse` | [DISCREPANCIAS] (E1:1 E2:0 E3:0 E4:0) |
| audiences | Reglas de Segmentación - Resumen | `IBClusterSummary` | `CustomerClusterSummaryResponse` | [OK] |
| codelists | Listas de Códigos - Categorías Tributarias | `IBCodelistTaxCategory` | `CodelistTaxCategoryResponse` | [OK] |
| consignments | Consignaciones - Maestro | `IBConsignment` | `ItemConsignmentResponse` | [OK] |
| consignments | Consignaciones - Alta | `IBConsignmentCreateRequest` | `ItemConsignmentCreateRequest` | [OK] |
| consignments | Consignaciones - Devolución | `IBConsignmentReturnRequest` | `ItemConsignmentReturnRequest` | [OK] |
| documents | Documentos - Maestro | `IBDocument` | `DocumentListItemResponse` | [OK] |
| localization | Localización Fiscal - Esquemas | `IBTaxScheme` | `LocalizationTaxSchemeResponse` | [OK] |
| localization | Localización Fiscal - Autoridades | `IBTaxAuthorityScheme` | `TaxAuthoritySchemeResponse` | [OK] |
| localization | Localización Fiscal - Identidad | `IBIdentityScheme` | `LocalizationIdentitySchemeResponse` | [OK] |

---

## 3. Desglose Detallado por Entidad con Discrepancias

### Asientos Contables - Maestro

- **Frontend:** `IBJournal` (`packages/api-contracts/src/erp/backendTypes/accountant/journals.types.ts`)
- **Backend:** `GeneralJournalResponse`

#### [E1] Campos Faltantes en Frontend
| Propiedad Backend | Tipo OpenAPI | Requerido | Nullable |
| :--- | :--- | :---: | :---: |
| `company_id` | `string` | Si | No |
| `date_from` | `string` | Si | No |
| `date_to` | `string` | Si | No |
| `items` | `array` | Si | No |

#### [E2] Campos Sobrantes o Deprecados en Frontend
| Propiedad Frontend | Tipo Frontend |
| :--- | :--- |
| `id` | `string` |
| `name` | `string` |
| `code` | `string` |
| `type` | `string` |
| `active` | `boolean` |
| `default_account_id` | `string` |
| `currency_id` | `string` |

---

### Asientos Contables - Alta

- **Frontend:** `IBJournalEntry` (`packages/api-contracts/src/erp/backendTypes/accountant/journals.types.ts`)
- **Backend:** `ManualJournalEntryCreateRequest`

#### [E1] Campos Faltantes en Frontend
| Propiedad Backend | Tipo OpenAPI | Requerido | Nullable |
| :--- | :--- | :---: | :---: |
| `document_type_id` | `string` | No | Si |

#### [E4] Nullability & Optionality Mismatch
| Propiedad | Conflicto | Frontend | Backend |
| :--- | :--- | :--- | :--- |
| `ref` | Backend envía null o es opcional, pero Frontend lo define obligatorio no-nulo | `string (non-null, required)` | `string (nullable=True)` |
| `date` | Backend envía null o es opcional, pero Frontend lo define obligatorio no-nulo | `string (non-null, required)` | `string (nullable=True)` |

---

### Períodos Contables - Maestro

- **Frontend:** `IBPeriod` (`packages/api-contracts/src/erp/backendTypes/accountant/periods.types.ts`)
- **Backend:** `FiscalPeriodResponse`

#### [E1] Campos Faltantes en Frontend
| Propiedad Backend | Tipo OpenAPI | Requerido | Nullable |
| :--- | :--- | :---: | :---: |
| `company_id` | `string` | Si | No |
| `is_opening_period` | `boolean` | No | No |
| `created_at` | `string` | Si | No |
| `warnings` | `array` | No | No |

---

### Clusters de Clientes - Maestro

- **Frontend:** `IBCustomerCluster` (`packages/api-contracts/src/erp/backendTypes/audiences/customerClusters.types.ts`)
- **Backend:** `CustomerClusterResponse`

#### [E2] Campos Sobrantes o Deprecados en Frontend
| Propiedad Frontend | Tipo Frontend |
| :--- | :--- |
| `deleted_at` | `string` |
| `deleted_by_name` | `string` |

#### [E4] Nullability & Optionality Mismatch
| Propiedad | Conflicto | Frontend | Backend |
| :--- | :--- | :--- | :--- |
| `excluded_count` | Backend lo exige obligatorio no-nulo, pero Frontend lo permite opcional/nulo | `optional=True, nullable=False` | `required=True, nullable=False` |

---

### Clusters de Clientes - Alta

- **Frontend:** `IBCustomerClusterCreate` (`packages/api-contracts/src/erp/backendTypes/audiences/customerClusters.types.ts`)
- **Backend:** `CustomerClusterCreateRequest`

#### [E1] Campos Faltantes en Frontend
| Propiedad Backend | Tipo OpenAPI | Requerido | Nullable |
| :--- | :--- | :---: | :---: |
| `metadata` | `object` | No | No |
| `active` | `boolean` | No | No |

---

### Clusters de Clientes - Edición

- **Frontend:** `IBCustomerClusterUpdate` (`packages/api-contracts/src/erp/backendTypes/audiences/customerClusters.types.ts`)
- **Backend:** `CustomerClusterUpdateRequest`

#### [E1] Campos Faltantes en Frontend
| Propiedad Backend | Tipo OpenAPI | Requerido | Nullable |
| :--- | :--- | :---: | :---: |
| `kind` | `string` | No | Si |
| `metadata` | `object` | No | Si |

---

### Clusters de Clientes - Miembro

- **Frontend:** `IBCustomerClusterMember` (`packages/api-contracts/src/erp/backendTypes/audiences/customerClusters.types.ts`)
- **Backend:** `CustomerClusterMemberResponse`

#### [E1] Campos Faltantes en Frontend
| Propiedad Backend | Tipo OpenAPI | Requerido | Nullable |
| :--- | :--- | :---: | :---: |
| `excluded_at` | `string` | No | Si |

#### [E4] Nullability & Optionality Mismatch
| Propiedad | Conflicto | Frontend | Backend |
| :--- | :--- | :--- | :--- |
| `customer_name` | Backend envía null o es opcional, pero Frontend lo define obligatorio no-nulo | `string (non-null, required)` | `string (nullable=True)` |
| `customer_ref` | Backend envía null o es opcional, pero Frontend lo define obligatorio no-nulo | `string (non-null, required)` | `string (nullable=True)` |

---

### Clusters de Ítems - Maestro

- **Frontend:** `IBItemCluster` (`packages/api-contracts/src/erp/backendTypes/audiences/itemClusters.types.ts`)
- **Backend:** `ItemClusterResponse`

#### [E2] Campos Sobrantes o Deprecados en Frontend
| Propiedad Frontend | Tipo Frontend |
| :--- | :--- |
| `deleted_at` | `string` |
| `deleted_by_name` | `string` |

#### [E4] Nullability & Optionality Mismatch
| Propiedad | Conflicto | Frontend | Backend |
| :--- | :--- | :--- | :--- |
| `excluded_count` | Backend lo exige obligatorio no-nulo, pero Frontend lo permite opcional/nulo | `optional=True, nullable=False` | `required=True, nullable=False` |

---

### Clusters de Ítems - Alta

- **Frontend:** `IBItemClusterCreate` (`packages/api-contracts/src/erp/backendTypes/audiences/itemClusters.types.ts`)
- **Backend:** `ItemClusterCreateRequest`

#### [E1] Campos Faltantes en Frontend
| Propiedad Backend | Tipo OpenAPI | Requerido | Nullable |
| :--- | :--- | :---: | :---: |
| `metadata` | `object` | No | No |
| `active` | `boolean` | No | No |

---

### Clusters de Ítems - Edición

- **Frontend:** `IBItemClusterUpdate` (`packages/api-contracts/src/erp/backendTypes/audiences/itemClusters.types.ts`)
- **Backend:** `ItemClusterUpdateRequest`

#### [E1] Campos Faltantes en Frontend
| Propiedad Backend | Tipo OpenAPI | Requerido | Nullable |
| :--- | :--- | :---: | :---: |
| `kind` | `string` | No | Si |
| `metadata` | `object` | No | Si |

---

### Clusters de Ítems - Miembro

- **Frontend:** `IBItemClusterMember` (`packages/api-contracts/src/erp/backendTypes/audiences/itemClusters.types.ts`)
- **Backend:** `ItemClusterMemberResponse`

#### [E1] Campos Faltantes en Frontend
| Propiedad Backend | Tipo OpenAPI | Requerido | Nullable |
| :--- | :--- | :---: | :---: |
| `excluded_at` | `string` | No | Si |

#### [E4] Nullability & Optionality Mismatch
| Propiedad | Conflicto | Frontend | Backend |
| :--- | :--- | :--- | :--- |
| `item_name` | Backend envía null o es opcional, pero Frontend lo define obligatorio no-nulo | `string (non-null, required)` | `string (nullable=True)` |
| `item_ref` | Backend envía null o es opcional, pero Frontend lo define obligatorio no-nulo | `string (non-null, required)` | `string (nullable=True)` |

---

### Reglas de Segmentación - Refresco

- **Frontend:** `IBClusterRefreshResult` (`packages/api-contracts/src/erp/backendTypes/audiences/clusterRules.types.ts`)
- **Backend:** `ClusterRefreshResponse`

#### [E1] Campos Faltantes en Frontend
| Propiedad Backend | Tipo OpenAPI | Requerido | Nullable |
| :--- | :--- | :---: | :---: |
| `excluded_count` | `integer` | Si | No |

---

