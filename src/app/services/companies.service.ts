import { formatQueryParams } from "@/lib/utils/formatter.helper";
import { COMMON_URL } from "../lib/constants/api.constants";
import {
    IFListV2,
    IFListBasicParams,
    IBListV2,
    IBCompany,
    IFCompany,
    IFCompanyCreate,
    IFCompanyUpdate,
    IBCompanyCreateOk
} from "@repo/api-contracts/erp";
import {
    mapCompanyToFrontend,
    mapCompanyListToFrontend,
    mapCompanyCreateToBackend,
    mapCompanyUpdateToBackend
} from "@repo/api-contracts/erp";
import { apiFetch } from "@/app/lib/utils/apiClient.helper";

export const companiesService = {
    async getAll(searchParams: IFListBasicParams, token: string): Promise<IFListV2<IFCompany>> {
        const filteredParams = formatQueryParams(searchParams);
        const query = new URLSearchParams(filteredParams);

        const data = await apiFetch<IBListV2<IBCompany> | IBCompany[]>(
            `${COMMON_URL}/companies?${query.toString()}`,
            { method: "GET" },
            "No se pudieron obtener las compañías",
            { token }
        );

        if (Array.isArray(data)) {
            return {
                items: mapCompanyListToFrontend(data),
                metadata: {
                    totalItems: data.length,
                    totalPages: 1,
                    currentPage: 1,
                    limit: searchParams.limit || data.length,
                    offset: searchParams.offset || 0,
                },
            };
        }

        return {
            items: mapCompanyListToFrontend(data.items || []),
            metadata: {
                totalItems: data.metadata?.total_items ?? data.items?.length ?? 0,
                totalPages: data.metadata?.total_pages ?? 1,
                currentPage: data.metadata?.current_page ?? 1,
                limit: data.metadata?.limit ?? searchParams.limit ?? 0,
                offset: data.metadata?.offset ?? searchParams.offset ?? 0,
            },
        };
    },

    async getById(id: string, token: string): Promise<IFCompany> {
        const data = await apiFetch<IBCompany>(
            `${COMMON_URL}/companies/${id}`,
            { method: "GET" },
            "Error al obtener la compañía",
            { token }
        );
        return mapCompanyToFrontend(data);
    },

    async create(createRequest: IFCompanyCreate, token: string): Promise<IBCompanyCreateOk> {
        const backendRequest = mapCompanyCreateToBackend(createRequest);

        return await apiFetch<IBCompanyCreateOk>(
            `${COMMON_URL}/companies`,
            {
                method: "POST",
                body: JSON.stringify(backendRequest),
            },
            "Error al crear la compañía",
            { token }
        );
    },

    async update(id: string, updateRequest: IFCompanyUpdate, token: string): Promise<IFCompany> {
        const backendRequest = mapCompanyUpdateToBackend(updateRequest);

        const data = await apiFetch<IBCompany>(
            `${COMMON_URL}/companies/${id}`,
            {
                method: "PATCH",
                body: JSON.stringify(backendRequest),
            },
            "Error al actualizar la compañía",
            { token }
        );
        return mapCompanyToFrontend(data);
    },

    async delete(id: string, token: string): Promise<{ success: boolean }> {
        return await apiFetch<{ success: boolean }>(
            `${COMMON_URL}/companies/${id}`,
            { method: "DELETE" },
            "Error al eliminar la compañía",
            { token }
        );
    }
};
