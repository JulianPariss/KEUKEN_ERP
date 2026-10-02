import { apiFetch } from "../lib/utils/apiClient.helper";
import { ADMIN_URL } from "../lib/constants/api.constants";
import { IBRestoreResponse } from "@repo/api-contracts/erp";
import { IFRestoreResponse } from "@repo/api-contracts/erp";
import { mapRestoreResponse } from "@repo/api-contracts/erp";

export const commonService = {
    async restore(schema: string, table: string, id: string, token: string): Promise<IFRestoreResponse> {
        try {
            const data: IBRestoreResponse = await apiFetch(
                `${ADMIN_URL}/recovery/${schema}/${table}/${id}/restore`,
                {
                    method: "POST",
                },
                "No se pudo restaurar el registro",
                { token }
            );

            return mapRestoreResponse(data);
        } catch (error) {
            console.error("Error en restore:", error);
            throw error;
        }
    },
};
