'use client';

import PERMISSIONS_CONSTANTS from "@/app/lib/constants/permissions.constants";
import { canDo } from "@/app/lib/utils/permission.helper";
import { itemsService } from "@/app/services/product_services/items.service";
import { productsService } from "@/app/services/product_services/products.service";
import { uomsService } from "@/app/services/product_services/uoms.service";
import { commonService } from "@/app/services/common.service";
import { RECOVERY_ENTITIES } from "@/app/lib/constants/recoveryWhiteList";
import { IFListBasicParams } from "@repo/api-contracts/erp";
import { IFUOM } from "@repo/api-contracts/erp";
import { GenericDataGrid, IGenericDataGridColumn } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { createGridPrinter } from "@/lib/printer/gridPrinter";
import { createGridStateStorage } from "@/lib/storage/gridStateStorage";
import CustomStore from "devextreme/data/custom_store";
import { CheckBox } from 'devextreme-react/check-box';
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import ItemsModal from "../modals/singleAdditions/itemsModal";
import { useRecovery } from "@/contexts/RecoveryContext";
import { ClusterManagerModal } from "@/app/(home)/audiences/components";

const { customLoad, customSave } = createGridStateStorage({ gridId: 'items-grid' });
const { onPrint } = createGridPrinter({ gridId: 'items-grid', title: 'Artículos', printerTemplate: 'grid' });

const costMethods = [
    { id: 'standard', name: 'Estándar' },
    { id: 'fifo', name: 'FIFO' },
    { id: 'average', name: 'Promedio' }
];

export interface ItemsClientProps {
    onSelectionChange?: (selectedItem: any | null) => void;
    selectionMode?: 'single' | 'multiple';
    clearSelectionTrigger?: number;
    productFilter?: string | null;
    onProductFilterChange?: (filterValue: string | null) => void;
    refreshTrigger?: number;
}

const ItemsClient: React.FC<ItemsClientProps> = ({
    onSelectionChange,
    selectionMode = 'multiple',
    clearSelectionTrigger = 0,
    productFilter = null,
    onProductFilterChange,
    refreshTrigger = 0,
}) => {
    const { isRecoveryMode, recoveryVisibility } = useRecovery();
    const router = useRouter();
    const { currentCompany } = useAuth();
    const gridRef = useRef<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [uoms, setUoms] = useState<IFUOM[]>([]);
    const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
    const [isClusterManagerOpen, setIsClusterManagerOpen] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [refreshVersion, setRefreshVersion] = useState(0);

    const { token, permissions, includeInactive, isSuperAdmin } = useAuth();

    // Refetch reactivo cuando cambia el switch de RecoveryMode o RecoveryVisibility
    useEffect(() => {
        setRefreshVersion(prev => prev + 1);
        if (gridRef.current?.instance?.refresh) {
            gridRef.current.instance.refresh();
        } else if (gridRef.current?.refresh) {
            gridRef.current.refresh();
        }
    }, [isRecoveryMode, recoveryVisibility]);

    const handleToolbarPreparing = useCallback((e: any) => {
        if (!isRecoveryMode) {
            e.toolbarOptions.items.unshift({
                location: 'before',
                widget: 'dxButton',
                options: {
                    icon: 'group',
                    text: selectedRowKeys.length > 0 ? `Clúster (${selectedRowKeys.length})` : 'Clúster',
                    hint: selectedRowKeys.length > 0
                        ? `Agrupar ${selectedRowKeys.length} artículos en un clúster`
                        : 'Seleccione artículos para agrupar',
                    type: 'default',
                    stylingMode: 'contained',
                    disabled: selectedRowKeys.length === 0,
                    onClick: () => {
                        setIsClusterManagerOpen(true);
                    }
                }
            });
        }
    }, [isRecoveryMode, selectedRowKeys]);

    const canModify = useMemo((): boolean => {
        return permissions ? canDo('modify', PERMISSIONS_CONSTANTS.modifyItems, permissions) : false;
    }, [permissions]);

    const dataSource = useMemo(() => {
        return new CustomStore({
            key: 'virtualId',
            load: async (loadOptions) => {
                const searchParams: IFListBasicParams = {
                    limit: loadOptions.take || 5000,
                    offset: loadOptions.skip || 0,
                };

                if (!currentCompany?.id) {
                    return {
                        data: [],
                        totalCount: 0
                    };
                }

                try {
                    const response = await itemsService.getAll(currentCompany.id, searchParams, token, includeInactive);
                    const itemsWithId = response.items.map((item: any) => ({
                        ...item,
                        virtualId: `${item.id}`
                    }));
                    return {
                        data: itemsWithId,
                        totalCount: response.metadata.totalItems
                    };
                } catch (error: any) {
                    console.error('Error loading items:', error);
                    const errorMessage = error instanceof Error && error.message ? error.message : 'Error al cargar los items';
                    notify(errorMessage, 'error', 3000);
                    return {
                        data: [],
                        totalCount: 0
                    };
                }
            }
        });
    }, [currentCompany?.id, token, includeInactive, isRecoveryMode, recoveryVisibility, refreshVersion]);

    useEffect(() => {
        if (!currentCompany?.id) return;
        const loadData = async () => {
            try {
                const [productsResponse, uomsResponse] = await Promise.all([
                    productsService.getOptions(currentCompany.id, { limit: 200, offset: 0 }, token),
                    uomsService.getAll({ offset: 0, limit: 500 }, token),
                ]);
                setProducts(productsResponse.items);
                setUoms(uomsResponse.items);
            } catch (error: any) {
                console.error('Error loading dropdown data:', error);
                const errorMessage = error instanceof Error && error.message ? error.message : 'Error al cargar los datos';
                notify(errorMessage, 'error', 3000);
            }
        };
        loadData();
    }, [refreshVersion, currentCompany?.id, token]);

    const handleRowInserted = async (e: any) => {
        try {
            const newData = e.data;
            await itemsService.create(newData, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Item creado exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error creating item:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al crear el item";
            notify(errorMessage, "error", 3000);
        }
    };

    const handleRowUpdated = async (e: any) => {
        try {
            const updatedData = { ...e.data };
            await itemsService.update(updatedData, updatedData.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Item actualizado exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error updating item:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al actualizar el item";
            notify(errorMessage, "error", 3000);
        }
    };

    const handleRowRemoved = async (data: any) => {
        try {
            await itemsService.delete(data.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Item eliminado exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error deleting item:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al eliminar el item";
            notify(errorMessage, "error", 3000);
        }
    };

    const handleRestore = async (data: any) => {
        if (!currentCompany?.id) {
            notify("No hay una empresa activa seleccionada", "error", 3000);
            return;
        }
        try {
            await commonService.restore(RECOVERY_ENTITIES.ITEM.schema, RECOVERY_ENTITIES.ITEM.table, data.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Item restaurado exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error al restaurar item:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al restaurar el registro";
            notify(errorMessage, "error", 3000);
        }
    };

    const columns: IGenericDataGridColumn[] = useMemo(() => {
        const cols: IGenericDataGridColumn[] = [
            {
                dataField: 'id',
                caption: 'ID',
                allowEditing: false,
                visible: false,
                width: 200,
            },
            {
                dataField: 'productName',
                caption: 'Producto',
                allowSorting: true,
                allowEditing: false,
                width: 200,
                minWidth: 150,
            },
            {
                dataField: 'sku',
                caption: 'SKU',
                allowSorting: true,
                width: 150,
                minWidth: 120,
            },
            {
                dataField: 'itemName',
                caption: 'Nombre de item',
                allowSorting: true,
                width: 200,
                minWidth: 150,
            },
            {
                dataField: 'companyId',
                caption: 'Compañía',
                allowSorting: true,
                visible: false,
            },
            {
                dataField: 'costMethod',
                caption: 'Método de Costo',
                allowSorting: true,
                width: 150,
                minWidth: 120,
                lookup: {
                    dataSource: costMethods,
                    valueExpr: 'id',
                    displayExpr: 'name'
                }
            },
            {
                dataField: 'wheight',
                caption: 'Peso',
                allowSorting: true,
                dataType: 'number',
                width: 110,
                minWidth: 90,
            },
            {
                dataField: 'volume',
                caption: 'Volumen',
                allowSorting: true,
                dataType: 'number',
                width: 110,
                minWidth: 90,
            },
            {
                dataField: 'palletUnits',
                caption: 'Unidades por Pallet',
                allowSorting: true,
                dataType: 'number',
                width: 160,
                minWidth: 130,
            },
            {
                dataField: 'palletUomId',
                caption: 'Unidad de Medida de Pallet',
                allowSorting: true,
                width: 180,
                minWidth: 140,
                lookup: {
                    dataSource: uoms,
                    valueExpr: 'id',
                    displayExpr: 'name'
                }
            },
            {
                dataField: 'minDaysToExpiryReception',
                caption: 'Días Mín. Vencimiento Recepción',
                allowSorting: true,
                dataType: 'number',
                width: 200,
                minWidth: 160,
            },
            {
                dataField: 'minDaysToExpiryOrder',
                caption: 'Días Mín. Vencimiento Orden',
                allowSorting: true,
                dataType: 'number',
                width: 190,
                minWidth: 150,
            },
            {
                dataField: 'active',
                caption: 'Activo',
                allowSorting: true,
                width: 90,
                minWidth: 80,
                alignment: 'center',
                visible: includeInactive,
                cellRender: (cellData: any) => (
                    <div className="flex justify-center items-center h-full">
                        <CheckBox value={cellData.value} readOnly />
                    </div>
                )
            },
            {
                dataField: 'isDualUom',
                caption: 'U.Medida Dual',
                allowSorting: true,
                width: 120,
                minWidth: 100,
                alignment: 'center',
                cellRender: (cellData: any) => (
                    <div className="flex justify-center items-center h-full">
                        <CheckBox value={cellData.value} readOnly />
                    </div>
                )
            }
        ];

        if (isRecoveryMode) {
            cols.push(
                {
                    dataField: 'deletedAt',
                    caption: 'Fecha Eliminación',
                    dataType: 'datetime',
                    format: 'dd/MM/yyyy HH:mm',
                    width: 160,
                },
                {
                    dataField: 'deletedByName',
                    caption: 'Eliminado Por',
                    width: 150,
                }
            );
        }

        return cols;
    }, [uoms, includeInactive, isRecoveryMode]);

    const actions = useMemo(() => [
        {
            icon: "eyeopen",
            hint: "Detalle",
            onClick: (data: any) => {
                if (data.productId) {
                    window.open(`/products/productDetail?id=${data.productId}`, '_blank');
                } else {
                    notify("No se encontró el ID del producto", "error", 3000);
                }
            },
            visible: () => true,
        },
        {
            icon: "edit",
            hint: "Editar",
            onClick: (data: any) => {
                setIsEditing(true);
                setSelectedItem(data);
                setIsItemsModalOpen(true);
            },
            visible: (e: any) => !isRecoveryMode && canModify,
        },
        {
            icon: "trash",
            hint: "Eliminar",
            onClick: (data: any) => handleRowRemoved(data),
            visible: (e: any) => !isRecoveryMode && canModify,
        },
        {
            icon: "revert",
            hint: "Restaurar",
            onClick: (data: any) => handleRestore(data),
            visible: (e: any) => isRecoveryMode && isSuperAdmin,
        }
    ], [canModify, isSuperAdmin, isRecoveryMode, token, currentCompany?.id]);

    const singleSelectedRowKeyRef = useRef<any>(null);
    const justSelectedKeyRef = useRef<any>(null);
    const isProgrammaticFilterRef = useRef(false);
    const isProgrammaticClearRef = useRef(false);

    const handleRowClick = (e: any) => {
        if (selectionMode !== 'single' || e.rowType !== 'data') return;
        if (e.column?.type === 'buttons') return;

        // Si la fila acaba de seleccionarse en esta misma acción de puntero, ignorar para no deseleccionarla
        if (justSelectedKeyRef.current !== null && String(justSelectedKeyRef.current) === String(e.key)) {
            justSelectedKeyRef.current = null;
            return;
        }

        if (
            singleSelectedRowKeyRef.current !== null &&
            String(singleSelectedRowKeyRef.current) === String(e.key)
        ) {
            e.component.clearSelection();
            singleSelectedRowKeyRef.current = null;
            justSelectedKeyRef.current = null;
            setSelectedRowKeys([]);
            if (onSelectionChange) {
                onSelectionChange(null);
            }
        }
    };

    const handleSelectionChanged = (e: any) => {
        const keys = e.selectedRowKeys || [];
        setSelectedRowKeys(keys);
        const newKey = keys.length > 0 ? keys[0] : null;
        if (selectionMode === 'single') {
            if (newKey !== null && String(newKey) !== String(singleSelectedRowKeyRef.current)) {
                justSelectedKeyRef.current = newKey;
                setTimeout(() => {
                    justSelectedKeyRef.current = null;
                }, 250);
            }
            singleSelectedRowKeyRef.current = newKey;
        }
        // El clear externo (clearSelectionTrigger) ya sincronizó el padre; no re-notificar
        if (isProgrammaticClearRef.current) {
            isProgrammaticClearRef.current = false;
            return;
        }
        if (onSelectionChange) {
            const item = e.selectedRowsData?.[0] || null;
            onSelectionChange(item);
        }
    };

    // Limpiar selección externa cuando se dispara el trigger (sin notificar al padre)
    useEffect(() => {
        if (clearSelectionTrigger > 0) {
            const gridInstance = gridRef.current?.instance ? gridRef.current.instance() : gridRef.current;
            isProgrammaticClearRef.current = true;
            gridInstance?.clearSelection?.();
            singleSelectedRowKeyRef.current = null;
            justSelectedKeyRef.current = null;
            setSelectedRowKeys([]);
            // Si no había selección, onSelectionChanged puede no dispararse
            setTimeout(() => {
                isProgrammaticClearRef.current = false;
            }, 0);
        }
    }, [clearSelectionTrigger]);

    // Refrescar externamente cuando se dispara refreshTrigger
    useEffect(() => {
        if (refreshTrigger > 0) {
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
        }
    }, [refreshTrigger]);

    // Sincronizar el filtro de Producto programáticamente
    useEffect(() => {
        const gridInstance = gridRef.current?.instance ? gridRef.current.instance() : gridRef.current;
        if (gridInstance?.columnOption) {
            const currentVal = gridInstance.columnOption('productName', 'filterValue');
            const targetVal = productFilter || null;
            if (currentVal !== targetVal) {
                isProgrammaticFilterRef.current = true;
                gridInstance.columnOption('productName', {
                    selectedFilterOperation: 'contains',
                    filterValue: targetVal,
                });
                setTimeout(() => {
                    isProgrammaticFilterRef.current = false;
                }, 100);
            }
        }
    }, [productFilter]);

    // Solo filterRow de Producto (no headerFilter / filterPanel): notifica edición manual al padre
    const handleEditorPreparing = useCallback((e: any) => {
        if (e.parentType !== 'filterRow' || e.dataField !== 'productName') return;
        const standardHandler = e.editorOptions?.onValueChanged;
        e.editorOptions = {
            ...e.editorOptions,
            onValueChanged: (args: any) => {
                standardHandler?.(args);
                // args.event definido = interacción de usuario; ausente en cambios programáticos
                if (!isProgrammaticFilterRef.current && args.event !== undefined) {
                    onProductFilterChange?.(args.value ? String(args.value) : null);
                }
            }
        };
    }, [onProductFilterChange]);

    return (
        <div className="flex flex-col w-full min-w-full h-full bg-dx-primary/10 rounded-dx font-sans overflow-hidden">
            <div className="w-full h-full flex flex-col gap-2">
                <GenericDataGrid
                            recoveryVisibility={recoveryVisibility}
                    ref={gridRef}
                    gridId="items-grid"
                    keyExpr="virtualId"
                    dataSource={dataSource}
                    remoteOperations={false}
                    columns={columns}
                    columnDefaults={{ allowFiltering: true, allowHeaderFiltering: true, minWidth: 110 }}
                    allowColumnReordering={true}
                    allowColumnResizing={true}
                    showBorders={true}
                    rowAlternationEnabled={true}
                    hoverStateEnabled={true}
                    paging={{ enabled: true, pageSize: 20, pageSizes: [10, 20, 50, 100] }}
                    sorting={{ mode: 'multiple' }}
                    filterRow={true}
                    headerFilter={true}
                    filterPanel={true}
                    grouping={{ autoExpandAll: false, contextMenuEnabled: true }}
                    groupPanel={true}
                    searchPanel={{
                        visible: true,
                        width: 350,
                        placeholder: 'Buscar items...',
                        highlightSearchText: true
                    }}
                    selection={selectionMode === 'single'
                        ? { mode: 'single' }
                        : {
                            mode: 'multiple',
                            selectAllMode: 'page',
                            showCheckBoxesMode: 'always'
                        }
                    }
                    onRowClick={handleRowClick}
                    onSelectionChanged={handleSelectionChanged}
                    onEditorPreparing={handleEditorPreparing}
                    onToolbarPreparing={handleToolbarPreparing}
                    print={{
                        enabled: true,
                        onPrint
                    }}
                    editing={{
                        allowAdding: isRecoveryMode ? false : canModify,
                        allowUpdating: false,
                        allowDeleting: false,
                        allowDetail: false,
                        useIcons: true,
                        onAdd: () => {
                            setIsEditing(false);
                            setIsItemsModalOpen(true);
                        }
                    }}
                    actions={actions}
                    export={{
                        enabled: true,
                        fileName: 'Items',
                        allowExportSelectedData: true,
                        formats: ['xlsx']
                    }}
                    columnChooser={true}
                    columnFixing={true}
                    stateStoring={{
                        enabled: true,
                        type: 'custom',
                        storageKey: 'items-grid',
                        savingTimeout: 1000,
                        customLoad,
                        customSave,
                    }}
                    scrolling={{ mode: 'standard' }}
                    onRowRemoved={handleRowRemoved}
                    onRowInserted={handleRowInserted}
                    onRowUpdated={handleRowUpdated}
                />
            </div>
            <ItemsModal
                isOpen={isItemsModalOpen}
                onClose={() => {
                    setIsItemsModalOpen(false);
                }}
                onHidden={() => {
                    setSelectedItem(null);
                }}
                onSuccess={() => {
                    setRefreshVersion(prev => prev + 1);
                    if (gridRef.current?.instance?.refresh) {
                        gridRef.current.instance.refresh();
                    } else if (gridRef.current?.refresh) {
                        gridRef.current.refresh();
                    }
                }}
                uoms={uoms}
                products={products}
                initialData={selectedItem}
                isEditing={isEditing}
            />
            <ClusterManagerModal
                isOpen={isClusterManagerOpen}
                onClose={() => setIsClusterManagerOpen(false)}
                selectedIds={selectedRowKeys}
                entityType="item"
                existingClusterOnly={true}
                onSuccess={() => {
                    if (gridRef.current?.clearSelection) {
                        gridRef.current.clearSelection();
                    } else if (gridRef.current?.instance?.()?.clearSelection) {
                        gridRef.current.instance().clearSelection();
                    }
                    setSelectedRowKeys([]);
                }}
            />
        </div>
    );
};

export default ItemsClient;
