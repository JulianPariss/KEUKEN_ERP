'use client';
import { useRecovery } from "@/contexts/RecoveryContext";
import { commonService } from "@/app/services/common.service";
import { RECOVERY_ENTITIES } from "@/app/lib/constants/recoveryWhiteList";

import PERMISSIONS_CONSTANTS from "@/app/lib/constants/permissions.constants";
import { canDo } from "@/app/lib/utils/permission.helper";
import { itemsService } from "@/app/services/product_services/items.service";
import { presentationsService } from "@/app/services/product_services/presentations.service";
import { uomsService } from "@/app/services/product_services/uoms.service";
import { IFListBasicParams } from "@repo/api-contracts/erp";
import { IFUOM } from "@repo/api-contracts/erp";
import { IFPackagingLevel } from "@repo/api-contracts/erp";
import { packagingLevelService } from "@/app/services/product_services/packagingLevel.service";
import { GenericDataGrid, IGenericDataGridColumn } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { createGridStateStorage } from "@/lib/storage/gridStateStorage";
import CustomStore from "devextreme/data/custom_store";
import { CheckBox } from 'devextreme-react/check-box';
import notify from "devextreme/ui/notify";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import PresentationsModal from "../modals/singleAdditions/presentationsModal";


const { customLoad, customSave } = createGridStateStorage({ gridId: 'presentations-grid' });

const PresentationsClient = () => {
    const { isRecoveryMode, recoveryVisibility } = useRecovery();
    const [packagingLevels, setPackagingLevels] = useState<IFPackagingLevel[]>([]);
    const router = useRouter();
    const { currentCompany } = useAuth();
    const gridRef = useRef<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [uoms, setUoms] = useState<IFUOM[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPresentation, setSelectedPresentation] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [refreshVersion, setRefreshVersion] = useState(0);

    const { token, permissions, includeInactive, isSuperAdmin } = useAuth();

    // Refetch reactivo cuando cambia el switch de RecoveryMode o RecoveryVisibility
    useEffect(() => {
        setRefreshVersion(prev => prev + 1);
        if (typeof gridRef.current?.instance?.refresh === 'function') {
            gridRef.current.instance.refresh();
        } else if (typeof gridRef.current?.refresh === 'function') {
            gridRef.current.refresh();
        }
    }, [isRecoveryMode, recoveryVisibility]);

    const canModify = useMemo((): boolean => {
        return permissions ? canDo('modify', PERMISSIONS_CONSTANTS.modifyPresentations, permissions) : false;
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
                    const response = await presentationsService.getAll(currentCompany.id, searchParams, token, includeInactive);
                    const itemsWithId = response.items.map((item: any) => ({
                        ...item,
                        virtualId: `${item.id}`
                    }));
                    return {
                        data: itemsWithId,
                        totalCount: response.metadata.totalItems
                    };
                } catch (error) {
                    console.error('Error loading products:', error);
                    notify('Error al cargar los productos', 'error', 3000);
                    return {
                        data: [],
                        totalCount: 0
                    };
                }
            }
        });
    }, [currentCompany?.id, token, includeInactive, isRecoveryMode, recoveryVisibility, refreshVersion]);

    useEffect(() => {
        if (!token || !currentCompany?.id) return;
        const loadData = async () => {
            try {
                const [itemsResponse, uomsResponse, plResponse] = await Promise.all([
                    itemsService.getOptions(currentCompany.id, { limit: 200, offset: 0 }, token),
                    uomsService.getAll({ offset: 0, limit: 500 }, token),
                    packagingLevelService.getAll(token)
                ]);
                setItems(itemsResponse.items);
                setUoms(uomsResponse.items);
                setPackagingLevels(plResponse);
            } catch (error) {
                console.error('Error loading dropdown data:', error);
                notify('Error al cargar los datos', 'error', 3000);
            }
        };
        loadData();
    }, [refreshVersion, currentCompany?.id, token]);

    const handleRowInserted = async (e: any) => {
        try {
            const newData = e.data;
            await presentationsService.create(newData, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Presentación creada exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error creating presentation:", error);
            notify(error?.message || "Error al crear la presentación", "error", 3000);
        }
    };

    const handleRowUpdated = async (e: any) => {
        try {
            const updatedData = { ...e.data };
            await presentationsService.update(updatedData, updatedData.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Presentación actualizada exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error updating presentation:", error);
            notify(error?.message || "Error al actualizar la presentación", "error", 3000);
        }
    };

    const handleRowRemoved = async (data: any) => {
        try {
            await presentationsService.delete(data.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Presentación eliminada exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error deleting presentation:", error);
            notify(error?.message || "Error al eliminar la presentación", "error", 3000);
        }
    };

    const handleRestore = async (data: any) => {
        if (!currentCompany?.id) {
            notify("No hay una empresa activa seleccionada", "error", 3000);
            return;
        }
        try {
            await commonService.restore(RECOVERY_ENTITIES.ITEM_PRESENTATION.schema, RECOVERY_ENTITIES.ITEM_PRESENTATION.table, data.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Presentación restaurada exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error al restaurar la presentación:", error);
            notify(error?.message || "Error al restaurar el registro", "error", 3000);
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
                calculateDisplayValue: (rowData: any) => rowData.productName,
            },
            {
                dataField: 'itemSku',
                caption: 'Item SKU',
                allowSorting: true,
                allowEditing: false,
                calculateDisplayValue: (rowData: any) => rowData.itemSku,
            },
            {
                dataField: 'name',
                caption: 'Nombre',
                allowSorting: true,
                validationRules: [{ type: 'required', message: 'El nombre es obligatorio' }],
            },
            {
                dataField: 'barcode',
                caption: 'Código de Barras',
                allowSorting: true,
                validationRules: [{ type: 'required', message: 'El código de barras es obligatorio' }],
            },
            {
                dataField: 'uomName',
                caption: 'Unidad de Medida',
                allowSorting: true,
                allowEditing: false,
                calculateDisplayValue: (rowData: any) => rowData.uomName,
            },
            {
                dataField: 'uomId',
                caption: 'UoM',
                allowSorting: true,
                visible: false,
                validationRules: [{ type: 'required', message: 'La unidad de medida es obligatoria' }],
                lookup: {
                    dataSource: uoms,
                    valueExpr: 'id',
                    displayExpr: 'name'
                },
                setCellValue: (newData: any, value: any) => {
                    newData.uomId = value;
                    const uom = uoms.find((u: IFUOM) => u.id === value);
                    if (uom) {
                        newData.uomName = uom.name;
                    }
                }
            },
            {
                dataField: 'uomRatio',
                caption: 'Relación de Unidad de Medida',
                allowSorting: true,
                dataType: 'number',
                validationRules: [{ type: 'required', message: 'La relación de unidad de medida es obligatoria' }],
            },
            {
                dataField: 'packagingLevelId',
                caption: 'Nivel Empaque',
                allowSorting: true,
                visible: true,
                validationRules: [{ type: 'required', message: 'El nivel de empaque es obligatorio' }],
                lookup: {
                    dataSource: packagingLevels,
                    valueExpr: 'id',
                    displayExpr: 'name'
                },
                setCellValue: (newData: any, value: any) => {
                    newData.packagingLevelId = value;
                    const pl = packagingLevels.find((p: IFPackagingLevel) => p.id === value);
                    if (pl) {
                        newData.packagingLevelName = pl.name;
                        newData.packagingLevelCode = pl.code;
                    }
                }
            },
            {
                dataField: 'active',
                caption: 'Activo',
                allowSorting: true,
                width: 80,
                alignment: 'center',
                visible: includeInactive,
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
    }, [items, uoms, packagingLevels, includeInactive, isRecoveryMode]);

    const actions = useMemo(() => [
        {
            icon: "eyeopen",
            hint: "Detalle",
            onClick: (data: any) => {
                const item = items.find(i => i.id === data.itemId);
                const productId = item?.meta?.productId;
                if (productId) {
                    window.open(`/products/productDetail?id=${productId}`, '_blank');
                } else {
                    notify("No se encontró el producto asociado a esta presentación", "error", 3000);
                }
            },
            visible: () => true,
        },
        {
            icon: "edit",
            hint: "Editar",
            onClick: (data: any) => {
                setIsEditing(true);
                setSelectedPresentation(data);
                setIsModalOpen(true);
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
    ], [canModify, items, isSuperAdmin, isRecoveryMode, token, currentCompany?.id]);

    return (
        <div className="flex flex-col w-full min-w-full h-full bg-dx-primary/10 rounded-dx font-sans overflow-hidden">
            <div className="w-full h-full flex flex-col gap-2">
                <GenericDataGrid
                            recoveryVisibility={recoveryVisibility}
                    ref={gridRef}
                    gridId="presentations-grid"
                    keyExpr="virtualId"
                    dataSource={dataSource}
                    remoteOperations={false}
                    columns={columns}
                    columnDefaults={{ allowFiltering: true, allowHeaderFiltering: true }}
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
                    selection={{ mode: 'none' }}
                    searchPanel={{
                        visible: true,
                        width: 350,
                        placeholder: 'Buscar presentaciones...',
                        highlightSearchText: true
                    }}
                    editing={{
                        allowAdding: isRecoveryMode ? false : canModify,
                        allowUpdating: false,
                        allowDeleting: false,
                        allowDetail: false,
                        useIcons: true,
                        onAdd: () => {
                            setIsEditing(false);
                            setSelectedPresentation(null);
                            setIsModalOpen(true);
                        }
                    }}
                    actions={actions}
                    export={{
                        enabled: true,
                        fileName: 'Presentaciones',
                        allowExportSelectedData: true,
                        formats: ['xlsx']
                    }}
                    columnChooser={true}
                    columnFixing={true}
                    stateStoring={{
                        enabled: true,
                        type: 'custom',
                        storageKey: 'presentations-grid',
                        savingTimeout: 1000,
                        customLoad,
                        customSave,
                    }}
                    scrolling={{ mode: 'standard' }}
                    onRowInserted={handleRowInserted}
                    onRowUpdated={handleRowUpdated}
                    onRowRemoved={handleRowRemoved}
                />
            </div>
            <PresentationsModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedPresentation(null);
                }}
                onSuccess={() => {
                    setRefreshVersion(prev => prev + 1);
                    if (gridRef.current?.instance?.refresh) {
                        gridRef.current.instance.refresh();
                    } else if (gridRef.current?.refresh) {
                        gridRef.current.refresh();
                    }
                }}
                items={items}
                uoms={uoms}
                packagingLevels={packagingLevels}
                initialData={selectedPresentation}
                isEditing={isEditing}
            />
        </div>
    );
};

export default PresentationsClient;
