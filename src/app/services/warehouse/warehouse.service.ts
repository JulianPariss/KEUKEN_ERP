import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { WMS_URL } from "../../lib/constants/api.constants";
import { IBList } from "@repo/api-contracts/erp";
import { IWarehouseCreate, IWarehouseResponse } from "@repo/api-contracts/erp";
import { IWarehouse } from "@repo/api-contracts/erp";
import { mapWarehouse } from "@repo/api-contracts/erp";

export const warehouseService = {
    async getAll(token: string, companyId?: string): Promise<IBList<IWarehouseResponse>> {
        try {
            return await apiFetch<IBList<IWarehouseResponse>>(
                `${WMS_URL}/warehouses`,
                {
                    method: "GET",
                    next: { tags: ["warehouses"] },
                },
                "No se pudieron obtener los almacenes",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en getAllWarehouses:", error);
            throw error;
        }
    },
    async getById(id: string, token: string, companyId?: string): Promise<IWarehouse> {
        try {
            const data = await apiFetch<IWarehouseResponse>(
                `${WMS_URL}/warehouses/${id}`,
                {
                    method: "GET",
                },
                "No se pudo obtener el almacén",
                { token, companyId }
            );
            return mapWarehouse(data);
        } catch (error) {
            console.error("Error en getWarehouseById:", error);
            throw error;
        }
    },
    async create(data: IWarehouseCreate, token: string, companyId?: string): Promise<IWarehouseResponse> {
        try {
            return await apiFetch<IWarehouseResponse>(
                `${WMS_URL}/warehouses`,
                {
                    method: "POST",
                    body: JSON.stringify(data),
                },
                "No se pudo crear el almacén",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en createWarehouse:", error);
            throw error;
        }
    },
    async update(id: string, data: Partial<IWarehouseCreate>, token: string, companyId?: string): Promise<IWarehouseResponse> {
        try {
            return await apiFetch<IWarehouseResponse>(
                `${WMS_URL}/warehouses/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(data),
                },
                "No se pudo actualizar el almacén",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en updateWarehouse:", error);
            throw error;
        }
    },
    async delete(id: string, token: string, companyId?: string): Promise<void> {
        try {
            await apiFetch<void>(
                `${WMS_URL}/warehouses/${id}`,
                {
                    method: "DELETE",
                },
                "No se pudo eliminar el almacén",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en deleteWarehouse:", error);
            throw error;
        }
    },
};
