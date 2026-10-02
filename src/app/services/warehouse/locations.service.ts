import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { formatQueryParams } from "@/lib/utils/formatter.helper";
import { WMS_URL } from "../../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IBLocation, IBLocationStateUpdate } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFLocation, IFLocationCreation, IFLocationDelete, IFLocationOccupancy, IFLocationParams, IFLocationSeachParams, IFLocationSimpleCreation, IFLocationStateUpdate } from "@repo/api-contracts/erp";
import { mapItemCreation } from "@repo/api-contracts/erp";
import { mapLocation, mapLocationCreation, mapLocationDeleteRequest, mapLocationList, mapLocationListParams, mapLocationListV2, mapLocationOccupancy, mapLocationSeachParamsRequest, mapLocationSimpleCreation, mapLocationStateChange, mapLocationUpdate } from "@repo/api-contracts/erp";
import { IFOptionItem, IFOptionsListParams } from "@repo/api-contracts/erp";
import { mapOptionsList } from "@repo/api-contracts/erp";


export const locationService = {
    async getAll(searchParams: IFLocationParams, token: string): Promise<IFListV2<IFLocation>> {
        try {
            const mappedParams = mapLocationListParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const query = new URLSearchParams(filteredParams).toString();

            const data: IBListV2<IBLocation> = await apiFetch(
                `${WMS_URL}/locations?${query}`,
                { method: "GET" },
                "No se pudieron obtener las ubicaciones",
                { token }
            );

            return mapLocationListV2(data);
        } catch (error) {
            console.error("Error en getAllLocations:", error);
            throw error;
        }
    },
    async getOptions(params: IFOptionsListParams, token: string): Promise<IFListV2<IFOptionItem>> {
        try {
            const query = new URLSearchParams();
            if (params.q) query.set("q", params.q);
            if (params.warehouseId) query.set("warehouse_id", params.warehouseId);
            if (params.limit !== undefined) query.set("limit", String(params.limit));
            if (params.offset !== undefined) query.set("offset", String(params.offset));

            const data = await apiFetch<any>(
                `${WMS_URL}/locations/options?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener opciones de ubicaciones",
                { token }
            );

            return mapOptionsList(data);
        } catch (error) {
            console.error("Error en getOptions (locations):", error);
            throw error;
        }
    },
    async getByPath(path: string, warehouse_id: string, token: string): Promise<IFLocation> {
        try {
            const data = await apiFetch<any>(
                `${WMS_URL}/warehouses/${warehouse_id}/locations/${path}`,
                { method: "GET" },
                "No se pudo obtener la ubicación por path",
                { token }
            );

            return mapLocation(data);
        } catch (error) {
            console.error("Error en getByPath:", error);
            throw error;
        }
    },
    async getByPattern(warehouse_id: string, searchParams: IFLocationSeachParams, token: string): Promise<IBListV2<IFLocation>> {
        try {
            const mappedParams = mapLocationSeachParamsRequest(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const query = new URLSearchParams(filteredParams).toString();

            const data: IBListV2<IBLocation> = await apiFetch(
                `${WMS_URL}/warehouses/${warehouse_id}/locations-by-path-pattern?${query}`,
                { method: "GET" },
                "No se pudieron obtener las ubicaciones",
                { token }
            );

            return {
                ...data,
                items: mapLocationList(data.items)
            };
        } catch (error) {
            console.error("Error en getByPattern:", error);
            throw error;
        }
    },
    async create(items: IFLocationCreation[], warehouseId: string, parentPath: string, simulate: boolean, token: string): Promise<any> {
        try {
            const mapped = mapLocationCreation(items, warehouseId, parentPath, simulate);
            if (!mapped) return null;

            const data = await apiFetch<any>(
                `${WMS_URL}/locations/mass-create`,
                {
                    method: "POST",
                    body: JSON.stringify(mapped),
                },
                "No se pudo crear la ubicación",
                { token }
            );

            return mapItemCreation(data);
        } catch (error) {
            console.error("Error en createLocation:", error);
            throw error;
        }
    },
    async createSimple(location: IFLocationSimpleCreation, token: string): Promise<IFLocation> {
        try {
            const data = await apiFetch<any>(
                `${WMS_URL}/locations`,
                {
                    method: "POST",
                    body: JSON.stringify(mapLocationSimpleCreation(location)),
                },
                "No se pudo crear la ubicación",
                { token }
            );

            return mapLocation(data);
        } catch (error) {
            console.error("Error en createSimple:", error);
            throw error;
        }
    },
    async update(location: Partial<IFLocationCreation>, location_id: string, token: string): Promise<IFLocation> {
        try {
            const data = await apiFetch<any>(
                `${WMS_URL}/locations/${location_id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mapLocationUpdate(location)),
                },
                "No se pudo editar la ubicación",
                { token }
            );

            return mapLocation(data);
        } catch (error) {
            console.error("Error en editLocation:", error);
            throw error;
        }
    },
    async delete(location: IFLocationDelete, token: string): Promise<void> {
        try {
            await apiFetch<void>(
                `${WMS_URL}/locations/mass-delete`,
                {
                    method: "DELETE",
                    body: JSON.stringify(mapLocationDeleteRequest(location)),
                },
                "No se pudo eliminar la ubicación",
                { token }
            );
        } catch (error) {
            console.error("Error en deleteLocation:", error);
            throw error;
        }
    },
    async deleteSimple(location_id: string, warehouse_id: string, token: string): Promise<void> {
        try {
            await apiFetch<void>(
                `${WMS_URL}/locations/${location_id}?warehouse_id=${warehouse_id}`,
                { method: "DELETE" },
                "No se pudo eliminar la ubicación",
                { token }
            );
        } catch (error) {
            console.error("Error en deleteLocation:", error);
            throw error;
        }
    },
    async changeState(path: string, state: IBLocationStateUpdate, token: string): Promise<IFLocationStateUpdate> {
        try {
            const data = await apiFetch<any>(
                `${WMS_URL}/locations/${path}/state`,
                {
                    method: "PATCH",
                    body: JSON.stringify(state),
                },
                "No se pudo cambiar el estado de la ubicación",
                { token }
            );

            return mapLocationStateChange(data);
        } catch (error) {
            console.error("Error en changeStateLocation:", error);
            throw error;
        }
    },
    async occupancy(location_id: string, token: string): Promise<IFLocationOccupancy> {
        try {
            const data = await apiFetch<any>(
                `${WMS_URL}/locations/${location_id}/occupancy`,
                { method: "GET" },
                "No se pudo obtener la ocupación de la ubicación",
                { token }
            );

            return mapLocationOccupancy(data);
        } catch (error) {
            console.error("Error en getOccupancyLocation:", error);
            throw error;
        }
    },
    async updateLevelByPattern(warehouse_id: string, searchParams: string, access_level: string, simulate: boolean, token: string): Promise<any> {
        try {
            return await apiFetch<any>(
                `${WMS_URL}/warehouses/${warehouse_id}/access-levels/${access_level}/assign-by-path-pattern`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        path_pattern: searchParams,
                        simulate: simulate
                    }),
                },
                "No se pudo actualizar el nivel de las ubicaciones",
                { token }
            );
        } catch (error) {
            console.error("Error en updateLevelByPattern:", error);
            throw error;
        }
    }
};
