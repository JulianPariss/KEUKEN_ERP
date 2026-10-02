import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { VEHICLES_URL } from "../lib/constants/api.constants";
import { IBListV2, IBCreateResponse, IBActionResponse } from "@repo/api-contracts/erp";
import { IBVehicle } from "@repo/api-contracts/erp";
import { IFListV2, IFCreateResponse, IFActionResponse } from "@repo/api-contracts/erp";
import { IFVehicle, IFVehicleCreate, IFVehicleUpdate } from "@repo/api-contracts/erp";
import { mapVehicleListV2, mapVehicleCreateToBackend, mapVehicleUpdateToBackend, mapVehicle } from "@repo/api-contracts/erp";

export const vehiclesService = {
    async getAll(token: string, limit: number = 20, offset: number = 0, companyId?: string): Promise<IFListV2<IFVehicle>> {
        try {
            const url = `${VEHICLES_URL}?limit=${limit}&offset=${offset}${companyId ? `&company_id=${encodeURIComponent(companyId)}` : ''}`;
            const data = await apiFetch<IBListV2<IBVehicle>>(
                url,
                { method: "GET" },
                "No se pudieron obtener los vehículos",
                { token, companyId }
            );

            return mapVehicleListV2(data);
        } catch (error) {
            console.error("Error en getAllVehicles:", error);
            throw error;
        }
    },

    async getById(id: string, token: string, companyId?: string): Promise<IFVehicle> {
        try {
            const url = `${VEHICLES_URL}/${id}${companyId ? `?company_id=${encodeURIComponent(companyId)}` : ''}`;
            const data = await apiFetch<IBVehicle>(
                url,
                { method: "GET" },
                "No se pudo obtener el vehículo",
                { token, companyId }
            );

            return mapVehicle(data);
        } catch (error) {
            console.error("Error en getVehicleById:", error);
            throw error;
        }
    },

    async create(data: IFVehicleCreate, token: string, companyId?: string): Promise<IFCreateResponse> {
        try {
            const mappedData = mapVehicleCreateToBackend(data);
            const targetCompanyId = companyId || (data as any).companyId;
            const payload = targetCompanyId ? { ...mappedData, company_id: targetCompanyId } : mappedData;
            const url = targetCompanyId ? `${VEHICLES_URL}?company_id=${encodeURIComponent(targetCompanyId)}` : VEHICLES_URL;

            const resData = await apiFetch<IBCreateResponse>(
                url,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
                "No se pudo crear el vehículo",
                { token, companyId: targetCompanyId }
            );

            return {
                message: resData.message,
                id: resData.id
            };
        } catch (error) {
            console.error("Error en createVehicle:", error);
            throw error;
        }
    },

    async update(id: string, data: IFVehicleUpdate, token: string, companyId?: string): Promise<IFVehicle> {
        try {
            const mappedData = mapVehicleUpdateToBackend(data);
            const payload = companyId ? { ...mappedData, company_id: companyId } : mappedData;
            const url = `${VEHICLES_URL}/${id}${companyId ? `?company_id=${encodeURIComponent(companyId)}` : ''}`;

            const resData = await apiFetch<IBVehicle>(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                },
                "No se pudo actualizar el vehículo",
                { token, companyId }
            );

            return mapVehicle(resData);
        } catch (error) {
            console.error("Error en updateVehicle:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, companyId?: string): Promise<IFActionResponse> {
        try {
            const url = `${VEHICLES_URL}/${id}${companyId ? `?company_id=${encodeURIComponent(companyId)}` : ''}`;
            const resData = await apiFetch<IBActionResponse>(
                url,
                {
                    method: "DELETE",
                    ...(companyId ? { body: JSON.stringify({ company_id: companyId }) } : {}),
                },
                "No se pudo eliminar el vehículo",
                { token, companyId }
            );

            return {
                message: resData?.message || "Vehículo eliminado satisfactoriamente"
            };
        } catch (error) {
            console.error("Error en deleteVehicle:", error);
            throw error;
        }
    },
};

export default vehiclesService;
