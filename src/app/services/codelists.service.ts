import { DOCUMENTS_URL } from "../lib/constants/api.constants";
import { apiFetch } from "../lib/utils/apiClient.helper";
import { IBCodelistTaxCategory } from "@repo/api-contracts/erp";
import { IFCodelistTaxCategory } from "@repo/api-contracts/erp";
import { mapCodelistTaxCategoryList } from "@repo/api-contracts/erp";

export const codelistsService = {
    async getTaxCategories(token: string, companyId?: string): Promise<IFCodelistTaxCategory[]> {
        try {
            const data: IBCodelistTaxCategory[] = await apiFetch(
                `${DOCUMENTS_URL}/codelists/tax-categories`,
                { method: "GET" },
                "No se pudieron obtener las categorías de impuestos del codelist",
                { token, companyId }
            );
            return mapCodelistTaxCategoryList(data);
        } catch (error) {
            console.error("Error en getTaxCategories codelist:", error);
            throw error;
        }
    },
};
