import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { ZONES_URL } from "../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IBZone } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFZone, IFZoneCreate, IFZoneUpdate } from "@repo/api-contracts/erp";
import { mapZoneListV2, mapZoneCreateToBackend, mapZoneUpdateToBackend, mapZone } from "@repo/api-contracts/erp";
import { IFOptionItem, IFOptionsListParams } from "@repo/api-contracts/erp";
import { mapOptionsList } from "@repo/api-contracts/erp";

export const zonesService = {
    async getAll(token: string, limit: number = 20, offset: number = 0, companyId?: string): Promise<IFListV2<IFZone>> {
        try {
            const url = `${ZONES_URL}?limit=${limit}&offset=${offset}${companyId ? `&company_id=${encodeURIComponent(companyId)}` : ''}`;
            const data = await apiFetch<IBListV2<IBZone>>(
                url,
                { method: "GET" },
                "No se pudieron obtener las zonas",
                { token, companyId }
            );

            return mapZoneListV2(data);
        } catch (error) {
            console.error("Error en getAllZones:", error);
            throw error;
        }
    },

    async getOptions(params: IFOptionsListParams, token: string): Promise<IFListV2<IFOptionItem>> {
        try {
            const query = new URLSearchParams();
            if (params.q) query.set("q", params.q);
            if (params.companyId) query.set("company_id", params.companyId);
            if (params.limit !== undefined) query.set("limit", String(params.limit));
            if (params.offset !== undefined) query.set("offset", String(params.offset));

            const data = await apiFetch<any>(
                `${ZONES_URL}/options?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener opciones de zonas",
                { token, companyId: params.companyId }
            );

            return mapOptionsList(data);
        } catch (error) {
            console.error("Error en getOptions (zones):", error);
            throw error;
        }
    },

    async create(data: IFZoneCreate, token: string, companyId?: string): Promise<IFZone> {
        try {
            const mappedData = mapZoneCreateToBackend(data);
            const targetCompanyId = companyId || (data as any).companyId;
            const payload = targetCompanyId ? { ...mappedData, company_id: targetCompanyId } : mappedData;
            const url = targetCompanyId ? `${ZONES_URL}?company_id=${encodeURIComponent(targetCompanyId)}` : ZONES_URL;

            const resData = await apiFetch<IBZone>(
                url,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
                "No se pudo crear la zona",
                { token, companyId: targetCompanyId }
            );

            return mapZone(resData);
        } catch (error) {
            console.error("Error en createZone:", error);
            throw error;
        }
    },

    async update(id: string, data: IFZoneUpdate, token: string, companyId?: string): Promise<IFZone> {
        try {
            const mappedData = mapZoneUpdateToBackend(data);
            const payload = companyId ? { ...mappedData, company_id: companyId } : mappedData;
            const url = `${ZONES_URL}/${id}${companyId ? `?company_id=${encodeURIComponent(companyId)}` : ''}`;

            const resData = await apiFetch<IBZone>(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                },
                "No se pudo actualizar la zona",
                { token, companyId }
            );

            return mapZone(resData);
        } catch (error) {
            console.error("Error en updateZone:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, companyId?: string): Promise<void> {
        try {
            const url = `${ZONES_URL}/${id}${companyId ? `?company_id=${encodeURIComponent(companyId)}` : ''}`;
            await apiFetch<void>(
                url,
                {
                    method: "DELETE",
                    ...(companyId ? { body: JSON.stringify({ company_id: companyId }) } : {}),
                },
                "No se pudo eliminar la zona",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en deleteZone:", error);
            throw error;
        }
    },
};

export default zonesService;
