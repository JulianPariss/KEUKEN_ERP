"use client";

import { useEffect, useState, useCallback } from "react";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { Button } from "@repo/devextreme";
import { useAuth } from "@/contexts/AuthContext";
import { combosService } from "@/app/services/combos.service";
import { IFCombo } from "@repo/api-contracts/erp";

import {
    getProcurementTypeLabel,
    getComboTypeLabel,
    getComboStatusLabel
} from "@/app/lib/constants/combos.constants";

interface ComboDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHidden?: () => void;
    comboId: string | null;
}

export default function ComboDetailModal({
    isOpen,
    onClose,
    onHidden,
    comboId
}: ComboDetailModalProps) {
    const { token, currentCompany } = useAuth();
    const [loading, setLoading] = useState(false);
    const [comboDetail, setComboDetail] = useState<IFCombo | null>(null);
    const [itemsMap, setItemsMap] = useState<Record<string, { label: string }>>({});

    // Carga de datos solo cuando el modal se abre con un comboId válido
    useEffect(() => {
        if (!isOpen || !comboId || !token) {
            return;
        }

        const fetchFull = async () => {
            setLoading(true);
            try {
                const [detail, itemsRes] = await Promise.allSettled([
                    combosService.getFullById(comboId, token, currentCompany?.id),
                    currentCompany?.id
                        ? combosService.getItemOptions(currentCompany.id, { limit: 100 }, token)
                        : Promise.resolve({ items: [], metadata: { totalItems: 0, totalPages: 0, currentPage: 1, limit: 100, offset: 0 } })
                ]);

                if (detail.status === "fulfilled") {
                    setComboDetail(detail.value);
                }
                if (itemsRes.status === "fulfilled" && itemsRes.value?.items) {
                    const map: Record<string, { label: string }> = {};
                    itemsRes.value.items.forEach(i => {
                        map[i.id] = { label: i.label };
                    });
                    setItemsMap(map);
                }
            } catch (err) {
                console.error("Error al obtener detalle del combo:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFull();
    }, [isOpen, comboId, token, currentCompany?.id]);

    // Regla 5 de SKILL.md: Limpieza estricta en onHidden (cuando la animación de cierre ha terminado)
    const handleHidden = useCallback(() => {
        setComboDetail(null);
        setItemsMap({});
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    const compData = comboDetail?.compositionData;

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={comboDetail ? `Estructura del Combo: ${comboDetail.name}` : "Detalle de Composición"}
            width={640}
            height="auto"
            maxHeight="88vh"
            className="custom-popup"
            deferRendering={false}
            onShown={(e) => {
                // Regla 4: Repaint en onShown para recalcular dimensiones de Popup y cabecera
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-5 flex flex-col gap-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-main/60 gap-3">
                        <i className="dx-icon-refresh dx-icon-spin text-3xl text-focus-300" />
                        <p className="text-sm font-medium">Cargando estructura del combo...</p>
                    </div>
                ) : !comboDetail ? (
                    <div className="flex flex-col items-center justify-center py-16 text-main/60 gap-2">
                        <i className="dx-icon-info text-2xl text-main/40" />
                        <p className="text-sm font-medium">No se encontró información del combo.</p>
                    </div>
                ) : (
                    <>
                        {/* Ficha Técnica Cabecera */}
                        <div className="!p-5 !rounded-dx !bg-primary-0/40 !border !border-focus-100/40 !shadow-sm">
                            <div className="mb-4 border-b border-main/10 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div>
                                    <h3 className="text-lg font-bold text-dx-primary mb-1">{comboDetail.name}</h3>
                                    <p className="text-xs opacity-60">Ficha técnica y clasificación comercial del kit.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-focus-300 bg-focus-300/10 px-3 py-1 rounded-full border border-focus-300/20">
                                        {getComboTypeLabel(compData?.comboType)}
                                    </span>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-main/5 border border-main/10">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${comboDetail.active ? "bg-success" : "bg-main/30"}`} />
                                        <span className="text-xs font-semibold text-main">
                                            {getComboStatusLabel(comboDetail.active)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                                <div className="p-3 rounded-dx bg-main/5 border border-main/10">
                                    <span className="text-xs opacity-60 block mb-1">SKU Pack</span>
                                    <span className="font-mono text-dx-primary font-bold text-sm">
                                        {comboDetail.itemSku || comboDetail.skuPrefix || "-"}
                                    </span>
                                </div>
                                <div className="p-3 rounded-dx bg-main/5 border border-main/10">
                                    <span className="text-xs opacity-60 block mb-1">Aprovisionamiento</span>
                                    <span className="text-dx-primary font-bold text-sm">
                                        {getProcurementTypeLabel(comboDetail.procurementType)}
                                    </span>
                                </div>
                                <div className="p-3 rounded-dx bg-main/5 border border-main/10">
                                    <span className="text-xs opacity-60 block mb-1">Unidad de Medida</span>
                                    <span className="text-dx-primary font-bold text-sm">
                                        {comboDetail.uomName || comboDetail.uomId || "-"}
                                    </span>
                                </div>
                                <div className="p-3 rounded-dx bg-main/5 border border-main/10">
                                    <span className="text-xs opacity-60 block mb-1">Categoría</span>
                                    <span className="text-dx-primary font-bold text-sm truncate block" title={comboDetail.categoryName || "-"}>
                                        {comboDetail.categoryName || "-"}
                                    </span>
                                </div>
                                <div className="p-3 rounded-dx bg-main/5 border border-main/10">
                                    <span className="text-xs opacity-60 block mb-1">Marca</span>
                                    <span className="text-dx-primary font-bold text-sm truncate block" title={comboDetail.brandName || "-"}>
                                        {comboDetail.brandName || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Componentes Fijos */}
                        <div className="!p-5 !rounded-dx !bg-primary-0/40 !border !border-focus-100/40 !shadow-sm">
                            <div className="mb-4 border-b border-main/10 pb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-dx-primary mb-1">Componentes Fijos</h3>
                                    <p className="text-xs opacity-60">Artículos incluidos de forma fija en este combo.</p>
                                </div>
                                <span className="text-xs font-semibold text-main/70 bg-main/5 px-3 py-1 rounded-full border border-main/10">
                                    {compData?.fixedComponents?.length || 0} {compData?.fixedComponents?.length === 1 ? "artículo" : "artículos"}
                                </span>
                            </div>

                            {!compData?.fixedComponents || compData.fixedComponents.length === 0 ? (
                                <div className="text-xs text-main/60 py-4 text-center italic bg-main/5 rounded-dx border border-dashed border-main/15">
                                    Este combo no incluye componentes fijos adicionales.
                                </div>
                            ) : (
                                <div className="border border-main/10 rounded-dx overflow-hidden">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-main/5 text-dx-primary font-semibold border-b border-main/10">
                                            <tr>
                                                <th className="p-3 w-12 text-center">#</th>
                                                <th className="p-3">Artículo Componente</th>
                                                <th className="p-3 text-right w-28">Cantidad</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-main/5">
                                            {compData.fixedComponents.map((item, idx) => {
                                                const itemInfo = itemsMap[item.itemId];
                                                return (
                                                    <tr key={item.itemId || idx} className="hover:bg-main/5 transition-colors">
                                                        <td className="p-3 font-mono text-center text-main/50">{idx + 1}</td>
                                                        <td className="p-3">
                                                            <div className="font-semibold text-dx-primary">
                                                                {itemInfo?.label || item.itemId}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            <span className="font-bold text-dx-primary bg-main/5 border border-main/10 px-2.5 py-1 rounded-dx">
                                                                x{item.quantity}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Selección Dinámica (si aplica) */}
                        {compData?.comboType === "DYNAMIC" && compData.dynamicSelection && (
                            <div className="!p-5 !rounded-dx !bg-primary-0/40 !border !border-focus-100/40 !shadow-sm">
                                <div className="mb-4 border-b border-main/10 pb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-dx-primary mb-1">Regla de Selección Dinámica</h3>
                                        <p className="text-xs opacity-60">Regla de personalización y rango de selección permitido para el cliente.</p>
                                    </div>
                                    <span className="text-xs font-semibold text-focus-300 bg-focus-300/10 px-3 py-1 rounded-full border border-focus-300/20">
                                        {compData.dynamicSelection.allowedItemIds.length} opciones
                                    </span>
                                </div>

                                <div className="p-3 rounded-dx bg-main/5 border border-main/10 mb-4">
                                    <p className="text-xs font-semibold text-dx-primary mb-1">Instrucción al Cliente:</p>
                                    <p className="text-xs text-main/80 font-medium">
                                        {compData.dynamicSelection.label}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="p-3 rounded-dx bg-main/5 border border-main/10">
                                        <span className="text-xs opacity-60 block mb-1">Cantidad Mínima Requerida</span>
                                        <span className="text-sm font-bold text-dx-primary">
                                            {compData.dynamicSelection.minQty} {compData.dynamicSelection.minQty === 1 ? "artículo" : "artículos"}
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-dx bg-main/5 border border-main/10">
                                        <span className="text-xs opacity-60 block mb-1">Cantidad Máxima Permitida</span>
                                        <span className="text-sm font-bold text-dx-primary">
                                            {compData.dynamicSelection.maxQty} {compData.dynamicSelection.maxQty === 1 ? "artículo" : "artículos"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-semibold text-dx-primary">
                                        Artículos Elegibles ({compData.dynamicSelection.allowedItemIds.length}):
                                    </span>
                                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2.5 bg-main/5 rounded-dx border border-main/10">
                                        {compData.dynamicSelection.allowedItemIds.map((itemId, i) => {
                                            const itemInfo = itemsMap[itemId];
                                            return (
                                                <span
                                                    key={itemId || i}
                                                    className="px-2.5 py-1 bg-primary-0/80 text-xs text-main rounded-dx font-medium border border-main/10 shadow-sm flex items-center gap-1.5"
                                                >
                                                    <i className="dx-icon-product text-focus-300 text-xs" />
                                                    <span>{itemInfo?.label || itemId}</span>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text="Cerrar"
                    onClick={onClose}
                    stylingMode="text"
                />
            </ToolbarItem>
        </Popup>
    );
}
