'use client';
import { useRecovery } from "@/contexts/RecoveryContext";
import { commonService } from "@/app/services/common.service";
import { RECOVERY_ENTITIES } from "@/app/lib/constants/recoveryWhiteList";
import PERMISSIONS_CONSTANTS from "@/app/lib/constants/permissions.constants";
import { canDo } from "@/app/lib/utils/permission.helper";
import { uomsService } from "@/app/services/product_services/uoms.service";
import { IFListBasicParams } from "@repo/api-contracts/erp";
import { IFUoMCategory } from "@repo/api-contracts/erp";
import { GenericDataGrid, IGenericDataGridColumn } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { createGridStateStorage } from "@/lib/storage/gridStateStorage";
import CustomStore from "devextreme/data/custom_store";
import { CheckBox } from 'devextreme-react/check-box';
import notify from "devextreme/ui/notify";
import { useEffect, useMemo, useRef, useState } from "react";
import UoMModal from "../components/modals/singleAdditions/uomModal";

const { customLoad, customSave } = createGridStateStorage({ gridId: 'uoms-grid' });

const uomTypes = [
    { id: 'reference', name: 'Referencia' },
    { id: 'bigger', name: 'Mayor' },
    { id: 'smaller', name: 'Menor' }
];

const UomsClient = () => {
    const { isRecoveryMode, recoveryVisibility } = useRecovery();
    const { token, permissions, currentCompany, isSuperAdmin, includeInactive } = useAuth();
    const gridRef = useRef<any>(null);
    const [categories, setCategories] = useState<IFUoMCategory[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUoM, setSelectedUoM] = useState<any>(null);
    const [refreshVersion, setRefreshVersion] = useState(0);

    const canModify = useMemo(() => {
        return permissions ? canDo('modify', PERMISSIONS_CONSTANTS.uoms, permissions) : false;
    }, [permissions]);

    // Refetch reactivo cuando cambia el switch de RecoveryMode o RecoveryVisibility
    useEffect(() => {
        setRefreshVersion(prev => prev + 1);
        if (gridRef.current?.instance?.refresh) {
            gridRef.current.instance.refresh();
        } else if (gridRef.current?.refresh) {
            gridRef.current.refresh();
        }
    }, [isRecoveryMode, recoveryVisibility]);

    const dataSource = useMemo(() => {
        return new CustomStore({
            key: 'virtualId',
            load: async (loadOptions) => {
                const searchParams: IFListBasicParams = {
                    limit: loadOptions.take || 20,
                    offset: loadOptions.skip || 0,
                };

                try {
                    const response = await uomsService.getAll(searchParams, token);
                    const itemsWithId = response.items.map((item: any) => ({
                        ...item,
                        virtualId: `${item.id}`
                    }));
                    return {
                        data: itemsWithId,
                        totalCount: response.metadata.totalItems
                    };
                } catch (error: any) {
                    console.error('Error loading uoms:', error);
                    notify(error?.message || 'Error al cargar las uoms', 'error', 3000);
                    return {
                        data: [],
                        totalCount: 0
                    };
                }
            }
        });
    }, [refreshVersion, currentCompany?.id, token, isRecoveryMode, recoveryVisibility]);

    // Cargar categorías de UoM al montar
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await uomsService.getUoMCategories({ offset: 0, limit: 500 }, token);
                setCategories(response.items);
            } catch (error: any) {
                console.error('Error loading UoM categories:', error);
                notify(error?.message || 'Error al cargar las categorías', 'error', 3000);
            }
        };
        loadCategories();
    }, [refreshVersion, currentCompany?.id, token]);

    const handleRowInserted = async (e: any) => {
        try {
            const newData = e.data;
            await uomsService.create(newData, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Unidad de medida creada exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error creating UOM:", error);
            notify(error?.message || "Error al crear la unidad de medida", "error", 3000);
        }
    };

    const handleRowUpdated = async (e: any) => {
        try {
            if (e.key && e.data.id && e.key !== e.data.id) {
                notify("No se puede cambiar el ID de una unidad de medida existente", "error", 3000);
                return;
            }

            const updatedData = { ...e.data };
            await uomsService.update(updatedData, updatedData.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Unidad de medida actualizada exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error updating UOM:", error);
            notify(error?.message || "Error al actualizar la unidad de medida", "error", 3000);
        }
    };

    const handleRowRemoved = async (e: any) => {
        try {
            const data = e.data || e;
            const message = await uomsService.delete(data.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify(message || "Unidad de medida eliminada exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error deleting UOM:", error);
            notify(error?.message || "Error al eliminar la unidad de medida", "error", 3000);
        }
    };

    const handleRestore = async (data: any) => {
        try {
            await commonService.restore(RECOVERY_ENTITIES.UOM.schema, RECOVERY_ENTITIES.UOM.table, data.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Unidad de medida restaurada exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error al restaurar unidad de medida:", error);
            notify(error?.message || "Error al restaurar el registro", "error", 3000);
        }
    };

    const actions = useMemo(() => [
        {
            icon: "edit",
            hint: "Editar",
            onClick: (data: any) => {
                setSelectedUoM(data);
                setIsModalOpen(true);
            },
            visible: (e: any) => !isRecoveryMode && (e.active ?? true) && canModify,
        },
        {
            icon: "trash",
            hint: "Eliminar",
            onClick: (data: any) => handleRowRemoved(data),
            visible: (e: any) => !isRecoveryMode && (e.active ?? true) && canModify,
        },
        {
            icon: "revert",
            hint: "Restaurar",
            onClick: (data: any) => handleRestore(data),
            visible: (e: any) => (isRecoveryMode && isSuperAdmin) || (!isRecoveryMode && !(e.active ?? true) && isSuperAdmin),
        }
    ], [canModify, isSuperAdmin, isRecoveryMode, token]);

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
                dataField: 'name',
                caption: 'Nombre',
                allowSorting: true,
                validationRules: [{ type: 'required', message: 'El nombre es obligatorio' }],
            },
            {
                dataField: 'type',
                caption: 'Tipo',
                allowSorting: true,
                validationRules: [{ type: 'required', message: 'El tipo es obligatorio' }],
                lookup: {
                    dataSource: uomTypes,
                    valueExpr: 'id',
                    displayExpr: 'name'
                }
            },
            {
                dataField: 'categoryName',
                caption: 'Categoría',
                allowSorting: true,
                allowEditing: false,
                calculateDisplayValue: (rowData: any) => rowData.categoryName,
            },
            {
                dataField: 'categoryId',
                caption: 'Categoría',
                allowSorting: true,
                visible: false,
                validationRules: [{ type: 'required', message: 'La categoría es obligatoria' }],
                lookup: {
                    dataSource: categories,
                    valueExpr: 'id',
                    displayExpr: 'name'
                },
                setCellValue: (newData: any, value: any) => {
                    newData.categoryId = value;
                    const category = categories.find(c => c.id === value);
                    if (category) {
                        newData.categoryName = category.name;
                    }
                }
            },
            {
                dataField: 'factor',
                caption: 'Factor',
                allowSorting: true,
                dataType: 'number',
                validationRules: [{ type: 'required', message: 'El factor es obligatorio' }],
            },
            {
                dataField: 'rounding',
                caption: 'Redondeo',
                allowSorting: true,
                dataType: 'number',
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
            },
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
    }, [categories, includeInactive, isRecoveryMode]);

    return (
        <div className="flex flex-col w-full min-w-full h-full rounded-dx font-sans overflow-hidden">
            <div className="w-full h-full flex flex-col gap-2">
                <div className="w-full flex-1 min-h-0">
                    <GenericDataGrid
                            recoveryVisibility={recoveryVisibility}
                        ref={gridRef}
                        gridId="uoms-grid"
                        keyExpr="id"
                        dataSource={dataSource}
                        remoteOperations={true}
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
                        searchPanel={{
                            visible: true,
                            width: 350,
                            placeholder: 'Buscar unidades de medida...',
                            highlightSearchText: true
                        }}
                        selection={{ mode: 'none' }}
                        editing={{
                            allowAdding: isRecoveryMode ? false : canModify,
                            allowUpdating: false,
                            allowDeleting: false,
                            useIcons: true,
                            onAdd: () => {
                                setSelectedUoM(null);
                                setIsModalOpen(true);
                            },
                        }}
                        actions={actions}
                        export={{
                            enabled: true,
                            fileName: 'UnidadesMedida',
                            allowExportSelectedData: true,
                            formats: ['xlsx']
                        }}
                        columnChooser={true}
                        columnFixing={true}
                        summary={{
                            totalItems: [
                                {
                                    column: 'id',
                                    summaryType: 'count',
                                    displayFormat: 'Total: {0} unidades de medida'
                                },
                            ],
                        }}
                        stateStoring={{
                            enabled: true,
                            type: 'custom',
                            storageKey: 'uoms-grid',
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
            </div>
            <UoMModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                }}
                onHidden={() => {
                    setSelectedUoM(null);
                }}
                onSuccess={() => {
                    setRefreshVersion(prev => prev + 1);
                    if (gridRef.current?.instance?.refresh) {
                        gridRef.current.instance.refresh();
                    } else if (gridRef.current?.refresh) {
                        gridRef.current.refresh();
                    }
                }}
                categories={categories}
                initialData={selectedUoM}
            />
        </div>

    );
};

export default UomsClient;
