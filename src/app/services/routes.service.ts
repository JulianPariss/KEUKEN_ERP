import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { ROUTES_URL } from "../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IBRouteItem, IBRouteDetails, IBRouteResponse } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFRouteItem, IFRouteCreate, IFRouteDetails, IFRouteResponse } from "@repo/api-contracts/erp";
import { mapRouteListV2, mapRouteCreateToBackend, mapRouteDetails, mapRouteResponse } from "@repo/api-contracts/erp";

export const routesService = {
    async getAll(token: string, limit: number = 20, offset: number = 0, companyId?: string): Promise<IFListV2<IFRouteItem>> {
        try {
            const url = `${ROUTES_URL}?limit=${limit}&offset=${offset}${companyId ? `&company_id=${encodeURIComponent(companyId)}` : ''}`;
            const data = await apiFetch<IBListV2<IBRouteItem>>(
                url,
                { method: "GET" },
                "No se pudieron obtener las rutas",
                { token, companyId }
            );

            return mapRouteListV2(data);
        } catch (error) {
            console.error("Error en getAllRoutes:", error);
            throw error;
        }
    },

    async getById(id: string, token: string, companyId?: string): Promise<IFRouteDetails> {
        try {
            const url = `${ROUTES_URL}/${id}${companyId ? `?company_id=${encodeURIComponent(companyId)}` : ''}`;
            const data = await apiFetch<IBRouteDetails>(
                url,
                { method: "GET" },
                "No se pudo obtener la ruta",
                { token, companyId }
            );

            return mapRouteDetails(data);
        } catch (error) {
            console.error("Error en getRouteById:", error);
            throw error;
        }
    },

    async create(data: IFRouteCreate, token: string, companyId?: string): Promise<IFRouteResponse> {
        try {
            const mappedData = mapRouteCreateToBackend(data);
            const targetCompanyId = companyId || (data as any).companyId;
            const payload = targetCompanyId ? { ...mappedData, company_id: targetCompanyId } : mappedData;
            const url = targetCompanyId ? `${ROUTES_URL}?company_id=${encodeURIComponent(targetCompanyId)}` : ROUTES_URL;

            const resData = await apiFetch<IBRouteResponse>(
                url,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
                "No se pudo crear la ruta",
                { token, companyId: targetCompanyId }
            );

            return mapRouteResponse(resData);
        } catch (error) {
            console.error("Error en createRoute:", error);
            throw error;
        }
    },

    async update(id: string, data: any, token: string, companyId?: string): Promise<IFRouteResponse> {
        try {
            const payload = companyId ? { ...data, company_id: companyId } : data;
            const url = `${ROUTES_URL}/${id}${companyId ? `?company_id=${encodeURIComponent(companyId)}` : ''}`;

            const resData = await apiFetch<IBRouteResponse>(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                },
                "No se pudo actualizar la ruta",
                { token, companyId }
            );

            return mapRouteResponse(resData);
        } catch (error) {
            console.error("Error en updateRoute:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, companyId?: string): Promise<void> {
        try {
            const url = `${ROUTES_URL}/${id}${companyId ? `?company_id=${encodeURIComponent(companyId)}` : ''}`;
            await apiFetch<void>(
                url,
                {
                    method: "DELETE",
                    ...(companyId ? { body: JSON.stringify({ company_id: companyId }) } : {}),
                },
                "No se pudo eliminar la ruta",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en deleteRoute:", error);
            throw error;
        }
    },
};

export default routesService;
