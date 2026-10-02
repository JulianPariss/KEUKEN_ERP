import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { IFPriceListCatalogItem, IFPriceListBulkUpdateItem } from "@repo/api-contracts/erp";
import { priceListsService } from "@/app/services/priceLists/priceLists.service";
import notify from "devextreme/ui/notify";

interface UseEditModeProps {
    isEditingMode: boolean;
    setIsEditingMode: React.Dispatch<React.SetStateAction<boolean>>;
    gridRef: React.MutableRefObject<any>;
    gridDataSource: IFPriceListCatalogItem[];
    setPriceListItems: React.Dispatch<React.SetStateAction<IFPriceListCatalogItem[]>>;
    canModify: boolean;
    token: string;
    selectedPriceListId: string | null;
    onSaveSuccess: () => Promise<void>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    modifiedPages?: number[];
    pageIndex?: number;
    setPageIndex?: (pageIndex: number) => void;
}

export const useEditMode = ({
    isEditingMode,
    setIsEditingMode,
    gridRef,
    gridDataSource,
    setPriceListItems,
    canModify,
    token,
    selectedPriceListId,
    onSaveSuccess,
    setIsLoading,
    modifiedPages = [],
    pageIndex = 0,
    setPageIndex
}: UseEditModeProps) => {
    const [modifiedRowKeys, setModifiedRowKeys] = useState<string[]>([]);
    const editChangesRef = useRef<any[]>([]);

    const editingOptions = useMemo(() => ({
        mode: (isEditingMode ? 'batch' : 'row') as 'batch' | 'row',
        allowAdding: false,
        allowUpdating: isEditingMode && canModify,
        allowDeleting: false,
    }), [isEditingMode, canModify]);

    const handleRevertRow = useCallback((key: string) => {
        const grid = gridRef.current?.instance();
        if (grid) {
            const changes = grid.option("editing.changes") || [];
            const newChanges = changes.filter((c: any) => c.key !== key);
            editChangesRef.current = newChanges;
            grid.option("editing.changes", newChanges);
        }
    }, [gridRef]);

    const handleSaving = useCallback(async (e: any) => {
        e.cancel = true;
        const changes = e.changes;

        if (!selectedPriceListId || !token) {
            notify("No se ha seleccionado una lista de precios válida o no hay sesión iniciada", "error", 3000);
            return;
        }

        if (changes && changes.length > 0) {
            const updates: IFPriceListBulkUpdateItem[] = [];
            const deletes: string[] = [];

            const roundToTwo = (val: any) => {
                if (typeof val === 'number') {
                    return Math.round((val + Number.EPSILON) * 100) / 100;
                }
                return val;
            };

            changes.forEach((change: any) => {
                const grid = gridRef.current?.instance();
                const visibleRows = grid ? grid.getVisibleRows() : [];
                let row = visibleRows.find((r: any) => r.key === change.key);
                let originalItem = row?.data;
                if (!originalItem && grid) {
                    const dsItems = grid.getDataSource()?.items() || [];
                    originalItem = dsItems.find((item: any) => item.itemId === change.key);
                }
                if (!originalItem) return;

                if (change.type === 'update') {
                    const updateItem: IFPriceListBulkUpdateItem = {
                        id: originalItem.id,
                    };
                    if (change.data.price !== undefined) {
                        updateItem.priceTarget = roundToTwo(change.data.price);
                    }
                    if (change.data.marginOverCostPct !== undefined) {
                        updateItem.marginOverCost = roundToTwo(change.data.marginOverCostPct);
                    }
                    if (change.data.maxDiscountPct !== undefined) {
                        updateItem.maxDiscountPct = roundToTwo(change.data.maxDiscountPct);
                    }
                    if (change.data.minQuantity !== undefined) {
                        updateItem.minQuantity = roundToTwo(change.data.minQuantity);
                    }
                    if (change.data.maxQuantity !== undefined) {
                        updateItem.maxQuantity = change.data.maxQuantity !== null ? roundToTwo(change.data.maxQuantity) : null;
                    }
                    if (change.data.base !== undefined) {
                        updateItem.base = change.data.base;
                    }
                    if (change.data.breakpointPackagingLevelId !== undefined) {
                        updateItem.breakpointPackagingLevelId = change.data.breakpointPackagingLevelId;
                    }
                    if (change.data.breakpointPackagingLevelCode !== undefined) {
                        updateItem.breakpointPackagingLevelCode = change.data.breakpointPackagingLevelCode;
                    }
                    if (change.data.breakpointPresentationId !== undefined) {
                        updateItem.breakpointPresentationId = change.data.breakpointPresentationId;
                    }
                    updates.push(updateItem);
                } else if (change.type === 'remove') {
                    if (originalItem.id) {
                        deletes.push(originalItem.id);
                    }
                }
            });

            if (updates.length > 0 || deletes.length > 0) {
                setIsLoading(true);
                try {
                    if (updates.length > 0) {
                        await priceListsService.bulkUpdate({
                            pricelistId: selectedPriceListId,
                            recalculate: true,
                            updates,
                            deletes: []
                        }, token);
                    }

                    if (deletes.length > 0) {
                        for (const ruleId of deletes) {
                            await priceListsService.removeRule(ruleId, token);
                        }
                    }

                    notify("Cambios aplicados con éxito", "success", 3000);

                    await onSaveSuccess();

                    e.component.cancelEditData();
                    setIsEditingMode(false);
                    setModifiedRowKeys([]);
                } catch (error: any) {
                    console.error("Error saving changes:", error);
                    notify(error.message || "Error al aplicar los cambios en el servidor", "error", 4000);
                } finally {
                    setIsLoading(false);
                }
            } else {
                e.component.cancelEditData();
                setIsEditingMode(false);
                setModifiedRowKeys([]);
            }
        } else {
            e.component.cancelEditData();
            setIsEditingMode(false);
            setModifiedRowKeys([]);
        }
    }, [selectedPriceListId, token, onSaveSuccess, setIsLoading, setIsEditingMode, gridRef]);

    const handleOptionChanged = useCallback((e: any) => {
        if (e.name === 'editing') {
            const changes = e.component.option("editing.changes") || [];
            editChangesRef.current = changes;

            const keys = changes.map((c: any) => c.key);
            setModifiedRowKeys(prevKeys => {
                if (prevKeys.length !== keys.length) return keys;
                const hasDifference = prevKeys.some((k, i) => k !== keys[i]);
                return hasDifference ? keys : prevKeys;
            });
        }
    }, []);

    const handleToolbarPreparing = useCallback((e: any) => {
        if (!canModify) return;

        if (!isEditingMode) {
            e.toolbarOptions.items.unshift({
                location: 'before',
                widget: 'dxButton',
                options: {
                    text: 'Recalcular',
                    icon: 'refresh',
                    type: 'normal',
                    stylingMode: 'outlined',
                    elementAttr: { class: '!rounded-dx font-bold shadow-md shadow-black/20 hover:bg-main/5 text-main/80' },
                    onClick: async (eBtn: any) => {
                        if (!selectedPriceListId || !token) return;

                        const grid = gridRef.current?.instance();
                        eBtn.component.option('disabled', true);
                        grid?.beginCustomLoading('Recalculando lista...');

                        try {
                            const res = await priceListsService.recalculate(selectedPriceListId, token);
                            notify(`${res.message}. Ítems recalculados: ${res.items_recalculated}`, 'success', 4000);
                            await onSaveSuccess?.();
                        } catch (err: any) {
                            notify(err.message || "Error al recalcular la lista", "error", 4000);
                        } finally {
                            eBtn.component.option('disabled', false);
                            grid?.endCustomLoading();
                        }
                    }
                }
            });

            e.toolbarOptions.items.unshift({
                location: 'before',
                widget: 'dxButton',
                options: {
                    text: 'Modo Edición',
                    icon: 'edit',
                    type: 'default',
                    stylingMode: 'contained',
                    elementAttr: { class: '!text-variant [&_.dx-icon]:!text-variant !rounded-dx font-bold shadow-md shadow-black/20' },
                    onClick: () => {
                        setIsEditingMode(true);
                    }
                }
            });
        } else {
            if (modifiedPages.length > 0) {
                e.toolbarOptions.items.unshift({
                    location: 'before',
                    template: () => {
                        const container = document.createElement('div');
                        container.className = "flex items-center gap-1.5 bg-focus-500/5 px-2.5 py-1 rounded-dx border border-focus-500/20 w-max shrink-0 whitespace-nowrap mr-2";

                        const span = document.createElement('span');
                        span.className = "text-xs font-semibold text-main/60 shrink-0";
                        span.textContent = "Cambios en:";
                        container.appendChild(span);

                        modifiedPages.forEach(page => {
                            const btn = document.createElement('button');
                            btn.textContent = `Pág. ${page}`;
                            btn.className = `px-2 py-0.5 rounded text-xs font-bold shrink-0 transition-all ${pageIndex === page - 1
                                ? 'bg-focus-500 text-variant shadow-sm'
                                : 'bg-main/5 text-main/80 hover:bg-main/10'
                                }`;
                            btn.addEventListener('click', () => {
                                setPageIndex?.(page - 1);
                            });
                            container.appendChild(btn);
                        });

                        return container;
                    }
                });
            }
            e.toolbarOptions.items.unshift({
                location: 'before',
                widget: 'dxButton',
                options: {
                    text: 'Cancelar',
                    icon: 'close',
                    type: 'normal',
                    stylingMode: 'outlined',
                    elementAttr: { class: '!rounded-dx font-medium' },
                    onClick: () => {
                        gridRef.current?.instance().cancelEditData();
                        setIsEditingMode(false);
                        setModifiedRowKeys([]);
                    }
                }
            });
            e.toolbarOptions.items.unshift({
                location: 'before',
                widget: 'dxButton',
                options: {
                    text: 'Confirmar',
                    icon: 'check',
                    type: 'success',
                    stylingMode: 'contained',
                    elementAttr: { class: '!bg-focus-300 !text-variant [&_.dx-icon]:!text-variant !rounded-dx font-bold shadow-md shadow-black/20' },
                    onClick: () => {
                        const grid = gridRef.current?.instance();
                        if (grid && grid.hasEditData()) {
                            grid.saveEditData();
                        } else {
                            setIsEditingMode(false);
                            setModifiedRowKeys([]);
                        }
                    }
                }
            });
        }
    }, [canModify, isEditingMode, gridRef, modifiedPages, pageIndex, setPageIndex]);

    return {
        modifiedRowKeys,
        editChangesRef,
        editingOptions,
        handleRevertRow,
        handleSaving,
        handleOptionChanged,
        handleToolbarPreparing
    };
};
