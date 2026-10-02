import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IFLogisticProfile } from "@repo/api-contracts/erp";
import { PRODUCTS_URL } from "../../lib/constants/api.constants";
import { IBLogisticProfile } from "@repo/api-contracts/erp";
import { mapLogisticProfile, mapLogisticProfileList, mapLogisticProfileToCreate, mapLogisticProfileToUpdate } from "@repo/api-contracts/erp";

export const logisticProfileService = {
    async getAll(companyId: string, token: string): Promise<IFLogisticProfile[]> {
        try {
            const url = `${PRODUCTS_URL}/handling/logistics-profiles?company_id=${companyId}`;

            const data: IBLogisticProfile[] = await apiFetch(
                url,
                { method: "GET" },
                "No se pudieron obtener los perfiles logísticos",
                { token, companyId }
            );

            return mapLogisticProfileList(data);
        } catch (error) {
            throw error;
        }
    },
    async create(companyId: string, data: Partial<IFLogisticProfile>, token: string): Promise<IFLogisticProfile> {
        try {
            const mappedData = mapLogisticProfileToCreate(data);
            const itemResponse: IBLogisticProfile = await apiFetch(
                `${PRODUCTS_URL}/handling/logistics-profiles?company_id=${companyId}`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear el perfil logístico",
                { token, companyId }
            );

            return mapLogisticProfile(itemResponse);
        } catch (error) {
            throw error;
        }
    },
    async update(companyId: string, id: string, data: Partial<IFLogisticProfile>, token: string): Promise<IFLogisticProfile> {
        try {
            const mappedData = mapLogisticProfileToUpdate(data);
            const itemResponse: IBLogisticProfile = await apiFetch(
                `${PRODUCTS_URL}/handling/logistics-profiles/${id}?company_id=${companyId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar el perfil logístico",
                { token, companyId }
            );

            return mapLogisticProfile(itemResponse);
        } catch (error) {
            console.error("Error en updateLogisticProfile:", error);
            throw error;
        }
    },
    async delete(companyId: string, id: string, token: string): Promise<string> {
        try {
            const message = await apiFetch<string>(
                `${PRODUCTS_URL}/handling/logistics-profiles/${id}?company_id=${companyId}`,
                { method: "DELETE" },
                "No se pudo eliminar el perfil logístico",
                { token, companyId }
            );

            return message;
        } catch (error) {
            console.error("Error en deleteLogisticProfile:", error);
            throw error;
        }
    }
};
