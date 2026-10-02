import { ACCOUNTS_URL } from "@/app/lib/constants/api.constants";
import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IBPeriod } from "@repo/api-contracts/erp";
import { IFPeriod, IFPeriodCreation, IFPeriodUpdate } from "@repo/api-contracts/erp";
import { mapPeriodList, mapPeriodToCreate, mapPeriodToUpdate } from "@repo/api-contracts/erp";

export const periodsService = {
    async getAll(token: string, company_id: string): Promise<IFPeriod[]> {
        try {
            const data: IBPeriod[] = await apiFetch(
                `${ACCOUNTS_URL}/gl/periods?company_id=${company_id}`,
                { method: "GET" },
                "No se pudieron obtener los periodos",
                { token, companyId: company_id }
            );

            return mapPeriodList(data);
        } catch (error) {
            console.error("Error en getAllPeriods:", error);
            throw error;
        }
    },

    async create(data: IFPeriodCreation, token: string, company_id: string): Promise<any> {
        try {
            const mappedData = mapPeriodToCreate(data);
            const periodResponse = await apiFetch(
                `${ACCOUNTS_URL}/gl/periods?company_id=${company_id}`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear el periodo",
                { token, companyId: company_id }
            );

            return periodResponse;
        } catch (error) {
            console.error("Error en createPeriod:", error);
            throw error;
        }
    },

    async update(id: string, data: IFPeriodUpdate, token: string, company_id: string): Promise<any> {
        try {
            const mappedData = mapPeriodToUpdate(data);
            const periodResponse = await apiFetch(
                `${ACCOUNTS_URL}/gl/periods/${id}?company_id=${company_id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar el periodo",
                { token, companyId: company_id }
            );

            return periodResponse;
        } catch (error) {
            console.error("Error en updatePeriod:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, company_id: string): Promise<any> {
        try {
            const periodResponse = await apiFetch(
                `${ACCOUNTS_URL}/gl/periods/${id}?company_id=${company_id}`,
                {
                    method: "DELETE",
                },
                "No se pudo eliminar el periodo",
                { token, companyId: company_id }
            );

            return periodResponse;
        } catch (error) {
            console.error("Error en deletePeriod:", error);
            throw error;
        }
    }
};
