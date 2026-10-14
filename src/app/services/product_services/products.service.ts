import { IBListV2, IBPackagingLevel } from "@repo/api-contracts/erp";
import { IBProduct, IBProductFullItem, IBProductClassification } from "@repo/api-contracts/erp";
import { IFListBasicParams, IFListV2, IFPackagingLevel } from "@repo/api-contracts/erp";
import {
    IFProduct,
    IFProductCreate,
    IFProductUpdate,
    IFProductFull,
    IFProductFullCreate,
    IFProductFullUpdate,
    IFProductFullItem,
    IFProductClassification
} from "@repo/api-contracts/erp";
import {
    mapProduct,
    mapProductFull,
    mapProductFullListV2,
    mapProductFullToCreate,
    mapProductFullToUpdate,
    mapProductListV2,
    mapProductSearchParams,
    mapProductToCreate,
    mapProductToUpdate,
    mapProductClassificationList,
    mapPackagingLevelList
} from "@repo/api-contracts/erp";
import { IFOptionItem, IFOptionsListParams } from "@repo/api-contracts/erp";
import { mapOptionsList } from "@repo/api-contracts/erp";
import { formatQueryParams } from "@/lib/utils/formatter.helper";
import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { PRODUCTS_URL } from "../../lib/constants/api.constants";

export const productsService = {
    async getAll(companyId: string, searchParams: IFListBasicParams, token: string, includeInactive: boolean = false): Promise<IFListV2<IFProduct>> {
        try {
            const mappedParams = mapProductSearchParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const queryParams = new URLSearchParams(filteredParams);
            queryParams.set("company_id", companyId);
            queryParams.set("include_inactive", String(includeInactive));

            const data: IBListV2<IBProduct> = await apiFetch(
                `${PRODUCTS_URL}/?${queryParams.toString()}`,
                { method: "GET" },
                "No se pudieron obtener los productos",
                { token, companyId }
            );

            return mapProductListV2(data);
        } catch (error) {
            console.error("Error en getAllProducts:", error);
            throw error;
        }
    },

    async getOptions(companyId: string, params: IFOptionsListParams, token: string): Promise<IFListV2<IFOptionItem>> {
        try {
            const query = new URLSearchParams();
            if (params.q) query.set("q", params.q);
            query.set("company_id", companyId);
            if (params.limit !== undefined) query.set("limit", String(params.limit));
            if (params.offset !== undefined) query.set("offset", String(params.offset));
            if (params.active !== undefined) query.set("active", String(params.active));

            const data: IBListV2<any> = await apiFetch(
                `${PRODUCTS_URL}/options?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener opciones de productos",
                { token, companyId }
            );

            return mapOptionsList(data);
        } catch (error) {
            console.error("Error en getOptions (products):", error);
            throw error;
        }
    },

    async getById(id: string, token: string, companyId?: string): Promise<IFProduct> {
        try {
            const queryParams = new URLSearchParams();
            if (companyId) queryParams.set("company_id", companyId);
            const url = queryParams.toString()
                ? `${PRODUCTS_URL}/${id}?${queryParams.toString()}`
                : `${PRODUCTS_URL}/${id}`;

            const data: IBProduct = await apiFetch<IBProduct>(
                url,
                { method: "GET" },
                "No se pudo obtener el producto",
                { token, companyId }
            );

            return mapProduct(data);
        } catch (error) {
            console.error("Error en getProductById:", error);
            throw error;
        }
    },

    async create(companyId: string, data: Partial<IFProduct> | IFProductCreate, token: string): Promise<IFProduct> {
        try {
            const mappedData = mapProductToCreate(data);
            const itemResponse: IBProduct = await apiFetch(
                `${PRODUCTS_URL}/?company_id=${companyId}`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear el producto",
                { token, companyId }
            );

            return mapProduct(itemResponse);
        } catch (error) {
            console.error("Error en createProduct:", error);
            throw error;
        }
    },

    async update(data: Partial<IFProduct> | IFProductUpdate, id: string, token: string): Promise<IFProduct> {
        try {
            const mappedData = mapProductToUpdate(data);
            const itemResponse: IBProduct = await apiFetch(
                `${PRODUCTS_URL}/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar el producto",
                { token }
            );

            return mapProduct(itemResponse);
        } catch (error) {
            console.error("Error en updateProduct:", error);
            throw error;
        }
    },

    async delete(id: string, token: string): Promise<string> {
        try {
            const message: string = await apiFetch(
                `${PRODUCTS_URL}/${id}`,
                { method: "DELETE" },
                "No se pudo eliminar el producto",
                { token }
            );

            return message;
        } catch (error) {
            console.error("Error en deleteProduct:", error);
            throw error;
        }
    },

    async createFull(data: IFProductFull | IFProductFullCreate, token: string, companyId?: string): Promise<IFProduct> {
        try {
            const mappedData = mapProductFullToCreate(data);
            const queryParams = new URLSearchParams();
            if (companyId) {
                queryParams.set("company_id", companyId);
            }
            const url = queryParams.toString()
                ? `${PRODUCTS_URL}/full?${queryParams.toString()}`
                : `${PRODUCTS_URL}/full`;

            const itemResponse: IBProduct = await apiFetch(
                url,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear el producto",
                { token, companyId }
            );

            return mapProduct(itemResponse);
        } catch (error) {
            console.error("Error en createProduct (full):", error);
            throw error;
        }
    },

    async updateFull(id: string, data: IFProductFullUpdate, token: string, companyId?: string): Promise<IFProductFullItem> {
        try {
            const mappedData = mapProductFullToUpdate(data);
            const queryParams = new URLSearchParams();
            if (companyId) {
                queryParams.set("company_id", companyId);
            }
            const url = queryParams.toString()
                ? `${PRODUCTS_URL}/${id}/full?${queryParams.toString()}`
                : `${PRODUCTS_URL}/${id}/full`;

            const itemResponse: IBProductFullItem = await apiFetch(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar el producto (full)",
                { token, companyId }
            );

            return mapProductFull(itemResponse);
        } catch (error) {
            console.error("Error en updateProduct (full):", error);
            throw error;
        }
    },

    async getFull(searchParams: IFListBasicParams, token: string, companyId?: string): Promise<IFListV2<IFProductFullItem>> {
        try {
            const mappedParams = mapProductSearchParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const queryParams = new URLSearchParams(filteredParams);
            if (companyId) {
                queryParams.set("company_id", companyId);
            }

            const data: IBListV2<IBProductFullItem> = await apiFetch(
                `${PRODUCTS_URL}/full?${queryParams.toString()}`,
                { method: "GET" },
                "No se pudieron obtener los productos",
                { token, companyId }
            );

            return mapProductFullListV2(data);
        } catch (error) {
            console.error("Error en getAllProducts:", error);
            throw error;
        }
    },

    async getFullById(id: string, token: string, companyId?: string): Promise<IFProductFullItem> {
        try {
            const data: IBProductFullItem = await apiFetch<IBProductFullItem>(
                `${PRODUCTS_URL}/${id}/full`,
                { method: "GET" },
                "No se pudo obtener el producto completo",
                { token, companyId }
            );

            return mapProductFull(data);
        } catch (error) {
            console.error("Error en getFullById:", error);
            throw error;
        }
    },

    async getClassifications(companyId: string, token: string): Promise<IFProductClassification[]> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.set("company_id", companyId);

            const data: IBProductClassification[] = await apiFetch(
                `${PRODUCTS_URL}/classifications?${queryParams.toString()}`,
                { method: "GET" },
                "No se pudieron obtener las clasificaciones de productos",
                { token, companyId }
            );

            return mapProductClassificationList(data);
        } catch (error) {
            console.error("Error en getClassifications:", error);
            throw error;
        }
    },

    async getPackagingLevels(token: string): Promise<IFPackagingLevel[]> {
        try {
            const data: IBPackagingLevel[] = await apiFetch(
                `${PRODUCTS_URL}/packaging-levels`,
                { method: "GET" },
                "No se pudieron obtener los niveles de empaque",
                { token }
            );

            return mapPackagingLevelList(data);
        } catch (error) {
            console.error("Error en getPackagingLevels:", error);
            throw error;
        }
    }
};