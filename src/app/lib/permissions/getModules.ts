export const MASTER_MODULES = {
    products: {
        label: 'Módulo de Productos',
    },
    wms: {
        label: 'Módulo de WMS',
    },
    users: {
        label: 'Módulo de Usuarios',
    },
    common: {
        label: 'Módulo Común',
    },
    accounting: {
        label: 'Módulo Contable',
    },
    delivery: {
        label: 'Módulo de Repartos',
    },
    commercial: {
        label: 'Módulo Comercial',
    },
    partners: {
        label: 'Módulo Partners',
    }
} as const;

export type TModuleKey = keyof typeof MASTER_MODULES;

export const MOCK_COMPANY_MODULES: Record<string, Record<TModuleKey, boolean>> = {
    'company-1': {
        products: true,
        wms: true,
        users: true,
        common: true,
        accounting: true,
        delivery: true,
        commercial: true,
        partners: true,
    },
    'company-2': {
        products: true,
        wms: false,
        users: true,
        common: false,
        accounting: false,
        delivery: true,
        commercial: true,
        partners: true,
    }
};
