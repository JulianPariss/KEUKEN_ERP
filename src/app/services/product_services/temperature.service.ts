import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IFTemperatureClass } from "@repo/api-contracts/erp";
import { PRODUCTS_URL } from "../../lib/constants/api.constants";
import { IBTemperatureClass } from "@repo/api-contracts/erp";
import { mapTemperatureClass, mapTemperatureClassList, mapTemperatureClassToCreate, mapTemperatureClassToUpdate } from "@repo/api-contracts/erp";

export const temperatureService = {
    async getAll(companyId: string, token: string): Promise<IFTemperatureClass[]> {
        try {
            const data: IBTemperatureClass[] = await apiFetch(
                `${PRODUCTS_URL}/handling/temperature-classes?company_id=${companyId}`,
                { method: "GET" },
                "No se pudieron obtener los niveles de temperatura",
                { token, companyId }
            );

            return mapTemperatureClassList(data);
        } catch (error) {
            throw error;
        }
    },

    async create(companyId: string, data: Partial<IFTemperatureClass>, token: string): Promise<IFTemperatureClass> {
        try {
            const mappedData = mapTemperatureClassToCreate(data);
            const itemResponse: IBTemperatureClass = await apiFetch(
                `${PRODUCTS_URL}/handling/temperature-classes?company_id=${companyId}`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear el nivel de temperatura",
                { token, companyId }
            );

            return mapTemperatureClass(itemResponse);
        } catch (error) {
            throw error;
        }
    },

    async update(companyId: string, id: string, data: Partial<IFTemperatureClass>, token: string): Promise<IFTemperatureClass> {
        try {
            const mappedData = mapTemperatureClassToUpdate(data);
            const itemResponse: IBTemperatureClass = await apiFetch(
                `${PRODUCTS_URL}/handling/temperature-classes/${id}?company_id=${companyId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar el nivel de temperatura",
                { token, companyId }
            );

            return mapTemperatureClass(itemResponse);
        } catch (error) {
            console.error("Error en updateTemperatureClass:", error);
            throw error;
        }
    },

    async delete(companyId: string, id: string, token: string): Promise<string> {
        try {
            const message: string = await apiFetch(
                `${PRODUCTS_URL}/handling/temperature-classes/${id}?company_id=${companyId}`,
                { method: "DELETE" },
                "No se pudo eliminar el nivel de temperatura",
                { token, companyId }
            );

            return message;
        } catch (error) {
            console.error("Error en deleteTemperatureClass:", error);
            throw error;
        }
    }
};
