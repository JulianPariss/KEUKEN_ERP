import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { COMMERCIAL_URL } from "../../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IBPriceList, IBPriceListFull, IBPriceListCatalog, IBPriceListBulkResponse } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFPriceList, IFPriceListCreate, IFPriceListUpdate, IFPriceListFull, IFPriceListCatalog, IFPriceListBulkUpdate, IFPriceListBulkResponse, IFPriceListItemCreate } from "@repo/api-contracts/erp";
import { mapPriceList, mapPriceListCreateToBackend, mapPriceListListV2, mapPriceListFull, mapPriceListCatalog, mapPriceListBulkUpdateToBackend, mapPriceListBulkResponse, mapPriceListItemCreateToBackend } from "@repo/api-contracts/erp";
import { IFOptionItem, IFOptionsListParams } from "@repo/api-contracts/erp";
import { mapOptionsList } from "@repo/api-contracts/erp";

export const priceListsService = {
    async getAll(
        token: string,
        companyId: string,
        limit: number = 100,
        offset: number = 0,
        filters?: {
            pricelistTypeId?: string | null;
            state?: string | null;
            name?: string | null;
            code?: string | null;
            validAt?: string | null;
            operation?: string | null;
        }
    ): Promise<IFListV2<IFPriceList>> {
        try {
            const queryParams = new URLSearchParams({
                company_id: companyId,
                limit: limit.toString(),
                offset: offset.toString(),
            });

            if (filters?.pricelistTypeId) queryParams.append('pricelist_type_id', filters.pricelistTypeId);
            if (filters?.state) queryParams.append('state', filters.state);
            if (filters?.name) queryParams.append('name', filters.name);
            if (filters?.code) queryParams.append('code', filters.code);
            if (filters?.validAt) queryParams.append('valid_at', filters.validAt);
            if (filters?.operation) queryParams.append('operation', filters.operation);

            const data: IBListV2<IBPriceList> = await apiFetch(
                `${COMMERCIAL_URL}/pricelists?${queryParams.toString()}`,
                { method: "GET" },
                "No se pudieron obtener las listas de precios",
                { token, companyId }
            );

            return mapPriceListListV2(data);
        } catch (error) {
            console.error("Error en getAll priceLists:", error);
            throw error;
        }
    },

    async getOptions(params: IFOptionsListParams, token: string): Promise<IFListV2<IFOptionItem>> {
        try {
            const query = new URLSearchParams();
            if (params.companyId) query.set("company_id", params.companyId);
            if (params.state) query.set("state", params.state);
            if (params.limit !== undefined) query.set("limit", String(params.limit));
            if (params.offset !== undefined) query.set("offset", String(params.offset));

            const data = await apiFetch<any>(
                `${COMMERCIAL_URL}/pricelists/options?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener opciones de listas de precios",
                { token, companyId: params.companyId }
            );

            return mapOptionsList(data);
        } catch (error) {
            console.error("Error en getOptions (pricelists):", error);
            throw error;
        }
    },

    async getById(id: string, token: string): Promise<IFPriceListFull> {
        try {
            const data: IBPriceListFull = await apiFetch(
                `${COMMERCIAL_URL}/pricelists/${id}`,
                { method: "GET" },
                "No se pudo obtener el detalle de la lista de precios",
                { token }
            );

            return mapPriceListFull(data);
        } catch (error) {
            console.error("Error en getById priceList:", error);
            throw error;
        }
    },

    async getFull(
        pricelistId: string,
        token: string,
        limit?: number,
        offset?: number,
    ): Promise<IFPriceListCatalog> {
        try {
            const url = new URL(`${COMMERCIAL_URL}/pricelists/${pricelistId}/full`);
            if (limit !== undefined && limit !== null) {
                url.searchParams.append("limit", limit.toString());
            }
            if (offset !== undefined && offset !== null) {
                url.searchParams.append("offset", offset.toString());
            }

            const data: IBPriceListCatalog = await apiFetch(
                url.toString(),
                { method: "GET" },
                "No se pudo obtener el catálogo de la lista de precios",
                { token }
            );

            return mapPriceListCatalog(data);
        } catch (error) {
            console.error("Error en getFull priceList:", error);
            throw error;
        }
    },

    async create(data: IFPriceListCreate, token: string): Promise<IFPriceList> {
        try {
            const mappedData = mapPriceListCreateToBackend(data);
            const resData: IBPriceList = await apiFetch(
                `${COMMERCIAL_URL}/pricelists`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear la lista de precios",
                { token }
            );

            return mapPriceList(resData);
        } catch (error) {
            console.error("Error en create priceList:", error);
            throw error;
        }
    },

    async bulkUpdate(data: IFPriceListBulkUpdate, token: string): Promise<IFPriceListBulkResponse> {
        try {
            const mappedData = mapPriceListBulkUpdateToBackend(data);
            const resData: IBPriceListBulkResponse = await apiFetch(
                `${COMMERCIAL_URL}/pricelist-items/bulk`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudieron aplicar los cambios masivos",
                { token }
            );

            return mapPriceListBulkResponse(resData);
        } catch (error) {
            console.error("Error en bulkUpdate priceLists:", error);
            throw error;
        }
    },

    async addRule(data: IFPriceListItemCreate, token: string): Promise<any> {
        try {
            const mappedData = mapPriceListItemCreateToBackend(data);
            return await apiFetch(
                `${COMMERCIAL_URL}/pricelist-items`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo añadir la regla",
                { token }
            );
        } catch (error) {
            console.error("Error en addRule:", error);
            throw error;
        }
    },

    async update(pricelistId: string, data: IFPriceListUpdate, token: string): Promise<IFPriceList> {
        try {
            const body: Record<string, any> = {};
            if (data.state !== undefined) body.state = data.state;
            if (data.validFrom !== undefined) body.valid_from = data.validFrom;
            if (data.name !== undefined) body.name = data.name;

            const resData: IBPriceList = await apiFetch(
                `${COMMERCIAL_URL}/pricelists/${pricelistId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(body),
                },
                "No se pudo actualizar la lista de precios",
                { token }
            );

            return mapPriceList(resData);
        } catch (error) {
            console.error("Error en update priceList:", error);
            throw error;
        }
    },

    async delete(pricelistId: string, token: string): Promise<{ message: string }> {
        try {
            const resData = await apiFetch<{ message: string }>(
                `${COMMERCIAL_URL}/pricelists/${pricelistId}`,
                {
                    method: "DELETE",
                },
                "No se pudo eliminar la lista de precios",
                { token }
            );

            return resData;
        } catch (error) {
            console.error("Error en delete priceList:", error);
            throw error;
        }
    },

    async removeRule(itemRuleId: string, token: string): Promise<{ message: string }> {
        try {
            const resData = await apiFetch<{ message: string }>(
                `${COMMERCIAL_URL}/pricelist-items/${itemRuleId}`,
                {
                    method: "DELETE",
                },
                "No se pudo eliminar la regla",
                { token }
            );

            return resData;
        } catch (error) {
            console.error("Error en removeRule priceLists:", error);
            throw error;
        }
    },

    async recalculate(pricelistId: string, token: string): Promise<{ message: string; items_recalculated: number }> {
        try {
            const resData = await apiFetch<{ message: string; items_recalculated: number }>(
                `${COMMERCIAL_URL}/pricelists/${pricelistId}/recalculate`,
                {
                    method: "POST",
                },
                "Error al recalcular la lista de precios",
                { token }
            );

            return resData;
        } catch (error) {
            console.error("Error en recalculate priceLists:", error);
            throw error;
        }
    },
};

