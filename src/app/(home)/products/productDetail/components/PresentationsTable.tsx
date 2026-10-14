'use client';

import { useMemo, Fragment } from 'react';
import { IFProductFullItem } from "@repo/api-contracts/erp";
import { BoxIcon, LayersIcon, CheckIcon } from "@repo/icons";

type IFProductFullItemItem = IFProductFullItem['items'][number];
type PresentationType = NonNullable<IFProductFullItemItem['presentations']>[number];

interface PresentationsTableProps {
    presentations?: PresentationType[];
    uoms: any[];
    packagingLevels: any[];
    getUomName: (id: string) => string;
}

export default function PresentationsTable({
    presentations = [],
    uoms,
    packagingLevels,
    getUomName
}: PresentationsTableProps) {
    // Sub-agrupar presentaciones por packaging_level_code resolviendo packaging_level_name
    const groupedPresentations = useMemo(() => {
        if (!presentations || presentations.length === 0) return [];

        // Jerarquía lógica estándar de niveles de empaque
        const KNOWN_LEVELS: Record<string, { order: number; defaultName: string }> = {
            'UNIDAD': { order: 1, defaultName: 'Unidad' },
            'DISPLAY': { order: 2, defaultName: 'Display' },
            'CAJA': { order: 3, defaultName: 'Caja' },
            'BULTO': { order: 4, defaultName: 'Bulto' },
            'PALLET': { order: 5, defaultName: 'Pallet' },
            'OTRO': { order: 6, defaultName: 'Otro' },
        };

        const groupMap = new Map<string, { code: string; name: string; items: PresentationType[] }>();

        presentations.forEach((pres: any) => {
            const levelId = pres.packagingLevelId || pres.packaging_level_id;
            const directCode = pres.packagingLevelCode || pres.packaging_level_code;

            // Búsqueda en catálogo de packagingLevels
            const matchedLevel = packagingLevels?.find((pl: any) =>
                (levelId && pl.id === levelId) ||
                (directCode && (pl.code === directCode || pl.name?.toUpperCase() === directCode?.toUpperCase()))
            );

            const code = directCode || matchedLevel?.code || (levelId ? `ID: ${String(levelId).substring(0, 8)}...` : 'SIN_NIVEL');
            const name = matchedLevel?.name ||
                pres.packagingLevelName ||
                pres.packaging_level_name ||
                KNOWN_LEVELS[code]?.defaultName ||
                (code === 'SIN_NIVEL' ? 'Sin Nivel de Empaque' : code);

            if (!groupMap.has(code)) {
                groupMap.set(code, {
                    code,
                    name,
                    items: []
                });
            }

            groupMap.get(code)!.items.push(pres);
        });

        const groups = Array.from(groupMap.values());

        // Ordenar grupos según la jerarquía de empaque
        groups.sort((a, b) => {
            const orderA = KNOWN_LEVELS[a.code]?.order ?? 99;
            const orderB = KNOWN_LEVELS[b.code]?.order ?? 99;
            if (orderA !== orderB) return orderA - orderB;
            return a.name.localeCompare(b.name);
        });

        // Dentro de cada grupo, colocar primero las presentaciones marcadas como principales (isPrimary)
        groups.forEach(g => {
            g.items.sort((a: any, b: any) => {
                const aPrimary = Boolean(a.isPrimary || a.is_primary);
                const bPrimary = Boolean(b.isPrimary || b.is_primary);
                if (aPrimary !== bPrimary) return aPrimary ? -1 : 1;
                const ratioA = Number(a.uomRatio ?? a.factor ?? 0);
                const ratioB = Number(b.uomRatio ?? b.factor ?? 0);
                if (ratioA !== ratioB) return ratioA - ratioB;
                return (a.name || '').localeCompare(b.name || '');
            });
        });

        return groups;
    }, [presentations, packagingLevels]);

    if (!presentations || presentations.length === 0) {
        return (
            <div className="mt-2 p-2.5 bg-main/5 rounded-dx text-xs text-main/60 flex items-center gap-2">
                <BoxIcon size={16} className="w-4 h-4 text-main/40 shrink-0" />
                <span>No hay presentaciones configuradas para este ítem.</span>
            </div>
        );
    }

    return (
        <div className="mt-2 flex flex-col gap-2">
            {/* Cabecera de la sección */}
            <div className="flex items-center justify-between border-b border-main/10 pb-1.5">
                <div className="flex items-center gap-2">
                    <LayersIcon size={16} className="w-4 h-4 text-focus-300 shrink-0" />
                    <h4 className="text-sm font-semibold text-main flex items-center gap-1.5">
                        <span>Presentaciones</span>
                        <span className="text-xs font-normal text-main/50">({presentations.length})</span>
                    </h4>
                </div>
                {groupedPresentations.length > 1 && (
                    <span className="text-[11px] text-main/40 font-medium">
                        {groupedPresentations.length} niveles de empaque
                    </span>
                )}
            </div>

            {/* Tabla con subagrupación */}
            <div className="overflow-x-auto border border-main/10 rounded-dx overflow-hidden shadow-none">
                <table className="w-full text-left border-collapse rounded-none">
                    <thead>
                        <tr className="bg-main/5 border-b border-main/10">
                            <th className="p-2.5 text-xs font-bold text-main uppercase tracking-wider">Nombre</th>
                            <th className="p-2.5 text-xs font-bold text-main uppercase tracking-wider">Código de Barras</th>
                            <th className="p-2.5 text-xs font-bold text-main uppercase tracking-wider">UoM</th>
                            <th className="p-2.5 text-xs font-bold text-main uppercase tracking-wider text-right">Ratio</th>
                            <th className="p-2.5 text-xs font-bold text-main uppercase tracking-wider text-center">Principal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedPresentations.map((group) => (
                            <Fragment key={group.code}>
                                {/* Fila Cabecera de Subgrupo: packaging_level_name y packaging_level_code */}
                                <tr className="bg-primary-900/80 border-t border-b border-main/15">
                                    <td colSpan={5} className="py-2 px-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <BoxIcon size={14} className="w-3.5 h-3.5 text-focus-300" />
                                                <span className="text-xs font-bold text-main tracking-wide">
                                                    {group.name}
                                                </span>
                                                <span className="font-mono text-[10px] text-focus-300 bg-focus-500/15 px-1.5 py-0.5 rounded border border-focus-500/25">
                                                    {group.code}
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-main/50">
                                                {group.items.length} {group.items.length === 1 ? 'presentación' : 'presentaciones'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>

                                {/* Filas de presentaciones dentro del subgrupo */}
                                {group.items.map((pres: any, idx: number) => {
                                    const isPrimary = Boolean(pres.isPrimary || pres.is_primary);
                                    return (
                                        <tr
                                            key={pres.id || idx}
                                            className={`${isPrimary
                                                ? 'bg-focus-300/5 hover:bg-focus-300/10'
                                                : idx % 2 === 0
                                                    ? 'bg-primary-0/10 hover:bg-focus-300/10'
                                                    : 'bg-primary-0/20 hover:bg-focus-300/10'
                                                } border-b border-main/5 last:border-0 transition-colors duration-100`}
                                        >
                                            <td className="p-2.5 text-xs font-medium text-main">
                                                <span>{pres.name}</span>
                                            </td>
                                            <td className="p-2.5 text-xs font-mono text-main/80">
                                                {pres.barcode || "—"}
                                            </td>
                                            <td className="p-2.5 text-xs text-main">
                                                {getUomName(pres.uomId || pres.uom_id)}
                                            </td>
                                            <td className="p-2.5 text-xs text-main text-right font-semibold">
                                                {pres.uomRatio ?? pres.factor ?? "—"}
                                            </td>
                                            <td className="p-2.5 text-xs text-center">
                                                {isPrimary ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success/15 text-success border border-success/30">
                                                        <CheckIcon size={12} className="w-3 h-3" />
                                                        <span>Principal</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-main/30 font-medium">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
