import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { CASH_REGISTERS_URL } from "@/app/lib/constants/api.constants";
import { IBCashRegister, IBCashRegisterSettlementResponse, IBCashRegisterType } from "@repo/api-contracts/erp";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IFCashRegister, IFCashRegisterCreation, IFCashRegisterUpdate, IFCashRegisterSettlementCreation, IFCashRegisterSettlementResponse, IFCashRegisterType } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { mapCashRegisterListV2, mapCashRegisterToCreate, mapCashRegisterToUpdate, mapCashRegister, mapSettlementToBackend, mapSettlementToFrontend } from "@repo/api-contracts/erp";

export const cashRegistersService = {
    async getAll(token: string, companyId: string): Promise<IFListV2<IFCashRegister>> {
        try {
            const data: IBListV2<IBCashRegister> = await apiFetch(
                `${CASH_REGISTERS_URL}?company_id=${companyId}`,
                { method: "GET" },
                "No se pudieron obtener las cajas registradoras",
                { token, companyId }
            );

            return mapCashRegisterListV2(data);
        } catch (error) {
            console.error("Error en getAllCashRegisters:", error);
            throw error;
        }
    },

    async getById(id: string, token: string, companyId?: string): Promise<IFCashRegister> {
        try {
            const data: IBCashRegister = await apiFetch(
                `${CASH_REGISTERS_URL}/${id}`,
                { method: "GET" },
                "No se pudo obtener la caja registradora",
                { token, companyId }
            );

            return mapCashRegister(data);
        } catch (error) {
            console.error("Error en getCashRegisterById:", error);
            throw error;
        }
    },

    async create(data: IFCashRegisterCreation, token: string, companyId?: string): Promise<any> {
        try {
            const mappedData = mapCashRegisterToCreate(data);
            const targetCompanyId = companyId || data.companyId;

            return await apiFetch(
                `${CASH_REGISTERS_URL}`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear la caja registradora",
                { token, companyId: targetCompanyId }
            );
        } catch (error) {
            console.error("Error en createCashRegister:", error);
            throw error;
        }
    },

    async update(id: string, data: IFCashRegisterUpdate, token: string, companyId?: string): Promise<any> {
        try {
            const mappedData = mapCashRegisterToUpdate(data);

            return await apiFetch(
                `${CASH_REGISTERS_URL}/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar la caja registradora",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en updateCashRegister:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, companyId?: string): Promise<any> {
        try {
            return await apiFetch(
                `${CASH_REGISTERS_URL}/${id}`,
                { method: "DELETE" },
                "No se pudo eliminar la caja registradora",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en deleteCashRegister:", error);
            throw error;
        }
    },

    async settle(id: string, data: IFCashRegisterSettlementCreation, token: string, companyId?: string): Promise<IFCashRegisterSettlementResponse> {
        try {
            const mappedData = mapSettlementToBackend(data);
            const resData: IBCashRegisterSettlementResponse = await apiFetch(
                `${CASH_REGISTERS_URL}/${id}/settlement`,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo realizar la rendición de la caja",
                { token, companyId }
            );

            return mapSettlementToFrontend(resData);
        } catch (error) {
            console.error("Error en settleCashRegister:", error);
            throw error;
        }
    },

    async getTypes(token: string): Promise<IFCashRegisterType[]> {
        try {
            const data: IBCashRegisterType[] = await apiFetch(
                `${CASH_REGISTERS_URL}/types`,
                { method: "GET" },
                "No se pudieron obtener los tipos de caja registradora",
                { token }
            );

            return data.map((item) => ({
                id: item.code,
                name: item.label,
                description: item.description,
            }));
        } catch (error) {
            console.error("Error en getTypes:", error);
            throw error;
        }
    },
};
