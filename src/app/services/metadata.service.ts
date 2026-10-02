import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { METADATA_URL } from "../lib/constants/api.constants";
import { IBMetadataAttribute, IBMetadataGroup } from "@repo/api-contracts/erp";
import { IFMetadataAttribute, IFMetadataGroup } from "@repo/api-contracts/erp";
import { mapMetadataAttribute, mapMetadataAttributeList, mapMetadataGroupList, mapMetadataAttributeToBackend, mapMetadataGroup, mapMetadataGroupToBackend } from "@repo/api-contracts/erp";

export const metadataService = {
  async getAttributes(entityType: string, token: string, visibleOnly: boolean = true, groupCode?: string | null, includeInactive?: boolean): Promise<IFMetadataAttribute[]> {
    try {
      const query = new URLSearchParams();
      query.set("entity_type", entityType);
      query.set("visible_only", String(visibleOnly));
      if (groupCode !== undefined && groupCode !== null) {
        query.set("group_code", groupCode);
      }
      if (includeInactive !== undefined) {
        query.set("include_inactive", String(includeInactive));
      }

      const rawData: any = await apiFetch(
        `${METADATA_URL}/attributes?${query.toString()}`,
        { method: "GET" },
        "No se pudieron obtener los atributos de metadata",
        { token }
      );

      const data = Array.isArray(rawData) ? rawData : (rawData.items || []);
      return mapMetadataAttributeList(data);
    } catch (error) {
      console.error("Error en getAttributes:", error);
      throw error;
    }
  },

  async getGroups(entityType: string, token: string): Promise<IFMetadataGroup[]> {
    try {
      const query = new URLSearchParams();
      query.set("entity_type", entityType);

      const rawData: any = await apiFetch(
        `${METADATA_URL}/groups?${query.toString()}`,
        { method: "GET" },
        "No se pudieron obtener los grupos de metadata",
        { token }
      );

      const data = Array.isArray(rawData) ? rawData : (rawData.items || []);
      return mapMetadataGroupList(data);
    } catch (error) {
      console.error("Error en getGroups:", error);
      throw error;
    }
  },

  async getValues<T = Record<string, any>>(entityType: string, entityId: string, token: string): Promise<T> {
    try {
      const data: any = await apiFetch(
        `${METADATA_URL}/values/${entityType}/${entityId}`,
        { method: "GET" },
        "No se pudieron obtener los valores de metadata",
        { token }
      );

      return data.values || data;
    } catch (error: any) {
      if (error?.status === 404) {
        return {} as T;
      }
      console.error("Error en getValues:", error);
      throw error;
    }
  },

  async saveValues<T = Record<string, any>>(entityType: string, entityId: string, values: T, token: string): Promise<T> {
    try {
      const data: any = await apiFetch(
        `${METADATA_URL}/values/${entityType}/${entityId}`,
        {
          method: "PUT",
          body: JSON.stringify({ values }),
        },
        "No se pudieron guardar los valores de metadata",
        { token }
      );

      return data.values || data;
    } catch (error) {
      console.error("Error en saveValues:", error);
      throw error;
    }
  },

  async createAttribute(attributeData: any, token: string): Promise<IFMetadataAttribute> {
    try {
      const backendData = mapMetadataAttributeToBackend(attributeData);
      const rawData: IBMetadataAttribute = await apiFetch(
        `${METADATA_URL}/attributes`,
        {
          method: "POST",
          body: JSON.stringify(backendData),
        },
        "No se pudo crear el atributo",
        { token }
      );

      return mapMetadataAttribute(rawData);
    } catch (error) {
      console.error("Error en createAttribute:", error);
      throw error;
    }
  },

  async updateAttribute(attributeId: string, attributeData: any, token: string): Promise<IFMetadataAttribute> {
    try {
      const backendData = mapMetadataAttributeToBackend(attributeData);
      delete backendData.entity_type;
      delete backendData.code;
      delete backendData.company_id;

      const rawData: IBMetadataAttribute = await apiFetch(
        `${METADATA_URL}/attributes/${attributeId}`,
        {
          method: "PATCH",
          body: JSON.stringify(backendData),
        },
        "No se pudo actualizar el atributo",
        { token }
      );

      return mapMetadataAttribute(rawData);
    } catch (error) {
      console.error("Error en updateAttribute:", error);
      throw error;
    }
  },

  async deleteAttribute(attributeId: string, token: string): Promise<void> {
    try {
      await apiFetch(
        `${METADATA_URL}/attributes/${attributeId}`,
        { method: "DELETE" },
        "No se pudo eliminar el atributo",
        { token }
      );
    } catch (error) {
      console.error("Error en deleteAttribute:", error);
      throw error;
    }
  },

  async createGroup(groupData: any, token: string): Promise<IFMetadataGroup> {
    try {
      const backendData = mapMetadataGroupToBackend(groupData);
      const rawData: IBMetadataGroup = await apiFetch(
        `${METADATA_URL}/groups`,
        {
          method: "POST",
          body: JSON.stringify(backendData),
        },
        "No se pudo crear el grupo",
        { token }
      );

      return mapMetadataGroup(rawData);
    } catch (error) {
      console.error("Error en createGroup:", error);
      throw error;
    }
  },

  async updateGroup(groupId: string, groupData: any, token: string): Promise<IFMetadataGroup> {
    try {
      const payload: any = {};
      if (groupData.name !== undefined) payload.name = groupData.name;
      if (groupData.sortOrder !== undefined) payload.sort_order = groupData.sortOrder;
      if (groupData.active !== undefined) payload.active = groupData.active;

      const rawData: IBMetadataGroup = await apiFetch(
        `${METADATA_URL}/groups/${groupId}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
        "No se pudo actualizar el grupo",
        { token }
      );

      return mapMetadataGroup(rawData);
    } catch (error) {
      console.error("Error en updateGroup:", error);
      throw error;
    }
  }
};

