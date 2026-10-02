import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { PARTNERS_URL } from "../../lib/constants/api.constants";
import { IBCitie } from "@repo/api-contracts/erp";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IFCitie, IFCitieCreation, IFCitieUpdate } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { mapCitieListV2, mapCitieToCreate, mapCitieToUpdate } from "@repo/api-contracts/erp";

export const citiesService = {
    async getAll(token: string, stateId: string, includeInactive: boolean = false, disableRecovery: boolean = false): Promise<IFListV2<IFCitie>> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.set("state_id", stateId);
            queryParams.set("include_inactive", String(includeInactive));

            const data: IBListV2<IBCitie> = await apiFetch(
                `${PARTNERS_URL}/cities?${queryParams.toString()}`,
                { method: "GET" },
                "No se pudieron obtener las ciudades",
                {
                    token,
                    recoveryOptions: disableRecovery ? { recoveryMode: false } : undefined,
                }
            );

            return mapCitieListV2(data);
        } catch (error) {
            console.error("Error en getAllCities:", error);
            throw error;
        }
    },

    async create(data: IFCitieCreation, token: string): Promise<any> {
        try {
            const mappedData = mapCitieToCreate(data);
            return await apiFetch(
                `${PARTNERS_URL}/cities`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear la ciudad",
                { token }
            );
        } catch (error) {
            console.error("Error en createCity:", error);
            throw error;
        }
    },

    async update(id: string, data: IFCitieUpdate, token: string): Promise<any> {
        try {
            const mappedData = mapCitieToUpdate(data);
            return await apiFetch(
                `${PARTNERS_URL}/cities/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar la ciudad",
                { token }
            );
        } catch (error) {
            console.error("Error en updateCity:", error);
            throw error;
        }
    },

    async delete(id: string, token: string): Promise<any> {
        try {
            return await apiFetch(
                `${PARTNERS_URL}/cities/${id}`,
                { method: "DELETE" },
                "No se pudo eliminar la ciudad",
                { token }
            );
        } catch (error) {
            console.error("Error en deleteCity:", error);
            throw error;
        }
    },
};

