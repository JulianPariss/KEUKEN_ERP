import { WMS_URL } from "../../lib/constants/api.constants";
import { apiFetch } from "../../lib/utils/apiClient.helper";
import {
  IFArea,
  IFAreaAssignment,
  IFAreaAssignmentResponse,
  IFAreaCreate,
  IFAreaType,
} from "@repo/api-contracts/erp";
import {
  mapArea,
  mapAreaAssignment,
  mapAreaAssignmentResponse,
  mapAreaCreate,
  mapAreaList,
  mapAreaTypeList,
} from "@repo/api-contracts/erp";

export const areaService = {
  async getAreaTypes(token: string): Promise<IFAreaType[]> {
    try {
      const data = await apiFetch<any>(
        `${WMS_URL}/warehouse-area-types`,
        { method: "GET" },
        "No se pudieron obtener los tipos de área",
        { token }
      );
      return mapAreaTypeList(data);
    } catch (error) {
      console.error("Error en getAreaTypes:", error);
      throw error;
    }
  },

  async getAreasByWarehouse(warehouseId: string, token: string): Promise<IFArea[]> {
    try {
      const data = await apiFetch<any>(
        `${WMS_URL}/warehouses/${warehouseId}/areas`,
        { method: "GET" },
        "No se pudieron obtener las áreas del almacén",
        { token }
      );
      return mapAreaList(data);
    } catch (error) {
      console.error("Error en getAreasByWarehouse:", error);
      throw error;
    }
  },

  async createArea(warehouseId: string, area: IFAreaCreate, token: string): Promise<IFArea> {
    try {
      const mappedArea = mapAreaCreate(area);
      const data = await apiFetch<any>(
        `${WMS_URL}/warehouses/${warehouseId}/areas`,
        {
          method: "POST",
          body: JSON.stringify(mappedArea),
        },
        "No se pudo crear el área en el almacén",
        { token }
      );
      return mapArea(data);
    } catch (error) {
      console.error("Error en createArea:", error);
      throw error;
    }
  },

  async assignArea(
    warehouseId: string,
    areaId: string,
    assignment: IFAreaAssignment,
    token: string
  ): Promise<IFAreaAssignmentResponse> {
    try {
      const mappedAssignment = mapAreaAssignment(assignment);
      const data = await apiFetch<any>(
        `${WMS_URL}/warehouses/${warehouseId}/areas/${areaId}/assign`,
        {
          method: "POST",
          body: JSON.stringify(mappedAssignment),
        },
        "No se pudo asignar el área",
        { token }
      );
      return mapAreaAssignmentResponse(data);
    } catch (error) {
      console.error("Error en assignArea:", error);
      throw error;
    }
  },
};

