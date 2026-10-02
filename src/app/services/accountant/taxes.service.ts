import { ACCOUNTS_URL } from "@/app/lib/constants/api.constants";
import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IBTax } from "@repo/api-contracts/erp";
import { IFTax, IFTaxCreate, IFTaxUpdate } from "@repo/api-contracts/erp";
import { IFListV4 } from "@repo/api-contracts/erp";
import { mapTax, mapTaxListV4, mapTaxToCreate, mapTaxToUpdate } from "@repo/api-contracts/erp";

export const taxesService = {
    async getAll(token: string, companyId: string): Promise<IFListV4<IFTax>> {
        try {
            const data = await apiFetch<{ items: IBTax[]; total_items: number }>(
                `${ACCOUNTS_URL}/taxes?company_id=${companyId}`,
                { method: "GET" },
                "No se pudieron obtener los impuestos",
                { token, companyId }
            );
            return mapTaxListV4(data);
        } catch (error) {
            console.error("Error en getAllTaxes:", error);
            throw error;
        }
    },

    async getById(id: string, token: string, companyId: string): Promise<IFTax> {
        try {
            const data = await apiFetch<IBTax>(
                `${ACCOUNTS_URL}/taxes/${id}?company_id=${companyId}`,
                { method: "GET" },
                "No se pudo obtener el impuesto",
                { token, companyId }
            );
            return mapTax(data);
        } catch (error) {
            console.error("Error en getTaxById:", error);
            throw error;
        }
    },

    async create(data: IFTaxCreate, token: string, companyId: string): Promise<IFTax> {
        try {
            const mappedData = mapTaxToCreate(data);
            const itemResponse = await apiFetch<IBTax>(
                `${ACCOUNTS_URL}/taxes?company_id=${companyId}`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear el impuesto",
                { token, companyId }
            );
            return mapTax(itemResponse);
        } catch (error) {
            console.error("Error en createTax:", error);
            throw error;
        }
    },

    async update(id: string, data: IFTaxUpdate, token: string, companyId: string): Promise<IFTax> {
        try {
            const mappedData = mapTaxToUpdate(data);
            const itemResponse = await apiFetch<IBTax>(
                `${ACCOUNTS_URL}/taxes/${id}?company_id=${companyId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar el impuesto",
                { token, companyId }
            );
            return mapTax(itemResponse);
        } catch (error) {
            console.error("Error en updateTax:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, companyId: string): Promise<any> {
        try {
            const deleteResponse = await apiFetch<any>(
                `${ACCOUNTS_URL}/taxes/${id}?company_id=${companyId}`,
                { method: "DELETE" },
                "No se pudo eliminar el impuesto",
                { token, companyId }
            );
            return deleteResponse;
        } catch (error) {
            console.error("Error en deleteTax:", error);
            throw error;
        }
    }
};

