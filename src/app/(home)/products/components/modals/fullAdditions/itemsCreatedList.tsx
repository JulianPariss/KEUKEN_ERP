import { IFCommercialPlatform, IFCurrency, IFPackagingLevel, IFProvider, IFUOM } from "@repo/api-contracts/erp";
import { Button } from '@repo/devextreme';
import { Accordion } from "devextreme-react/accordion";
import { useRecovery } from "@/contexts/RecoveryContext";
import React, { useCallback, useState } from "react";
import ItemMediaUploadSection, { ICachedItemMedia } from "./itemMediaUploadSection";

interface IItemsCreatedListProps {
    itemsData: any[];
    uoms: IFUOM[];
    costMethods: any[];
    removeItem: (tempId: string) => void;
    onEditItem: (tempId: string) => void;
    canCreatePresentation?: boolean;
    setItemsData: React.Dispatch<React.SetStateAction<any[]>>;
    setIsAddingItem: React.Dispatch<React.SetStateAction<boolean>>;
    packagingLevels: IFPackagingLevel[];
    productData?: any;
    currencies?: IFCurrency[];
    suppliers?: IFProvider[];
    platforms?: IFCommercialPlatform[];
}

const ReadField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs text-main/60 leading-tight">{label}</span>
        <span className="text-sm font-medium text-main truncate">{children ?? "—"}</span>
    </div>
);

const FlagChip = ({ on, label }: { on: boolean; label: string }) => (
    <span
        className={`px-2 py-1 rounded-dx text-[11px] font-medium border ${
            on
                ? "bg-focus-500/15 text-focus-300 border-focus-500/30"
                : "bg-main/5 text-main/40 border-main/10"
        }`}
    >
        {label}
    </span>
);

const ItemExpandedBody = ({
    item: i,
    uoms,
    costMethods,
    canCreatePresentation,
    setItemsData,
    packagingLevels,
    productData,
    currencies,
    suppliers,
    platforms,
}: any) => {
    const [isMediaExpanded, setIsMediaExpanded] = useState(false);

    const getUomName = (id: string) => uoms?.find((u: any) => u.id === id)?.name || "—";
    const getCostMethodName = (id: string) => costMethods?.find((c: any) => c.id === id)?.name || id || "—";
    const getCurrencyName = (id: string) => currencies?.find((c: any) => c.id === id)?.name || "—";

    const rawSuppliers = Array.isArray(i.suppliers) ? i.suppliers : [];
    const presentations = Array.isArray(i.presentations) ? i.presentations : [];
    const levelIds = [...new Set(presentations.map((p: any) => p.packagingLevelId).filter(Boolean))];

    const rawPlatforms = i.platformIds || [];
    const platformNames = (Array.isArray(rawPlatforms) ? rawPlatforms : []).map((pId: any) => {
        const id = typeof pId === "object" ? pId.id : pId;
        return platforms?.find((p: any) => p.id === id)?.name || (typeof pId === "object" ? pId.name : id);
    }).filter(Boolean);

    return (
        <div className="p-4 bg-primary-0/20 flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
                <ReadField label="Nombre de Item">{i.itemName || productData?.name || "—"}</ReadField>
                <ReadField label="SKU">{i.sku || "—"}</ReadField>
                <ReadField label="Método de Costo">{getCostMethodName(i.costMethod)}</ReadField>
                <ReadField label="Moneda de Venta">{i.currencyId ? getCurrencyName(i.currencyId) : "—"}</ReadField>
                <ReadField label="Peso">{i.weight ?? 0}</ReadField>
                <ReadField label="Volumen">{i.volume ?? 0}</ReadField>
                <ReadField label="Unidades por Pallet">{i.palletUnits ?? 0}</ReadField>
                <ReadField label="U. Medida Pallet">{getUomName(i.palletUomId)}</ReadField>
                {(i.uomRatio !== undefined && i.uomRatio !== null && i.uomRatio !== "" && Number(i.uomRatio) > 0) ? (
                    <ReadField label="Ratio de Unidad">{i.uomRatio}</ReadField>
                ) : null}
            </div>

            <div className="p-3 bg-primary-0/30 rounded-dx border border-main/10 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-main">Proveedores del Ítem</span>
                    <span className="text-xs text-main/60">{rawSuppliers.length} vinculado(s)</span>
                </div>
                {rawSuppliers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {rawSuppliers.map((s: any, idx: number) => {
                            const sId = s.supplierId || s.supplier_id || s.id;
                            const prov = suppliers?.find((p: any) => p.id === sId);
                            const provName = prov?.name || s.name || sId;
                            const sSku = s.supplierSku || s.supplier_sku;
                            return (
                                <div
                                    key={sId || idx}
                                    className="flex items-center gap-2 bg-main/5 border border-main/15 px-2.5 py-1.5 rounded-lg text-xs text-main"
                                >
                                    <span className="text-[10px] text-main/50 font-mono w-4 shrink-0">{idx + 1}.</span>
                                    <span className="font-semibold">{provName}</span>
                                    {sSku ? (
                                        <span className="bg-focus-500/20 text-focus-300 font-mono px-1.5 py-0.5 rounded text-[11px] border border-focus-500/30">
                                            {sSku}
                                        </span>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-main/40 italic">Sin proveedores vinculados</p>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs text-main/60">Plataformas Comerciales</span>
                <div className="flex flex-wrap gap-1.5">
                    {platformNames.length > 0 ? (
                        platformNames.map((name: string, idx: number) => (
                            <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded bg-main/5 text-main/80 border border-main/10 font-medium"
                            >
                                {name}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-main/40 italic">Sin plataformas asignadas</span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                <div className="flex flex-col gap-1 p-3 rounded-dx border border-main/5">
                    <FlagChip on={!!(i.isDualUom || i.uomRatio)} label="U.Medida Doble" />
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-dx border border-main/5">
                    <FlagChip on={!!i.isInventoryItem} label="Controla Stock" />
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-dx border border-main/5">
                    <FlagChip on={!!i.requiresExpiry} label="Requiere Vencimiento" />
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-dx border border-main/5">
                    <FlagChip on={!!i.isSerializable} label="Es Serializable" />
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-dx border border-main/5">
                    <FlagChip on={!!i.isConsignmentItem} label="Admite Consignación" />
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-dx border border-main/5">
                    <FlagChip on={i.active !== false} label="Activo" />
                </div>
            </div>

            {canCreatePresentation !== false && (
                <div className="px-4 py-3 rounded-dx bg-primary-300 shadow-inner shadow-black/25">
                    <h4 className="text-sm font-semibold text-dx-primary mb-2">
                        Presentaciones ({presentations.length})
                    </h4>
                    {presentations.length > 0 ? (
                        <div className="p-2 bg-main/5 rounded-dx">
                            {levelIds.map((levelId: any) => {
                                const levelName = packagingLevels?.find((pl: any) => pl.id === levelId)?.name || "Desconocido";
                                const levelPresentations = presentations.filter((p: any) => p.packagingLevelId === levelId);
                                return (
                                    <div key={levelId} className="mb-4 last:mb-0">
                                        <h5 className="text-sm font-bold text-dx-primary opacity-80 border-b border-main/10 pb-1 mb-2 px-1">
                                            Nivel: {levelName}
                                        </h5>
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-main/10 text-left text-dx-primary opacity-60">
                                                    <th className="p-1">Nombre</th>
                                                    <th className="p-1">Barras</th>
                                                    <th className="p-1">UoM</th>
                                                    <th className="p-1">Ratio</th>
                                                    <th className="p-1 text-center w-[80px]">Principal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {levelPresentations.map((p: any) => (
                                                    <tr
                                                        key={p.tempId}
                                                        className="border-b border-main/5 last:border-0"
                                                    >
                                                        <td className="p-1">{p.name}</td>
                                                        <td className="p-1">{p.barcode}</td>
                                                        <td className="p-1">{getUomName(p.uomId)}</td>
                                                        <td className="p-1">{p.uomRatio}</td>
                                                        <td className="p-1 text-center">
                                                            {p.isPrimary ? (
                                                                <i className="dx-icon dx-icon-check text-success" />
                                                            ) : (
                                                                <span className="text-main/30">—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-3 bg-main/5 rounded-dx">
                            <p className="text-sm opacity-60">No se han añadido presentaciones</p>
                        </div>
                    )}
                </div>
            )}

            <div className="px-4 py-3 rounded-dx bg-primary-300 shadow-inner shadow-black/25">
                <button
                    type="button"
                    className="w-full flex justify-between items-center text-left"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMediaExpanded((v) => !v);
                    }}
                >
                    <h4 className="text-sm font-semibold text-dx-primary">
                        Imágenes del Ítem ({i.media?.length || 0})
                    </h4>
                    <i className={`dx-icon-chevron${isMediaExpanded ? "up" : "down"} opacity-60`} />
                </button>
                {isMediaExpanded && (
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <ItemMediaUploadSection
                            media={i.media || []}
                            onChange={(newMedia) => {
                                setItemsData((prevData: any[]) =>
                                    prevData.map((item) =>
                                        item.tempId === i.tempId ? { ...item, media: newMedia } : item
                                    )
                                );
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const ItemsCreatedList = (props: IItemsCreatedListProps) => {
    const {
        itemsData,
        uoms,
        costMethods,
        removeItem,
        onEditItem,
        canCreatePresentation,
        setItemsData,
        setIsAddingItem,
        packagingLevels,
        productData,
        currencies,
        suppliers,
        platforms,
    } = props;

    const { isRecoveryMode } = useRecovery();

    const handleDelete = useCallback((item: any) => {
        if (item.media && item.media.length > 0) {
            item.media.forEach((m: ICachedItemMedia) => {
                if (m.previewUrl) URL.revokeObjectURL(m.previewUrl);
            });
        }
        if (itemsData.length === 1) {
            setIsAddingItem(true);
        }
        removeItem(item.tempId);
    }, [itemsData.length, removeItem, setIsAddingItem]);

    const renderItemTitle = useCallback((item: any) => {
        const displayName = item.itemName || productData?.name || "Sin nombre";
        const presentationsCount = Array.isArray(item.presentations) ? item.presentations.length : 0;
        return (
            <div className="flex justify-between items-center w-full gap-2 pr-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {item.media?.[0]?.previewUrl && (
                        <img
                            src={item.media[0].previewUrl}
                            alt=""
                            className="w-5 h-5 object-cover rounded border border-main/10 shrink-0"
                        />
                    )}
                    <span className="font-semibold text-dx-primary truncate">{displayName}</span>
                    <span className="bg-focus-300/10 text-focus-300 px-2 py-0.5 rounded text-xs font-mono shrink-0">
                        {item.sku}
                    </span>
                    {presentationsCount > 0 && (
                        <span className="text-[11px] text-main/50 shrink-0 hidden sm:inline">
                            {presentationsCount} {presentationsCount === 1 ? "pres." : "pres."}
                        </span>
                    )}
                    {item.media && item.media.length > 0 && (
                        <span className="bg-focus-500/15 text-focus-300 px-2 py-0.5 rounded text-xs font-medium shrink-0">
                            {item.media.length} {item.media.length === 1 ? "imagen" : "imágenes"}
                        </span>
                    )}
                </div>
                {!isRecoveryMode && (
                    <div
                        className="flex gap-0.5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <Button
                            icon="edit"
                            type="default"
                            stylingMode="text"
                            hint="Editar ítem"
                            className="!rounded-dx !h-8 !w-8"
                            onClick={() => onEditItem(item.tempId)}
                        />
                        <Button
                            icon="trash"
                            type="danger"
                            stylingMode="text"
                            hint="Eliminar ítem"
                            className="!rounded-dx !h-8 !w-8"
                            onClick={() => handleDelete(item)}
                        />
                    </div>
                )}
            </div>
        );
    }, [productData?.name, isRecoveryMode, onEditItem, handleDelete]);

    const renderItemContent = useCallback((item: any) => (
        <ItemExpandedBody
            item={item}
            uoms={uoms}
            costMethods={costMethods}
            canCreatePresentation={canCreatePresentation}
            setItemsData={setItemsData}
            packagingLevels={packagingLevels}
            productData={productData}
            currencies={currencies}
            suppliers={suppliers}
            platforms={platforms}
        />
    ), [
        uoms,
        costMethods,
        canCreatePresentation,
        setItemsData,
        packagingLevels,
        productData,
        currencies,
        suppliers,
        platforms,
    ]);

    return (
        <div className="mt-2">
            <Accordion
                dataSource={itemsData}
                keyExpr="tempId"
                collapsible={true}
                multiple={true}
                itemTitleRender={renderItemTitle}
                itemRender={renderItemContent}
                className="custom-accordion custom-accordion-preview"
            />
        </div>
    );
};

export default React.memo(ItemsCreatedList);
