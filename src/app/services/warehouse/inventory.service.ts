import { INVENTORY_URL } from "../../lib/constants/api.constants";
import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IBInventory, IBInventoryCreateResponse } from "@repo/api-contracts/erp";
import { IFInventory, IFInventoryCreate, IFInventoryCreateResponse, IFInventoryPatch } from "@repo/api-contracts/erp";
import { mapInventory, mapInventoryCreation, mapInventoryCreationResponse, mapInventoryPatch } from "@repo/api-contracts/erp";

export const inventoryService = {
    async getById(id: string, token: string): Promise<IFInventory> {
        try {
            const data: IBInventory = await apiFetch(
                `${INVENTORY_URL}/${id}`,
                { method: "GET" },
                "No se pudo obtener el inventario",
                { token }
            );

            return mapInventory(data);
        } catch (error) {
            throw error;
        }
    },
    async getByLocation(location_id: string, token: string): Promise<IFInventory> {
        try {
            const data: IBInventory = await apiFetch(
                `${INVENTORY_URL}/by-location/${location_id}`,
                { method: "GET" },
                "No se pudo obtener el inventario",
                { token }
            );

            return mapInventory(data);
        } catch (error) {
            throw error;
        }
    },
    async create(inventory: IFInventoryCreate, token: string): Promise<IFInventoryCreateResponse> {
        try {
            const mapped = mapInventoryCreation(inventory);
            const data: IBInventoryCreateResponse = await apiFetch(
                INVENTORY_URL,
                {
                    method: "POST",
                    body: JSON.stringify(mapped),
                },
                "No se pudo crear el inventario",
                { token }
            );

            return mapInventoryCreationResponse(data);
        } catch (error) {
            throw error;
        }
    },
    async confirm(id: string, token: string): Promise<void> {
        try {
            await apiFetch(
                `${INVENTORY_URL}/${id}/confirm`,
                { method: "POST" },
                "No se pudo confirmar el inventario",
                { token }
            );
        } catch (error) {
            throw error;
        }
    },
    async patch(id: string, data: IFInventoryPatch, token: string): Promise<IFInventory> {
        try {
            const mapped = mapInventoryPatch(data);
            const responseData: IBInventory = await apiFetch(
                `${INVENTORY_URL}/${id}/lines`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mapped),
                },
                "No se pudo actualizar las líneas del inventario",
                { token }
            );

            return mapInventory(responseData);
        } catch (error) {
            throw error;
        }
    }
};
