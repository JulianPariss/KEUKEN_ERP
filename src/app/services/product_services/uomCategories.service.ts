import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IBUoMCategory } from "@repo/api-contracts/erp";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IFUoMCategory } from "@repo/api-contracts/erp";
import { IFListBasicParams, IFListV2 } from "@repo/api-contracts/erp";
import { mapUoMCategory, mapUoMCategoryListV2, mapUoMCategoryToCreate, mapUoMCategoryToUpdate } from "@repo/api-contracts/erp";
import { mapListParams } from "@repo/api-contracts/erp";
import { formatQueryParams } from "@/lib/utils/formatter.helper";
import { PRODUCTS_URL } from "../../lib/constants/api.constants";

export const uomCategoriesService = {
    async getAll(searchParams: IFListBasicParams, token: string): Promise<IFListV2<IFUoMCategory>> {
        try {
            const mappedParams = mapListParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const query = new URLSearchParams(filteredParams).toString();

            const url = `${PRODUCTS_URL}/uom-categories?${query}`;

            const data = await apiFetch<IBListV2<IBUoMCategory>>(
                url,
                { method: "GET" },
                "No se pudieron obtener las categorías de UoM",
                { token }
            );

            return mapUoMCategoryListV2(data);
        } catch (error) {
            console.error("Error en getAll UoM Categories:", error);
            throw error;
        }
    },
    async create(data: Partial<IFUoMCategory>, token: string): Promise<IFUoMCategory> {
        try {
            const mappedData = mapUoMCategoryToCreate(data);
            const itemResponse = await apiFetch<IBUoMCategory>(
                `${PRODUCTS_URL}/uom-category`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear la categoría de UoM",
                { token }
            );

            return mapUoMCategory(itemResponse);
        } catch (error) {
            console.error("Error en create UoM Category:", error);
            throw error;
        }
    },
    async update(data: Partial<IFUoMCategory>, id: string, token: string): Promise<IFUoMCategory> {
        try {
            const mappedData = mapUoMCategoryToUpdate(data);
            const itemResponse = await apiFetch<IBUoMCategory>(
                `${PRODUCTS_URL}/uom-category/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar la categoría de UoM",
                { token }
            );

            return mapUoMCategory(itemResponse);
        } catch (error) {
            console.error("Error en update UoM Category:", error);
            throw error;
        }
    },
    async delete(id: string, token: string): Promise<string> {
        try {
            const message = await apiFetch<string>(
                `${PRODUCTS_URL}/uom-categories/${id}`,
                { method: "DELETE" },
                "No se pudo eliminar la categoría de UoM",
                { token }
            );

            return message;
        } catch (error) {
            console.error("Error en delete UoM Category:", error);
            throw error;
        }
    },
};
