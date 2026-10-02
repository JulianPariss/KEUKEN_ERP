import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IFOperativeProfile } from "@repo/api-contracts/erp";
import { WMS_URL } from "../../lib/constants/api.constants";
import { IBOperativeProfile } from "@repo/api-contracts/erp";
import { mapOperativeProfileList } from "@repo/api-contracts/erp";

export const operativeProfileService = {
    async getAll(companyId: string, token: string): Promise<IFOperativeProfile[]> {
        try {
            const url = `${WMS_URL}/operational-profiles?company_id=${companyId}`;

            const data: IBOperativeProfile[] = await apiFetch(
                url,
                { method: "GET" },
                "No se pudieron obtener los perfiles operativos",
                { token, companyId }
            );

            return mapOperativeProfileList(data);
        } catch (error) {
            console.error("Error en getAll operative profiles:", error);
            throw error;
        }
    }
};
