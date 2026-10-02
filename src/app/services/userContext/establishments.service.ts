import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { ESTABLISHMENTS_URL } from "@/app/lib/constants/api.constants";
import { IBEstablishment } from "@repo/api-contracts/erp";
import { IBCreateResponse, IBListV2 } from "@repo/api-contracts/erp";
import { IFEstablishment, IFEstablishmentCreate, IFEstablishmentUpdate } from "@repo/api-contracts/erp";
import { IFCreateResponse, IFListV2 } from "@repo/api-contracts/erp";
import { mapEstablishment, mapEstablishmentList, mapEstablishmentToBackend, mapEstablishmentUpdateToBackend } from "@repo/api-contracts/erp";

export const establishmentsService = {
    async getAll(
        params?: { limit?: number; offset?: number; company_id?: string; include_inactive?: boolean },
        token?: string
    ): Promise<IFListV2<IFEstablishment>> {
        try {
            let url = ESTABLISHMENTS_URL;
            const searchParams = new URLSearchParams();
            if (params?.limit !== undefined) searchParams.append("limit", params.limit.toString());
            if (params?.offset !== undefined) searchParams.append("offset", params.offset.toString());
            if (params?.company_id) searchParams.append("company_id", params.company_id);
            if (params?.include_inactive !== undefined) searchParams.append("include_inactive", params.include_inactive.toString());
            const queryString = searchParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }

            const data: IBListV2<IBEstablishment> = await apiFetch(
                url,
                { method: "GET" },
                "No se pudieron obtener los establecimientos",
                { token: token || "", companyId: params?.company_id }
            );

            return mapEstablishmentList(data);
        } catch (error) {
            console.error("Error en getAll establecimientos:", error);
            throw error;
        }
    },

    async getById(id: string, token: string): Promise<IFEstablishment> {
        try {
            const url = `${ESTABLISHMENTS_URL}/${id}`;
            const data: IBEstablishment = await apiFetch(
                url,
                { method: "GET" },
                "No se pudo obtener el establecimiento",
                { token }
            );

            return mapEstablishment(data);
        } catch (error) {
            console.error("Error en getById establecimiento:", error);
            throw error;
        }
    },

    async create(establishmentData: IFEstablishmentCreate, token: string): Promise<IFCreateResponse> {
        try {
            const backendData = mapEstablishmentToBackend(establishmentData);
            const data: IBCreateResponse = await apiFetch(
                ESTABLISHMENTS_URL,
                {
                    method: "POST",
                    body: JSON.stringify(backendData),
                },
                "No se pudo crear el establecimiento",
                { token }
            );

            return {
                message: data.message,
                id: data.id,
            };
        } catch (error) {
            console.error("Error en create establecimiento:", error);
            throw error;
        }
    },

    async update(id: string, establishmentData: IFEstablishmentUpdate, token: string): Promise<IFEstablishment> {
        try {
            const url = `${ESTABLISHMENTS_URL}/${id}`;
            const backendData = mapEstablishmentUpdateToBackend(establishmentData);
            const data: IBEstablishment = await apiFetch(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(backendData),
                },
                "No se pudo actualizar el establecimiento",
                { token }
            );

            return mapEstablishment(data);
        } catch (error) {
            console.error("Error en update establecimiento:", error);
            throw error;
        }
    },

    async delete(id: string, token: string): Promise<void> {
        try {
            const url = `${ESTABLISHMENTS_URL}/${id}`;
            await apiFetch<void>(
                url,
                { method: "DELETE" },
                "No se pudo eliminar el establecimiento",
                { token }
            );
        } catch (error) {
            console.error("Error en delete establecimiento:", error);
            throw error;
        }
    }
};
