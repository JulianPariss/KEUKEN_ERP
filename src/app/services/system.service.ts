import { APIV1_URL } from "../lib/constants/api.constants";
import { apiFetch, apiFetchBlob } from "../lib/utils/apiClient.helper";
import { IBSystemSetting, IBSettingsAuditResponse } from "@repo/api-contracts/erp";
import { IFSystemSetting, IFSystemSettingUpdate, IFSettingsAuditResponse } from "@repo/api-contracts/erp";
import { mapSystemSettingList, mapSystemSettingUpdateToBackend, mapSystemSetting, mapSystemAuditResponse } from "@repo/api-contracts/erp";

export const systemService = {
    async getAll(token: string): Promise<IFSystemSetting[]> {
        try {
            const data: IBSystemSetting[] = await apiFetch(
                `${APIV1_URL}/system/settings`,
                { method: "GET" },
                "No se pudieron obtener las configuraciones del sistema",
                { token }
            );

            return mapSystemSettingList(data);
        } catch (error) {
            console.error("Error en getAll system settings:", error);
            throw error;
        }
    },

    async update(key: string, setting: IFSystemSettingUpdate, token: string): Promise<IFSystemSetting> {
        try {
            const backendData = mapSystemSettingUpdateToBackend(setting);
            const rawData: IBSystemSetting = await apiFetch(
                `${APIV1_URL}/system/settings/${key}`,
                {
                    method: "PUT",
                    body: JSON.stringify(backendData),
                },
                "No se pudo actualizar la configuración del sistema",
                { token }
            );

            return mapSystemSetting(rawData);
        } catch (error) {
            console.error("Error en update system setting:", error);
            throw error;
        }
    },

    async getAudit(
        token: string,
        params: { page?: number; limit?: number; setting_key?: string } = {}
    ): Promise<IFSettingsAuditResponse> {
        try {
            const query = new URLSearchParams();
            if (params.page !== undefined) query.set("page", String(params.page));
            if (params.limit !== undefined) query.set("limit", String(params.limit));
            if (params.setting_key !== undefined) query.set("setting_key", params.setting_key);

            const data: IBSettingsAuditResponse = await apiFetch(
                `${APIV1_URL}/system/settings/audit?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener los logs de auditoría",
                { token }
            );

            return mapSystemAuditResponse(data);
        } catch (error) {
            console.error("Error en getAudit system settings:", error);
            throw error;
        }
    },

    async export(token: string): Promise<Blob> {
        try {
            return await apiFetchBlob(
                `${APIV1_URL}/system/settings/export`,
                { method: "GET" },
                "No se pudo exportar las configuraciones",
                { token }
            );
        } catch (error) {
            console.error("Error en export system settings:", error);
            throw error;
        }
    },

    async testConnection(key: string, token: string): Promise<{ latency_ms: number; ok: boolean; provider: string }> {
        try {
            return await apiFetch<{ latency_ms: number; ok: boolean; provider: string }>(
                `${APIV1_URL}/system/settings/${key}/test`,
                { method: "GET" },
                "No se pudo probar la conexión",
                { token }
            );
        } catch (error) {
            console.error(`Error en testConnection para ${key}:`, error);
            throw error;
        }
    }
};


