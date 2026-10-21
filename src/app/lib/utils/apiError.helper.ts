export class ApiError extends Error {
    public status: number;
    public code?: string;
    public rawDetails?: any;

    constructor(message: string, status: number, code?: string, rawDetails?: any) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.rawDetails = rawDetails;
    }
}

export function extractBackendMessage(errorData: any): string | null {
    if (!errorData) return null;

    // 1. Atributo 'message' (Cadena o Array)
    if (typeof errorData.message === "string" && errorData.message.trim()) {
        return errorData.message;
    }
    if (Array.isArray(errorData.message) && errorData.message.length > 0) {
        return errorData.message.join(", ");
    }

    // 2. Atributo 'detail' (Estándar FastAPI/Python)
    if (typeof errorData.detail === "string" && errorData.detail.trim()) {
        return errorData.detail;
    }
    if (errorData.detail && typeof errorData.detail === "object" && !Array.isArray(errorData.detail)) {
        if (typeof errorData.detail.message === "string" && errorData.detail.message.trim()) {
            return errorData.detail.message;
        }
        if (typeof errorData.detail.msg === "string" && errorData.detail.msg.trim()) {
            return errorData.detail.msg;
        }
    }
    if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
        return errorData.detail
            .map((d: any) => (typeof d === "string" ? d : d.msg || d.message || JSON.stringify(d)))
            .join(", ");
    }

    // 3. Atributo 'error'
    if (typeof errorData.error === "string" && errorData.error.trim()) {
        return errorData.error;
    }
    if (typeof errorData.error?.message === "string") {
        return errorData.error.message;
    }

    // 4. Atributo 'errors' (Array o Record)
    if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        return errorData.errors
            .map((e: any) => (typeof e === "string" ? e : e.message || e.msg || JSON.stringify(e)))
            .join(", ");
    }

    return null;
}

export function getDefaultErrorMessage(status: number, fallbackMessage?: string): string {
    const statusMessages: Record<number, string> = {
        400: "Solicitud incorrecta. Verifique los datos enviados.",
        401: "Sesión no autorizada o expirada.",
        403: "No tiene permisos suficientes para realizar esta acción.",
        404: "El recurso solicitado no existe.",
        409: "Conflicto: El registro ya existe o no se puede procesar en su estado actual.",
        422: "Error de validación en los datos ingresados.",
        500: "Error interno en el servidor de backend.",
        502: "Servicio temporalmente no disponible (Bad Gateway).",
        503: "Servidor en mantenimiento o no disponible.",
        504: "Tiempo de espera agotado al conectar con el servidor.",
    };

    return fallbackMessage || statusMessages[status] || `Error insospechado (${status}).`;
}

const SUPPLIER_SKU_DUP_MSG = "Ese código de proveedor ya está asignado a otro ítem";

function getErrorCode(error: any): string {
    return String(
        error?.code ||
        error?.rawDetails?.code ||
        error?.rawDetails?.detail?.code ||
        ""
    );
}

function getErrorText(error: any): string {
    return String(error?.message || error?.rawDetails?.message || error?.rawDetails?.detail || "");
}

/**
 * Mapea errores específicos para vínculos y códigos de proveedor de ítem
 * según ADR 0029/0030 y Handoff 2026-10 / fullAdditions sync.
 * - POST/PATCH /products/full → 400 + supplier_sku_duplicate
 * - POST/PUT /procurement/item-supplier → 409
 * - supplier_sku vacío → 422
 */
export function mapItemSupplierError(error: any): string {
    const status = error?.status;
    const code = getErrorCode(error);
    const text = getErrorText(error);

    if (status === 400 && (code === "supplier_sku_duplicate" || text.includes("supplier_sku_duplicate"))) {
        return SUPPLIER_SKU_DUP_MSG;
    }
    if (status === 409) {
        return SUPPLIER_SKU_DUP_MSG;
    }
    if (status === 422) {
        return "Código de proveedor obligatorio.";
    }
    if (status === 404) {
        return "Vínculo o entidad no encontrada.";
    }
    return error?.message || "Error al procesar el proveedor del ítem.";
}

/**
 * Errores de POST /products/full (create fullAdditions).
 * Preferir el detalle del POST ante fallos de AsyncRule/availability.
 */
export function mapProductFullCreateError(error: any): string {
    const status = error?.status;
    const code = getErrorCode(error);
    const text = getErrorText(error).toLowerCase();

    if (status === 400 && (code === "supplier_sku_duplicate" || text.includes("supplier_sku_duplicate"))) {
        return SUPPLIER_SKU_DUP_MSG;
    }
    if (status === 422 && (text.includes("supplier_sku") || code.includes("supplier_sku"))) {
        return "Código de proveedor obligatorio.";
    }
    if (status === 409 || status === 400) {
        if (text.includes("barcode") || code.includes("barcode")) {
            return "Código de barras ya registrado en el catálogo.";
        }
        if (text.includes("sku_prefix") || text.includes("sku prefix") || code.includes("sku_prefix")) {
            return "El prefijo SKU ya está en uso (el servidor distingue mayúsculas/minúsculas).";
        }
        if (
            (text.includes("sku") && !text.includes("supplier")) ||
            code.includes("sku_duplicate") ||
            code === "sku_exists"
        ) {
            return "Este SKU ya está registrado en el catálogo.";
        }
    }
    if (status === 422) {
        return error?.message || "Error de validación en los datos del producto o ítems.";
    }

    // Proveedor u otros mensajes ya tipados
    if (text.includes("supplier") || code.includes("supplier")) {
        return mapItemSupplierError(error);
    }

    return error?.message || getDefaultErrorMessage(status || 500, "No se pudo crear el producto completo.");
}

