import { PARTNERS_URL } from "../../lib/constants/api.constants";
import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IBCountry } from "@repo/api-contracts/erp";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IFCountry, IFCountryCreation, IFCountryUpdate } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { mapCountryListV2, mapCountryToCreate, mapCountryToUpdate } from "@repo/api-contracts/erp";

export const countriesService = {
    async getAll(token: string, includeInactive?: boolean, disableRecovery: boolean = false): Promise<IFListV2<IFCountry>> {
        try {
            const params = new URLSearchParams();
            if (includeInactive) {
                params.append("include_inactive", String(includeInactive));
            }
            params.append("is_deleted", "false");

            const queryString = params.toString() ? `?${params.toString()}` : "";
            const data: IBListV2<IBCountry> = await apiFetch(
                `${PARTNERS_URL}/countries${queryString}`,
                { method: "GET" },
                "No se pudieron obtener los países",
                { token, recoveryOptions: disableRecovery ? { recoveryMode: false } : undefined }
            );

            return mapCountryListV2(data);
        } catch (error) {
            console.error("Error en getAllCountries:", error);
            throw error;
        }
    },

    async create(data: IFCountryCreation, token: string): Promise<any> {
        try {
            const mappedData = mapCountryToCreate(data);
            return await apiFetch(
                `${PARTNERS_URL}/countries`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear el país",
                { token }
            );
        } catch (error) {
            console.error("Error en createCountry:", error);
            throw error;
        }
    },

    async update(id: string, data: IFCountryUpdate, token: string): Promise<any> {
        try {
            const mappedData = mapCountryToUpdate(data);
            return await apiFetch(
                `${PARTNERS_URL}/countries/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar el país",
                { token }
            );
        } catch (error) {
            console.error("Error en updateCountry:", error);
            throw error;
        }
    },

    async delete(id: string, token: string): Promise<any> {
        try {
            return await apiFetch(
                `${PARTNERS_URL}/countries/${id}`,
                { method: "DELETE" },
                "No se pudo eliminar el país",
                { token }
            );
        } catch (error) {
            console.error("Error en deleteCountry:", error);
            throw error;
        }
    },
};

