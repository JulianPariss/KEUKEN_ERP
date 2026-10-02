import { getOperationalHeaders, IOperationalHeaderOptions } from "./api.helper";
import { ApiError, extractBackendMessage, getDefaultErrorMessage } from "./apiError.helper";

export interface IApiFetchContext {
    token?: string;
    companyId?: string;
    branchId?: string;
    recoveryOptions?: IOperationalHeaderOptions;
}

/**
 * Cliente HTTP centralizado para servicios de la aplicación.
 * Inyecta headers operativos, procesa respuestas exitosas y normaliza errores de la API.
 */
export async function apiFetch<T>(
    url: string,
    options: RequestInit = {},
    fallbackMessage: string = "Error al procesar la solicitud",
    context?: IApiFetchContext
): Promise<T> {
    const defaultHeaders = getOperationalHeaders(
        context?.token,
        context?.companyId,
        context?.branchId,
        context?.recoveryOptions
    );

    const mergedHeaders: Record<string, string> = {
        ...defaultHeaders,
        ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, {
        ...options,
        headers: mergedHeaders,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const backendMessage = extractBackendMessage(errorData);
        const finalMessage = backendMessage || getDefaultErrorMessage(response.status, fallbackMessage);

        throw new ApiError(
            finalMessage,
            response.status,
            errorData?.code || errorData?.status_code || errorData?.detail?.code,
            errorData
        );
    }

    if (response.status === 204) {
        return { success: true } as unknown as T;
    }

    try {
        return await response.json();
    } catch {
        return { success: true } as unknown as T;
    }
}

/**
 * Versión de apiFetch específica para descargas de archivos (Blobs).
 */
export async function apiFetchBlob(
    url: string,
    options: RequestInit = {},
    fallbackMessage: string = "Error al procesar la solicitud",
    context?: IApiFetchContext
): Promise<Blob> {
    const defaultHeaders = getOperationalHeaders(
        context?.token,
        context?.companyId,
        context?.branchId,
        context?.recoveryOptions
    );

    const mergedHeaders: Record<string, string> = {
        ...defaultHeaders,
        ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, {
        ...options,
        headers: mergedHeaders,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const backendMessage = extractBackendMessage(errorData);
        const finalMessage = backendMessage || getDefaultErrorMessage(response.status, fallbackMessage);

        throw new ApiError(
            finalMessage,
            response.status,
            errorData?.code || errorData?.status_code || errorData?.detail?.code,
            errorData
        );
    }

    return await response.blob();
}

