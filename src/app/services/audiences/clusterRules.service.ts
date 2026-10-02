import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { COMMERCIAL_URL } from "@/app/lib/constants/api.constants";
import {
    IBClusterPreviewResult,
    IBClusterRefreshResult,
    IBClusterSummary,
    IBSnapshotResult
} from "@repo/api-contracts/erp";
import {
    IFClusterPreviewResult,
    IFClusterRefreshResult,
    IFClusterSummary,
    IFCustomerRuleSet,
    IFSnapshotResult
} from "@repo/api-contracts/erp";
import { IFClusterAddMembersResponse } from "@repo/api-contracts/erp";
import { IBClusterAddMembersResponse } from "@repo/api-contracts/erp";
import {
    mapClusterPreviewRequestToBackend,
    mapClusterPreviewResult,
    mapClusterRefreshResult,
    mapClusterSummary,
    mapSnapshotResult
} from "@repo/api-contracts/erp";
import { mapClusterAddMembersResponse } from "@repo/api-contracts/erp";

export const clusterRulesService = {
    async previewCustomerRules(
        ruleSet: IFCustomerRuleSet,
        companyId: string,
        limit: number = 100,
        token?: string
    ): Promise<IFClusterPreviewResult> {
        try {
            if (!companyId) throw new Error("Debe seleccionar una compañía activa");

            const payload = mapClusterPreviewRequestToBackend({
                companyId,
                ruleSet,
                limit,
            });

            const query = `?company_id=${encodeURIComponent(companyId)}`;

            const resData = await apiFetch<IBClusterPreviewResult>(
                `${COMMERCIAL_URL}/customer-clusters/preview${query}`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
                "No se pudo generar la previsualización de reglas",
                { token, companyId }
            );

            return mapClusterPreviewResult(resData);
        } catch (error) {
            console.error("Error en previewCustomerRules:", error);
            throw error;
        }
    },

    async refreshCustomerCluster(
        clusterId: string,
        companyId?: string,
        token?: string
    ): Promise<IFClusterRefreshResult> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";

            const resData = await apiFetch<IBClusterRefreshResult>(
                `${COMMERCIAL_URL}/customer-clusters/${clusterId}/refresh${query}`,
                {
                    method: "POST",
                },
                "No se pudo recalcular la membresía del clúster de clientes",
                { token, companyId }
            );

            return mapClusterRefreshResult(resData);
        } catch (error) {
            console.error("Error en refreshCustomerCluster:", error);
            throw error;
        }
    },

    async refreshItemCluster(
        clusterId: string,
        companyId?: string,
        token?: string
    ): Promise<IFClusterRefreshResult> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";

            const resData = await apiFetch<IBClusterRefreshResult>(
                `${COMMERCIAL_URL}/item-clusters/${clusterId}/refresh${query}`,
                {
                    method: "POST",
                },
                "No se pudo recalcular la membresía del clúster de ítems",
                { token, companyId }
            );

            return mapClusterRefreshResult(resData);
        } catch (error) {
            console.error("Error en refreshItemCluster:", error);
            throw error;
        }
    },

    async getCustomerClusterSummary(
        clusterId: string,
        lastDays: number = 90,
        companyId?: string,
        token?: string
    ): Promise<IFClusterSummary> {
        try {
            const query = new URLSearchParams();
            query.set("last_days", String(lastDays));
            if (companyId) {
                query.set("company_id", companyId);
            }

            const resData = await apiFetch<IBClusterSummary>(
                `${COMMERCIAL_URL}/customer-clusters/${clusterId}/summary?${query.toString()}`,
                {
                    method: "GET",
                },
                "No se pudo obtener el resumen comercial del clúster",
                { token, companyId }
            );

            return mapClusterSummary(resData);
        } catch (error) {
            console.error("Error en getCustomerClusterSummary:", error);
            throw error;
        }
    },

    async excludeCustomer(
        clusterId: string,
        customerId: string,
        companyId?: string,
        token?: string
    ): Promise<IFClusterAddMembersResponse> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";

            const resData = await apiFetch<IBClusterAddMembersResponse>(
                `${COMMERCIAL_URL}/customer-clusters/${clusterId}/exclusions/${customerId}${query}`,
                {
                    method: "POST",
                },
                "No se pudo registrar la exclusión del cliente en el clúster",
                { token, companyId }
            );

            return mapClusterAddMembersResponse(resData);
        } catch (error) {
            console.error("Error en excludeCustomer:", error);
            throw error;
        }
    },

    async snapshotCustomerCluster(
        clusterId: string,
        companyId?: string,
        token?: string
    ): Promise<IFSnapshotResult> {
        try {
            const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";

            const resData = await apiFetch<IBSnapshotResult>(
                `${COMMERCIAL_URL}/customer-clusters/${clusterId}/snapshot${query}`,
                {
                    method: "POST",
                },
                "No se pudo generar el snapshot del clúster",
                { token, companyId }
            );

            return mapSnapshotResult(resData);
        } catch (error) {
            console.error("Error en snapshotCustomerCluster:", error);
            throw error;
        }
    }
};
