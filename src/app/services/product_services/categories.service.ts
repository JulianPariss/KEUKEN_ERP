import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IBCategory } from "@repo/api-contracts/erp";
import { IFCategory } from "@repo/api-contracts/erp";
import { IFListBasicParams, IFListV2 } from "@repo/api-contracts/erp";
import { mapCategory, mapCategoryListV2, mapCategoryToCreate, mapCategoryToUpdate } from "@repo/api-contracts/erp";
import { mapListParams } from "@repo/api-contracts/erp";
import { formatQueryParams } from "@/lib/utils/formatter.helper";
import { PRODUCTS_URL } from "../../lib/constants/api.constants";

export const categoriesService = {
    async getAll(companyId: string, searchParams: IFListBasicParams, token: string): Promise<IFListV2<IFCategory>> {
        try {
            const mappedParams = mapListParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const queryParams = new URLSearchParams(filteredParams);
            queryParams.set("company_id", companyId);

            const url = `${PRODUCTS_URL}/categories?${queryParams.toString()}`;

            const data = await apiFetch<any>(
                url,
                { method: "GET" },
                "No se pudieron obtener las categorías",
                { token, companyId }
            );

            return mapCategoryListV2(data);
        } catch (error) {
            console.error("Error en getAllCategories:", error);
            throw error;
        }
    },

    async create(data: Partial<IFCategory>, token: string): Promise<IFCategory> {
        try {
            const mappedData = mapCategoryToCreate(data);
            const itemResponse = await apiFetch<IBCategory>(
                `${PRODUCTS_URL}/category`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear la categoría",
                { token, companyId: data.companyId }
            );

            return mapCategory(itemResponse);
        } catch (error) {
            console.error("Error en createCategory:", error);
            throw error;
        }
    },

    async update(data: Partial<IFCategory>, id: string, token: string): Promise<IFCategory> {
        try {
            const mappedData = mapCategoryToUpdate(data);
            const itemResponse = await apiFetch<IBCategory>(
                `${PRODUCTS_URL}/category/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar la categoría",
                { token, companyId: data.companyId }
            );

            return mapCategory(itemResponse);
        } catch (error) {
            console.error("Error en updateCategory:", error);
            throw error;
        }
    },

    async delete(id: string, token: string): Promise<string> {
        try {
            return await apiFetch<string>(
                `${PRODUCTS_URL}/categories/${id}`,
                {
                    method: "DELETE",
                },
                "No se pudo eliminar la categoría",
                { token }
            );
        } catch (error) {
            console.error("Error en deleteCategory:", error);
            throw error;
        }
    },
};