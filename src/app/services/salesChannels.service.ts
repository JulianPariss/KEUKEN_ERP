import { apiFetch } from "../lib/utils/apiClient.helper";
import { SALES_CHANNELS_URL } from "../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IBSalesChannel } from "@repo/api-contracts/erp";
import { IFSalesChannel } from "@repo/api-contracts/erp";
import { mapSalesChannel } from "@repo/api-contracts/erp";

export const salesChannelsService = {
    getAll: async (
        token: string,
        limit: number = 50,
        offset: number = 0,
        companyId?: string
    ): Promise<IFListV2<IFSalesChannel>> => {
        const url = new URL(SALES_CHANNELS_URL);
        url.searchParams.append('limit', limit.toString());
        url.searchParams.append('offset', offset.toString());
        if (companyId) {
            url.searchParams.append('company_id', companyId);
        }

        const data: IBListV2<IBSalesChannel> = await apiFetch(
            url.toString(),
            { method: "GET" },
            "Error al cargar los canales de venta",
            { token, companyId }
        );

        return {
            items: data.items.map(mapSalesChannel),
            metadata: {
                totalItems: data.metadata.total_items,
                totalPages: data.metadata.total_pages,
                currentPage: data.metadata.current_page,
                limit: data.metadata.limit,
                offset: data.metadata.offset
            }
        };
    }
};
