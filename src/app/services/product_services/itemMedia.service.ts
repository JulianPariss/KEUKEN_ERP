import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import {
    IBItemMedia,
    IBItemMediaListResponse,
    IFItemMedia,
    IFItemMediaPatch,
    IFItemMediaReorder,
    IFItemMediaUploadParams,
    mapItemMedia,
    mapItemMediaList,
    mapItemMediaPatch,
    mapItemMediaReorder,
} from "@repo/api-contracts/erp";
import { ITEMS_URL } from "../../lib/constants/api.constants";

export const itemMediaService = {
    /**
     * Obtiene la lista de elementos multimedia asociados a un ítem.
     * @param itemId UUID o SKU del ítem
     * @param platformId Opcional: ID de la plataforma comercial para filtrar
     * @param token Bearer token para autenticación
     * @param companyId ID de la compañía operativa
     */
    async listItemMedia(
        itemId: string,
        platformId?: string | null,
        token?: string,
        companyId?: string
    ): Promise<IFItemMedia[]> {
        try {
            const queryParams = new URLSearchParams();
            if (platformId) queryParams.set("platform_id", platformId);
            if (companyId) queryParams.set("company_id", companyId);
            const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
            const url = `${ITEMS_URL}/${encodeURIComponent(itemId)}/media${queryStr}`;

            const data = await apiFetch<IBItemMediaListResponse>(
                url,
                { method: "GET" },
                "No se pudieron obtener los archivos multimedia del ítem",
                { token, companyId }
            );

            return mapItemMediaList(data);
        } catch (error) {
            console.error("Error en listItemMedia:", error);
            throw error;
        }
    },

    /**
     * Obtiene la vista resuelta de multimedia para integraciones.
     * @param itemId UUID o SKU del ítem
     * @param platformId Opcional: ID de la plataforma comercial
     * @param token Bearer token para autenticación
     * @param companyId ID de la compañía operativa
     */
    async resolveItemMedia(
        itemId: string,
        platformId?: string | null,
        token?: string,
        companyId?: string
    ): Promise<IFItemMedia[]> {
        try {
            const queryParams = new URLSearchParams();
            if (platformId) queryParams.set("platform_id", platformId);
            if (companyId) queryParams.set("company_id", companyId);
            const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
            const url = `${ITEMS_URL}/${encodeURIComponent(itemId)}/media/resolve${queryStr}`;

            const data = await apiFetch<IBItemMediaListResponse>(
                url,
                { method: "GET" },
                "No se pudieron resolver los archivos multimedia del ítem",
                { token, companyId }
            );

            return mapItemMediaList(data);
        } catch (error) {
            console.error("Error en resolveItemMedia:", error);
            throw error;
        }
    },

    /**
     * Sube un archivo multimedia para el ítem vía multipart/form-data.
     * @param itemId UUID o SKU del ítem
     * @param data Instancia de FormData o payload estructurado IFItemMediaUploadParams
     * @param token Bearer token para autenticación
     * @param companyId ID de la compañía operativa
     */
    async uploadItemMedia(
        itemId: string,
        data: FormData | IFItemMediaUploadParams,
        token?: string,
        companyId?: string
    ): Promise<IFItemMedia> {
        try {
            let form: FormData;
            if (typeof FormData !== "undefined" && data instanceof FormData) {
                form = data;
            } else {
                form = new FormData();
                const uploadParams = data as IFItemMediaUploadParams;
                form.append("file", uploadParams.file);
                if (uploadParams.platformId) {
                    form.append("platform_id", uploadParams.platformId);
                }
                if (uploadParams.sortOrder != null) {
                    form.append("sort_order", String(uploadParams.sortOrder));
                }
                if (uploadParams.kindCode) {
                    form.append("kind_code", uploadParams.kindCode);
                }
                if (uploadParams.altText) {
                    form.append("alt_text", uploadParams.altText);
                }
            }

            const queryParams = new URLSearchParams();
            if (companyId) queryParams.set("company_id", companyId);
            const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
            const url = `${ITEMS_URL}/${encodeURIComponent(itemId)}/media${queryStr}`;

            const itemMediaResponse = await apiFetch<IBItemMedia>(
                url,
                {
                    method: "POST",
                    body: form,
                },
                "No se pudo subir el archivo multimedia",
                { token, companyId }
            );

            return mapItemMedia(itemMediaResponse);
        } catch (error) {
            console.error("Error en uploadItemMedia:", error);
            throw error;
        }
    },

    /**
     * Actualiza metadatos de un archivo multimedia del ítem.
     * @param itemId UUID o SKU del ítem
     * @param mediaId UUID del archivo multimedia
     * @param patchData Campos opcionales a modificar (sortOrder, platformId, kindCode, altText)
     * @param token Bearer token para autenticación
     * @param companyId ID de la compañía operativa
     */
    async patchItemMedia(
        itemId: string,
        mediaId: string,
        patchData: IFItemMediaPatch,
        token?: string,
        companyId?: string
    ): Promise<IFItemMedia> {
        try {
            const mappedPayload = mapItemMediaPatch(patchData);
            const queryParams = new URLSearchParams();
            if (companyId) queryParams.set("company_id", companyId);
            const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
            const url = `${ITEMS_URL}/${encodeURIComponent(itemId)}/media/${encodeURIComponent(mediaId)}${queryStr}`;

            const itemMediaResponse = await apiFetch<IBItemMedia>(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedPayload),
                },
                "No se pudo actualizar el archivo multimedia",
                { token, companyId }
            );

            return mapItemMedia(itemMediaResponse);
        } catch (error) {
            console.error("Error en patchItemMedia:", error);
            throw error;
        }
    },

    /**
     * Reordena los archivos multimedia de un ítem para un scope específico.
     * @param itemId UUID o SKU del ítem
     * @param reorderData Lista ordenada de mediaIds y platformId opcional
     * @param token Bearer token para autenticación
     * @param companyId ID de la compañía operativa
     */
    async reorderItemMedia(
        itemId: string,
        reorderData: IFItemMediaReorder,
        token?: string,
        companyId?: string
    ): Promise<IFItemMedia[]> {
        try {
            const mappedPayload = mapItemMediaReorder(reorderData);
            const queryParams = new URLSearchParams();
            if (companyId) queryParams.set("company_id", companyId);
            const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
            const url = `${ITEMS_URL}/${encodeURIComponent(itemId)}/media/reorder${queryStr}`;

            const data = await apiFetch<IBItemMediaListResponse>(
                url,
                {
                    method: "POST",
                    body: JSON.stringify(mappedPayload),
                },
                "No se pudo reordenar los archivos multimedia",
                { token, companyId }
            );

            return mapItemMediaList(data);
        } catch (error) {
            console.error("Error en reorderItemMedia:", error);
            throw error;
        }
    },

    /**
     * Elimina (soft-delete) un archivo multimedia asociado a un ítem.
     * @param itemId UUID o SKU del ítem
     * @param mediaId UUID del archivo multimedia
     * @param token Bearer token para autenticación
     * @param companyId ID de la compañía operativa
     */
    async deleteItemMedia(
        itemId: string,
        mediaId: string,
        token?: string,
        companyId?: string
    ): Promise<void> {
        try {
            const queryParams = new URLSearchParams();
            if (companyId) queryParams.set("company_id", companyId);
            const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
            const url = `${ITEMS_URL}/${encodeURIComponent(itemId)}/media/${encodeURIComponent(mediaId)}${queryStr}`;

            await apiFetch<void>(
                url,
                { method: "DELETE" },
                "No se pudo eliminar el archivo multimedia",
                { token, companyId }
            );
        } catch (error) {
            console.error("Error en deleteItemMedia:", error);
            throw error;
        }
    },
};

export const {
    listItemMedia,
    resolveItemMedia,
    uploadItemMedia,
    patchItemMedia,
    reorderItemMedia,
    deleteItemMedia,
} = itemMediaService;
