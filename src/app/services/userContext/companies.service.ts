import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { ICompanyResponse } from "@repo/api-contracts/erp";
import { ICompany } from "@repo/api-contracts/erp";
import { mapCompanyList } from "@repo/api-contracts/erp";
import { COMMON_URL } from "@/app/lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IFListBasicParams } from "@repo/api-contracts/erp";

export const companiesService = {
    async getAll(searchParams: IFListBasicParams, token: string): Promise<IBListV2<ICompany>> {
        try {
            const { limit = 5000, offset = 0 } = searchParams;
            const url = `${COMMON_URL}/companies?limit=${limit}&offset=${offset}`;

            const data = await apiFetch<IBListV2<ICompanyResponse>>(
                url,
                { method: "GET" },
                "No se pudieron obtener las compañías",
                { token }
            );

            return {
                ...data,
                items: mapCompanyList(data.items)
            };
        } catch (error) {
            throw error;
        }
    },
};
