'use client';

import { inventoryService } from "@/app/services/warehouse/inventory.service";
import { IFInventory } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { useLocations } from "@/contexts/LocationsContext";
import { LoadIndicator, NumberBox } from "devextreme-react";
import { Button } from '@repo/devextreme';
import notify from "devextreme/ui/notify";
import { useState } from "react";

interface IInventoryListCardProps {
    locationId: string;
    activeInventory: IFInventory;
}

const InventoryListCard = ({ locationId, activeInventory }: IInventoryListCardProps) => {
    const { triggerRefresh, setActiveInventory } = useLocations();
    const [editingLineId, setEditingLineId] = useState<string | null>(null);
    const [editQuantity, setEditQuantity] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    const handleEdit = (line: any) => {
        setEditingLineId(`${line.itemId}-${line.batchId}`);
        setEditQuantity(line.realQty || 0);
    };

    const handleCancel = () => {
        setEditingLineId(null);
    };

    const handleSave = async (line: any) => {
        if (editQuantity < 0) {
            notify("La cantidad no puede ser negativa", "error");
            return;
        }

        setLoading(true);
        try {
            await inventoryService.patch(activeInventory.id, {
                lines: [{
                    lineId: null,
                    itemId: line.itemId,
                    batchId: line.batchId,
                    realQty: editQuantity,
                    realSecQty: 0,
                    batchName: line.batchName || "",
                    batchExpirationDate: line.batchExpirationDate || null,
                    batchSupplierBatch: "",
                    batchInternalCode: "",
                    batchProperties: null
                }]
            }, token);

            notify("Cantidad registrada correctamente", "success");

            if (setActiveInventory) {
                const updatedLines = activeInventory.lines.map(l => {
                    if (l.itemId === line.itemId && l.batchId === line.batchId) {
                        return {
                            ...l,
                            realQty: editQuantity,
                            diffQty: editQuantity - l.theoreticalQty
                        };
                    }
                    return l;
                });
                setActiveInventory({ ...activeInventory, lines: updatedLines });
            }

            setEditingLineId(null);
        } catch (error: any) {
            console.error("Error adjusting stock:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al registrar la cantidad";
            notify(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };


    const calculateAditions = () => {
        return activeInventory.lines.reduce((acc, il) => il.realQty !== null && il.diffQty > 0 ? acc + Number(il.diffQty) : acc, 0);
    }

    const calculateSubtractions = () => {
        return activeInventory.lines.reduce((acc, il) => il.realQty !== null && il.diffQty < 0 ? acc + Number(il.diffQty) : acc, 0);
    }

    if (activeInventory.lines.length === 0) {
        return (
            <div className="flex flex-col w-full items-center justify-center p-12 text-center bg-primary-500/40 rounded-dx border-2 border-dashed border-primary-950/40">
                <div className="size-12 bg-primary-500/40 rounded-full flex items-center justify-center mb-4 border border-primary-500/10">
                    <i
                        style={{ fontSize: '1.5rem' }}
                        className="dx-icon-product !text-main/40" />
                </div>
                <h4 className="!text-main/40 mb-1">Sin Elementos</h4>
                <p className="text-xs  !text-main/30 ">
                    No hay productos registrados en esta ubicación para inventariar
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="px-1 py-1 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-md">Inventario Activo</span>
                    <h4 className="text-sm  !text-focus-500">{activeInventory.name}</h4>
                </div>
                <div className="px-2 py-1 bg-focus-500/10 rounded-dx border border-focus-500/20">
                    <span className="text-xs ">Items: {activeInventory.lines.length} | Adiciones: {calculateAditions()} | Sustracciones: {calculateSubtractions()}</span>
                </div>
            </div>

            {activeInventory.lines.map((inventoryLine, index) => {
                const invLine = activeInventory.lines.find(il =>
                    il.itemId === inventoryLine.itemId && il.batchId === inventoryLine.batchId
                );

                return (
                    <div
                        key={`${inventoryLine.itemId}-${inventoryLine.batchId}-${index}`}
                        className="bg-primary-500 border border-focus-500/20 rounded-dx p-4 flex flex-col gap-3 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-dx flex items-center justify-center border border-focus-100/20 bg-focus-500/80 transition-colors">
                                    <i className="dx-icon-packagebox text-xl !text-variant" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-sm  font-bold leading-tight">{inventoryLine.itemName}</h4>
                                    <span className="text-xs !text-main/60 bg-main/10 px-1 mt-1 rounded-full w-fit">{inventoryLine.itemId}</span>
                                </div>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                {editingLineId === `${inventoryLine.itemId}-${inventoryLine.batchId}` ? (
                                    <>
                                        <NumberBox
                                            disabled={loading}
                                            value={editQuantity}
                                            onValueChanged={(e) => setEditQuantity(e.value || 0)}
                                            min={0}
                                            onContentReady={(e) => e.component.focus()}
                                            onEnterKey={() => { !loading && handleSave(inventoryLine) }}
                                            width={85}
                                            height={36}
                                            stylingMode="filled"
                                            valueChangeEvent="keyup"
                                            className="!rounded-dx !bg-primary-950/20"
                                            inputAttr={{ class: '!text-lg !font-bold !text-center' }}
                                        />
                                        <div className="flex items-center gap-1">
                                            {loading ? (
                                                <div className="flex items-center justify-center size-5 mx-1">
                                                    <LoadIndicator width={20} height={20} />
                                                </div>
                                            ) : (
                                                <Button
                                                    icon="check"
                                                    onClick={() => handleSave(inventoryLine)}
                                                    disabled={loading}
                                                    stylingMode="text"
                                                    className="!text-green-500 hover:!bg-green-500/10 !rounded-full shrink-0"
                                                />
                                            )}
                                            <Button
                                                icon="close"
                                                onClick={handleCancel}
                                                disabled={loading}
                                                stylingMode="text"
                                                className="!text-red-500 hover:!bg-red-500/10 !rounded-full shrink-0"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xl leading-none font-black">
                                                {invLine ? invLine.realQty : '-'}
                                            </span>
                                        </div>
                                        <Button
                                            disabled={loading}
                                            icon="edit"
                                            stylingMode="text"
                                            hint="Editar"
                                            className="!text-focus-100 hover:!bg-focus-500/10 !rounded-full shrink-0"
                                            onClick={() => handleEdit(inventoryLine)}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {invLine && invLine.diffQty !== 0 && (
                            <div className={`mt-2 px-3 py-1.5 flex items-center justify-between ${invLine.diffQty > 0 ? 'bg-focus-500/10 border-t border-focus-500/20' : 'bg-focus-500/10 border-t border-focus-500/20'
                                }`}>
                                <span className="text-sm uppercase font-bold">Diferencia</span>
                                <span className={`text-xs  ${invLine.diffQty > 0 ? '!text-green-500' : '!text-red-500'}`}>
                                    {invLine.diffQty > 0 ? '+' : ''}{invLine.diffQty}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}

        </div>
    );
};

export default InventoryListCard;
