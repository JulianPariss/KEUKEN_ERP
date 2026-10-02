'use client';

import { IFProductFullItem } from "@repo/api-contracts/erp";

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
    if (!presentations || presentations.length === 0) {
        return (
            <div className="mt-2 p-2 bg-main/5 rounded text-sm text-main/60">
                No hay presentaciones para este ítem.
            </div>
        );
    }

    return (
        <div className="mt-2 flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-main border-b border-main/10 pb-1">Presentaciones</h4>
            <div className="overflow-x-auto border border-main/10 rounded-dx overflow-hidden shadow-none">
                <table className="w-full text-left border-collapse rounded-none">
                    <thead>
                        <tr className="bg-main/5 border-b border-main/10">
                            <th className="p-2 text-xs font-bold text-main uppercase tracking-wider">Nombre</th>
                            <th className="p-2 text-xs font-bold text-main uppercase tracking-wider">Código de Barras</th>
                            <th className="p-2 text-xs font-bold text-main uppercase tracking-wider">UoM</th>
                            <th className="p-2 text-xs font-bold text-main uppercase tracking-wider">Nivel Empaque</th>
                            <th className="p-2 text-xs font-bold text-main uppercase tracking-wider text-right">Ratio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {presentations.map((pres: any, idx: number) => (
                            <tr
                                key={idx}
                                className={`${idx % 2 === 0 ? 'bg-primary-0/10' : 'bg-primary-0/20'} border-b border-main/5 last:border-0 hover:bg-focus-300/10 transition-colors duration-100`}
                            >
                                <td className="p-2 text-xs font-medium text-main">{pres.name}</td>
                                <td className="p-2 text-xs font-mono text-main/80">{pres.barcode || "—"}</td>
                                <td className="p-2 text-xs text-main">{getUomName(pres.uomId)}</td>
                                <td className="p-2 text-xs text-main">
                                    {packagingLevels?.find((pl: any) => pl.id === pres.packagingLevelId)?.name || pres.packagingLevelId || pres.packagingLevelCode || "—"}
                                </td>
                                <td className="p-2 text-xs text-main text-right font-semibold">{pres.uomRatio ?? pres.factor ?? "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
