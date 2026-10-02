import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { COMMERCIAL_URL } from "../../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IBSalesRoute } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFSalesRoute, IFSalesRouteCreate, IFSalesRoutePatch } from "@repo/api-contracts/erp";
import { mapSalesRoute, mapSalesRouteCreate, mapSalesRouteListV2, mapSalesRoutePatch } from "@repo/api-contracts/erp";

export const salesRoutesService = {
    async getAll(token: string, limit: number = 50, offset: number = 0, companyId?: string): Promise<IFListV2<IFSalesRoute>> {
        try {
            const url = new URL(`${COMMERCIAL_URL}/sales-routes`);
            if (companyId) {
                url.searchParams.append("company_id", companyId);
            }
            url.searchParams.append("limit", limit.toString());
            url.searchParams.append("offset", offset.toString());

            const data: IBListV2<IBSalesRoute> = await apiFetch(
                url.toString(),
                { method: "GET" },
                "No se pudieron obtener las rutas de venta",
                { token, companyId }
            );

            return mapSalesRouteListV2(data);
        } catch (error) {
            console.error("Error en getAll salesRoutes:", error);
            throw error;
        }
    },

    async create(data: IFSalesRouteCreate, token: string): Promise<IFSalesRoute> {
        try {
            const mappedData = mapSalesRouteCreate(data);
            const resData: IBSalesRoute = await apiFetch(
                `${COMMERCIAL_URL}/sales-routes`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear la ruta de venta",
                { token, companyId: data.companyId }
            );

            return mapSalesRoute(resData);
        } catch (error) {
            console.error("Error en create salesRoute:", error);
            throw error;
        }
    },

    async update(id: string, data: IFSalesRoutePatch, token: string, companyId?: string): Promise<IFSalesRoute> {
        try {
            const mappedData = mapSalesRoutePatch(data);
            const resData: IBSalesRoute = await apiFetch(
                `${COMMERCIAL_URL}/sales-routes/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar la ruta de venta",
                { token, companyId }
            );

            return mapSalesRoute(resData);
        } catch (error) {
            console.error("Error en update salesRoute:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, companyId?: string): Promise<void> {
        try {
            await apiFetch(
                `${COMMERCIAL_URL}/sales-routes/${id}`,
                { method: "DELETE" },
                "No se pudo eliminar la ruta de venta",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en delete salesRoute:", error);
            throw error;
        }
    }
};

