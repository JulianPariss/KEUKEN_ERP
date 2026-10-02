import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { COMMERCIAL_URL } from "@/app/lib/constants/api.constants";
import { IBItemCluster, IBClusterAddMembersResponse, IBItemClusterMember } from "@repo/api-contracts/erp";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IFItemCluster, IFItemClusterCreate, IFClusterAddMembersResponse, IFItemClusterMember } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import {
    mapItemCluster,
    mapItemClusterToCreate,
    mapItemClusterToUpdate,
    mapItemClusterAddMembersToCreate,
    mapClusterAddMembersResponse,
    mapItemClusterMember,
} from "@repo/api-contracts/erp";

export const itemClustersService = {
    async getAll(
        limit: number = 50,
        offset: number = 0,
        token: string,
        companyId?: string,
        includeInactive: boolean = false
    ): Promise<IFListV2<IFItemCluster>> {
        try {
            const query = new URLSearchParams();
            query.set("limit", String(limit));
            query.set("offset", String(offset));
            if (companyId) {
                query.set("company_id", companyId);
            }
            query.set("include_inactive", String(includeInactive));

            const resData = await apiFetch<IBListV2<IBItemCluster>>(
                `${COMMERCIAL_URL}/item-clusters?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener los clústeres de ítems",
                { token, companyId }
            );

            return {
                items: (resData.items || []).map(mapItemCluster),
                metadata: {
                    totalItems: resData.metadata?.total_items ?? 0,
                    totalPages: resData.metadata?.total_pages ?? 1,
                    currentPage: resData.metadata?.current_page ?? 1,
                    limit: resData.metadata?.limit ?? limit,
                    offset: resData.metadata?.offset ?? offset,
                }
            };
        } catch (error) {
            console.error("Error en getAll itemClusters:", error);
            throw error;
        }
    },

    async create(
        data: IFItemClusterCreate,
        token: string,
        companyId?: string
    ): Promise<IFItemCluster> {
        try {
            const mappedData = mapItemClusterToCreate(data);
            const targetCompanyId = companyId || data.companyId;
            const payload = {
                ...mappedData,
                company_id: targetCompanyId,
            };

            const query = targetCompanyId ? `?company_id=${encodeURIComponent(targetCompanyId)}` : "";

            const resData = await apiFetch<IBItemCluster>(
                `${COMMERCIAL_URL}/item-clusters${query}`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
                "No se pudo crear el clúster de ítems",
                { token, companyId: targetCompanyId }
            );

            return mapItemCluster(resData);
        } catch (error) {
            console.error("Error en create itemCluster:", error);
            throw error;
        }
    },

    async addMembers(
        clusterId: string,
        itemIds: string[],
        token: string,
        companyId?: string
    ): Promise<IFClusterAddMembersResponse> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
            const payload = mapItemClusterAddMembersToCreate({ itemIds });

            const resData = await apiFetch<IBClusterAddMembersResponse>(
                `${COMMERCIAL_URL}/item-clusters/${clusterId}/members${query}`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
                "No se pudieron agregar los ítems al clúster",
                { token, companyId }
            );

            return mapClusterAddMembersResponse(resData);
        } catch (error) {
            console.error("Error en addMembers (itemClusters):", error);
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
    ): Promise<IFListV2<IFItemClusterMember>> {
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

            const resData = await apiFetch<IBListV2<IBItemClusterMember>>(
                `${COMMERCIAL_URL}/item-clusters/${clusterId}/members?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener los miembros del clúster de ítems",
                { token, companyId }
            );

            return {
                items: (resData.items || []).map(mapItemClusterMember),
                metadata: {
                    totalItems: resData.metadata?.total_items ?? 0,
                    totalPages: resData.metadata?.total_pages ?? 1,
                    currentPage: resData.metadata?.current_page ?? 1,
                    limit: resData.metadata?.limit ?? limit,
                    offset: resData.metadata?.offset ?? offset,
                }
            };
        } catch (error) {
            console.error("Error en getMembers (itemClusters):", error);
            throw error;
        }
    },

    async removeMember(
        clusterId: string,
        itemId: string,
        token: string,
        companyId?: string
    ): Promise<IFClusterAddMembersResponse> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
            const resData = await apiFetch<IBClusterAddMembersResponse>(
                `${COMMERCIAL_URL}/item-clusters/${clusterId}/members/${itemId}${query}`,
                { method: "DELETE" },
                "No se pudo eliminar el ítem del clúster",
                { token, companyId }
            );

            return mapClusterAddMembersResponse(resData);
        } catch (error) {
            console.error("Error en removeMember (itemClusters):", error);
            throw error;
        }
    },

    async getById(
        clusterId: string,
        token: string,
        companyId?: string
    ): Promise<IFItemCluster> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
            const resData = await apiFetch<IBItemCluster>(
                `${COMMERCIAL_URL}/item-clusters/${clusterId}${query}`,
                { method: "GET" },
                "No se pudo obtener el detalle del clúster de ítems",
                { token, companyId }
            );

            return mapItemCluster(resData);
        } catch (error) {
            console.error("Error en getById (itemClusters):", error);
            throw error;
        }
    },

    async update(
        clusterId: string,
        data: Partial<IFItemCluster>,
        token: string,
        companyId?: string
    ): Promise<IFItemCluster> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
            const payload = mapItemClusterToUpdate(data);

            const resData = await apiFetch<IBItemCluster>(
                `${COMMERCIAL_URL}/item-clusters/${clusterId}${query}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                },
                "No se pudo actualizar el clúster de ítems",
                { token, companyId }
            );

            return mapItemCluster(resData);
        } catch (error) {
            console.error("Error en update (itemClusters):", error);
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
                `${COMMERCIAL_URL}/item-clusters/${clusterId}${query}`,
                { method: "DELETE" },
                "No se pudo eliminar el clúster de ítems",
                { token, companyId }
            );

            return mapClusterAddMembersResponse(resData);
        } catch (error) {
            console.error("Error en delete (itemClusters):", error);
            throw error;
        }
    },

    async removeMembers(
        clusterId: string,
        itemIds: string[],
        token: string,
        companyId?: string
    ): Promise<void> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
            await apiFetch<void>(
                `${COMMERCIAL_URL}/item-clusters/${clusterId}/members${query}`,
                {
                    method: "DELETE",
                    body: JSON.stringify({ item_ids: itemIds })
                },
                "No se pudieron remover los miembros del clúster",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en removeMembers (itemClusters):", error);
            throw error;
        }
    },

    async excludeMember(
        clusterId: string,
        itemId: string,
        token: string,
        companyId?: string
    ): Promise<void> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
            await apiFetch<void>(
                `${COMMERCIAL_URL}/item-clusters/${clusterId}/exclusions/${itemId}${query}`,
                { method: "POST" },
                "No se pudo excluir al miembro del clúster",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en excludeMember (itemClusters):", error);
            throw error;
        }
    },

    async includeMember(
        clusterId: string,
        itemId: string,
        token: string,
        companyId?: string
    ): Promise<void> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
            await apiFetch<void>(
                `${COMMERCIAL_URL}/item-clusters/${clusterId}/exclusions/${itemId}${query}`,
                { method: "DELETE" },
                "No se pudo re-incluir al miembro en el clúster",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en includeMember (itemClusters):", error);
            throw error;
        }
    }
};
