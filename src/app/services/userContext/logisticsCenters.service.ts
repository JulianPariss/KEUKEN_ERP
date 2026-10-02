import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { LOGISTICS_CENTERS_URL } from "@/app/lib/constants/api.constants";
import { IBLogisticsCenter } from "@repo/api-contracts/erp";
import { IBCreateResponse, IBListV2 } from "@repo/api-contracts/erp";
import { IFLogisticsCenter, IFLogisticsCenterCreate, IFLogisticsCenterUpdate } from "@repo/api-contracts/erp";
import { IFCreateResponse, IFListV2 } from "@repo/api-contracts/erp";
import { mapLogisticsCenter, mapLogisticsCenterList, mapLogisticsCenterToBackend, mapLogisticsCenterUpdateToBackend } from "@repo/api-contracts/erp";

export const logisticsCentersService = {
    async getAll(
        params?: { limit?: number; offset?: number; company_id?: string; include_inactive?: boolean },
        token?: string
    ): Promise<IFListV2<IFLogisticsCenter>> {
        try {
            let url = LOGISTICS_CENTERS_URL;
            const searchParams = new URLSearchParams();
            if (params?.limit !== undefined) searchParams.append("limit", params.limit.toString());
            if (params?.offset !== undefined) searchParams.append("offset", params.offset.toString());
            if (params?.company_id) searchParams.append("company_id", params.company_id);
            if (params?.include_inactive !== undefined) searchParams.append("include_inactive", params.include_inactive.toString());
            const queryString = searchParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }

            const data: IBListV2<IBLogisticsCenter> = await apiFetch(
                url,
                { method: "GET" },
                "No se pudieron obtener los centros logísticos",
                { token, companyId: params?.company_id }
            );

            return mapLogisticsCenterList(data);
        } catch (error) {
            console.error("Error en getAll centros logísticos:", error);
            throw error;
        }
    },

    async getById(id: string, token: string): Promise<IFLogisticsCenter> {
        try {
            const url = `${LOGISTICS_CENTERS_URL}/${id}`;
            const data: IBLogisticsCenter = await apiFetch(
                url,
                { method: "GET" },
                "No se pudo obtener el centro logístico",
                { token }
            );

            return mapLogisticsCenter(data);
        } catch (error) {
            console.error("Error en getById centro logístico:", error);
            throw error;
        }
    },

    async create(centerData: IFLogisticsCenterCreate, token: string): Promise<IFCreateResponse> {
        try {
            const backendData = mapLogisticsCenterToBackend(centerData);
            const data: IBCreateResponse = await apiFetch(
                LOGISTICS_CENTERS_URL,
                {
                    method: "POST",
                    body: JSON.stringify(backendData),
                },
                "No se pudo crear el centro logístico",
                { token, companyId: centerData.companyId }
            );

            return {
                message: data.message,
                id: data.id,
            };
        } catch (error) {
            console.error("Error en create centro logístico:", error);
            throw error;
        }
    },

    async update(id: string, centerData: IFLogisticsCenterUpdate, token: string): Promise<IFLogisticsCenter> {
        try {
            const url = `${LOGISTICS_CENTERS_URL}/${id}`;
            const backendData = mapLogisticsCenterUpdateToBackend(centerData);
            const data: IBLogisticsCenter = await apiFetch(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(backendData),
                },
                "No se pudo actualizar el centro logístico",
                { token }
            );

            return mapLogisticsCenter(data);
        } catch (error) {
            console.error("Error en update centro logístico:", error);
            throw error;
        }
    },

    async delete(id: string, token: string): Promise<{ message: string }> {
        try {
            const url = `${LOGISTICS_CENTERS_URL}/${id}`;
            const data = await apiFetch<{ message: string }>(
                url,
                { method: "DELETE" },
                "No se pudo eliminar el centro logístico",
                { token }
            );

            return data;
        } catch (error) {
            console.error("Error en delete centro logístico:", error);
            throw error;
        }
    },
};
