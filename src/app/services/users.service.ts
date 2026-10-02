import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { USERS_URL } from "../lib/constants/api.constants";
import { IBUser, TBUsers } from "@repo/api-contracts/erp";
import { IFUser, IFUserCreate, IFUserUpdate, TFUsers, IFDriversListParams } from "@repo/api-contracts/erp";
import { mapUser, mapUserCreate, mapUsers, mapUserUpdate, mapUserListV2 } from "@repo/api-contracts/erp";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { formatQueryParams } from "@/lib/utils/formatter.helper";
import { IFOptionItem, IFOptionsListParams } from "@repo/api-contracts/erp";
import { mapOptionsList } from "@repo/api-contracts/erp";

export const usersService = {
    async getAll(token: string, companyId: string): Promise<TFUsers> {
        try {
            const data: TBUsers = await apiFetch(
                `${USERS_URL}?company_id=${companyId}`,
                { method: "GET" },
                "No se pudieron obtener los usuarios",
                { token, companyId }
            );
            return mapUsers(data);
        } catch (error) {
            console.error("Error en getAll usuarios:", error);
            throw error;
        }
    },

    async getSalesmenOptions(params: IFOptionsListParams, token: string): Promise<IFListV2<IFOptionItem>> {
        try {
            const query = new URLSearchParams();
            if (params.q) query.set("q", params.q);
            if (params.companyId) query.set("company_id", params.companyId);
            if (params.limit !== undefined) query.set("limit", String(params.limit));
            if (params.offset !== undefined) query.set("offset", String(params.offset));

            const data = await apiFetch<any>(
                `${USERS_URL}/salesmen/options?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener opciones de vendedores",
                { token, companyId: params.companyId }
            );

            return mapOptionsList(data);
        } catch (error) {
            console.error("Error en getSalesmenOptions (users):", error);
            throw error;
        }
    },

    async getById(id: string, token: string): Promise<IFUser> {
        try {
            const data: IBUser = await apiFetch(
                `${USERS_URL}/${id}`,
                { method: "GET" },
                "No se pudo obtener el usuario",
                { token }
            );
            return mapUser(data);
        } catch (error) {
            console.error("Error en getById usuario:", error);
            throw error;
        }
    },

    async getDrivers(params: IFDriversListParams, token: string): Promise<IFListV2<IFUser>> {
        try {
            const filteredParams = formatQueryParams(params);
            const query = new URLSearchParams(filteredParams as any).toString();

            const data: IBListV2<IBUser> = await apiFetch(
                `${USERS_URL}/drivers?${query}`,
                { method: "GET" },
                "No se pudieron obtener los conductores",
                { token, companyId: params.companyId }
            );

            return mapUserListV2(data);
        } catch (error) {
            console.error("Error en getDrivers:", error);
            throw error;
        }
    },

    async create(user: IFUserCreate, token: string): Promise<IFUser> {
        try {
            const mappedData = mapUserCreate(user);
            const userResponse: IBUser = await apiFetch(
                `${USERS_URL}`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear el usuario",
                { token }
            );

            return mapUser(userResponse);
        } catch (error) {
            console.error("Error en create usuario:", error);
            throw error;
        }
    },

    async update(userId: string, user: IFUserUpdate, token: string): Promise<IFUser> {
        try {
            const mappedData = mapUserUpdate(user);
            const userResponse: IBUser = await apiFetch(
                `${USERS_URL}/${userId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar el usuario",
                { token }
            );

            return mapUser(userResponse);
        } catch (error) {
            console.error("Error en update usuario:", error);
            throw error;
        }
    },
};