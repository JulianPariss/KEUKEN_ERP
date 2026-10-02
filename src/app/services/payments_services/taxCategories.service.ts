import { PARTNERS_URL } from "../../lib/constants/api.constants";
import { apiFetch } from "../../lib/utils/apiClient.helper";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IBTaxCategory } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFTaxCategory, IFTaxCategoryCreation, IFTaxCategoryUpdate } from "@repo/api-contracts/erp";
import { mapTaxCategoryListV2, mapTaxCategoryToCreate, mapTaxCategoryToUpdate } from "@repo/api-contracts/erp";

export const taxCategoriesService = {
    async getAll(countryCode: string, token: string, includeInactive?: boolean, companyId?: string): Promise<IFListV2<IFTaxCategory>> {
        try {
            const queryParams = new URLSearchParams();
            if (countryCode) queryParams.append("country_code", countryCode);
            if (includeInactive !== undefined) queryParams.append("include_inactive", String(includeInactive));
            const url = `${PARTNERS_URL}/tax-categories?${queryParams.toString()}`;

            const data: IBListV2<IBTaxCategory> = await apiFetch(
                url,
                { method: "GET" },
                "No se pudieron obtener las categorías de impuestos",
                { token, companyId }
            );

            return mapTaxCategoryListV2(data);
        } catch (error) {
            console.error("Error en getAllTaxCategories:", error);
            throw error;
        }
    },

    async create(data: IFTaxCategoryCreation, token: string, companyId?: string): Promise<any> {
        try {
            const mappedData = mapTaxCategoryToCreate(data);
            const taxCategoryResponse = await apiFetch(
                `${PARTNERS_URL}/tax-categories`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear la categoría de impuestos",
                { token, companyId }
            );

            return taxCategoryResponse;
        } catch (error) {
            console.error("Error en createTaxCategory:", error);
            throw error;
        }
    },

    async update(id: string, data: IFTaxCategoryUpdate, token: string, companyId?: string): Promise<any> {
        try {
            const mappedData = mapTaxCategoryToUpdate(data);
            const taxCategoryResponse = await apiFetch(
                `${PARTNERS_URL}/tax-categories/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar la categoría de impuestos",
                { token, companyId }
            );

            return taxCategoryResponse;
        } catch (error) {
            console.error("Error en updateTaxCategory:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, companyId?: string): Promise<any> {
        try {
            const taxCategoryResponse = await apiFetch(
                `${PARTNERS_URL}/tax-categories/${id}`,
                { method: "DELETE" },
                "No se pudo eliminar la categoría de impuestos",
                { token, companyId }
            );

            return taxCategoryResponse;
        } catch (error) {
            console.error("Error en deleteTaxCategory:", error);
            throw error;
        }
    },
};
