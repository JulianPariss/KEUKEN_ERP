'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { providerService } from '@/app/services/location_services/provider.service';
import { IFProvider } from '@repo/api-contracts/erp';
import { BuildingOfficeIcon, ChevronUpIcon, ChevronDownIcon, WarningTriangleIcon, CheckIcon } from '@repo/icons';

interface ItemSuppliersSectionProps {
    suppliers?: any[] | null;
}

interface NormalizedSupplier {
    id: string;
    name: string;
    code?: string;
    priority?: number;
    isPrimary: boolean;
}

export default function ItemSuppliersSection({ suppliers }: ItemSuppliersSectionProps) {
    const { token, currentCompany } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [providersDirectory, setProvidersDirectory] = useState<IFProvider[] | null>(null);

    // Lista cruda segura de proveedores
    const rawList = useMemo(() => {
        if (!suppliers || !Array.isArray(suppliers)) return [];
        return suppliers;
    }, [suppliers]);

    // Normalizar la lista identificando nombres y prioridades
    const normalizedList = useMemo<NormalizedSupplier[]>(() => {
        return rawList.map((s, index) => {
            if (!s) return { id: '', name: 'Proveedor sin datos', isPrimary: false };

            const id = typeof s === 'string' ? s : (s.id || s.supplier_id || s.supplierId || s.provider_id || '');
            const rawName = typeof s === 'string' ? '' : (s.name || s.supplier_name || s.supplierName || s.provider_name);
            const code = typeof s === 'string' ? undefined : (s.code || s.supplier_code);

            // Búsqueda en el directorio cargado si no venía el nombre completo
            const directoryMatch = providersDirectory?.find(p => p.id === id);
            const finalName = rawName || directoryMatch?.name || (id ? `Proveedor (${id.substring(0, 8)}...)` : 'Proveedor sin nombre');
            const finalCode = code || directoryMatch?.code;

            const priorityNum = s && typeof s === 'object' && s.priority !== undefined
                ? Number(s.priority)
                : undefined;

            const isExplicitPrimary = Boolean(
                priorityNum === 1 ||
                (s && typeof s === 'object' && (s.is_primary || s.isPrimary))
            );

            return {
                id,
                name: finalName,
                code: finalCode,
                priority: priorityNum,
                isPrimary: isExplicitPrimary
            };
        });
    }, [rawList, providersDirectory]);

    // Proveedor principal: el que posea priority en 1, o el primer elemento si ninguno lo tiene explícito
    const primarySupplier = useMemo(() => {
        if (normalizedList.length === 0) return null;
        const explicit = normalizedList.find(s => s.priority === 1 || s.isPrimary);
        return explicit || normalizedList[0];
    }, [normalizedList]);

    // Proveedores restantes (secundarios)
    const otherSuppliers = useMemo(() => {
        if (!primarySupplier) return [];
        return normalizedList.filter(s => s !== primarySupplier);
    }, [normalizedList, primarySupplier]);

    // Carga bajo demanda al expandir
    const handleToggleExpand = useCallback(async () => {
        if (isExpanded) {
            setIsExpanded(false);
            return;
        }

        if (!providersDirectory && token && currentCompany?.id) {
            setLoading(true);
            try {
                const res = await providerService.getAll(token, currentCompany.id);
                setProvidersDirectory(res?.items || []);
            } catch (err) {
                console.error("Error al cargar listado de proveedores:", err);
            } finally {
                setLoading(false);
            }
        }

        setIsExpanded(true);
    }, [currentCompany?.id, isExpanded, providersDirectory, token]);

    return (
        <div className="flex flex-col gap-2 p-3.5 bg-primary-900/40 rounded-dx border border-main/10 transition-colors">
            {/* Cabecera */}
            <div className="flex items-center justify-between gap-2 border-b border-main/10 pb-2">
                <div className="flex items-center gap-2">
                    <BuildingOfficeIcon size={16} className="w-4 h-4 text-focus-300 shrink-0" />
                    <h4 className="text-sm font-semibold text-main flex items-center gap-1.5">
                        <span>Proveedores</span>
                        <span className="text-xs font-normal text-main/50">({normalizedList.length})</span>
                    </h4>
                </div>

                {/* Botón de toggle (solo si posee más de uno) */}
                {otherSuppliers.length > 0 && (
                    <button
                        type="button"
                        onClick={handleToggleExpand}
                        disabled={loading}
                        className="px-2.5 py-1 text-xs font-semibold text-focus-300 hover:text-focus-100 bg-focus-500/15 hover:bg-focus-500/25 rounded-dx border border-focus-500/25 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-focus-300 border-t-transparent rounded-full animate-spin" />
                                <span>Cargando...</span>
                            </>
                        ) : isExpanded ? (
                            <>
                                <ChevronUpIcon size={14} className="w-3.5 h-3.5" />
                                <span>Ocultar proveedores</span>
                            </>
                        ) : (
                            <>
                                <ChevronDownIcon size={14} className="w-3.5 h-3.5" />
                                <span>Ver más proveedores ({otherSuppliers.length})</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Vista sin desplegar */}
            {normalizedList.length === 0 ? (
                <div className="flex items-center gap-2 py-1 text-xs text-main/50 italic">
                    <WarningTriangleIcon size={16} className="w-4 h-4 text-main/30 shrink-0" />
                    <span>Sin proveedores configurados</span>
                </div>
            ) : (
                <div className="flex flex-col gap-2 pt-1">
                    {/* Proveedor Principal */}
                    {primarySupplier && (
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-dx bg-primary-0/20 border border-main/10">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-focus-300/15 text-focus-300 border border-focus-300/30 shrink-0 flex items-center gap-1">
                                    <CheckIcon size={12} className="w-3 h-3" />
                                    <span>Principal</span>
                                </span>
                                <span className="font-semibold text-main text-xs truncate">
                                    {primarySupplier.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-main/50 shrink-0">
                                {primarySupplier.code && (
                                    <span className="font-mono bg-primary-950/40 px-1.5 py-0.5 rounded border border-main/10">
                                        {primarySupplier.code}
                                    </span>
                                )}
                                <span className="font-medium text-main/60">
                                    Prioridad: 1
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Lista desplegada de proveedores secundarios */}
                    {isExpanded && otherSuppliers.length > 0 && (
                        <div className="flex flex-col gap-1.5 pt-1 pl-1 border-t border-main/5">
                            <span className="text-[11px] font-semibold text-main/60 uppercase tracking-wider">
                                Otros Proveedores ({otherSuppliers.length})
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {otherSuppliers.map((supp, idx) => (
                                    <div
                                        key={supp.id || idx}
                                        className="flex items-center justify-between gap-2 p-2 rounded-dx bg-primary-950/30 border border-main/5 text-xs"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="w-5 h-5 rounded-full bg-main/5 flex items-center justify-center text-[10px] font-mono text-main/60 shrink-0">
                                                {supp.priority ?? (idx + 2)}
                                            </span>
                                            <span className="font-medium text-main/90 truncate">
                                                {supp.name}
                                            </span>
                                        </div>
                                        {supp.code && (
                                            <span className="font-mono text-[10px] text-main/40 shrink-0">
                                                {supp.code}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
