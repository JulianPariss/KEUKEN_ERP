import { formatQueryParams } from "@/lib/utils/formatter.helper";
import { WMS_URL } from "../lib/constants/api.constants";
import { IFListV2, IFListBasicParams } from "@repo/api-contracts/erp";
import { IFConsignment, IFConsignmentCreateRequest, IFConsignmentReturnRequest } from "@repo/api-contracts/erp";
import { mapConsignment, mapConsignmentList, mapConsignmentToCreate, mapConsignmentReturn } from "@repo/api-contracts/erp";
import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IBConsignment } from "@repo/api-contracts/erp";

export const consignmentsService = {
    async getAll(searchParams: IFListBasicParams, token: string, companyId?: string): Promise<IFListV2<IFConsignment>> {
        const filteredParams = formatQueryParams(searchParams);
        const query = new URLSearchParams(filteredParams);
        if (companyId) query.set("company_id", companyId);

        const data: IBConsignment[] = await apiFetch<IBConsignment[]>(
            `${WMS_URL}/consignments?${query.toString()}`,
            { method: "GET" },
            "No se pudieron obtener las consignaciones",
            { token, companyId }
        );

        return {
            items: mapConsignmentList(data),
            metadata: { totalItems: data.length, totalPages: 1, currentPage: 1, limit: searchParams.limit || 0, offset: searchParams.offset || 0 },
        };
    },

    async getById(id: string, token: string, companyId?: string): Promise<IFConsignment> {
        const url = companyId
            ? `${WMS_URL}/consignments/${id}?company_id=${encodeURIComponent(companyId)}`
            : `${WMS_URL}/consignments/${id}`;

        const data = await apiFetch<any>(
            url,
            { method: "GET" },
            "Error al obtener la consignación",
            { token, companyId }
        );
        return mapConsignment(data);
    },

    async create(createRequest: IFConsignmentCreateRequest, token: string, companyId?: string): Promise<IFConsignment> {
        const backendRequest = mapConsignmentToCreate(createRequest);
        const targetCompanyId = companyId || createRequest.companyId;
        const payload = targetCompanyId ? { ...backendRequest, company_id: targetCompanyId } : backendRequest;
        const url = targetCompanyId
            ? `${WMS_URL}/consignments?company_id=${encodeURIComponent(targetCompanyId)}`
            : `${WMS_URL}/consignments`;

        const data = await apiFetch<any>(
            url,
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
            "Error al crear la consignación",
            { token, companyId: targetCompanyId }
        );
        return mapConsignment(data);
    },

    async returnItem(id: string, returnRequest: IFConsignmentReturnRequest, token: string, companyId?: string): Promise<any> {
        const backendRequest = mapConsignmentReturn(returnRequest);
        const payload = companyId ? { ...backendRequest, company_id: companyId } : backendRequest;
        const url = companyId
            ? `${WMS_URL}/consignments/${id}/return?company_id=${encodeURIComponent(companyId)}`
            : `${WMS_URL}/consignments/${id}/return`;

        return await apiFetch<any>(
            url,
            {
                method: "PATCH",
                body: JSON.stringify(payload),
            },
            "Error al registrar devolución de consignación",
            { token, companyId }
        );
    }
};

