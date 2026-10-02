import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { formatQueryParams } from "@/lib/utils/formatter.helper";
import { WMS_URL } from "../lib/constants/api.constants";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFArticleStock, IFArticleStockParams, IFStockByLocation, IFStockByLotsParams, IFStockCreate, IFStockGetAllParams, IFStockItem, IFStockReserve, IFStockSummaryParams, IFStockSummaryRow } from "@repo/api-contracts/erp";
import {
  mapArticleStock,
  mapStockByLocation,
  mapStockByLotsSeachParams,
  mapStockCreateReserve,
  mapStockListV2,
  mapStockReserve,
  mapStockSeachParams,
  mapStockSummaryListV2,
  mapStockSummaryParams
} from "@repo/api-contracts/erp";

export const stockService = {
    async getAll(searchParams: IFStockGetAllParams, token: string, companyId?: string): Promise<IFListV2<IFStockItem>> {
        try {
            const mappedParams = mapStockSeachParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const query = new URLSearchParams(filteredParams).toString();
            const data = await apiFetch<any>(
                `${WMS_URL}/stock?${query}`,
                { method: "GET" },
                "No se pudo obtener el listado de stock",
                { token, companyId }
            );
            return mapStockListV2(data);
        } catch (error) {
            console.error("Error en getAllStock:", error);
            throw error;
        }
    },

    async getAllByLots(searchParams: IFStockByLotsParams, token: string, companyId?: string): Promise<IFListV2<IFStockItem>> {
        try {
            const mappedParams = mapStockByLotsSeachParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const query = new URLSearchParams(filteredParams).toString();
            const data = await apiFetch<any>(
                `${WMS_URL}/stock-lots?${query}`,
                { method: "GET" },
                "No se pudo obtener el listado de stock por lotes",
                { token, companyId }
            );
            return mapStockListV2(data);
        } catch (error) {
            console.error("Error en getAllStockByLots:", error);
            throw error;
        }
    },

    async getArticleStock(searchParams: IFArticleStockParams, token: string, companyId?: string): Promise<IFArticleStock> {
        try {
            const locationPath = searchParams.locationId ? `/${searchParams.locationId}` : '/all';
            const data = await apiFetch<any>(
                `${WMS_URL}/stock${locationPath}/${searchParams.itemId}`,
                { method: "GET" },
                "No se pudo obtener el stock del articulo",
                { token, companyId }
            );
            return mapArticleStock(data);
        } catch (error) {
            console.error("Error en getArticleStock:", error);
            throw error;
        }
    },

    async getStockByLocation(locationId: string, token: string, companyId?: string): Promise<IFStockByLocation> {
        try {
            const data = await apiFetch<any>(
                `${WMS_URL}/stock/${locationId}`,
                { method: "GET" },
                "No se pudo obtener el stock de la ubicación",
                { token, companyId }
            );
            return mapStockByLocation(data);
        } catch (error) {
            console.error("Error en getStockByLocation:", error);
            throw error;
        }
    },

    async createReserve(searchParams: IFStockCreate, token: string, companyId?: string): Promise<IFStockReserve> {
        try {
            const data = await apiFetch<any>(
                `${WMS_URL}/reserve`,
                {
                    method: "POST",
                    body: JSON.stringify(mapStockCreateReserve(searchParams)),
                },
                "No se pudo crear la reserva",
                { token, companyId }
            );
            return mapStockReserve(data);
        } catch (error) {
            console.error("Error en createReserve:", error);
            throw error;
        }
    },

    async getStockSummary(searchParams: IFStockSummaryParams, token: string, companyId?: string): Promise<IFListV2<IFStockSummaryRow>> {
        try {
            const mappedParams = mapStockSummaryParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const query = new URLSearchParams(filteredParams).toString();
            const data = await apiFetch<any>(
                `${WMS_URL}/stock/summary?${query}`,
                { method: "GET" },
                "No se pudo obtener el resumen de stock",
                { token, companyId }
            );
            return mapStockSummaryListV2(data);
        } catch (error) {
            console.error("Error en getStockSummary:", error);
            throw error;
        }
    },
};

