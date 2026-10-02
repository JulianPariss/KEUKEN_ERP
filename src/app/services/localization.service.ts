import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { DOCUMENTS_URL } from "../lib/constants/api.constants";
import { IBTaxScheme, IBTaxAuthorityScheme, IBIdentityScheme } from "@repo/api-contracts/erp";
import { IFTaxScheme, IFTaxAuthorityScheme, IFIdentityScheme } from "@repo/api-contracts/erp";
import {
    mapTaxSchemeList,
    mapTaxAuthoritySchemeList,
    mapIdentitySchemeList,
    mapTaxScheme,
    mapTaxAuthorityScheme,
    mapIdentityScheme
} from "@repo/api-contracts/erp";

export const localizationService = {
    async getTaxSchemes(countryCode: string, token: string): Promise<IFTaxScheme[]> {
        try {
            const data: IBTaxScheme[] = await apiFetch(
                `${DOCUMENTS_URL}/localization/tax-schemes?country_code=${countryCode}`,
                { method: "GET" },
                "No se pudieron obtener los esquemas de impuestos",
                { token }
            );
            return mapTaxSchemeList(data);
        } catch (error) {
            console.error("Error en getTaxSchemes:", error);
            throw error;
        }
    },

    async createTaxScheme(data: Partial<IFTaxScheme>, token: string): Promise<IFTaxScheme> {
        try {
            const resData: IBTaxScheme = await apiFetch(
                `${DOCUMENTS_URL}/localization/tax-schemes`,
                {
                    method: "POST",
                    body: JSON.stringify(data),
                },
                "No se pudo crear el esquema de impuestos",
                { token }
            );
            return mapTaxScheme(resData);
        } catch (error) {
            console.error("Error en createTaxScheme:", error);
            throw error;
        }
    },

    async updateTaxScheme(id: string, data: Partial<IFTaxScheme>, token: string): Promise<IFTaxScheme> {
        try {
            const resData: IBTaxScheme = await apiFetch(
                `${DOCUMENTS_URL}/localization/tax-schemes/${id}`,
                {
                    method: "PUT",
                    body: JSON.stringify(data),
                },
                "No se pudo actualizar el esquema de impuestos",
                { token }
            );
            return mapTaxScheme(resData);
        } catch (error) {
            console.error("Error en updateTaxScheme:", error);
            throw error;
        }
    },

    async getTaxAuthoritySchemes(countryCode: string, token: string, authorityCode?: string, schemeGroup?: string): Promise<IFTaxAuthorityScheme[]> {
        try {
            const params = new URLSearchParams({ country_code: countryCode });
            if (authorityCode) params.append("authority_code", authorityCode);
            if (schemeGroup) params.append("scheme_group", schemeGroup);

            const data: IBTaxAuthorityScheme[] = await apiFetch(
                `${DOCUMENTS_URL}/localization/tax-authority-schemes?${params.toString()}`,
                { method: "GET" },
                "No se pudieron obtener los esquemas de autoridad de impuestos",
                { token }
            );
            return mapTaxAuthoritySchemeList(data);
        } catch (error) {
            console.error("Error en getTaxAuthoritySchemes:", error);
            throw error;
        }
    },

    async createTaxAuthorityScheme(data: Partial<IFTaxAuthorityScheme>, token: string): Promise<IFTaxAuthorityScheme> {
        try {
            const resData: IBTaxAuthorityScheme = await apiFetch(
                `${DOCUMENTS_URL}/localization/tax-authority-schemes`,
                {
                    method: "POST",
                    body: JSON.stringify(data),
                },
                "No se pudo crear el esquema de autoridad",
                { token }
            );
            return mapTaxAuthorityScheme(resData);
        } catch (error) {
            console.error("Error en createTaxAuthorityScheme:", error);
            throw error;
        }
    },

    async updateTaxAuthorityScheme(id: string, data: Partial<IFTaxAuthorityScheme>, token: string): Promise<IFTaxAuthorityScheme> {
        try {
            const resData: IBTaxAuthorityScheme = await apiFetch(
                `${DOCUMENTS_URL}/localization/tax-authority-schemes/${id}`,
                {
                    method: "PUT",
                    body: JSON.stringify(data),
                },
                "No se pudo actualizar el esquema de autoridad",
                { token }
            );
            return mapTaxAuthorityScheme(resData);
        } catch (error) {
            console.error("Error en updateTaxAuthorityScheme:", error);
            throw error;
        }
    },

    async getIdentitySchemes(countryCode: string, token: string): Promise<IFIdentityScheme[]> {
        try {
            const data: IBIdentityScheme[] = await apiFetch(
                `${DOCUMENTS_URL}/localization/identity-schemes?country_code=${countryCode}`,
                { method: "GET" },
                "No se pudieron obtener los esquemas de identidad",
                { token }
            );
            return mapIdentitySchemeList(data);
        } catch (error) {
            console.error("Error en getIdentitySchemes:", error);
            throw error;
        }
    },
};
