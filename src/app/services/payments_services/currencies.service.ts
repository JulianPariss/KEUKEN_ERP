import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { COMMON_URL } from "../../lib/constants/api.constants";
import { IBCurrency } from "@repo/api-contracts/erp";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IFCurrency, IFCurrencyCreation, IFCurrencyUpdate } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { mapCurrencyListV2, mapCurrencyToCreate, mapCurrencyToUpdate } from "@repo/api-contracts/erp";

export const currenciesService = {
    async getAll(token: string, includeInactive: boolean = false, disableRecovery: boolean = false): Promise<IFListV2<IFCurrency>> {
        try {
            const queryParams = new URLSearchParams();
            if (includeInactive) {
                queryParams.set("include_inactive", "true");
            }
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
            const data: IBListV2<IBCurrency> = await apiFetch(
                `${COMMON_URL}/currencies${queryString}`,
                { method: "GET" },
                "No se pudieron obtener las monedas",
                { token, recoveryOptions: disableRecovery ? { recoveryMode: false } : undefined }
            );

            return mapCurrencyListV2(data);
        } catch (error) {
            console.error("Error en getAllCurrencies:", error);
            throw error;
        }
    },

    async create(data: IFCurrencyCreation, token: string, companyId: string): Promise<any> {
        try {
            const mappedData = mapCurrencyToCreate(data);
            const currencyResponse = await apiFetch<any>(
                `${COMMON_URL}/currencies`,
                {
                    method: "POST",
                    body: JSON.stringify({ ...mappedData, company_id: companyId }),
                },
                "No se pudo crear la moneda",
                { token, companyId }
            );

            return currencyResponse;
        } catch (error) {
            console.error("Error en createCurrency:", error);
            throw error;
        }
    },

    async update(id: string, data: IFCurrencyUpdate, token: string, companyId: string): Promise<any> {
        try {
            const mappedData = mapCurrencyToUpdate(data);
            const currencyResponse = await apiFetch<any>(
                `${COMMON_URL}/currencies/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ ...mappedData, company_id: companyId }),
                },
                "No se pudo actualizar la moneda",
                { token, companyId }
            );

            return currencyResponse;
        } catch (error) {
            console.error("Error en updateCurrency:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, companyId: string): Promise<any> {
        try {
            const currencyResponse = await apiFetch<any>(
                `${COMMON_URL}/currencies/${id}`,
                {
                    method: "DELETE",
                    body: JSON.stringify({ company_id: companyId }),
                },
                "No se pudo eliminar la moneda",
                { token, companyId }
            );

            return currencyResponse;
        } catch (error) {
            console.error("Error en deleteCurrency:", error);
            throw error;
        }
    },
};
