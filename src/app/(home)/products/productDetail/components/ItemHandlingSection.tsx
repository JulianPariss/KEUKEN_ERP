'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logisticProfileService } from '@/app/services/product_services/logisticProfile.service';
import { temperatureService } from '@/app/services/product_services/temperature.service';
import { hazardService } from '@/app/services/product_services/hazard.service';
import { segregationGroupsService } from '@/app/services/product_services/segregationGroups.service';
import {
    IFLogisticProfile,
    IFTemperatureClass,
    IFHazardClass,
    IFSegregationGroup
} from '@repo/api-contracts/erp';
import {
    ShieldCheckIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    InfoCircleIcon,
    ArrowsRightLeftIcon,
    ChartBarIcon,
    WarningTriangleIcon,
    LayersIcon
} from '@repo/icons';

interface ItemHandlingSectionProps {
    logisticsProfileId?: string | null;
    temperatureClassId?: string | null;
    hazardClassId?: string | null;
    segregationGroupId?: string | null;
}

interface HandlingLoadedData {
    logisticsProfiles: IFLogisticProfile[];
    temperatureClasses: IFTemperatureClass[];
    hazardClasses: IFHazardClass[];
    segregationGroups: IFSegregationGroup[];
}

export default function ItemHandlingSection({
    logisticsProfileId,
    temperatureClassId,
    hazardClassId,
    segregationGroupId,
}: ItemHandlingSectionProps) {
    const { token, currentCompany } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [handlingData, setHandlingData] = useState<HandlingLoadedData | null>(null);

    // Verificar si al menos uno de los valores de manejo está configurado
    const hasHandling = Boolean(
        logisticsProfileId ||
        temperatureClassId ||
        hazardClassId ||
        segregationGroupId
    );

    // Cargar los 4 servicios de manejo bajo demanda al hacer click en el botón
    const handleToggleExpand = useCallback(async () => {
        if (isExpanded) {
            setIsExpanded(false);
            return;
        }

        if (!handlingData && token && currentCompany?.id) {
            setLoading(true);
            setError(null);
            try {
                const [logisticsRes, tempsRes, hazardsRes, segsRes] = await Promise.all([
                    logisticProfileService.getAll(currentCompany.id, token),
                    temperatureService.getAll(currentCompany.id, token),
                    hazardService.getAll(currentCompany.id, token),
                    segregationGroupsService.getAll(currentCompany.id, token),
                ]);

                setHandlingData({
                    logisticsProfiles: logisticsRes || [],
                    temperatureClasses: tempsRes || [],
                    hazardClasses: hazardsRes || [],
                    segregationGroups: segsRes || [],
                });
            } catch (err: any) {
                console.error("Error al cargar datos de manejo del item:", err);
                setError(err instanceof Error && err.message ? err.message : "Error al cargar datos de manejo");
            } finally {
                setLoading(false);
            }
        }

        setIsExpanded(true);
    }, [currentCompany?.id, handlingData, isExpanded, token]);

    // Resuelve nombres y códigos matcheando con los IDs
    const matchedLogistics = useMemo(() => {
        if (!logisticsProfileId || !handlingData) return null;
        return handlingData.logisticsProfiles.find(l => l.id === logisticsProfileId);
    }, [handlingData, logisticsProfileId]);

    const matchedTemperature = useMemo(() => {
        if (!temperatureClassId || !handlingData) return null;
        return handlingData.temperatureClasses.find(t => t.id === temperatureClassId);
    }, [handlingData, temperatureClassId]);

    const matchedHazard = useMemo(() => {
        if (!hazardClassId || !handlingData) return null;
        return handlingData.hazardClasses.find(h => h.id === hazardClassId);
    }, [handlingData, hazardClassId]);

    const matchedSegregation = useMemo(() => {
        if (!segregationGroupId || !handlingData) return null;
        return handlingData.segregationGroups.find(s => s.id === segregationGroupId);
    }, [handlingData, segregationGroupId]);

    return (
        <div className="flex flex-col gap-2 p-3.5 bg-primary-900/40 rounded-dx border border-main/10 transition-colors">
            {/* Cabecera */}
            <div className="flex items-center justify-between gap-2 border-b border-main/10 pb-2">
                <div className="flex items-center gap-2">
                    <ShieldCheckIcon size={16} className="w-4 h-4 text-focus-300 shrink-0" />
                    <h4 className="text-sm font-semibold text-main flex items-center gap-1.5">
                        <span>Manejo y Logística</span>
                    </h4>
                </div>

                {/* Botón de carga/toggle (solo visible si tiene valores de manejo) */}
                {hasHandling && (
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
                                <span>Ocultar manejo</span>
                            </>
                        ) : (
                            <>
                                <ChevronDownIcon size={14} className="w-3.5 h-3.5" />
                                <span>Ver información de manejo</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Vista sin configuración particular */}
            {!hasHandling ? (
                <div className="flex items-center gap-2 py-1 text-xs text-main/50 italic">
                    <InfoCircleIcon size={16} className="w-4 h-4 text-main/30 shrink-0" />
                    <span>Sin manejo particular configurado</span>
                </div>
            ) : (
                <div className="flex flex-col gap-2 pt-1">
                    {/* Resumen previo si está colapsado */}
                    {!isExpanded && (
                        <div className="flex items-center gap-2 text-xs text-main/70">
                            <span className="w-2 h-2 rounded-full bg-success" />
                            <span>Parámetros de manejo y logística configurados en el ítem</span>
                        </div>
                    )}

                    {/* Mensaje de error si falla la carga */}
                    {error && (
                        <div className="p-2.5 rounded-dx bg-error/10 border border-error/20 text-xs text-error flex items-center justify-between">
                            <span>{error}</span>
                            <button
                                type="button"
                                onClick={handleToggleExpand}
                                className="underline hover:text-white"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {/* Datos desplegados matcheados */}
                    {isExpanded && handlingData && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                            {/* 1. Perfil Logístico */}
                            <div className="flex flex-col gap-1 p-2.5 rounded-dx bg-primary-0/20 border border-main/10">
                                <span className="text-[11px] font-semibold text-main/50 uppercase tracking-wider flex items-center gap-1">
                                    <ArrowsRightLeftIcon size={14} className="w-3.5 h-3.5 text-focus-300" />
                                    <span>Perfil Logístico</span>
                                </span>
                                <span className="text-xs font-semibold text-main">
                                    {matchedLogistics?.name || (logisticsProfileId ? `ID: ${logisticsProfileId.substring(0, 8)}...` : 'Sin configurar')}
                                </span>
                                {matchedLogistics?.code && (
                                    <span className="font-mono text-[10px] text-focus-300">
                                        {matchedLogistics.code}
                                    </span>
                                )}
                            </div>

                            {/* 2. Clase de Temperatura */}
                            <div className="flex flex-col gap-1 p-2.5 rounded-dx bg-primary-0/20 border border-main/10">
                                <span className="text-[11px] font-semibold text-main/50 uppercase tracking-wider flex items-center gap-1">
                                    <ChartBarIcon size={14} className="w-3.5 h-3.5 text-focus-300" />
                                    <span>Clase Temperatura</span>
                                </span>
                                <span className="text-xs font-semibold text-main">
                                    {matchedTemperature?.name || (temperatureClassId ? `ID: ${temperatureClassId.substring(0, 8)}...` : 'Sin configurar')}
                                </span>
                                {matchedTemperature?.code && (
                                    <span className="font-mono text-[10px] text-focus-300">
                                        {matchedTemperature.code}
                                    </span>
                                )}
                            </div>

                            {/* 3. Clase de Peligro */}
                            <div className="flex flex-col gap-1 p-2.5 rounded-dx bg-primary-0/20 border border-main/10">
                                <span className="text-[11px] font-semibold text-main/50 uppercase tracking-wider flex items-center gap-1">
                                    <WarningTriangleIcon size={14} className="w-3.5 h-3.5 text-error" />
                                    <span>Clase Peligro</span>
                                </span>
                                <span className="text-xs font-semibold text-main">
                                    {matchedHazard?.name || (hazardClassId ? `ID: ${hazardClassId.substring(0, 8)}...` : 'Sin configurar')}
                                </span>
                                {matchedHazard?.code && (
                                    <span className="font-mono text-[10px] text-error">
                                        {matchedHazard.code}
                                    </span>
                                )}
                            </div>

                            {/* 4. Grupo de Segregación */}
                            <div className="flex flex-col gap-1 p-2.5 rounded-dx bg-primary-0/20 border border-main/10">
                                <span className="text-[11px] font-semibold text-main/50 uppercase tracking-wider flex items-center gap-1">
                                    <LayersIcon size={14} className="w-3.5 h-3.5 text-focus-300" />
                                    <span>Grupo Segregación</span>
                                </span>
                                <span className="text-xs font-semibold text-main">
                                    {matchedSegregation?.name || (segregationGroupId ? `ID: ${segregationGroupId.substring(0, 8)}...` : 'Sin configurar')}
                                </span>
                                {matchedSegregation?.code && (
                                    <span className="font-mono text-[10px] text-focus-300">
                                        {matchedSegregation.code}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
