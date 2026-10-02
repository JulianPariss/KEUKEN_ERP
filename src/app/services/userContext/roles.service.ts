import { COMMON_URL } from "@/app/lib/constants/api.constants";
import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { TBRoles } from "@repo/api-contracts/erp";
import { IFRole, TFRoles } from "@repo/api-contracts/erp";
import { mapRoles } from "@repo/api-contracts/erp";

export const roleService = {
    async getAll(token: string, companyId: string): Promise<TFRoles> {
        try {
            const data: TBRoles = await apiFetch(
                `${COMMON_URL}/companies/${companyId}/api-keys`,
                { method: "GET" },
                "No se pudieron obtener las claves de API",
                { token, companyId }
            );

            return mapRoles(data);
        } catch (error) {
            console.error("Error en getAllKeys:", error);
            throw error;
        }
    },

    async create(name: string, token: string, companyId: string): Promise<IFRole> {
        try {
            const mappedData = { name, scopes: [] };
            const providerResponse = await apiFetch<IFRole>(
                `${COMMON_URL}/companies/${companyId}/api-keys`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear la clave de API",
                { token, companyId }
            );

            return providerResponse;
        } catch (error) {
            console.error("Error en createKey:", error);
            throw error;
        }
    },

    async update(keyId: string, data: { scopes: string[], active: boolean }, token: string, companyId: string): Promise<any> {
        try {
            const mappedData = data;
            const providerResponse = await apiFetch<any>(
                `${COMMON_URL}/companies/${companyId}/api-keys/${keyId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar la clave de API",
                { token, companyId }
            );

            return providerResponse;
        } catch (error) {
            console.error("Error en updateKey:", error);
            throw error;
        }
    },

    async delete(keyId: string, token: string, companyId: string): Promise<any> {
        try {
            const providerResponse = await apiFetch<any>(
                `${COMMON_URL}/companies/${companyId}/api-keys/${keyId}`,
                {
                    method: "DELETE",
                },
                "No se pudo eliminar la clave de API",
                { token, companyId }
            );

            return providerResponse;
        } catch (error) {
            console.error("Error en deleteKey:", error);
            throw error;
        }
    }
};
