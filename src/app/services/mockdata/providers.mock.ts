import { IBListV2 } from "@repo/api-contracts/erp";
import { IBProvider } from "@repo/api-contracts/erp";

export const MOCK_PROVIDERS_RESPONSE: IBListV2<IBProvider> = {
    items: [
        {
            id: '1',
            name: 'Distribuidora Global S.A.',
            company_id: 'comp_erp_01',
            email: 'contacto@distglobal.com',
            ref: 'ref_1',
            account_debit_id: 'account_debit_1',
            account_credit_id: 'account_credit_1',
            min_days_to_expiry_reception: 10,
            min_days_to_expiry_order: 20,
            tax_id: '30-70809010-3',
            code: 'PROV001',
            country_id: 'country_1',
            country_iso_code: 'AR',
            state_id: 'state_1',
            state_code: 'CABA',
            state_name: 'Ciudad Autónoma de Buenos Aires',
        } as any,
        {
            id: '2',
            name: 'Importaciones Tech-Flow',
            company_id: 'comp_erp_01',
            email: 'sales@techflow.com',
            ref: 'ref_2',
            account_debit_id: 'account_debit_2',
            account_credit_id: 'account_credit_2',
            min_days_to_expiry_reception: 15,
            min_days_to_expiry_order: 25,
            tax_id: 'US-TECH-2024',
            code: 'PROV002',
            country_id: 'country_1',
            country_iso_code: 'US',
            state_id: 'state_2',
            state_code: 'NY',
            state_name: 'New York',
        } as any,
        {
            id: '3',
            name: 'Servicios Logísticos del Norte',
            company_id: 'comp_erp_01',
            email: 'info@logiscadenorte.com.ar',
            ref: 'ref_3',
            account_debit_id: 'account_debit_3',
            account_credit_id: 'account_credit_3',
            min_days_to_expiry_reception: 12,
            min_days_to_expiry_order: 22,
            tax_id: '33-55667788-9',
            code: 'PROV003',
            country_id: 'country_1',
            country_iso_code: 'AR',
            state_id: 'state_3',
            state_code: 'SFE',
            state_name: 'Santa Fe',
        } as any
    ],
    metadata: {
        total_items: 3,
        total_pages: 1,
        current_page: 1,
        limit: 10,
        offset: 0
    }
};

import { IFProvider } from "@repo/api-contracts/erp";

export const providersInterceptor = {
    getAll: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_PROVIDERS_RESPONSE;
    },
    create: async (provider: Partial<IFProvider>): Promise<IFProvider> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newProvider = {
            id: Math.random().toString(36).substr(2, 9),
            code: (provider as any).code || "",
            name: provider.name || "",
            companyId: provider.companyId || "",
            email: provider.email || "",
            taxId: provider.taxId || "",
            ref: (provider as any).ref || "",
            accountDebitId: (provider as any).accountDebitId || "",
            accountCreditId: (provider as any).accountCreditId || "",
            minDaysToExpiryReception: (provider as any).minDaysToExpiryReception || 0,
            minDaysToExpiryOrder: provider.minDaysToExpiryOrder || 0,
            countryId: (provider as any).countryId || "",
            countryIsoCode: (provider as any).countryIsoCode || "",
            stateId: (provider as any).stateId || "",
            stateCode: (provider as any).stateCode || "",
            stateName: (provider as any).stateName || "",
        } as any;
        return newProvider as IFProvider;
    },
    update: async (id: string, provider: Partial<IFProvider>): Promise<IFProvider> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            ...provider,
            id,
            updatedAt: new Date().toISOString(),
        } as any;
    }
};
