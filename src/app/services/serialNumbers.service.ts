import { WMS_URL } from "../lib/constants/api.constants";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFSerialNumber, IFSerialNumberCreateRequest } from "@repo/api-contracts/erp";
import { mapSerialNumber, mapSerialNumberList, mapSerialNumberToCreate } from "@repo/api-contracts/erp";
import { apiFetch } from "@/app/lib/utils/apiClient.helper";

export const serialNumbersService = {
    async getAll(itemId: string, token: string, companyId?: string): Promise<IFListV2<IFSerialNumber>> {
        const url = companyId
            ? `${WMS_URL}/items/${itemId}/serial-numbers?company_id=${encodeURIComponent(companyId)}`
            : `${WMS_URL}/items/${itemId}/serial-numbers`;

        const data = await apiFetch<any>(
            url,
            { method: "GET" },
            "No se pudieron obtener los serial numbers",
            { token, companyId }
        );
        const items = mapSerialNumberList(Array.isArray(data) ? data : (data.items || []));
        return {
            items,
            metadata: {
                totalItems: items.length,
                totalPages: 1,
                currentPage: 1,
                limit: items.length,
                offset: 0
            },
        };
    },

    async getById(id: string, token: string, companyId?: string): Promise<IFSerialNumber> {
        const url = companyId
            ? `${WMS_URL}/serial-numbers/${id}?company_id=${encodeURIComponent(companyId)}`
            : `${WMS_URL}/serial-numbers/${id}`;

        const data = await apiFetch<any>(
            url,
            { method: "GET" },
            "Error al obtener el serial number",
            { token, companyId }
        );
        return mapSerialNumber(data);
    },

    async create(createRequest: IFSerialNumberCreateRequest, token: string, companyId?: string): Promise<IFSerialNumber> {
        const backendRequest = mapSerialNumberToCreate(createRequest);
        const targetCompanyId = companyId || createRequest.companyId;
        const payload = targetCompanyId ? { ...backendRequest, company_id: targetCompanyId } : backendRequest;
        const url = targetCompanyId
            ? `${WMS_URL}/serial-numbers?company_id=${encodeURIComponent(targetCompanyId)}`
            : `${WMS_URL}/serial-numbers`;

        const data = await apiFetch<any>(
            url,
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
            "Error al crear el serial number",
            { token, companyId: targetCompanyId }
        );
        return mapSerialNumber(data);
    },

    async update(id: string, updateRequest: IFSerialNumberCreateRequest, token: string, companyId?: string): Promise<IFSerialNumber> {
        const backendRequest = mapSerialNumberToCreate(updateRequest);
        const targetCompanyId = companyId || updateRequest.companyId;
        const payload = targetCompanyId ? { ...backendRequest, company_id: targetCompanyId } : backendRequest;
        const url = targetCompanyId
            ? `${WMS_URL}/serial-numbers/${id}?company_id=${encodeURIComponent(targetCompanyId)}`
            : `${WMS_URL}/serial-numbers/${id}`;

        const data = await apiFetch<any>(
            url,
            {
                method: "PATCH",
                body: JSON.stringify(payload),
            },
            "Error al actualizar el serial number",
            { token, companyId: targetCompanyId }
        );
        return mapSerialNumber(data);
    },

    async delete(id: string, token: string, companyId?: string): Promise<void> {
        const url = companyId
            ? `${WMS_URL}/serial-numbers/${id}?company_id=${encodeURIComponent(companyId)}`
            : `${WMS_URL}/serial-numbers/${id}`;

        await apiFetch<void>(
            url,
            {
                method: "DELETE",
                ...(companyId ? { body: JSON.stringify({ company_id: companyId }) } : {}),
            },
            "Error al eliminar el serial number",
            { token, companyId }
        );
    }
};
