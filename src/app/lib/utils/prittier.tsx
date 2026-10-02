import { TFRoutesStatus } from "@repo/api-contracts/erp";
import { TFZoneType } from "@repo/api-contracts/erp";

export const deliveryRoutes: Record<TFRoutesStatus, string> = {
    'draft': 'Borrador',
    'in_progress': 'En Progreso',
}

export const deliveryZones: Record<TFZoneType, string> = {
    'delivery': 'Reparto',
    'sales': 'Venta'
}

export const formatPrice = (value: number | string | undefined | null): string => {
    if (value === undefined || value === null) return '';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '';
    return `$ ${num.toLocaleString('es-UY', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

export const formatPercent = (value: number | string | undefined | null): string => {
    if (value === undefined || value === null) return '';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '';

    return `${num.toLocaleString('es-UY', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}%`;
};

export const getZeroTimeDate = (dateParam?: string | Date | null) => {
    if (dateParam === null || dateParam === undefined || dateParam === "") {
        const d = new Date();
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0] + 'T00:00:00.000Z';
    }
    const d = new Date(dateParam);
    if (isNaN(d.getTime())) return "";
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0] + 'T00:00:00.000Z';
};

export const formatDate = (dateParam?: string | Date | null): string => {
    if (!dateParam) return '';
    const d = typeof dateParam === 'string' ? new Date(dateParam) : dateParam;
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

