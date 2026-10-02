import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { BRANCHES_URL } from "@/app/lib/constants/api.constants";
import { IBBranch, IBBranchDetail } from "@repo/api-contracts/erp";
import { IBCreateResponse, IBListV2 } from "@repo/api-contracts/erp";
import { IFBranch, IFBranchCreate, IFBranchDetail, IFBranchUpdate } from "@repo/api-contracts/erp";
import { IFCreateResponse, IFListV2 } from "@repo/api-contracts/erp";
import { mapBranch, mapBranchDetail, mapBranchList, mapBranchToBackend, mapBranchUpdateToBackend } from "@repo/api-contracts/erp";

export const branchesService = {
    async getAll(
        params?: { limit?: number; offset?: number; company_id?: string; include_inactive?: boolean },
        token?: string
    ): Promise<IFListV2<IFBranch>> {
        try {
            let url = BRANCHES_URL;
            const searchParams = new URLSearchParams();
            if (params?.limit !== undefined) searchParams.append("limit", params.limit.toString());
            if (params?.offset !== undefined) searchParams.append("offset", params.offset.toString());
            if (params?.company_id) searchParams.append("company_id", params.company_id);
            if (params?.include_inactive !== undefined) searchParams.append("include_inactive", params.include_inactive.toString());
            const queryString = searchParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }

            const data: IBListV2<IBBranch> = await apiFetch(
                url,
                { method: "GET" },
                "No se pudieron obtener las sucursales",
                { token, companyId: params?.company_id }
            );

            return mapBranchList(data);
        } catch (error) {
            console.error("Error en getAll sucursales:", error);
            throw error;
        }
    },
    async getBranches(
        params?: { limit?: number; offset?: number; company_id?: string },
        token?: string
    ): Promise<IFListV2<IFBranch>> {
        return this.getAll(params, token);
    },
    async getById(branchId: string, token: string): Promise<IFBranchDetail> {
        try {
            const url = `${BRANCHES_URL}/${branchId}`;
            const data: IBBranchDetail = await apiFetch(
                url,
                { method: "GET" },
                "No se pudo obtener la sucursal",
                { token }
            );

            return mapBranchDetail(data);
        } catch (error) {
            console.error("Error en getById sucursal:", error);
            throw error;
        }
    },
    async create(branchData: IFBranchCreate, token: string): Promise<IFCreateResponse> {
        try {
            const backendData = mapBranchToBackend(branchData);
            const data: IBCreateResponse = await apiFetch(
                BRANCHES_URL,
                {
                    method: "POST",
                    body: JSON.stringify(backendData),
                },
                "No se pudo crear la sucursal",
                { token }
            );

            return {
                message: data.message,
                id: data.id,
            };
        } catch (error) {
            console.error("Error en create sucursal:", error);
            throw error;
        }
    },
    async update(branchId: string, branchData: IFBranchUpdate, token: string): Promise<IFBranch> {
        try {
            const url = `${BRANCHES_URL}/${branchId}`;
            const backendData = mapBranchUpdateToBackend(branchData);
            const data: IBBranch = await apiFetch(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(backendData),
                },
                "No se pudo actualizar la sucursal",
                { token }
            );

            return mapBranch(data);
        } catch (error) {
            console.error("Error en update sucursal:", error);
            throw error;
        }
    },
    async delete(branchId: string, token: string): Promise<void> {
        try {
            const url = `${BRANCHES_URL}/${branchId}`;
            await apiFetch<void>(
                url,
                { method: "DELETE" },
                "No se pudo eliminar la sucursal",
                { token }
            );
        } catch (error) {
            console.error("Error en delete sucursal:", error);
            throw error;
        }
    }
};
