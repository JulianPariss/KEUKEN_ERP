import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import {
    IBItemSupplierRead,
    IFItemSupplierCreate,
    IFItemSupplierQueryParams,
    IFItemSupplierRead,
    IFItemSupplierUpdate,
    mapItemSupplierCreateToBackend,
    mapItemSupplierQueryParamsToBackend,
    mapItemSupplierRead,
    mapItemSupplierUpdateToBackend,
} from "@repo/api-contracts/erp";
import { PROCUREMENT_URL } from "../../lib/constants/api.constants";

export const itemSuppliersService = {
    async getAll(
        params: IFItemSupplierQueryParams,
        token: string,
        companyId?: string
    ): Promise<IFItemSupplierRead[]> {
        try {
            const backendParams = mapItemSupplierQueryParamsToBackend(params);
            const queryParams = new URLSearchParams();
            if (backendParams.item_id) queryParams.set("item_id", backendParams.item_id);
            if (backendParams.supplier_id) queryParams.set("supplier_id", backendParams.supplier_id);
            if (backendParams.active !== undefined) queryParams.set("active", String(backendParams.active));
            if (backendParams.limit !== undefined) queryParams.set("limit", String(backendParams.limit));
            if (backendParams.offset !== undefined) queryParams.set("offset", String(backendParams.offset));

            const query = queryParams.toString();
            const url = `${PROCUREMENT_URL}/item-supplier${query ? `?${query}` : ""}`;

            const response = await apiFetch<any>(
                url,
                { method: "GET" },
                "No se pudieron obtener los proveedores del ítem",
                { token, companyId }
            );

            const items: IBItemSupplierRead[] = Array.isArray(response)
                ? response
                : (response?.items || []);

            return items.map(mapItemSupplierRead);
        } catch (error) {
            console.error("Error en itemSuppliersService.getAll:", error);
            throw error;
        }
    },

    async create(
        data: IFItemSupplierCreate,
        token: string,
        companyId?: string
    ): Promise<IFItemSupplierRead> {
        try {
            const body = mapItemSupplierCreateToBackend(data);
            const url = `${PROCUREMENT_URL}/item-supplier`;

            const response = await apiFetch<IBItemSupplierRead>(
                url,
                {
                    method: "POST",
                    body: JSON.stringify(body),
                },
                "No se pudo vincular el proveedor al ítem",
                { token, companyId }
            );

            return mapItemSupplierRead(response);
        } catch (error) {
            console.error("Error en itemSuppliersService.create:", error);
            throw error;
        }
    },

    async update(
        id: string,
        data: IFItemSupplierUpdate,
        token: string,
        companyId?: string
    ): Promise<IFItemSupplierRead> {
        try {
            const body = mapItemSupplierUpdateToBackend(data);
            const url = `${PROCUREMENT_URL}/item-supplier/${id}`;

            const response = await apiFetch<IBItemSupplierRead>(
                url,
                {
                    method: "PUT",
                    body: JSON.stringify(body),
                },
                "No se pudo actualizar el vínculo con el proveedor",
                { token, companyId }
            );

            return mapItemSupplierRead(response);
        } catch (error) {
            console.error("Error en itemSuppliersService.update:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, companyId?: string): Promise<void> {
        try {
            const url = `${PROCUREMENT_URL}/item-supplier/${id}`;

            await apiFetch<void>(
                url,
                { method: "DELETE" },
                "No se pudo desvincular el proveedor del ítem",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en itemSuppliersService.delete:", error);
            throw error;
        }
    },
};
