
/**
 * Genera un UUID v4 de forma segura.
 * Utiliza la API nativa del navegador (Web Crypto API) si está disponible,
 * de lo contrario, tiene un fallback para entornos donde no esté disponible.
 */
export const generateUUID = (): string => {
    // Verificamos si estamos en el navegador y si crypto.randomUUID está disponible
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }

    // Fallback para entornos donde no esté disponible randomUUID (ej. contextos no seguros o navegadores muy antiguos)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
