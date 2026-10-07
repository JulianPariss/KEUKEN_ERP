import { TModuleKey } from "./getModules";

export const PERMISSION_ACTIONS = ['view', 'modify', 'extract'] as const;
export type TPermissionAction = typeof PERMISSION_ACTIONS[number];

export const MASTER_PERMISSIONS = {
    products: {
        label: 'Gestión de Productos',
        backendMap: {
            view: ['products:products:read'],
            modify: ['products:products:write'],
            extract: [] as string[],
        }
    },
    items: {
        label: 'Gestión de Items',
        backendMap: {
            view: ['products:items:read'],
            modify: ['products:items:write'],
            extract: [] as string[],
        }
    },
    presentations: {
        label: 'Gestión de Presentaciones',
        backendMap: {
            view: ['products:presentations:read'],
            modify: ['products:presentations:write'],
            extract: [] as string[],
        }
    },
    categories: {
        label: 'Gestión de Categorías',
        backendMap: {
            view: ['products:uom_categories:read'],
            modify: {
                keys: ['products:uom_categories:write'],
                maxAuthority: 'superadmin',
                onlyMaxAuthority: true,
            },
            extract: [] as string[],
        }
    },
    uoms: {
        label: 'Gestión de Unidades de Medida',
        backendMap: {
            view: ['products:uoms:read'],
            modify: ['products:uoms:write'],
            extract: [] as string[],
        }
    },
    brands: {
        label: 'Gestión de Marcas',
        backendMap: {
            view: ['products:products:read'],
            modify: ['products:products:write'],
            extract: [] as string[],
        }
    },
    saleBillingModes: {
        label: 'Gestión de Modos de Venta',
        backendMap: {
            view: ['products:products:read', 'products:sale_billing_modes:read'],
            modify: {
                keys: ['products:sale_billing_modes:write'],
                maxAuthority: 'superadmin',
                onlyMaxAuthority: true,
            },
            extract: [] as string[],
        }
    },
    users: {
        label: 'Gestión de Usuarios',
        backendMap: {
            view: ['users:list:read'],
            modify: ['users:abm:write'],
            extract: [] as string[],
        }
    },
    warehouses: {
        label: 'Gestión de Depósitos',
        backendMap: {
            view: ['wms:warehouses:read'],
            modify: ['wms:warehouses:write'],
            extract: [] as string[],
        }
    },
    locations: {
        label: 'Gestión de Ubicaciones',
        backendMap: {
            view: ['wms:locations:read'],
            modify: ['wms:locations:write'],
            extract: [] as string[],
        }
    },
    inventory: {
        label: 'Gestión de Inventario',
        backendMap: {
            view: ['wms:inventory:read'],
            modify: ['wms:inventory:write'],
            extract: [] as string[],
        }
    },
    keysManager: {
        label: 'Gestión de Claves',
        backendMap: {
            view: ['common:api_keys:read'],
            modify: ['common:api_keys:write'],
            extract: [] as string[],
        }
    },
    stock: {
        label: 'Gestión de Stock',
        backendMap: {
            view: ['wms:stock:read'],
            modify: [] as string[],
            extract: [] as string[],
        }
    },
    accounting: {
        label: 'Gestión de Contabilidad',
        backendMap: {
            view: ['accounting:accounting:read'],
            modify: ['accounting:accounting:write'],
            extract: [] as string[],
        }
    },
    delivery: {
        label: 'Gestión de Repartos y Rutas',
        backendMap: {
            view: ['delivery:routes:read'],
            modify: ['delivery:routes:write'],
            extract: [] as string[],
        }
    },
    cashRegisters: {
        label: 'Gestión de Cajas Registradoras',
        backendMap: {
            view: ['payments:cash_registers:read'],
            modify: ['payments:cash_registers:write'],
            extract: [] as string[],
        }
    },
    currencies: {
        label: 'Gestión de Monedas',
        backendMap: {
            view: {
                keys: ['common:currencies:read'],
                maxAuthority: 'admin',
                onlyMaxAuthority: false,
            },
            modify: {
                keys: ['common:currencies:write'],
                maxAuthority: 'superadmin',
                onlyMaxAuthority: true,
            },
            extract: [] as string[],
        }
    },
    providers: {
        label: 'Gestión de Proveedores',
        backendMap: {
            view: ['common:suppliers:read'],
            modify: ['common:suppliers:write'],
            extract: [] as string[],
        }
    },
    paymentTerms: {
        label: 'Gestión de Términos de Pago',
        backendMap: {
            view: ['common:customers:read'],
            modify: ['common:customers:write'],
            extract: [] as string[],
        }
    },
    paymentMethods: {
        label: 'Gestión de Métodos de Pago',
        backendMap: {
            view: ['common:customers:read'],
            modify: ['common:customers:write'],
            extract: [] as string[],
        }
    },
    countries: {
        label: 'Gestión de Países',
        backendMap: {
            view: ['common:customers:read'],
            modify: ['common:customers:write'],
            extract: [] as string[],
        }
    },
    states: {
        label: 'Gestión de Provincias / Estados',
        backendMap: {
            view: ['common:customers:read'],
            modify: ['common:customers:write'],
            extract: [] as string[],
        }
    },
    taxCategories: {
        label: 'Gestión de Categorías de Impuestos',
        backendMap: {
            view: ['common:customers:read'],
            modify: ['common:customers:write'],
            extract: [] as string[],
        }
    },
    cities: {
        label: 'Gestión de Ciudades',
        backendMap: {
            view: ['common:customers:read'],
            modify: ['common:customers:write'],
            extract: [] as string[],
        }
    },
    commercialPriceLists: {
        label: 'Gestión de Listas de Precios',
        backendMap: {
            view: ['commercial:pricelists:read'],
            modify: ['commercial:pricelists:write'],
            extract: [] as string[],
        }
    },
    'sales-channels': {
        label: 'Gestión de Canales de Venta',
        backendMap: {
            view: ['commercial:pricelists:read'],
            modify: ['commercial:pricelists:write'],
            extract: [] as string[],
        }
    },
    partners: {
        label: 'Gestión de Partners',
        backendMap: {
            view: ['partners:customers:read'],
            modify: ['partners:customers:write'],
            extract: [] as string[],
        }
    },
    system: {
        label: 'Configuración del Sistema',
        backendMap: {
            view: {
                keys: ['system:settings:read'],
                maxAuthority: 'superadmin',
                onlyMaxAuthority: true
            },
            modify: {
                keys: ['system:settings:write'],
                maxAuthority: 'superadmin',
                onlyMaxAuthority: true
            },
            extract: [] as string[]
        }
    },
    branches: {
        label: 'Gestión de Sucursales',
        backendMap: {
            view: ['common:branches:read'],
            modify: ['common:branches:write'],
            extract: [] as string[],
        }
    },
    logisticsCenters: {
        label: 'Gestión de Centros Logísticos',
        backendMap: {
            view: ['common:logistics-centers:read'],
            modify: ['common:logistics-centers:write'],
            extract: [] as string[],
        }
    },
    establishments: {
        label: 'Gestión de Establecimientos',
        backendMap: {
            view: ['common:establishments:read'],
            modify: ['common:establishments:write'],
            extract: [] as string[],
        }
    },
    companies: {
        label: 'Gestión de Empresas',
        backendMap: {
            view: ['common:companies:read'],
            modify: ['common:companies:write'],
            extract: [] as string[],
        }
    },
} as const;

export const VIEW_TO_MODULE_MAP: Record<TViewPermissionKey, TModuleKey> = {
    companiesView: 'common',
    productosView: 'products',
    warehousesView: 'wms',
    defaultView: 'users',
    keysManagerView: 'common',
    stockView: 'wms',
    accountingView: 'accounting',
    deliveryView: 'delivery',
    cashRegistersView: 'accounting',
    currenciesView: 'common',
    providersView: 'common',
    paymentTermsView: 'common',
    paymentMethodsView: 'common',
    countriesView: 'common',
    statesView: 'common',
    taxCategoriesView: 'common',
    citiesView: 'common',
    commercialPriceListsView: 'commercial',
    salesChannelsView: 'common',
    pricePoliciesView: 'commercial',
    partnersView: 'partners',
    systemView: 'common',
    localizationView: 'common',
    branchesView: 'common',
    logisticsCentersView: 'common',
    establishmentsView: 'common',
    structureView: 'common',
};

export type TBackendPermissionKey = keyof typeof MASTER_PERMISSIONS;

export type TMaxAuthority = 'admin' | 'superadmin';

export const AUTHORITY_HIERARCHY: Record<TMaxAuthority, number> = {
    admin: 1,
    superadmin: 2
};

export interface IActionPermissionConfig {
    keys: string[];
    maxAuthority?: TMaxAuthority;
    onlyMaxAuthority?: boolean;
}

export interface IViewPermissionConfig {
    requiredPermissions: TBackendPermissionKey[];
    maxAuthority?: TMaxAuthority;
    onlyMaxAuthority?: boolean;
}

export interface IPagePermission {
    actions: Record<TPermissionAction, boolean | null>;
    backendKey: TBackendPermissionKey;
    label: string;
}

export type TFPermissionsConfig = Record<TBackendPermissionKey, IPagePermission>;

export const permissionsConfig: TFPermissionsConfig = Object.entries(MASTER_PERMISSIONS).reduce((acc, [key, config]) => {
    const backendKey = key as TBackendPermissionKey;
    acc[backendKey] = {
        label: config.label,
        backendKey,
        actions: {
            view: false,
            modify: false,
            extract: false
        }
    };
    return acc;
}, {} as TFPermissionsConfig);

export type TViewPermissionKey =
    | 'productosView'
    | 'warehousesView'
    | 'defaultView'
    | 'keysManagerView'
    | 'stockView'
    | 'accountingView'
    | 'deliveryView'
    | 'cashRegistersView'
    | 'currenciesView'
    | 'providersView'
    | 'paymentTermsView'
    | 'paymentMethodsView'
    | 'countriesView'
    | 'statesView'
    | 'taxCategoriesView'
    | 'citiesView'
    | 'commercialPriceListsView'
    | 'salesChannelsView'
    | 'pricePoliciesView'
    | 'partnersView'
    | 'systemView'
    | 'localizationView'
    | 'branchesView'
    | 'logisticsCentersView'
    | 'establishmentsView'
    | 'structureView'
    | 'companiesView';

export type TViewPermissionsRequireds = Record<TViewPermissionKey, TBackendPermissionKey[] | IViewPermissionConfig>;

export const viewPermissionsRequireds: TViewPermissionsRequireds = {
    companiesView: [
        "companies",
    ],
    productosView: [
        "products",
        "items",
        "presentations",
        "categories",
        "uoms",
        "brands",
        "saleBillingModes",
    ],
    warehousesView: [
        "warehouses",
        "locations"
    ],
    defaultView: [
        "users",
    ],
    keysManagerView: [
        "keysManager",
    ],
    stockView: [
        "stock",
    ],
    accountingView: [
        "accounting",
    ],
    deliveryView: [
        "delivery",
    ],
    cashRegistersView: [
        "cashRegisters",
    ],
    currenciesView: [
        "currencies",
    ],
    providersView: [
        "providers",
    ],
    paymentTermsView: [
        "paymentTerms",
    ],
    paymentMethodsView: [
        "paymentMethods",
    ],
    countriesView: [
        "countries",
    ],
    statesView: [
        "states",
    ],
    taxCategoriesView: [
        "taxCategories",
    ],
    citiesView: [
        "cities",
    ],
    commercialPriceListsView: [
        "commercialPriceLists"
    ],
    salesChannelsView: [
        "sales-channels"
    ],
    pricePoliciesView: [
        "commercialPriceLists"
    ],
    partnersView: [
        "partners"
    ],
    systemView: {
        requiredPermissions: ["system"],
        maxAuthority: 'superadmin',
        onlyMaxAuthority: true
    },
    localizationView: [
        "countries",
        "cities",
        "currencies",
        "states",
        "taxCategories"
    ],
    branchesView: [
        "branches"
    ],
    logisticsCentersView: [
        "logisticsCenters"
    ],
    establishmentsView: [
        "establishments"
    ],
    structureView: [
        "branches"
    ],
};

export const ROUTE_VIEW_MAP: Record<string, TViewPermissionKey> = {
    '/products': 'productosView',
    '/products/uom-categories': 'productosView',
    '/warehouses': 'warehousesView',
    '/users': 'defaultView',
    '/system/keysManager': 'keysManagerView',
    '/stock': 'stockView',
    '/accounting': 'accountingView',
    '/accounting/documents': 'accountingView',
    '/delivery': 'deliveryView',
    '/accounting/cashRegisters': 'cashRegistersView',
    '/localization': 'localizationView',
    '/localization/currencies': 'currenciesView',
    '/providers': 'providersView',
    '/priceLists/paymentTerms': 'paymentTermsView',
    '/priceLists/paymentMethods': 'paymentMethodsView',
    '/localization/countries': 'countriesView',
    '/localization/states': 'statesView',
    '/localization/taxCategories': 'taxCategoriesView',
    '/localization/cities': 'citiesView',
    '/priceLists/sales-channels': 'salesChannelsView',
    '/priceLists/commercial-platforms': 'commercialPriceListsView',
    '/priceLists': 'commercialPriceListsView',
    '/priceLists/priceListDetail': 'commercialPriceListsView',
    '/priceLists/pricePolicies': 'pricePoliciesView',
    '/customers': 'partnersView',
    '/system': 'systemView',
    '/system/audit': 'systemView',
    '/structure': 'structureView',
    '/structure/branches': 'branchesView',
    '/structure/logisticCenters': 'logisticsCentersView',
    '/structure/establishments': 'establishmentsView',
    '/companies': 'companiesView',
};
