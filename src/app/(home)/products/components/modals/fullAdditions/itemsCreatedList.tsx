import { IFUOM } from "@repo/api-contracts/erp";
import { IFPackagingLevel } from "@repo/api-contracts/erp";
import { Button } from '@repo/devextreme';
import { useRecovery } from "@/contexts/RecoveryContext";
import React, { useState } from "react";
import PresentationSection from "./presentationsCreation";

interface IItemsCreatedListProps {
    itemsData: any[];
    currentPresentationsMap: Record<string, any>;
    setCurrentPresentationsMap: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    uoms: IFUOM[];
    costMethods: any[];
    removeItem: (tempId: string) => void;
    canCreatePresentation?: boolean;
    setItemsData: React.Dispatch<React.SetStateAction<any[]>>;
    setIsAddingItem: React.Dispatch<React.SetStateAction<boolean>>;
    packagingLevels: IFPackagingLevel[];
}

const ItemListItem = React.memo(({
    item: i,
    uoms,
    costMethods,
    removeItem,
    canCreatePresentation,
    setItemsData,
    itemsLength,
    setIsAddingItem,
    packagingLevels
}: any) => {
    const { isRecoveryMode } = useRecovery();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDelete = () => {
        if (itemsLength === 1) {
            setIsAddingItem(true);
        }
        removeItem(i.tempId);
    };

    return (
        <div key={i.tempId} className="rounded-dx border border-focus-300/20 overflow-hidden">
            <div className="p-4 bg-primary-0/20">
                <div className="flex justify-between items-start border-b border-focus-100/10 pb-3 mb-3">
                    <div className="space-y-1">
                        <div className="flex gap-2 items-center">
                            <h4 className="text-dx-primary font-bold text-lg">{i.itemName}</h4>
                            <span className="bg-focus-300/10 !text-focus-300 px-2 py-0.5 rounded text-xs ">{i.sku}</span>
                        </div>
                    </div>
                    {!isRecoveryMode && (
                        <div className="flex gap-1">
                            <Button
                                icon="trash"
                                type="danger"
                                stylingMode="text"
                                className="!rounded-dx !h-8 !w-8 transition-transform hover:scale-110"
                                onClick={handleDelete}
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-5 gap-y-4 gap-x-2">
                    <div className="flex flex-col">
                        <span className="text-xs  !text-main/50">Volumen</span>
                        <span className="text-sm ">{i.volume}m³</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs  !text-main/50">Peso</span>
                        <span className="text-sm ">{i.weight}kg</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs  !text-main/50">Pallet</span>
                        <span className="text-sm ">{i.palletUnits} <span className="text-xs  !text-main/50  ">{uoms.find((u: any) => u.id === i.palletUomId)?.name || 'UoM'}</span></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs  !text-main/50">Costo</span>
                        <span className="text-sm ">{costMethods.find((c: any) => c.id === i.costMethod)?.name}</span>
                    </div>
                    {i.uomRatio !== undefined && i.uomRatio !== null && i.uomRatio > 0 ? (
                        <div className="flex flex-col">
                            <span className="text-xs  !text-main/50">Ratio UoM</span>
                            <span className="text-sm ">{i.uomRatio}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-xs  !text-main/50">Tipo</span>
                            <span className="text-sm ">Estándar</span>
                        </div>
                    )}
                </div>
            </div>
            {canCreatePresentation && (
                <div className="border-t border-focus-100/10 transition-colors">
                    <div
                        className="p-3 flex justify-between items-center cursor-pointer bg-focus-300/20"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <span className="text-sm  font-semibold opacity-80">Presentaciones ({i.presentations?.length || 0}) </span>
                        <i className={`dx-icon-chevron${isExpanded ? 'up' : 'down'} opacity-60`}></i>
                    </div>
                    {isExpanded && (
                        <div className="p-3 bg-focus-300/10">
                            <PresentationSection
                                presentations={i.presentations || []}
                                setPresentations={(newPres: any) => {
                                    setItemsData((prevData: any[]) => prevData.map(item =>
                                        item.tempId === i.tempId
                                            ? { ...item, presentations: typeof newPres === 'function' ? newPres(item.presentations || []) : newPres }
                                            : item
                                    ));
                                }}
                                uoms={uoms}
                                packagingLevels={packagingLevels}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

const ItemsCreatedList = (props: IItemsCreatedListProps) => {

    const {
        itemsData,
        uoms,
        costMethods,
        removeItem,
        canCreatePresentation,
        setItemsData,
        setIsAddingItem,
        packagingLevels
    } = props;

    return (
        <div>
            <div className="flex flex-col gap-y-5 mt-5">
                {itemsData.map((i) => (
                    <ItemListItem
                        key={i.tempId}
                        itemsLength={itemsData.length}
                        item={i}
                        uoms={uoms}
                        costMethods={costMethods}
                        removeItem={removeItem}
                        canCreatePresentation={canCreatePresentation}
                        setItemsData={setItemsData}
                        setIsAddingItem={setIsAddingItem}
                        packagingLevels={packagingLevels}
                    />
                ))}
            </div>
        </div>
    );
};

export default React.memo(ItemsCreatedList);