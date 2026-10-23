export const formatQualityState = (qualityState: string): string => {
    switch (qualityState) {
        case "good":
            return "Bueno";
        case "quarantine":
            return "Cuarentena";
        case "scrap":
            return "Scrap";
        default:
            return "Desconocido";
    }
};

export const formatCssColor = (color: string) => {
    if (typeof window === "undefined") return "white";
    if (color.startsWith("--")) {
        const val = getComputedStyle(document.documentElement).getPropertyValue(color).trim();
        return val || "white";
    }
    return color;
};

export const formatDate = (dateStr?: string | Date | null): string => {
    if (!dateStr) return "-";
    try {
        const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
        return date.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return typeof dateStr === "string" ? dateStr : "-";
    }
};
