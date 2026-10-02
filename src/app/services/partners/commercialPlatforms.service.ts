import { IFCommercialPlatform, IFCommercialPlatformCreate, IFCommercialPlatformsListParams } from "@repo/api-contracts/erp";
import { mapCommercialPlatform, mapCommercialPlatformToCreate, mapCommercialPlatformListV2 } from "@repo/api-contracts/erp";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IBCommercialPlatform } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { PARTNERS_URL } from "@/app/lib/constants/api.constants";
import { formatQueryParams } from "@/lib/utils/formatter.helper";
import { apiFetch } from "@/app/lib/utils/apiClient.helper";

export const commercialPlatformsService = {
    async getAll(params: IFCommercialPlatformsListParams, token: string): Promise<IFListV2<IFCommercialPlatform>> {
        try {
            const filteredParams = formatQueryParams(params);
            const query = new URLSearchParams(filteredParams as any).toString();

            const data: IBListV2<IBCommercialPlatform> = await apiFetch(
                `${PARTNERS_URL}/commercial-platforms?${query}`,
                { method: "GET" },
                "Error fetching commercial platforms",
                { token }
            );

            return mapCommercialPlatformListV2(data);
        } catch (error) {
            console.error("Error en getAll:", error);
            throw error;
        }
    },

    async create(data: IFCommercialPlatformCreate, token: string): Promise<any> {
        try {
            return await apiFetch(
                `${PARTNERS_URL}/commercial-platforms`,
                {
                    method: "POST",
                    body: JSON.stringify(mapCommercialPlatformToCreate(data))
                },
                "Error creating commercial platform",
                { token }
            );
        } catch (error) {
            console.error("Error en create:", error);
            throw error;
        }
    },

    async update(id: string, data: Partial<IFCommercialPlatformCreate>, token: string): Promise<any> {
        try {
            const payload: any = {};
            if (data.code !== undefined) payload.code = data.code;
            if (data.name !== undefined) payload.name = data.name;
            if (data.companyId !== undefined) payload.company_id = data.companyId;
            if (data.active !== undefined) payload.active = data.active;
            if (data.includeInDefaultPopulate !== undefined) payload.include_in_default_populate = data.includeInDefaultPopulate;

            return await apiFetch(
                `${PARTNERS_URL}/commercial-platforms/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(payload)
                },
                "Error updating commercial platform",
                { token }
            );
        } catch (error) {
            console.error("Error en update:", error);
            throw error;
        }
    },

    async delete(id: string, token: string): Promise<any> {
        try {
            return await apiFetch(
                `${PARTNERS_URL}/commercial-platforms/${id}`,
                {
                    method: "DELETE"
                },
                "Error deleting commercial platform",
                { token }
            );
        } catch (error) {
            console.error("Error en delete:", error);
            throw error;
        }
    }
};
