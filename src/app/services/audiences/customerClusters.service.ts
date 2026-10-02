import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { COMMERCIAL_URL } from "@/app/lib/constants/api.constants";
import { IBCustomerCluster, IBClusterAddMembersResponse, IBCustomerClusterMember } from "@repo/api-contracts/erp";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IFCustomerCluster, IFCustomerClusterCreate, IFClusterAddMembersResponse, IFCustomerClusterMember } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import {
    mapCustomerCluster,
    mapCustomerClusterToCreate,
    mapCustomerClusterToUpdate,
    mapCustomerClusterAddMembersToCreate,
    mapClusterAddMembersResponse,
    mapCustomerClusterMember,
} from "@repo/api-contracts/erp";

export const customerClustersService = {
    async getAll(
        limit: number = 50,
        offset: number = 0,
        token: string,
        companyId?: string,
        includeInactive: boolean = false
    ): Promise<IFListV2<IFCustomerCluster>> {
        try {
            const query = new URLSearchParams();
            query.set("limit", String(limit));
            query.set("offset", String(offset));
            if (companyId) {
                query.set("company_id", companyId);
            }
            query.set("include_inactive", String(includeInactive));

            const resData = await apiFetch<IBListV2<IBCustomerCluster>>(
                `${COMMERCIAL_URL}/customer-clusters?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener los clústeres de clientes",
                { token, companyId }
            );

            return {
                items: (resData.items || []).map(mapCustomerCluster),
                metadata: {
                    totalItems: resData.metadata?.total_items ?? 0,
                    totalPages: resData.metadata?.total_pages ?? 1,
                    currentPage: resData.metadata?.current_page ?? 1,
                    limit: resData.metadata?.limit ?? limit,
                    offset: resData.metadata?.offset ?? offset,
                }
            };
        } catch (error) {
            console.error("Error en getAll customerClusters:", error);
            throw error;
        }
    },

    async create(
        data: IFCustomerClusterCreate,
        token: string,
        companyId?: string
    ): Promise<IFCustomerCluster> {
        try {
            const mappedData = mapCustomerClusterToCreate(data);
            const targetCompanyId = companyId || data.companyId;
            const payload = {
                ...mappedData,
                company_id: targetCompanyId,
            };

            const query = targetCompanyId ? `?company_id=${encodeURIComponent(targetCompanyId)}` : "";

            const resData = await apiFetch<IBCustomerCluster>(
                `${COMMERCIAL_URL}/customer-clusters${query}`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
                "No se pudo crear el clúster de clientes",
                { token, companyId: targetCompanyId }
            );

            return mapCustomerCluster(resData);
        } catch (error) {
            console.error("Error en create customerCluster:", error);
            throw error;
        }
    },

    async addMembers(
        clusterId: string,
        customerIds: string[],
        token: string,
        companyId?: string
    ): Promise<IFClusterAddMembersResponse> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
            const payload = mapCustomerClusterAddMembersToCreate({ customerIds });

            const resData = await apiFetch<IBClusterAddMembersResponse>(
                `${COMMERCIAL_URL}/customer-clusters/${clusterId}/members${query}`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
                "No se pudieron agregar los clientes al clúster",
                { token, companyId }
            );

            return mapClusterAddMembersResponse(resData);
        } catch (error) {
            console.error("Error en addMembers (customerClusters):", error);
            throw error;
        }
    },

    async getMembers(
        clusterId: string,
        limit: number = 100,
        offset: number = 0,
        token: string,
        companyId?: string,
        excluded?: boolean | 'all'
    ): Promise<IFListV2<IFCustomerClusterMember>> {
        try {
            const query = new URLSearchParams();
            query.set("limit", String(limit));
            query.set("offset", String(offset));
            if (companyId) {
                query.set("company_id", companyId);
            }
            if (excluded !== undefined) {
                query.set("excluded", String(excluded));
            }

            const resData = await apiFetch<IBListV2<IBCustomerClusterMember>>(
                `${COMMERCIAL_URL}/customer-clusters/${clusterId}/members?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener los miembros del clúster de clientes",
                { token, companyId }
            );

            return {
                items: (resData.items || []).map(mapCustomerClusterMember),
                metadata: {
                    totalItems: resData.metadata?.total_items ?? 0,
                    totalPages: resData.metadata?.total_pages ?? 1,
                    currentPage: resData.metadata?.current_page ?? 1,
                    limit: resData.metadata?.limit ?? limit,
                    offset: resData.metadata?.offset ?? offset,
                }
            };
        } catch (error) {
            console.error("Error en getMembers (customerClusters):", error);
            throw error;
        }
    },

    async removeMember(
        clusterId: string,
        customerId: string,
        token: string,
        companyId?: string
    ): Promise<IFClusterAddMembersResponse> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
            const resData = await apiFetch<IBClusterAddMembersResponse>(
                `${COMMERCIAL_URL}/customer-clusters/${clusterId}/members/${customerId}${query}`,
                { method: "DELETE" },
                "No se pudo eliminar el cliente del clúster",
                { token, companyId }
            );

            return mapClusterAddMembersResponse(resData);
        } catch (error) {
            console.error("Error en removeMember (customerClusters):", error);
            throw error;
        }
    },

    async getById(
        clusterId: string,
        token: string,
        companyId?: string
    ): Promise<IFCustomerCluster> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
            const resData = await apiFetch<IBCustomerCluster>(
                `${COMMERCIAL_URL}/customer-clusters/${clusterId}${query}`,
                { method: "GET" },
                "No se pudo obtener el detalle del clúster de clientes",
                { token, companyId }
            );

            return mapCustomerCluster(resData);
        } catch (error) {
            console.error("Error en getById (customerClusters):", error);
            throw error;
        }
    },

    async update(
        clusterId: string,
        data: Partial<IFCustomerCluster>,
        token: string,
        companyId?: string
    ): Promise<IFCustomerCluster> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
            const payload = mapCustomerClusterToUpdate(data);

            const resData = await apiFetch<IBCustomerCluster>(
                `${COMMERCIAL_URL}/customer-clusters/${clusterId}${query}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                },
                "No se pudo actualizar el clúster de clientes",
                { token, companyId }
            );

            return mapCustomerCluster(resData);
        } catch (error) {
            console.error("Error en update (customerClusters):", error);
            throw error;
        }
    },

    async delete(
        clusterId: string,
        token: string,
        companyId?: string
    ): Promise<IFClusterAddMembersResponse> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
            const resData = await apiFetch<IBClusterAddMembersResponse>(
                `${COMMERCIAL_URL}/customer-clusters/${clusterId}${query}`,
                { method: "DELETE" },
                "No se pudo eliminar el clúster de clientes",
                { token, companyId }
            );

            return mapClusterAddMembersResponse(resData);
        } catch (error) {
            console.error("Error en delete (customerClusters):", error);
            throw error;
        }
    },

    async excludeMember(
        clusterId: string,
        customerId: string,
        token: string,
        companyId?: string
    ): Promise<void> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
            await apiFetch<void>(
                `${COMMERCIAL_URL}/customer-clusters/${clusterId}/exclusions/${customerId}${query}`,
                { method: "POST" },
                "No se pudo excluir al miembro del clúster",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en excludeMember (customerClusters):", error);
            throw error;
        }
    },

    async includeMember(
        clusterId: string,
        customerId: string,
        token: string,
        companyId?: string
    ): Promise<void> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
            await apiFetch<void>(
                `${COMMERCIAL_URL}/customer-clusters/${clusterId}/exclusions/${customerId}${query}`,
                { method: "DELETE" },
                "No se pudo re-incluir al miembro en el clúster",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en includeMember (customerClusters):", error);
            throw error;
        }
    },

    async removeMembers(
        clusterId: string,
        customerIds: string[],
        token: string,
        companyId?: string
    ): Promise<void> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
            await apiFetch<void>(
                `${COMMERCIAL_URL}/customer-clusters/${clusterId}/members${query}`,
                {
                    method: "DELETE",
                    body: JSON.stringify({ customer_ids: customerIds })
                },
                "No se pudieron remover los miembros del clúster",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en removeMembers (customerClusters):", error);
            throw error;
        }
    }
};
