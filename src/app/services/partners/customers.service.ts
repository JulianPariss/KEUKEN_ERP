import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { PARTNERS_URL } from "@/app/lib/constants/api.constants";
import { IBCustomer, IBCustomerAddress, IBCustomerCreate, IBCustomerFull, IBCustomerUpdate } from "@repo/api-contracts/erp";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IFCustomer, IFCustomerAddress, IFCustomerCreate, IFCustomerFull, IFCustomerUpdate } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { mapCustomer, mapCustomerAddress, mapCustomerFull, mapCustomerToCreate, mapCustomerToUpdate } from "@repo/api-contracts/erp";
import { IFOptionItem, IFOptionsListParams } from "@repo/api-contracts/erp";
import { mapOptionsList } from "@repo/api-contracts/erp";

export const customersService = {
    async getAll(token: string, limit: number = 50, offset: number = 0, companyId?: string): Promise<IFListV2<IFCustomer>> {
        try {
            const query = new URLSearchParams();
            query.set("limit", String(limit));
            query.set("offset", String(offset));
            if (companyId) {
                query.set("company_id", companyId);
            }

            const resData = await apiFetch<IBListV2<IBCustomer>>(
                `${PARTNERS_URL}/customers?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener los clientes",
                { token, companyId }
            );

            return {
                items: resData.items.map(mapCustomer),
                metadata: {
                    totalItems: resData.metadata.total_items,
                    totalPages: resData.metadata.total_pages,
                    currentPage: resData.metadata.current_page,
                    limit: resData.metadata.limit,
                    offset: resData.metadata.offset,
                }
            };
        } catch (error) {
            console.error("Error en getAll customers:", error);
            throw error;
        }
    },

    async getOptions(params: IFOptionsListParams, token: string): Promise<IFListV2<IFOptionItem>> {
        try {
            const query = new URLSearchParams();
            if (params.q) query.set("q", params.q);
            if (params.companyId) query.set("company_id", params.companyId);
            if (params.limit !== undefined) query.set("limit", String(params.limit));
            if (params.offset !== undefined) query.set("offset", String(params.offset));
            if (params.active !== undefined) query.set("active", String(params.active));

            const data = await apiFetch<any>(
                `${PARTNERS_URL}/customers/options?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener opciones de clientes",
                { token, companyId: params.companyId }
            );

            return mapOptionsList(data);
        } catch (error) {
            console.error("Error en getOptions (customers):", error);
            throw error;
        }
    },

    async getById(id: string, token: string, companyId?: string): Promise<IFCustomer> {
        try {
            const url = companyId
                ? `${PARTNERS_URL}/customers/${id}?company_id=${encodeURIComponent(companyId)}`
                : `${PARTNERS_URL}/customers/${id}`;

            const resData = await apiFetch<IBCustomer>(
                url,
                { method: "GET" },
                "No se pudo obtener el cliente",
                { token, companyId }
            );

            return mapCustomer(resData);
        } catch (error) {
            console.error("Error en getById customer:", error);
            throw error;
        }
    },

    async getFullById(id: string, token: string, companyId?: string): Promise<IFCustomerFull> {
        try {
            const url = companyId
                ? `${PARTNERS_URL}/customers/${id}/full?company_id=${encodeURIComponent(companyId)}`
                : `${PARTNERS_URL}/customers/${id}/full`;

            const resData = await apiFetch<IBCustomerFull>(
                url,
                { method: "GET" },
                "No se pudo obtener el detalle completo del cliente",
                { token, companyId }
            );

            return mapCustomerFull(resData);
        } catch (error) {
            console.error("Error en getFullById customer:", error);
            throw error;
        }
    },

    async create(data: IFCustomerCreate, token: string, companyId?: string): Promise<IFCustomer> {
        try {
            const mappedData = mapCustomerToCreate(data);
            const targetCompanyId = companyId || data.companyId;
            const payload = targetCompanyId ? { ...mappedData, company_id: targetCompanyId } : mappedData;
            const url = targetCompanyId
                ? `${PARTNERS_URL}/customer?company_id=${encodeURIComponent(targetCompanyId)}`
                : `${PARTNERS_URL}/customer`;

            const resData = await apiFetch<IBCustomer>(
                url,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
                "No se pudo crear el cliente",
                { token, companyId: targetCompanyId }
            );

            return mapCustomer(resData);
        } catch (error) {
            console.error("Error en create customer:", error);
            throw error;
        }
    },

    async update(id: string, data: IFCustomerUpdate, token: string, companyId?: string): Promise<IFCustomer> {
        try {
            const mappedData = mapCustomerToUpdate(data);
            const payload = companyId ? { ...mappedData, company_id: companyId } : mappedData;
            const url = companyId
                ? `${PARTNERS_URL}/customers/${id}?company_id=${encodeURIComponent(companyId)}`
                : `${PARTNERS_URL}/customers/${id}`;

            const resData = await apiFetch<IBCustomer>(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                },
                "No se pudo actualizar el cliente",
                { token, companyId }
            );

            return mapCustomer(resData);
        } catch (error) {
            console.error("Error en update customer:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, companyId?: string): Promise<{ message: string }> {
        try {
            const url = companyId
                ? `${PARTNERS_URL}/customers/${id}?company_id=${encodeURIComponent(companyId)}`
                : `${PARTNERS_URL}/customers/${id}`;

            return await apiFetch<{ message: string }>(
                url,
                { method: "DELETE" },
                "No se pudo eliminar el cliente",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en delete customer:", error);
            throw error;
        }
    },

    async getAddresses(customerId: string, token: string, companyId?: string): Promise<IFCustomerAddress[]> {
        try {
            const url = companyId
                ? `${PARTNERS_URL}/customers/${customerId}/addresses?company_id=${encodeURIComponent(companyId)}`
                : `${PARTNERS_URL}/customers/${customerId}/addresses`;

            const resData = await apiFetch<any>(
                url,
                { method: "GET" },
                "No se pudieron obtener las direcciones del cliente",
                { token, companyId }
            );

            const items: IBCustomerAddress[] = Array.isArray(resData)
                ? resData
                : (resData?.items || []);

            return items.map(mapCustomerAddress);
        } catch (error) {
            console.error("Error en getAddresses customer:", error);
            throw error;
        }
    }
};
