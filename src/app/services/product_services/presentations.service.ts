import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IBPresentation } from "@repo/api-contracts/erp";
import { IFListBasicParams, IFListV2 } from "@repo/api-contracts/erp";
import { IFPresentation, IFPresentationByItemParams } from "@repo/api-contracts/erp";
import { mapListParams } from "@repo/api-contracts/erp";
import { mapPresentation, mapPresentationByItemParams, mapPresentationListV2, mapPresentationToCreate, mapPresentationToUpdate } from "@repo/api-contracts/erp";
import { formatQueryParams } from "@/lib/utils/formatter.helper";
import { PRODUCTS_URL } from "../../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";


export const presentationsService = {
    async getAll(companyId: string, searchParams: IFListBasicParams, token: string, includeInactive: boolean = false): Promise<IFListV2<IFPresentation>> {
        try {
            const mappedParams = mapListParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const queryParams = new URLSearchParams(filteredParams);
            queryParams.set("company_id", companyId);
            queryParams.set("include_inactive", String(includeInactive));

            const url = `${PRODUCTS_URL}/presentations/list?${queryParams.toString()}`;
            const data: IBListV2<IBPresentation> = await apiFetch(
                url,
                { method: "GET" },
                "No se pudieron obtener las presentaciones",
                { token, companyId }
            );

            return mapPresentationListV2(data);

        } catch (error) {
            throw error;
        }
    },
    async getAllbyItem(searchParams: IFPresentationByItemParams, token: string, includeInactive: boolean = false): Promise<IFListV2<IFPresentation>> {
        try {
            const mappedParams = mapPresentationByItemParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const queryParams = new URLSearchParams(filteredParams);
            queryParams.set("include_inactive", String(includeInactive));
            const query = queryParams.toString();
            const url = `${PRODUCTS_URL}/item/${searchParams.itemId}/presentations/list?${query}`;

            const data: IBListV2<IBPresentation> = await apiFetch(
                url,
                { method: "GET" },
                "No se pudieron obtener las presentaciones",
                { token }
            );

            return mapPresentationListV2(data);
        } catch (error) {
            throw error;
        }
    },

    async create(data: Partial<IFPresentation> & { itemId: string }, token: string): Promise<IFPresentation> {
        try {
            const mappedData = mapPresentationToCreate(data);
            const presentationResponse: IBPresentation = await apiFetch(
                `${PRODUCTS_URL}/presentation`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear la presentación",
                { token }
            );

            return mapPresentation(presentationResponse);

        } catch (error) {
            console.error("Error en createPresentation:", error);
            throw error;
        }
    },
    async update(data: Partial<IFPresentation>, id: string, token: string): Promise<IFPresentation> {
        try {
            const mappedData = mapPresentationToUpdate(data);
            const presentationResponse: IBPresentation = await apiFetch(
                `${PRODUCTS_URL}/presentation/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar la presentación",
                { token }
            );

            return mapPresentation(presentationResponse);

        } catch (error) {
            console.error("Error en updatePresentation:", error);
            throw error;
        }
    },
    async delete(id: string, token: string): Promise<string> {
        try {
            const message: string = await apiFetch(
                `${PRODUCTS_URL}/presentations/${id}`,
                { method: "DELETE" },
                "No se pudo eliminar la presentación",
                { token }
            );

            return message;
        } catch (error) {
            console.error("Error en deletePresentation:", error);
            throw error;
        }
    },
};