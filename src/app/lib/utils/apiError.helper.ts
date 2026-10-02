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
