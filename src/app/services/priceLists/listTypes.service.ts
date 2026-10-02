import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { COMMERCIAL_URL } from "../../lib/constants/api.constants";
import { IBListV2, IBActionResponse } from "@repo/api-contracts/erp";
import { IBListType } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFListType, IFListTypeCreate, IFListTypePatch } from "@repo/api-contracts/erp";
import { mapListType, mapListTypeToCreate, mapListTypeToPatch } from "@repo/api-contracts/erp";

export const listTypesService = {
    async getAll(
        token: string,
        companyId: string,
        limit: number = 50,
        offset: number = 0,
        operation?: string | null
    ): Promise<IFListV2<IFListType>> {
        try {
            const url = new URL(`${COMMERCIAL_URL}/pricelist-types`);
            url.searchParams.append("company_id", companyId);
            url.searchParams.append("limit", limit.toString());
            url.searchParams.append("offset", offset.toString());
            if (operation) {
                url.searchParams.append("operation", operation);
            }

            const data: IBListV2<IBListType> = await apiFetch(
                url.toString(),
                { method: "GET" },
                "No se pudieron obtener los tipos de listas",
                { token, companyId }
            );
            
            return {
                items: data.items.map(mapListType),
                metadata: {
                    totalItems: data.metadata.total_items,
                    totalPages: data.metadata.total_pages,
                    currentPage: data.metadata.current_page,
                    limit: data.metadata.limit,
                    offset: data.metadata.offset,
                }
            };
        } catch (error) {
            console.error("Error en getAllListTypes:", error);
            throw error;
        }
    },

    async create(data: IFListTypeCreate, token: string): Promise<IFListType> {
        try {
            const mappedData = mapListTypeToCreate(data);
            const responseData: IBListType = await apiFetch(
                `${COMMERCIAL_URL}/pricelist-types`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear el tipo de lista",
                { token }
            );

            return mapListType(responseData);
        } catch (error) {
            console.error("Error en createListType:", error);
            throw error;
        }
    },

    async update(id: string, data: IFListTypePatch, token: string): Promise<IFListType> {
        try {
            const mappedData = mapListTypeToPatch(data);
            const responseData: IBListType = await apiFetch(
                `${COMMERCIAL_URL}/pricelist-types/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar el tipo de lista",
                { token }
            );

            return mapListType(responseData);
        } catch (error) {
            console.error("Error en updateListType:", error);
            throw error;
        }
    },

    async delete(id: string, token: string): Promise<string> {
        try {
            const data: IBActionResponse = await apiFetch(
                `${COMMERCIAL_URL}/pricelist-types/${id}`,
                { method: "DELETE" },
                "No se pudo eliminar el tipo de lista",
                { token }
            );

            return data.message;
        } catch (error) {
            console.error("Error en deleteListType:", error);
            throw error;
        }
    }
};
