import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IFSaleBillingMode } from "@repo/api-contracts/erp";
import { PRODUCTS_URL } from "../../lib/constants/api.constants";
import { IBSaleBillingMode } from "@repo/api-contracts/erp";
import { mapSaleBillingMode, mapSaleBillingModeList, mapSaleBillingModeToCreate, mapSaleBillingModeToUpdate } from "@repo/api-contracts/erp";

export const saleBillingModesService = {
    async getAll(token: string, companyId?: string): Promise<IFSaleBillingMode[]> {
        try {
            const url = companyId
                ? `${PRODUCTS_URL}/sale-billing-modes?company_id=${companyId}`
                : `${PRODUCTS_URL}/sale-billing-modes`;

            const data: IBSaleBillingMode[] = await apiFetch(
                url,
                { method: "GET" },
                "No se pudieron obtener los modos de venta",
                { token, companyId }
            );

            return mapSaleBillingModeList(data);
        } catch (error) {
            console.error("Error en getAll sale billing modes:", error);
            throw error;
        }
    },
    async create(data: Partial<IFSaleBillingMode>, token: string, companyId?: string): Promise<IFSaleBillingMode> {
        try {
            const mappedData = mapSaleBillingModeToCreate(data);
            const url = companyId
                ? `${PRODUCTS_URL}/sale-billing-modes?company_id=${companyId}`
                : `${PRODUCTS_URL}/sale-billing-modes`;

            const itemResponse: IBSaleBillingMode = await apiFetch(
                url,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear el modo de venta",
                { token, companyId }
            );

            return mapSaleBillingMode(itemResponse);
        } catch (error) {
            console.error("Error en create sale billing mode:", error);
            throw error;
        }
    },
    async update(data: Partial<IFSaleBillingMode>, id: string, token: string, companyId?: string): Promise<IFSaleBillingMode> {
        try {
            const mappedData = mapSaleBillingModeToUpdate(data);
            const url = companyId
                ? `${PRODUCTS_URL}/sale-billing-modes/${id}?company_id=${companyId}`
                : `${PRODUCTS_URL}/sale-billing-modes/${id}`;

            const itemResponse: IBSaleBillingMode = await apiFetch(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar el modo de venta",
                { token, companyId }
            );

            return mapSaleBillingMode(itemResponse);
        } catch (error) {
            console.error("Error en updateSaleBillingMode:", error);
            throw error;
        }
    },
    async delete(id: string, token: string, companyId?: string): Promise<string> {
        try {
            const url = companyId
                ? `${PRODUCTS_URL}/sale-billing-modes/${id}?company_id=${companyId}`
                : `${PRODUCTS_URL}/sale-billing-modes/${id}`;

            const message: string = await apiFetch(
                url,
                { method: "DELETE" },
                "No se pudo eliminar el modo de venta",
                { token, companyId }
            );

            return message;
        } catch (error) {
            console.error("Error en deleteSaleBillingMode:", error);
            throw error;
        }
    }
};
