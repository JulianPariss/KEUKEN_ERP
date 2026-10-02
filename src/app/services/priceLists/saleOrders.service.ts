import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { APIV1_URL } from "../../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IBSaleOrder, IBSaleOrderDetail } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFSaleOrder, IFSaleOrderDetail } from "@repo/api-contracts/erp";
import { mapSaleOrderDetail, mapSaleOrdersListV2 } from "@repo/api-contracts/erp";

export const saleOrdersService = {
    async getAll(
        token: string,
        limit: number = 100,
        offset: number = 0,
        filters?: {
            companyId?: string | null;
        }
    ): Promise<IFListV2<IFSaleOrder>> {
        try {
            const queryParams = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
            });

            if (filters?.companyId) queryParams.append('company_id', filters.companyId);

            const data: IBListV2<IBSaleOrder> = await apiFetch(
                `${APIV1_URL}/sales-orders?${queryParams.toString()}`,
                { method: "GET" },
                "No se pudieron obtener los pedidos de venta",
                { token, companyId: filters?.companyId || undefined }
            );

            return mapSaleOrdersListV2(data);
        } catch (error) {
            console.error("Error en getAll saleOrders:", error);
            throw error;
        }
    },

    async getFullById(id: string, token: string, companyId?: string): Promise<IFSaleOrderDetail> {
        try {
            const data = await apiFetch<IBSaleOrderDetail>(
                `${APIV1_URL}/sales-orders/${id}/details`,
                { method: "GET" },
                "No se pudo obtener el detalle del pedido de venta",
                { token, companyId }
            );

            return mapSaleOrderDetail(data);
        } catch (error) {
            console.error("Error en getFullById saleOrder:", error);
            throw error;
        }
    }
};
