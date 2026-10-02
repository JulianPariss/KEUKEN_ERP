import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IFHazardClass } from "@repo/api-contracts/erp";
import { PRODUCTS_URL } from "../../lib/constants/api.constants";
import { IBHazardClass } from "@repo/api-contracts/erp";
import { mapHazardClass, mapHazardClassList, mapHazardClassToCreate, mapHazardClassToUpdate } from "@repo/api-contracts/erp";

export const hazardService = {
    async getAll(companyId: string, token: string): Promise<IFHazardClass[]> {
        try {
            const data: IBHazardClass[] = await apiFetch(
                `${PRODUCTS_URL}/handling/hazard-classes?company_id=${companyId}`,
                { method: "GET" },
                "No se pudieron obtener los niveles de peligro",
                { token, companyId }
            );

            return mapHazardClassList(data);
        } catch (error) {
            throw error;
        }
    },
    async create(companyId: string, data: Partial<IFHazardClass>, token: string): Promise<IFHazardClass> {
        try {
            const mappedData = mapHazardClassToCreate(data);
            const itemResponse: IBHazardClass = await apiFetch(
                `${PRODUCTS_URL}/handling/hazard-classes?company_id=${companyId}`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear el nivel de peligro",
                { token, companyId }
            );

            return mapHazardClass(itemResponse);
        } catch (error) {
            throw error;
        }
    },
    async update(companyId: string, id: string, data: Partial<IFHazardClass>, token: string): Promise<IFHazardClass> {
        try {
            const mappedData = mapHazardClassToUpdate(data);
            const itemResponse: IBHazardClass = await apiFetch(
                `${PRODUCTS_URL}/handling/hazard-classes/${id}?company_id=${companyId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar el nivel de peligro",
                { token, companyId }
            );

            return mapHazardClass(itemResponse);
        } catch (error) {
            console.error("Error en updateHazardClass:", error);
            throw error;
        }
    },
    async delete(companyId: string, id: string, token: string): Promise<string> {
        try {
            const message: string = await apiFetch(
                `${PRODUCTS_URL}/handling/hazard-classes/${id}?company_id=${companyId}`,
                { method: "DELETE" },
                "No se pudo eliminar el nivel de peligro",
                { token, companyId }
            );

            return message;
        } catch (error) {
            console.error("Error en deleteHazardClass:", error);
            throw error;
        }
    }
};
