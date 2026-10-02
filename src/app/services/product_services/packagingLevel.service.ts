import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IFPackagingLevel } from "@repo/api-contracts/erp";
import { IBPackagingLevel } from "@repo/api-contracts/erp";
import { mapPackagingLevelList } from "@repo/api-contracts/erp";
import { PRODUCTS_URL } from "../../lib/constants/api.constants";

export const packagingLevelService = {
    async getAll(token: string): Promise<IFPackagingLevel[]> {
        try {
            const data: IBPackagingLevel[] = await apiFetch(
                `${PRODUCTS_URL}/packaging-levels`,
                { method: "GET" },
                "No se pudieron obtener los niveles de empaquetado",
                { token }
            );

            return mapPackagingLevelList(data);
        } catch (error) {
            throw error;
        }
    }
};
