import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IFFragilityClass } from "@repo/api-contracts/erp";
import { PRODUCTS_URL } from "../../lib/constants/api.constants";
import { IBFragilityClass } from "@repo/api-contracts/erp";
import { mapFragilityClass, mapFragilityClassList, mapFragilityClassToCreate, mapFragilityClassToUpdate } from "@repo/api-contracts/erp";

export const fragilityService = {
    async getAll(companyId: string, token: string): Promise<IFFragilityClass[]> {
        try {
            const data: IBFragilityClass[] = await apiFetch(
                `${PRODUCTS_URL}/handling/fragility-classes?company_id=${companyId}`,
                { method: "GET" },
                "No se pudieron obtener los niveles de fragilidad",
                { token, companyId }
            );

            return mapFragilityClassList(data);
        } catch (error) {
            throw error;
        }
    },

    async create(companyId: string, data: Partial<IFFragilityClass>, token: string): Promise<IFFragilityClass> {
        try {
            const mappedData = mapFragilityClassToCreate(data);
            const itemResponse: IBFragilityClass = await apiFetch(
                `${PRODUCTS_URL}/handling/fragility-classes?company_id=${companyId}`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear el nivel de fragilidad",
                { token, companyId }
            );

            return mapFragilityClass(itemResponse);
        } catch (error) {
            throw error;
        }
    },

    async update(companyId: string, id: string, data: Partial<IFFragilityClass>, token: string): Promise<IFFragilityClass> {
        try {
            const mappedData = mapFragilityClassToUpdate(data);
            const itemResponse: IBFragilityClass = await apiFetch(
                `${PRODUCTS_URL}/handling/fragility-classes/${id}?company_id=${companyId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar el nivel de fragilidad",
                { token, companyId }
            );

            return mapFragilityClass(itemResponse);
        } catch (error) {
            console.error("Error en updateFragilityClass:", error);
            throw error;
        }
    },

    async delete(companyId: string, id: string, token: string): Promise<string> {
        try {
            const message: string = await apiFetch(
                `${PRODUCTS_URL}/handling/fragility-classes/${id}?company_id=${companyId}`,
                { method: "DELETE" },
                "No se pudo eliminar el nivel de fragilidad",
                { token, companyId }
            );

            return message;
        } catch (error) {
            console.error("Error en deleteFragilityClass:", error);
            throw error;
        }
    }
};
