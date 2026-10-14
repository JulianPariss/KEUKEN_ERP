import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { COMBOS_URL, PRODUCTS_URL } from "../../lib/constants/api.constants";
import { formatQueryParams } from "@/lib/utils/formatter.helper";
import {
    IBListV2,
    IBProduct,
    IBProductFull,
    IBProductClassification,
    IFListBasicParams,
    IFListV2,
    IFOptionItem,
    IFOptionsListParams,
    IFCombo,
    IFComboProductCreate,
    IFComboItemCreate,
    IFComboItemUpdate,
    mapProductToCombo,
    mapComboProductCreateToBackend,
    mapComboItemCreateToBackend,
    mapComboItemUpdateToBackend,
    mapOptionsList,
    mapProductClassificationList
} from "@repo/api-contracts/erp";

export const combosService = {
    /**
     * Obtiene todos los productos de clasificación COMBO paginados
     */
    async getAll(
        companyId: string,
        searchParams: IFListBasicParams,
        token: string,
        includeInactive: boolean = false
    ): Promise<IFListV2<IFCombo>> {
        try {
            const queryParams = new URLSearchParams();
            if (companyId) queryParams.set("company_id", companyId);
            queryParams.set("include_inactive", String(includeInactive));
            queryParams.set("classification", "COMBO");
            if (searchParams.limit !== undefined) queryParams.set("limit", String(searchParams.limit));
            if (searchParams.offset !== undefined) queryParams.set("offset", String(searchParams.offset));
            if ((searchParams as any).q) queryParams.set("q", (searchParams as any).q);

            const data = await apiFetch<IBListV2<IBProduct>>(
                `${COMBOS_URL}/?${queryParams.toString()}`,
                { method: "GET" },
                "No se pudieron obtener los combos",
                { token, companyId }
            );

            // Filtrar también en memoria por seguridad si el backend no filtra por clasificación
            const comboItems = (data.items || [])
                .filter(p => !p.classification || p.classification.toUpperCase() === "COMBO")
                .map(mapProductToCombo);

            return {
                items: comboItems,
                metadata: {
                    totalItems: data.metadata?.total_items ?? comboItems.length,
                    totalPages: data.metadata?.total_pages ?? 1,
                    currentPage: data.metadata?.current_page ?? 1,
                    limit: data.metadata?.limit ?? searchParams.limit ?? 20,
                    offset: data.metadata?.offset ?? searchParams.offset ?? 0
                }
            };
        } catch (error) {
            console.error("Error en combosService.getAll:", error);
            throw error;
        }
    },

    /**
     * Obtiene el detalle completo del combo leyendo la composición desde /products/{id}/full
     */
    async getFullById(id: string, token: string, companyId?: string): Promise<IFCombo> {
        try {
            const data = await apiFetch<IBProductFull>(
                `${COMBOS_URL}/${id}/full`,
                { method: "GET" },
                "No se pudo obtener el detalle del combo",
                { token, companyId }
            );

            return mapProductToCombo(data);
        } catch (error) {
            console.error(`Error en combosService.getFullById (${id}):`, error);
            throw error;
        }
    },

    /**
     * Alta completa en dos pasos:
     * 1. POST /products/ (cabecera con classification: "COMBO")
     * 2. POST /products/item (ítem pack con composition_data validada por backend)
     */
    async createCombo(
        companyId: string,
        payload: {
            product: IFComboProductCreate;
            item: Omit<IFComboItemCreate, "productId">;
        },
        token: string
    ): Promise<IFCombo> {
        try {
            // Paso 1: Crear cabecera de producto COMBO
            const productBackendPayload = mapComboProductCreateToBackend(payload.product, companyId);
            const createdProduct = await apiFetch<{ id: string; name: string }>(
                `${PRODUCTS_URL}/?company_id=${companyId}`,
                {
                    method: "POST",
                    body: JSON.stringify(productBackendPayload)
                },
                "No se pudo crear la cabecera del combo",
                { token, companyId }
            );

            // Paso 2: Crear el ítem que encapsula la estructura composition_data
            const itemBackendPayload = mapComboItemCreateToBackend(
                {
                    ...payload.item,
                    productId: createdProduct.id,
                    sku: payload.item.sku || `${payload.product.skuPrefix}001`
                },
                createdProduct.id,
                companyId
            );

            await apiFetch<any>(
                `${PRODUCTS_URL}/item?company_id=${companyId}`,
                {
                    method: "POST",
                    body: JSON.stringify(itemBackendPayload)
                },
                "No se pudo registrar la composición del combo",
                { token, companyId }
            );

            // Retornar detalle completo
            return await this.getFullById(createdProduct.id, token, companyId);
        } catch (error) {
            console.error("Error en combosService.createCombo:", error);
            throw error;
        }
    },

    /**
     * Edición de cabecera y composición
     */
    async updateCombo(
        id: string,
        itemId: string | null | undefined,
        payload: {
            product?: Partial<IFComboProductCreate>;
            item?: IFComboItemUpdate;
        },
        token: string,
        companyId?: string
    ): Promise<IFCombo> {
        try {
            // Paso 1: Actualizar cabecera si vino información
            if (payload.product) {
                const patchPayload: Record<string, any> = {};
                if (payload.product.name) patchPayload.name = payload.product.name;
                if (payload.product.uomId) patchPayload.uom_id = payload.product.uomId;
                if (payload.product.defaultSecUomId !== undefined) patchPayload.default_sec_uom_id = payload.product.defaultSecUomId;
                if (payload.product.categoryId !== undefined) patchPayload.category_id = payload.product.categoryId;
                if (payload.product.brandId !== undefined) patchPayload.brand_id = payload.product.brandId;
                if (payload.product.currencyId !== undefined) patchPayload.currency_id = payload.product.currencyId;
                if (payload.product.active !== undefined) patchPayload.active = payload.product.active;
                if (payload.product.saleBillingModeCode) patchPayload.sale_billing_mode_code = payload.product.saleBillingModeCode;
                if (payload.product.saleBillingModeId) patchPayload.sale_billing_mode_id = payload.product.saleBillingModeId;
                if (payload.product.procurementType) patchPayload.procurement_type = payload.product.procurementType;

                if (Object.keys(patchPayload).length > 0) {
                    await apiFetch<any>(
                        `${PRODUCTS_URL}/${id}${companyId ? `?company_id=${companyId}` : ""}`,
                        {
                            method: "PATCH",
                            body: JSON.stringify(patchPayload)
                        },
                        "No se pudo actualizar la cabecera del combo",
                        { token, companyId }
                    );
                }
            }

            // Paso 2: Actualizar ítem con su composition_data
            if (itemId && payload.item) {
                const itemUpdatePayload = mapComboItemUpdateToBackend(payload.item);
                await apiFetch<any>(
                    `${PRODUCTS_URL}/item/${itemId}${companyId ? `?company_id=${companyId}` : ""}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(itemUpdatePayload)
                    },
                    "No se pudo actualizar la composición del combo",
                    { token, companyId }
                );
            }

            return await this.getFullById(id, token, companyId);
        } catch (error) {
            console.error(`Error en combosService.updateCombo (${id}):`, error);
            throw error;
        }
    },

    /**
     * Eliminación suave (soft delete) del combo
     */
    async deleteCombo(id: string, token: string, companyId?: string): Promise<{ success: boolean }> {
        try {
            await apiFetch<any>(
                `${PRODUCTS_URL}/${id}`,
                { method: "DELETE" },
                "No se pudo eliminar el combo",
                { token, companyId }
            );
            return { success: true };
        } catch (error) {
            console.error(`Error en combosService.deleteCombo (${id}):`, error);
            throw error;
        }
    },

    /**
     * Selector de componentes existentes para armar el combo
     */
    async getItemOptions(
        companyId: string,
        params: IFOptionsListParams,
        token: string
    ): Promise<IFListV2<IFOptionItem>> {
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
                "No se pudieron obtener opciones de componentes",
                { token, companyId }
            );

            return mapOptionsList(data);
        } catch (error) {
            console.error("Error en combosService.getItemOptions:", error);
            throw error;
        }
    },

    /**
     * Catálogo de clasificaciones de producto (para verificar código COMBO)
     */
    async getClassifications(companyId: string, token: string): Promise<any[]> {
        try {
            const query = new URLSearchParams();
            if (companyId) query.set("company_id", companyId);
            const data = await apiFetch<any[]>(
                `${PRODUCTS_URL}/classifications?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener las clasificaciones de productos",
                { token, companyId }
            );
            return mapProductClassificationList(data);
        } catch (error) {
            console.error("Error en combosService.getClassifications:", error);
            throw error;
        }
    }
};
