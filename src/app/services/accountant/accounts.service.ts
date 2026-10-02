import { ACCOUNTS_URL } from "@/app/lib/constants/api.constants";
import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IBAccount, IBAccountLinesList, IBAccountRoot } from "@repo/api-contracts/erp";
import { IBListV3 } from "@repo/api-contracts/erp";
import { IFAccount, IFAccountCreation, IFAccountLinesList, IFAccountQueryParams, IFAccountsTree, IFAccountUpdate } from "@repo/api-contracts/erp";
import { IFListV3 } from "@repo/api-contracts/erp";
import { mapAccountLinesList, mapAccountListV3, mapAccountToCreate, mapAccountToUpdate, mapAccountTreeList } from "@repo/api-contracts/erp";


export const accountsService = {
    async getAll(
        token: string,
        company_id: string,
        params?: IFAccountQueryParams
    ): Promise<IFListV3<IFAccount>> {
        try {
            const searchParams = new URLSearchParams();
            searchParams.append("company_id", company_id);

            if (params?.type) searchParams.append("type", params.type);
            if (params?.q) searchParams.append("q", params.q);
            if (params?.code_prefix) searchParams.append("code_prefix", params.code_prefix);
            if (params?.chart_status) searchParams.append("chart_status", params.chart_status);
            if (params?.limit !== undefined && params?.limit !== null) searchParams.append("limit", params.limit.toString());
            if (params?.offset !== undefined && params?.offset !== null) searchParams.append("offset", params.offset.toString());

            const queryString = searchParams.toString();
            const url = `${ACCOUNTS_URL}/gl/accounts${queryString ? `?${queryString}` : ""}`;

            const data: IBListV3<IBAccount> = await apiFetch(
                url,
                { method: "GET" },
                "No se pudieron obtener las cuentas",
                { token, companyId: company_id }
            );
            return mapAccountListV3(data);
        } catch (error) {
            console.error("Error en getAllAccounts:", error);
            throw error;
        }
    },

    async getAllTree(token: string, company_id: string): Promise<IFAccountsTree[]> {
        try {
            const data: IBAccountRoot = await apiFetch(
                `${ACCOUNTS_URL}/gl/accounts/tree?company_id=${company_id}`,
                { method: "GET" },
                "No se pudieron obtener las cuentas",
                { token, companyId: company_id }
            );
            return mapAccountTreeList(data.roots);
        } catch (error) {
            console.error("Error en getAllAccountsTree:", error);
            throw error;
        }
    },

    async create(data: IFAccountCreation, token: string, company_id: string): Promise<any> {
        try {
            const mappedData = mapAccountToCreate(data);
            const accountResponse = await apiFetch<any>(
                `${ACCOUNTS_URL}/gl/accounts?company_id=${company_id}`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear la cuenta",
                { token, companyId: company_id }
            );
            return accountResponse;
        } catch (error) {
            console.error("Error en createAccount:", error);
            throw error;
        }
    },

    async update(id: string, data: IFAccountUpdate, token: string, company_id: string): Promise<any> {
        try {
            const mappedData = mapAccountToUpdate(data);
            const accountResponse = await apiFetch<any>(
                `${ACCOUNTS_URL}/gl/accounts/${id}?company_id=${company_id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar la cuenta",
                { token, companyId: company_id }
            );
            return accountResponse;
        } catch (error) {
            console.error("Error en updateAccount:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, company_id: string, movements_only: boolean = false): Promise<any> {
        try {
            await apiFetch<any>(
                `${ACCOUNTS_URL}/gl/accounts/${id}?company_id=${company_id}&movements_only=${movements_only}`,
                { method: "DELETE" },
                "No se pudo eliminar la cuenta",
                { token, companyId: company_id }
            );
            return null;
        } catch (error) {
            console.error("Error en deleteAccount:", error);
            throw error;
        }
    },

    async getAccountLines(id: string, token: string, company_id: string, params: Record<string, string> = {}): Promise<IFAccountLinesList> {
        try {
            const queryParams = new URLSearchParams(params);
            const data: IBAccountLinesList = await apiFetch(
                `${ACCOUNTS_URL}/gl/accounts/${id}/lines?company_id=${company_id}&${queryParams.toString()}`,
                { method: "GET" },
                "No se pudieron obtener los movimientos",
                { token, companyId: company_id }
            );
            return mapAccountLinesList(data);
        } catch (error) {
            console.error("Error en getAccountLines:", error);
            throw error;
        }
    },
}
