import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { PARTNERS_URL } from "../../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IBState } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFState, IFStateCreation, IFStateUpdate } from "@repo/api-contracts/erp";
import { mapStateListV2, mapStateToCreate, mapStateToUpdate } from "@repo/api-contracts/erp";

export const statesService = {
    async getAll(token: string, countryCode?: string, includeInactive: boolean = false, disableRecovery: boolean = false): Promise<IFListV2<IFState>> {
        try {
            const queryParams = new URLSearchParams();
            if (countryCode) queryParams.set("country_code", countryCode);
            queryParams.set("include_inactive", String(includeInactive));
            const data: IBListV2<IBState> = await apiFetch(
                `${PARTNERS_URL}/states?${queryParams.toString()}`,
                { method: "GET" },
                "No se pudieron obtener las provincias",
                { token, recoveryOptions: disableRecovery ? { recoveryMode: false } : undefined }
            );

            return mapStateListV2(data);
        } catch (error) {
            console.error("Error en getAllStates:", error);
            throw error;
        }
    },

    async create(data: IFStateCreation, token: string): Promise<any> {
        try {
            const mappedData = mapStateToCreate(data);
            return await apiFetch(
                `${PARTNERS_URL}/states`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear la provincia",
                { token }
            );
        } catch (error) {
            console.error("Error en createState:", error);
            throw error;
        }
    },

    async update(id: string, data: IFStateUpdate, token: string): Promise<any> {
        try {
            const mappedData = mapStateToUpdate(data);
            return await apiFetch(
                `${PARTNERS_URL}/states/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar la provincia",
                { token }
            );
        } catch (error) {
            console.error("Error en updateState:", error);
            throw error;
        }
    },

    async delete(id: string, token: string): Promise<any> {
        try {
            return await apiFetch(
                `${PARTNERS_URL}/states/${id}`,
                { method: "DELETE" },
                "No se pudo eliminar la provincia",
                { token }
            );
        } catch (error) {
            console.error("Error en deleteState:", error);
            throw error;
        }
    },
};
