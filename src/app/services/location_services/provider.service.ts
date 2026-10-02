import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { PARTNERS_URL } from "../../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IBProvider, IBProviderFull } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFProvider, IFProviderCreation, IFProviderUpdate, IFProviderFull } from "@repo/api-contracts/erp";
import { IFOptionItem, IFOptionsListParams } from "@repo/api-contracts/erp";
import { IBOptionItem } from "@repo/api-contracts/erp";
import { mapOptionsList } from "@repo/api-contracts/erp";
import { mapProviderFull, mapProviderListV2, mapProviderToCreate, mapProviderToUpdate } from "@repo/api-contracts/erp";

export const providerService = {
    async getAll(token: string, companyId?: string): Promise<IFListV2<IFProvider>> {
        try {
            const url = companyId
                ? `${PARTNERS_URL}/suppliers?company_id=${encodeURIComponent(companyId)}`
                : `${PARTNERS_URL}/suppliers`;

            const data: IBListV2<IBProvider> = await apiFetch(
                url,
                { method: "GET" },
                "No se pudieron obtener los proveedores",
                { token, companyId }
            );

            return mapProviderListV2(data);
        } catch (error) {
            console.error("Error en getAllProviders:", error);
            throw error;
        }
    },

    async getOptions(params: IFOptionsListParams, token: string): Promise<IFListV2<IFOptionItem>> {
        try {
            const query = new URLSearchParams();
            if (params.q) query.set("q", params.q);
            if (params.companyId) query.set("company_id", params.companyId);
            if (params.limit !== undefined) query.set("limit", String(params.limit));
            if (params.offset !== undefined) query.set("offset", String(params.offset));
            if (params.active !== undefined) query.set("active", String(params.active));

            const data: IBListV2<IBOptionItem> = await apiFetch(
                `${PARTNERS_URL}/suppliers/options?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener opciones de proveedores",
                { token, companyId: params.companyId }
            );

            return mapOptionsList(data);
        } catch (error) {
            console.error("Error en getOptions (providers):", error);
            throw error;
        }
    },

    async create(data: IFProviderCreation, token: string, companyId?: string): Promise<any> {
        try {
            const mappedData = mapProviderToCreate(data);
            const targetCompanyId = companyId || data.companyId;
            const payload = targetCompanyId ? { ...mappedData, company_id: targetCompanyId } : mappedData;
            const url = targetCompanyId
                ? `${PARTNERS_URL}/supplier?company_id=${encodeURIComponent(targetCompanyId)}`
                : `${PARTNERS_URL}/supplier`;

            const providerResponse = await apiFetch<any>(
                url,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
                "No se pudo crear el proveedor",
                { token, companyId: targetCompanyId }
            );

            return providerResponse;
        } catch (error) {
            console.error("Error en createProvider:", error);
            throw error;
        }
    },

    async update(id: string, data: IFProviderUpdate, token: string, companyId?: string): Promise<any> {
        try {
            const mappedData = mapProviderToUpdate(data);
            const payload = companyId ? { ...mappedData, company_id: companyId } : mappedData;
            const url = companyId
                ? `${PARTNERS_URL}/suppliers/${id}?company_id=${encodeURIComponent(companyId)}`
                : `${PARTNERS_URL}/suppliers/${id}`;

            const providerResponse = await apiFetch<any>(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                },
                "No se pudo actualizar el proveedor",
                { token, companyId }
            );

            return providerResponse;
        } catch (error) {
            console.error("Error en updateProvider:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, companyId?: string): Promise<{ message: string }> {
        try {
            const url = companyId
                ? `${PARTNERS_URL}/suppliers/${id}?company_id=${encodeURIComponent(companyId)}`
                : `${PARTNERS_URL}/suppliers/${id}`;

            return await apiFetch<{ message: string }>(
                url,
                { method: "DELETE" },
                "No se pudo eliminar el proveedor",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en deleteProvider:", error);
            throw error;
        }
    },

    async getFull(id: string, token: string, companyId?: string): Promise<IFProviderFull> {
        try {
            const url = companyId
                ? `${PARTNERS_URL}/suppliers/${id}/full?company_id=${encodeURIComponent(companyId)}`
                : `${PARTNERS_URL}/suppliers/${id}/full`;

            const data: { supplier: IBProviderFull } = await apiFetch(
                url,
                { method: "GET" },
                "No se pudo obtener el detalle completo del proveedor",
                { token, companyId }
            );

            return mapProviderFull(data.supplier);
        } catch (error) {
            console.error("Error en getFullProvider:", error);
            throw error;
        }
    },
};