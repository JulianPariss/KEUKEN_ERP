interface MetadataEmptyStateProps {
    message?: string;
}

export default function MetadataEmptyState({
    message = "No existe metadata para esta entidad"
}: MetadataEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-6 px-4 rounded-dx border border-dashed border-main/10 bg-main/5 text-center gap-1.5 transition-colors">
            <i className="dx-icon-info text-2xl text-main/30" />
            <p className="text-sm font-medium text-main/70">{message}</p>
            <p className="text-xs text-main/40">No hay atributos personalizados definidos en el catálogo para esta sección.</p>
        </div>
    );
}
