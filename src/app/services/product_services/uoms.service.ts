import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IBUoMCategory } from "@repo/api-contracts/erp";
import { IFListBasicParams, IFListV2 } from "@repo/api-contracts/erp";
import { IFUoMCategory } from "@repo/api-contracts/erp";
import { mapListParams } from "@repo/api-contracts/erp";
import { formatQueryParams } from "@/lib/utils/formatter.helper";
import { PRODUCTS_URL } from "../../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IBUOM } from "@repo/api-contracts/erp";
import { IFUOM } from "@repo/api-contracts/erp";
import { mapUoM, mapUoMCategoryListV2, mapUoMListV2, mapUoMToCreate, mapUoMToUpdate } from "@repo/api-contracts/erp";


export const uomsService = {
    async getAll(searchParams: IFListBasicParams, token: string): Promise<IFListV2<IFUOM>> {
        try {
            const mappedParams = mapListParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const query = new URLSearchParams(filteredParams).toString();

            const url = `${PRODUCTS_URL}/uoms?${query}`;

            const data: IBListV2<IBUOM> = await apiFetch(
                url,
                { method: "GET" },
                "No se pudieron obtener las unidades de medida",
                { token }
            );

            return mapUoMListV2(data);
        } catch (error) {
            throw error;
        }
    },
    async create(data: Partial<IFUOM>, token: string): Promise<IFUOM> {
        try {
            const mappedData = mapUoMToCreate(data);
            const itemResponse: IBUOM = await apiFetch(
                `${PRODUCTS_URL}/uom`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear la unidad de medida",
                { token }
            );

            return mapUoM(itemResponse);

        } catch (error) {
            throw error;
        }
    },
    async update(data: Partial<IFUOM>, id: string, token: string): Promise<IFUOM> {
        try {
            const mappedData = mapUoMToUpdate(data);
            const itemResponse: IBUOM = await apiFetch(
                `${PRODUCTS_URL}/uom/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar la unidad de medida",
                { token }
            );

            return mapUoM(itemResponse);

        } catch (error) {
            console.error("Error en updateUoM:", error);
            throw error;
        }
    },
    async delete(id: string, token: string): Promise<string> {
        try {
            const message: string = await apiFetch(
                `${PRODUCTS_URL}/uoms/${id}`,
                { method: "DELETE" },
                "No se pudo eliminar la unidad de medida",
                { token }
            );

            return message;
        } catch (error) {
            console.error("Error en deleteUoM:", error);
            throw error;
        }
    },
    async getUoMCategories(searchParams: IFListBasicParams, token: string): Promise<IFListV2<IFUoMCategory>> {
        try {
            const mappedParams = mapListParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const query = new URLSearchParams(filteredParams).toString();

            const url = `${PRODUCTS_URL}/uom-categories?${query}`;

            const data: IBListV2<IBUoMCategory> = await apiFetch(
                url,
                { method: "GET" },
                "No se pudieron obtener las categorías de unidades de medida",
                { token, recoveryOptions: { recoveryMode: false } }
            );

            return mapUoMCategoryListV2(data);

        } catch (error) {
            console.error("Error en getUoMCategories:", error);
            throw error;
        }
    },
};