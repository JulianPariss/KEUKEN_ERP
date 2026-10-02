import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IFSegregationGroup } from "@repo/api-contracts/erp";
import { PRODUCTS_URL } from "../../lib/constants/api.constants";
import { IBSegregationGroup } from "@repo/api-contracts/erp";
import { mapSegregationGroup, mapSegregationGroupList, mapSegregationGroupToCreate, mapSegregationGroupToUpdate } from "@repo/api-contracts/erp";

export const segregationGroupsService = {
    async getAll(companyId: string, token: string): Promise<IFSegregationGroup[]> {
        try {
            const data: IBSegregationGroup[] = await apiFetch(
                `${PRODUCTS_URL}/handling/segregation-groups?company_id=${companyId}`,
                { method: "GET" },
                "No se pudieron obtener los grupos de segregación",
                { token, companyId }
            );
            return mapSegregationGroupList(data);
        } catch (error) {
            throw error;
        }
    },
    async create(companyId: string, data: Partial<IFSegregationGroup>, token: string): Promise<IFSegregationGroup> {
        try {
            const mappedData = mapSegregationGroupToCreate(data);
            const itemResponse: IBSegregationGroup = await apiFetch(
                `${PRODUCTS_URL}/handling/segregation-groups?company_id=${companyId}`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear el grupo de segregación",
                { token, companyId }
            );
            return mapSegregationGroup(itemResponse);

        } catch (error) {
            throw error;
        }
    },
    async update(companyId: string, id: string, data: Partial<IFSegregationGroup>, token: string): Promise<IFSegregationGroup> {
        try {
            const mappedData = mapSegregationGroupToUpdate(data);
            const itemResponse: IBSegregationGroup = await apiFetch(
                `${PRODUCTS_URL}/handling/segregation-groups/${id}?company_id=${companyId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar el grupo de segregación",
                { token, companyId }
            );
            return mapSegregationGroup(itemResponse);

        } catch (error) {
            console.error("Error en updateSegregationGroup:", error);
            throw error;
        }
    },
    async delete(companyId: string, id: string, token: string): Promise<string> {
        try {
            const message: string = await apiFetch(
                `${PRODUCTS_URL}/handling/segregation-groups/${id}?company_id=${companyId}`,
                { method: "DELETE" },
                "No se pudo eliminar el grupo de segregación",
                { token, companyId }
            );
            return message;
        } catch (error) {
            console.error("Error en deleteSegregationGroup:", error);
            throw error;
        }
    }
};
