import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { PARTNERS_URL } from "../../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IBPaymentMethod } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFPaymentMethod, IFPaymentMethodCreation, IFPaymentMethodsUpdate } from "@repo/api-contracts/erp";
import { mapPaymentMethodListV2, mapPaymentMethodToCreate, mapPaymentMethodToUpdate } from "@repo/api-contracts/erp";

export const paymentMethodsService = {
    async getAll(token: string, companyId?: string): Promise<IFListV2<IFPaymentMethod>> {
        try {
            const url = companyId
                ? `${PARTNERS_URL}/payment-methods?company_id=${encodeURIComponent(companyId)}`
                : `${PARTNERS_URL}/payment-methods`;

            const data: IBListV2<IBPaymentMethod> = await apiFetch(
                url,
                { method: "GET" },
                "No se pudieron obtener los métodos de pago",
                { token, companyId }
            );

            return mapPaymentMethodListV2(data);
        } catch (error) {
            console.error("Error en getAllPaymentMethods:", error);
            throw error;
        }
    },

    async create(data: IFPaymentMethodCreation, token: string, companyId?: string): Promise<any> {
        try {
            const mappedData = mapPaymentMethodToCreate(data);
            const targetCompanyId = companyId || data.companyId;
            const payload = targetCompanyId ? { ...mappedData, company_id: targetCompanyId } : mappedData;
            const url = targetCompanyId
                ? `${PARTNERS_URL}/payment-methods?company_id=${encodeURIComponent(targetCompanyId)}`
                : `${PARTNERS_URL}/payment-methods`;

            const paymentMethodResponse = await apiFetch<any>(
                url,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
                "No se pudo crear el método de pago",
                { token, companyId: targetCompanyId }
            );

            return paymentMethodResponse;
        } catch (error) {
            console.error("Error en createPaymentMethod:", error);
            throw error;
        }
    },

    async update(id: string, data: IFPaymentMethodsUpdate, token: string, companyId?: string): Promise<any> {
        try {
            const mappedData = mapPaymentMethodToUpdate(data);
            const payload = companyId ? { ...mappedData, company_id: companyId } : mappedData;
            const url = companyId
                ? `${PARTNERS_URL}/payment-methods/${id}?company_id=${encodeURIComponent(companyId)}`
                : `${PARTNERS_URL}/payment-methods/${id}`;

            const paymentMethodResponse = await apiFetch<any>(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                },
                "No se pudo actualizar el método de pago",
                { token, companyId }
            );

            return paymentMethodResponse;
        } catch (error) {
            console.error("Error en updatePaymentMethod:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, companyId?: string): Promise<any> {
        try {
            const url = companyId
                ? `${PARTNERS_URL}/payment-methods/${id}?company_id=${encodeURIComponent(companyId)}`
                : `${PARTNERS_URL}/payment-methods/${id}`;

            const paymentMethodResponse = await apiFetch<any>(
                url,
                {
                    method: "DELETE",
                    ...(companyId ? { body: JSON.stringify({ company_id: companyId }) } : {}),
                },
                "No se pudo eliminar el método de pago",
                { token, companyId }
            );

            return paymentMethodResponse;
        } catch (error) {
            console.error("Error en deletePaymentMethod:", error);
            throw error;
        }
    },
};
