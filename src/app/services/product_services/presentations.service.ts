import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import {
    IBListV2,
    IBPresentation,
    IFListBasicParams,
    IFListV2,
    IFPresentation,
    IFPresentationByItemParams,
    IFPresentationCreate,
    IFPresentationUpdate,
    mapListParams,
    mapPresentation,
    mapPresentationByItemParams,
    mapPresentationListV2,
    mapPresentationToCreate,
    mapPresentationToUpdate,
    IBAvailabilityResponse,
    IFAvailabilityResponse,
    IFBarcodeAvailabilityParams,
    mapAvailabilityResponseToFrontend,
    mapBarcodeAvailabilityParamsToBackend,
} from "@repo/api-contracts/erp";
import { formatQueryParams } from "@/lib/utils/formatter.helper";
import { PRODUCTS_URL } from "../../lib/constants/api.constants";

export const presentationsService = {
    async getAll(companyId: string, searchParams: IFListBasicParams, token: string, includeInactive: boolean = false): Promise<IFListV2<IFPresentation>> {
        try {
            const mappedParams = mapListParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const queryParams = new URLSearchParams(filteredParams);
            queryParams.set("company_id", companyId);
            queryParams.set("include_inactive", String(includeInactive));

            const url = `${PRODUCTS_URL}/presentations/list?${queryParams.toString()}`;
            const data = await apiFetch<IBListV2<IBPresentation>>(
                url,
                { method: "GET" },
                "No se pudieron obtener las presentaciones",
                { token, companyId }
            );

            return mapPresentationListV2(data);
        } catch (error) {
            console.error("Error en getAllPresentations:", error);
            throw error;
        }
    },

    async getAllbyItem(searchParams: IFPresentationByItemParams, token: string, includeInactive: boolean = false, companyId?: string): Promise<IFListV2<IFPresentation>> {
        try {
            const mappedParams = mapPresentationByItemParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const queryParams = new URLSearchParams(filteredParams);
            if (companyId) queryParams.set("company_id", companyId);
            queryParams.set("include_inactive", String(includeInactive));
            const query = queryParams.toString();
            const url = `${PRODUCTS_URL}/item/${searchParams.itemId}/presentations${query ? `?${query}` : ""}`;

            const data = await apiFetch<IBListV2<IBPresentation>>(
                url,
                { method: "GET" },
                "No se pudieron obtener las presentaciones",
                { token, companyId }
            );

            return mapPresentationListV2(data);
        } catch (error) {
            console.error("Error en getAllbyItem:", error);
            throw error;
        }
    },

    async getById(id: string, token: string, companyId?: string): Promise<IFPresentation> {
        try {
            const queryParams = new URLSearchParams();
            if (companyId) queryParams.set("company_id", companyId);
            const url = queryParams.toString()
                ? `${PRODUCTS_URL}/presentation/${id}?${queryParams.toString()}`
                : `${PRODUCTS_URL}/presentation/${id}`;

            const presentationResponse = await apiFetch<IBPresentation>(
                url,
                { method: "GET" },
                "No se pudo obtener la presentación",
                { token, companyId }
            );

            return mapPresentation(presentationResponse);
        } catch (error) {
            console.error("Error en getPresentationById:", error);
            throw error;
        }
    },

    async getByBarcode(barcode: string, token: string, companyId?: string): Promise<IFPresentation> {
        try {
            const queryParams = new URLSearchParams();
            if (companyId) queryParams.set("company_id", companyId);
            const url = queryParams.toString()
                ? `${PRODUCTS_URL}/item/by-barcode/${barcode}?${queryParams.toString()}`
                : `${PRODUCTS_URL}/item/by-barcode/${barcode}`;

            const data = await apiFetch<IBPresentation>(
                url,
                { method: "GET" },
                "No se pudo obtener la presentación por código de barras",
                { token, companyId }
            );

            return mapPresentation(data);
        } catch (error) {
            console.error("Error en getByBarcode:", error);
            throw error;
        }
    },

    async create(data: (Partial<IFPresentation> & { itemId: string }) | IFPresentationCreate, token: string, companyId?: string): Promise<IFPresentation> {
        try {
            const mappedData = mapPresentationToCreate(data);
            const queryParams = new URLSearchParams();
            if (companyId) queryParams.set("company_id", companyId);
            const url = queryParams.toString()
                ? `${PRODUCTS_URL}/presentation?${queryParams.toString()}`
                : `${PRODUCTS_URL}/presentation`;

            const presentationResponse = await apiFetch<IBPresentation>(
                url,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear la presentación",
                { token, companyId }
            );

            return mapPresentation(presentationResponse);
        } catch (error) {
            console.error("Error en createPresentation:", error);
            throw error;
        }
    },

    async update(data: Partial<IFPresentation> | IFPresentationUpdate, id: string, token: string, companyId?: string): Promise<IFPresentation> {
        try {
            const mappedData = mapPresentationToUpdate(data);
            const queryParams = new URLSearchParams();
            if (companyId) queryParams.set("company_id", companyId);
            const url = queryParams.toString()
                ? `${PRODUCTS_URL}/presentation/${id}?${queryParams.toString()}`
                : `${PRODUCTS_URL}/presentation/${id}`;

            const presentationResponse = await apiFetch<IBPresentation>(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar la presentación",
                { token, companyId }
            );

            return mapPresentation(presentationResponse);
        } catch (error) {
            console.error("Error en updatePresentation:", error);
            throw error;
        }
    },

    async delete(id: string, token: string, companyId?: string): Promise<string> {
        try {
            const queryParams = new URLSearchParams();
            if (companyId) queryParams.set("company_id", companyId);
            const url = queryParams.toString()
                ? `${PRODUCTS_URL}/presentations/${id}?${queryParams.toString()}`
                : `${PRODUCTS_URL}/presentations/${id}`;

            const message = await apiFetch<string>(
                url,
                { method: "DELETE" },
                "No se pudo eliminar la presentación",
                { token, companyId }
            );

            return message;
        } catch (error) {
            console.error("Error en deletePresentation:", error);
            throw error;
        }
    },

    async checkBarcodeAvailability(params: IFBarcodeAvailabilityParams, token: string, companyId?: string): Promise<IFAvailabilityResponse> {
        try {
            const backendParams = mapBarcodeAvailabilityParamsToBackend(params);
            const queryParams = new URLSearchParams();
            queryParams.set("barcode", backendParams.barcode);
            if (backendParams.exclude_id) queryParams.set("exclude_id", backendParams.exclude_id);

            const url = `${PRODUCTS_URL}/presentations/barcode-availability?${queryParams.toString()}`;
            const data = await apiFetch<IBAvailabilityResponse>(
                url,
                { method: "GET" },
                "No se pudo verificar la disponibilidad del código de barras",
                { token, companyId }
            );

            return mapAvailabilityResponseToFrontend(data);
        } catch (error) {
            console.error("Error en checkBarcodeAvailability:", error);
            throw error;
        }
    },
};