import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { COMMERCIAL_URL } from "../../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IBPricePolicy } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFPricePolicy } from "@repo/api-contracts/erp";
import { mapPricePolicy } from "@repo/api-contracts/erp";

export const pricePoliciesService = {
    async getAll(
        token: string,
        companyId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<IFListV2<IFPricePolicy>> {
        try {
            const url = new URL(`${COMMERCIAL_URL}/pricing-channel-policies`);
            url.searchParams.append("limit", limit.toString());
            url.searchParams.append("offset", offset.toString());

            const data: IBListV2<IBPricePolicy> = await apiFetch(
                url.toString(),
                { method: "GET" },
                "No se pudieron obtener las políticas de precios",
                { token, companyId }
            );
            
            return {
                items: data.items.map(mapPricePolicy),
                metadata: {
                    totalItems: data.metadata.total_items,
                    totalPages: data.metadata.total_pages,
                    currentPage: data.metadata.current_page,
                    limit: data.metadata.limit,
                    offset: data.metadata.offset,
                }
            };
        } catch (error) {
            console.error("Error en getAllPricePolicies:", error);
            throw error;
        }
    }
};
