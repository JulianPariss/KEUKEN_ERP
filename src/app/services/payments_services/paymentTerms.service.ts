import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { PARTNERS_URL } from "../../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IBPaymentTerm } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFPaymentTerm, IFPaymentTermCreation, IFPaymentTermUpdate } from "@repo/api-contracts/erp";
import { mapPaymentTermListV2, mapPaymentTermToCreate, mapPaymentTermToUpdate } from "@repo/api-contracts/erp";
import { IFOptionItem, IFOptionsListParams } from "@repo/api-contracts/erp";
import { mapOptionsList } from "@repo/api-contracts/erp";

export const paymentTermsService = {
    async getAll(token: string, companyId?: string): Promise<IFListV2<IFPaymentTerm>> {
        try {
            const url = companyId
                ? `${PARTNERS_URL}/payment-terms?company_id=${encodeURIComponent(companyId)}`
                : `${PARTNERS_URL}/payment-terms`;

            const data: IBListV2<IBPaymentTerm> = await apiFetch(
                url,
                { method: "GET" },
                "No se pudieron obtener las condiciones de pago",
                { token, companyId }
            );

            return mapPaymentTermListV2(data);
        } catch (error) {
            console.error("Error en getAllPaymentTerms:", error);
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

            const data: IBListV2<any> = await apiFetch(
                `${PARTNERS_URL}/payment-terms/options?${query.toString()}`,
                { method: "GET" },
                "No se pudieron obtener opciones de condiciones de pago",
                { token, companyId: params.companyId }
            );

            return mapOptionsList(data);
        } catch (error) {
            console.error("Error en getOptions (payment-terms):", error);
            throw error;
        }
    },

    async create(data: IFPaymentTermCreation, token: string, companyId?: string): Promise<any> {
        try {
            const mappedData = mapPaymentTermToCreate(data);
            const targetCompanyId = companyId || data.companyId;
            const payload = targetCompanyId ? { ...mappedData, company_id: targetCompanyId } : mappedData;
            const url = targetCompanyId
                ? `${PARTNERS_URL}/payment-terms?company_id=${encodeURIComponent(targetCompanyId)}`
                : `${PARTNERS_URL}/payment-terms`;

            const paymentTermResponse = await apiFetch(
                url,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
                "No se pudo crear la condición de pago",
                { token, companyId: targetCompanyId }
            );

            return paymentTermResponse;
        } catch (error) {
            console.error("Error en createPaymentTerm:", error);
            throw error;
        }
    },

    async update(id: string, data: IFPaymentTermUpdate, token: string, companyId?: string): Promise<any> {
        try {
            const mappedData = mapPaymentTermToUpdate(data);
            const payload = companyId ? { ...mappedData, company_id: companyId } : mappedData;
            const url = companyId
                ? `${PARTNERS_URL}/payment-terms/${id}?company_id=${encodeURIComponent(companyId)}`
                : `${PARTNERS_URL}/payment-terms/${id}`;

            const paymentTermResponse = await apiFetch(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                },
                "No se pudo actualizar la condición de pago",
                { token, companyId }
            );

            return paymentTermResponse;
        } catch (error) {
            console.error("Error en updatePaymentTerm:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, companyId?: string): Promise<any> {
        try {
            const url = companyId
                ? `${PARTNERS_URL}/payment-terms/${id}?company_id=${encodeURIComponent(companyId)}`
                : `${PARTNERS_URL}/payment-terms/${id}`;

            const paymentTermResponse = await apiFetch(
                url,
                {
                    method: "DELETE",
                    ...(companyId ? { body: JSON.stringify({ company_id: companyId }) } : {}),
                },
                "No se pudo eliminar la condición de pago",
                { token, companyId }
            );

            return paymentTermResponse;
        } catch (error) {
            console.error("Error en deletePaymentTerm:", error);
            throw error;
        }
    },
};
