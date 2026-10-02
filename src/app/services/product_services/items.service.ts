import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IBItem } from "@repo/api-contracts/erp";
import { IFListBasicParams, IFListV2 } from "@repo/api-contracts/erp";
import { IFItem } from "@repo/api-contracts/erp";
import { mapListParams } from "@repo/api-contracts/erp";
import { mapItem, mapItemListV2, mapItemToCreate, mapItemToUpdate } from "@repo/api-contracts/erp";
import { formatQueryParams } from "@/lib/utils/formatter.helper";
import { PRODUCTS_URL } from "../../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IFOptionItem, IFOptionsListParams } from "@repo/api-contracts/erp";
import { mapOptionsList } from "@repo/api-contracts/erp";

export const itemsService = {
    async getAll(companyId: string, searchParams: IFListBasicParams, token: string, includeInactive: boolean = false): Promise<IFListV2<IFItem>> {
        try {
            const mappedParams = mapListParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const queryParams = new URLSearchParams(filteredParams);
            if (companyId) {
                queryParams.set("company_id", companyId);
            }
            queryParams.set("include_inactive", String(includeInactive));

            const url = `${PRODUCTS_URL}/items?${queryParams.toString()}`;
            const data = await apiFetch<IBListV2<IBItem>>(
                url,
                { method: "GET" },
                "No se pudieron obtener los items",
                { token, companyId }
            );

            return mapItemListV2(data);
        } catch (error) {
            console.error("Error en getAllItems:", error);
            throw error;
        }
    },
    async getOptions(companyId: string, params: IFOptionsListParams, token: string): Promise<IFListV2<IFOptionItem>> {
        try {
            const query = new URLSearchParams();
            if (params.q) query.set("q", params.q);
            if (companyId) query.set("company_id", companyId);
            if (params.productId) query.set("product_id", params.productId);
            if (params.limit !== undefined) query.set("limit", String(params.limit));
            if (params.offset !== undefined) query.set("offset", String(params.offset));
            if (params.active !== undefined) query.set("active", String(params.active));

            const data = await apiFetch<any>(
                `${PRODUCTS_URL}/items/options?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener opciones de items",
                { token, companyId }
            );

            return mapOptionsList(data);
        } catch (error) {
            console.error("Error en getOptions (items):", error);
            throw error;
        }
    },
    async create(data: Partial<IFItem>, token: string, companyId?: string): Promise<IFItem> {
        try {
            const mappedData = mapItemToCreate(data);
            const queryParams = new URLSearchParams();
            if (companyId) queryParams.set("company_id", companyId);
            const url = queryParams.toString()
                ? `${PRODUCTS_URL}/item?${queryParams.toString()}`
                : `${PRODUCTS_URL}/item`;

            const itemResponse = await apiFetch<IBItem>(
                url,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear el item",
                { token, companyId }
            );

            return mapItem(itemResponse);
        } catch (error) {
            console.error("Error en createItem:", error);
            throw error;
        }
    },
    async getItembySku(sku: string, token: string, companyId?: string): Promise<IFItem> {
        try {
            const queryParams = new URLSearchParams();
            if (companyId) queryParams.set("company_id", companyId);
            const url = queryParams.toString()
                ? `${PRODUCTS_URL}/item-by-sku/${sku}?${queryParams.toString()}`
                : `${PRODUCTS_URL}/item-by-sku/${sku}`;

            const itemResponse = await apiFetch<IBItem>(
                url,
                { method: "GET" },
                "No se pudo obtener el item por SKU",
                { token, companyId }
            );

            return mapItem(itemResponse);
        } catch (error) {
            console.error("Error en getItembySku:", error);
            throw error;
        }
    },
    async update(data: Partial<IFItem>, id: string, token: string, companyId?: string): Promise<IFItem> {
        try {
            const mappedData = mapItemToUpdate(data);
            const queryParams = new URLSearchParams();
            if (companyId) queryParams.set("company_id", companyId);
            const url = queryParams.toString()
                ? `${PRODUCTS_URL}/item/${id}?${queryParams.toString()}`
                : `${PRODUCTS_URL}/item/${id}`;

            const itemResponse = await apiFetch<IBItem>(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar el item",
                { token, companyId }
            );

            return mapItem(itemResponse);
        } catch (error) {
            console.error("Error en updateItem:", error);
            throw error;
        }
    },
    async delete(id: string, token: string, companyId?: string): Promise<string> {
        try {
            const queryParams = new URLSearchParams();
            if (companyId) queryParams.set("company_id", companyId);
            const url = queryParams.toString()
                ? `${PRODUCTS_URL}/items/${id}?${queryParams.toString()}`
                : `${PRODUCTS_URL}/items/${id}`;

            const message = await apiFetch<string>(
                url,
                { method: "DELETE" },
                "No se pudo eliminar el item",
                { token, companyId }
            );

            return message;
        } catch (error) {
            console.error("Error en deleteItem:", error);
            throw error;
        }
    },
};