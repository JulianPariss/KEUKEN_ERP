import { IFCommercialPlatform, IFCurrency, IFPackagingLevel, IFProvider, IFUOM } from "@repo/api-contracts/erp";
import { Button } from '@repo/devextreme';
import { useRecovery } from "@/contexts/RecoveryContext";
import React, { useState } from "react";
import PresentationSection from "./presentationsCreation";
import ItemMediaUploadSection, { ICachedItemMedia } from "./itemMediaUploadSection";

interface IItemsCreatedListProps {
    itemsData: any[];
    currentPresentationsMap?: Record<string, any>;
    setCurrentPresentationsMap?: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    uoms: IFUOM[];
    costMethods: any[];
    removeItem: (tempId: string) => void;
    canCreatePresentation?: boolean;
    setItemsData: React.Dispatch<React.SetStateAction<any[]>>;
    setIsAddingItem: React.Dispatch<React.SetStateAction<boolean>>;
    packagingLevels: IFPackagingLevel[];
    productData?: any;
    currencies?: IFCurrency[];
    suppliers?: IFProvider[];
    platforms?: IFCommercialPlatform[];
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
    packagingLevels,
    productData,
    currencies,
    suppliers,
    platforms,
}: any) => {
    const { isRecoveryMode } = useRecovery();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMediaExpanded, setIsMediaExpanded] = useState(false);

    const handleDelete = () => {
        if (i.media && i.media.length > 0) {
            i.media.forEach((m: ICachedItemMedia) => {
                if (m.previewUrl) URL.revokeObjectURL(m.previewUrl);
            });
        }
        if (itemsLength === 1) {
            setIsAddingItem(true);
        }
        removeItem(i.tempId);
    };

    const getUomName = (id: string) => uoms?.find((u: any) => u.id === id)?.name || id || "—";
    const getCostMethodName = (id: string) => costMethods?.find((c: any) => c.id === id)?.name || id || "Estándar";
    const getCurrencyName = (id: string) => currencies?.find((c: any) => c.id === id)?.name || id;

    const rawSuppliers = i.suppliers || i.supplierIds || [];
    const supplierNames = (Array.isArray(rawSuppliers) ? rawSuppliers : []).map((sId: any) => {
        const id = typeof sId === 'object' ? sId.id : sId;
        return suppliers?.find((s: any) => s.id === id)?.name || (typeof sId === 'object' ? sId.name : id);
    }).filter(Boolean);

    const rawPlatforms = i.platformIds || i.platforms || [];
    const platformNames = (Array.isArray(rawPlatforms) ? rawPlatforms : []).map((pId: any) => {
        const id = typeof pId === 'object' ? pId.id : pId;
        return platforms?.find((p: any) => p.id === id)?.name || (typeof pId === 'object' ? pId.name : id);
    }).filter(Boolean);

    const logisticsDisplay = i.logisticsProfileId ? "Personalizado" : (productData?.defaultLogisticsProfileId ? "Hereda del Producto" : "Sin configuración");
    const tempDisplay = i.temperatureClassId ? "Personalizado" : (productData?.defaultTemperatureClassId ? "Hereda del Producto" : "Sin configuración");
    const hazardDisplay = i.hazardClassId ? "Personalizado" : (productData?.defaultHazardClassId ? "Hereda del Producto" : "Sin configuración");
    const segregationDisplay = i.segregationGroupId ? "Personalizado" : (productData?.defaultSegregationGroupId ? "Hereda del Producto" : "Sin configuración");

    return (
        <div key={i.tempId} className="rounded-dx border border-focus-300/20 overflow-hidden shadow-sm">
            <div className="p-4 bg-primary-0/20">
                {/* Header: Name, SKU, Badges, Delete Button */}
                <div className="flex justify-between items-start border-b border-focus-100/10 pb-3 mb-3">
                    <div className="space-y-1.5 flex-grow">
                        <div className="flex gap-2 items-center flex-wrap">
                            <h4 className="text-dx-primary font-bold text-lg">
                                {i.itemName || productData?.name || "Sin nombre"}
                            </h4>
                            <span className="bg-focus-300/10 !text-focus-300 px-2 py-0.5 rounded text-xs font-mono font-medium">
                                {i.sku}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${i.active !== false ? "bg-success/15 text-success border border-success/30" : "bg-error/15 text-error border border-error/30"}`}>
                                {i.active !== false ? "Activo" : "Inactivo"}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${i.isInventoryItem ? "bg-focus-500/15 text-focus-300 border border-focus-500/30" : "bg-main/5 text-main/50 border border-main/10"}`}>
                                {i.isInventoryItem ? "Controla Stock" : "Sin Stock"}
                            </span>
                            {i.requiresExpiry && (
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-warning/15 text-warning border border-warning/30">
                                    Vencimiento
                                </span>
                            )}
                            {i.isSerializable && (
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    Serializable
                                </span>
                            )}
                            {i.isConsignmentItem && (
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    Consignación
                                </span>
                            )}
                            {i.media && i.media.length > 0 && (
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-focus-500/15 text-focus-300 border border-focus-500/30">
                                    {i.media.length} {i.media.length === 1 ? 'imagen' : 'imágenes'}
                                </span>
                            )}
                        </div>
                    </div>
                    {!isRecoveryMode && (
                        <div className="flex gap-1 ml-2">
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

                {/* Measurements, Cost and Currency */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-y-3 gap-x-2 pb-3 border-b border-focus-100/10 text-xs">
                    <div className="flex flex-col">
                        <span className="!text-main/50">Volumen</span>
                        <span className="text-sm font-medium">{i.volume ?? 0}m³</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="!text-main/50">Peso</span>
                        <span className="text-sm font-medium">{i.weight ?? 0}kg</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="!text-main/50">Pallet</span>
                        <span className="text-sm font-medium">
                            {i.palletUnits ?? 0} <span className="text-xs !text-main/50">{getUomName(i.palletUomId)}</span>
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="!text-main/50">Costo</span>
                        <span className="text-sm font-medium">{getCostMethodName(i.costMethod)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="!text-main/50">Moneda</span>
                        <span className="text-sm font-medium">{i.currencyId ? getCurrencyName(i.currencyId) : "—"}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="!text-main/50">{i.uomRatio ? "Ratio UoM" : "Tipo"}</span>
                        <span className="text-sm font-medium">
                            {i.uomRatio !== undefined && i.uomRatio !== null && i.uomRatio > 0 ? i.uomRatio : "Estándar"}
                        </span>
                    </div>
                </div>

                {/* Suppliers and Platforms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3 border-b border-focus-100/10 text-xs">
                    <div className="flex flex-col gap-1">
                        <span className="!text-main/50 font-medium">Proveedores</span>
                        <div className="flex flex-wrap gap-1">
                            {supplierNames.length > 0 ? (
                                supplierNames.map((name: string, idx: number) => (
                                    <span key={idx} className="text-xs px-2 py-0.5 rounded bg-main/5 text-main/80 border border-main/10 font-medium">
                                        {name}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-main/40 italic">Sin proveedores asignados</span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="!text-main/50 font-medium">Plataformas Comerciales</span>
                        <div className="flex flex-wrap gap-1">
                            {platformNames.length > 0 ? (
                                platformNames.map((name: string, idx: number) => (
                                    <span key={idx} className="text-xs px-2 py-0.5 rounded bg-main/5 text-main/80 border border-main/10 font-medium">
                                        {name}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-main/40 italic">Sin plataformas asignadas</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Handling info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                    <div className="flex flex-col">
                        <span className="!text-main/50 text-[11px]">Perfil Logístico</span>
                        <span className="font-medium text-main/80">{logisticsDisplay}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="!text-main/50 text-[11px]">Clase Temperatura</span>
                        <span className="font-medium text-main/80">{tempDisplay}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="!text-main/50 text-[11px]">Clase Peligro</span>
                        <span className="font-medium text-main/80">{hazardDisplay}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="!text-main/50 text-[11px]">Grupo Segregación</span>
                        <span className="font-medium text-main/80">{segregationDisplay}</span>
                    </div>
                </div>
            </div>

            {canCreatePresentation && (
                <div className="border-t border-focus-100/10 transition-colors">
                    <div
                        className="p-3 flex justify-between items-center cursor-pointer bg-focus-300/20"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <span className="text-sm font-semibold opacity-80">Presentaciones ({i.presentations?.length || 0})</span>
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

            {/* Gestión de Imágenes del Ítem */}
            <div className="border-t border-focus-100/10 transition-colors">
                <div
                    className="p-3 flex justify-between items-center cursor-pointer bg-focus-300/15 hover:bg-focus-300/25 transition-colors"
                    onClick={() => setIsMediaExpanded(!isMediaExpanded)}
                >
                    <span className="text-sm font-semibold opacity-80">
                        Imágenes ({i.media?.length || 0})
                    </span>
                    <i className={`dx-icon-chevron${isMediaExpanded ? 'up' : 'down'} opacity-60`}></i>
                </div>
                {isMediaExpanded && (
                    <div className="p-3 bg-focus-300/5">
                        <ItemMediaUploadSection
                            media={i.media || []}
                            onChange={(newMedia) => {
                                setItemsData((prevData: any[]) => prevData.map(item =>
                                    item.tempId === i.tempId
                                        ? { ...item, media: newMedia }
                                        : item
                                ));
                            }}
                        />
                    </div>
                )}
            </div>
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
        packagingLevels,
        productData,
        currencies,
        suppliers,
        platforms,
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
                        productData={productData}
                        currencies={currencies}
                        suppliers={suppliers}
                        platforms={platforms}
                    />
                ))}
            </div>
        </div>
    );
};

export default React.memo(ItemsCreatedList);