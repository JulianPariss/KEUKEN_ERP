'use client'

import { Button } from '@repo/devextreme';

interface IPresentationSectionProps {
    presentations: any[];
    setPresentations: React.Dispatch<React.SetStateAction<any[]>>;
    uoms: any[];
    packagingLevels: any[];
}

const PresentationSection = (props: IPresentationSectionProps) => {

    const {
        presentations,
        setPresentations,
        uoms,
        packagingLevels,
    } = props;

    const removePresentation = (tempId: string) => {
        setPresentations((prev: any[]) => (prev || []).filter(p => p.tempId !== tempId));
    };

    return (
        <div>
            <div className="overflow-x-auto">
                {presentations.length === 0 ?
                    <div className="text-center p-4 text-sm  opacity-50">
                        No hay presentaciones agregadas aún
                    </div>
                    :
                    <table className="w-full text-sm  min-w-[600px]">
                        <thead>
                            <tr className="border-b border-main/10">
                                <th className="text-left p-2 w-[25%]">Nombre</th>
                                <th className="text-left p-2 w-[20%]">Código de Barras</th>
                                <th className="text-left p-2 w-[20%]">Unidad de medida</th>
                                <th className="text-left p-2 w-[15%]">Nivel Empaque</th>
                                <th className="text-left p-2 w-[10%]">Ratio</th>
                                <th className="text-end p-2 w-[10%]">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {presentations.map((p: any) => (
                                <tr key={p.tempId} className="border-b border-main/5 last:border-0 hover:bg-main/5 transition-colors">
                                    <td className="p-2">{p.name}</td>
                                    <td className="p-2">{p.barcode}</td>
                                    <td className="p-2">{uoms.find(u => u.id === p.uomId)?.name || p.uomId}</td>
                                    <td className="p-2">{packagingLevels?.find(pl => pl.id === p.packagingLevelId)?.name || p.packagingLevelId}</td>
                                    <td className="p-2">{p.uomRatio}</td>
                                    <td className="p-2 text-end">
                                        <Button
                                            icon="trash"
                                            type="danger"
                                            stylingMode="text"
                                            onClick={() => removePresentation(p.tempId)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                }
            </div>
        </div>
    );
};

export default PresentationSection;