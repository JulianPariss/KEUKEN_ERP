'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { commercialPlatformsService } from '@/app/services/partners/commercialPlatforms.service';
import { IFCommercialPlatform } from '@repo/api-contracts/erp';
import {
    GlobeIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    WarningTriangleIcon,
    ShoppingBagIcon
} from '@repo/icons';

interface ItemPlatformsSectionProps {
    platforms?: any[] | null;
}

interface NormalizedPlatform {
    id: string;
    name: string;
    code?: string;
    type?: string;
}

export default function ItemPlatformsSection({ platforms }: ItemPlatformsSectionProps) {
    const { token, currentCompany } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [platformsDirectory, setPlatformsDirectory] = useState<IFCommercialPlatform[] | null>(null);

    // Lista cruda segura de plataformas
    const rawList = useMemo(() => {
        if (!platforms || !Array.isArray(platforms)) return [];
        return platforms;
    }, [platforms]);

    // Normalizar la lista identificando nombres y códigos
    const normalizedList = useMemo<NormalizedPlatform[]>(() => {
        return rawList.map((p) => {
            if (!p) return { id: '', name: 'Plataforma sin datos' };

            const id = typeof p === 'string' ? p : (p.id || p.platform_id || p.platformId || '');
            const rawName = typeof p === 'string' ? '' : (p.name || p.platform_name || p.platformName);
            const code = typeof p === 'string' ? undefined : (p.code || p.platform_code);

            // Búsqueda en el directorio cargado si no venía el nombre completo
            const directoryMatch = platformsDirectory?.find(item => item.id === id);
            const finalName = rawName || directoryMatch?.name || (id ? `Plataforma (${id.substring(0, 8)}...)` : 'Plataforma');
            const finalCode = code || directoryMatch?.code;
            const type = typeof p === 'object' ? (p.platform_type || p.platformType || (p as any).type) : undefined;

            return {
                id,
                name: finalName,
                code: finalCode,
                type: type ? String(type) : undefined
            };
        });
    }, [rawList, platformsDirectory]);

    const firstPlatform = normalizedList[0] || null;
    const otherPlatforms = normalizedList.slice(1);

    // Carga bajo demanda al expandir
    const handleToggleExpand = useCallback(async () => {
        if (isExpanded) {
            setIsExpanded(false);
            return;
        }

        if (!platformsDirectory && token && currentCompany?.id) {
            setLoading(true);
            try {
                const res = await commercialPlatformsService.getAll(
                    { companyId: currentCompany.id, limit: 500, offset: 0 },
                    token
                );
                setPlatformsDirectory(res?.items || []);
            } catch (err) {
                console.error("Error al cargar plataformas comerciales:", err);
            } finally {
                setLoading(false);
            }
        }

        setIsExpanded(true);
    }, [currentCompany?.id, isExpanded, platformsDirectory, token]);

    return (
        <div className="flex flex-col gap-2 p-3.5 bg-primary-900/40 rounded-dx border border-main/10 transition-colors">
            {/* Cabecera */}
            <div className="flex items-center justify-between gap-2 border-b border-main/10 pb-2">
                <div className="flex items-center gap-2">
                    <GlobeIcon size={16} className="w-4 h-4 text-focus-300 shrink-0" />
                    <h4 className="text-sm font-semibold text-main flex items-center gap-1.5">
                        <span>Plataformas Comerciales</span>
                        <span className="text-xs font-normal text-main/50">({normalizedList.length})</span>
                    </h4>
                </div>

                {/* Botón de toggle (solo si posee más de una) */}
                {otherPlatforms.length > 0 && (
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
                                <span>Ocultar plataformas</span>
                            </>
                        ) : (
                            <>
                                <ChevronDownIcon size={14} className="w-3.5 h-3.5" />
                                <span>Ver más plataformas ({otherPlatforms.length})</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Vista sin desplegar */}
            {normalizedList.length === 0 ? (
                <div className="flex items-center gap-2 py-1 text-xs text-main/50 italic">
                    <WarningTriangleIcon size={16} className="w-4 h-4 text-main/30 shrink-0" />
                    <span>Sin plataformas configuradas</span>
                </div>
            ) : (
                <div className="flex flex-col gap-2 pt-1">
                    {/* Primera plataforma visible */}
                    {firstPlatform && (
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-dx bg-primary-0/20 border border-main/10">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-focus-300/15 text-focus-300 border border-focus-300/25 shrink-0 flex items-center gap-1">
                                    <ShoppingBagIcon size={12} className="w-3 h-3" />
                                    <span>Plataforma</span>
                                </span>
                                <span className="font-semibold text-main text-xs truncate">
                                    {firstPlatform.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-main/50 shrink-0">
                                {firstPlatform.code && (
                                    <span className="font-mono bg-primary-950/40 px-1.5 py-0.5 rounded border border-main/10">
                                        {firstPlatform.code}
                                    </span>
                                )}
                                {firstPlatform.type && (
                                    <span className="capitalize text-main/60">
                                        {firstPlatform.type}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Lista desplegada de plataformas restantes */}
                    {isExpanded && otherPlatforms.length > 0 && (
                        <div className="flex flex-col gap-1.5 pt-1 pl-1 border-t border-main/5">
                            <span className="text-[11px] font-semibold text-main/60 uppercase tracking-wider">
                                Otras Plataformas ({otherPlatforms.length})
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {otherPlatforms.map((plat, idx) => (
                                    <div
                                        key={plat.id || idx}
                                        className="flex items-center justify-between gap-2 p-2 rounded-dx bg-primary-950/30 border border-main/5 text-xs"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="w-2 h-2 rounded-full bg-focus-300 shrink-0" />
                                            <span className="font-medium text-main/90 truncate">
                                                {plat.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {plat.code && (
                                                <span className="font-mono text-[10px] text-main/40">
                                                    {plat.code}
                                                </span>
                                            )}
                                            {plat.type && (
                                                <span className="text-[10px] text-main/50 bg-main/5 px-1.5 py-0.5 rounded">
                                                    {plat.type}
                                                </span>
                                            )}
                                        </div>
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
