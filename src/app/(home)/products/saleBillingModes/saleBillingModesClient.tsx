'use client';
import { useRecovery } from "@/contexts/RecoveryContext";
import { commonService } from "@/app/services/common.service";
import { RECOVERY_ENTITIES } from "@/app/lib/constants/recoveryWhiteList";

import PERMISSIONS_CONSTANTS from "@/app/lib/constants/permissions.constants";
import { canDo } from "@/app/lib/utils/permission.helper";
import { saleBillingModesService } from "@/app/services/product_services/saleBillingModes.service";
import { uomsService } from "@/app/services/product_services/uoms.service";

import { IFUoMCategory } from "@repo/api-contracts/erp";
import { GenericDataGrid, IGenericDataGridColumn } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { createGridStateStorage } from "@/lib/storage/gridStateStorage";
import CustomStore from "devextreme/data/custom_store";
import { CheckBox } from 'devextreme-react/check-box';
import notify from "devextreme/ui/notify";
import { useEffect, useMemo, useRef, useState } from "react";
import SaleBillingModesModal from "../components/modals/singleAdditions/saleBillingModesModal";

const { customLoad, customSave } = createGridStateStorage({ gridId: 'sale-billing-modes-grid' });

const SaleBillingModesClient = () => {
    const { isRecoveryMode, recoveryVisibility } = useRecovery();
    const { token, permissions, loading, currentCompany, isSuperAdmin } = useAuth();
    const gridRef = useRef<any>(null);
    const [categories, setCategories] = useState<IFUoMCategory[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMode, setSelectedMode] = useState<any>(null);
    const [refreshVersion, setRefreshVersion] = useState(0);

    const canView = useMemo(() => {
        return permissions ? canDo('view', ['saleBillingModes'], permissions) : false;
    }, [permissions]);

    const canModify = useMemo(() => {
        if (isSuperAdmin) return true;
        return permissions ? canDo('modify', PERMISSIONS_CONSTANTS.modifySaleBillingModes, permissions) : false;
    }, [permissions, isSuperAdmin]);

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
            key: 'id',
            load: async () => {
                try {
                    const response = await saleBillingModesService.getAll(token, currentCompany?.id);
                    return response;
                } catch (error: any) {
                    console.error('Error loading sale billing modes:', error);
                    const errorMessage = error instanceof Error && error.message ? error.message : 'Error al cargar los modos de venta';
                    notify(errorMessage, 'error', 3000);
                    return [];
                }
            }
        });
    }, [refreshVersion, token, currentCompany?.id, isRecoveryMode, recoveryVisibility]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await uomsService.getUoMCategories({ offset: 0, limit: 500 }, token);
                setCategories(response.items);
            } catch (error: any) {
                console.error('Error loading UoM categories:', error);
                const errorMessage = error instanceof Error && error.message ? error.message : 'Error al cargar las categorías de UoM';
                notify(errorMessage, 'error', 3000);
            }
        };
        loadCategories();
    }, [token, currentCompany?.id]);

    const handleRowInserted = async (e: any) => {
        try {
            await saleBillingModesService.create(e.data, token, currentCompany?.id);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Modo de venta creado exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error creating sale billing mode:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al crear el modo de venta";
            notify(errorMessage, "error", 3000);
        }
    };

    const handleRowUpdated = async (e: any) => {
        try {
            const updatedData = { ...e.data };
            await saleBillingModesService.update(updatedData, updatedData.id, token, currentCompany?.id);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Modo de venta actualizado exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error updating sale billing mode:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al actualizar el modo de venta";
            notify(errorMessage, "error", 3000);
        }
    };

    const handleRowRemoved = async (e: any) => {
        try {
            const data = e.data || e;
            const message = await saleBillingModesService.delete(data.id, token, currentCompany?.id);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify(message || "Modo de venta eliminado exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error deleting sale billing mode:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al eliminar el modo de venta";
            notify(errorMessage, "error", 3000);
        }
    };

    const handleRestore = async (data: any) => {
        try {
            await commonService.restore(RECOVERY_ENTITIES.SALE_BILLING_MODE.schema, RECOVERY_ENTITIES.SALE_BILLING_MODE.table, data.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Modo de venta restaurado exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error al restaurar modo de venta:", error);
            notify(error?.message || "Error al restaurar el registro", "error", 3000);
        }
    };

    const actions = useMemo(() => [
        {
            icon: "edit",
            hint: "Editar",
            onClick: (data: any) => {
                setSelectedMode(data);
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
    ], [canModify, isSuperAdmin, isRecoveryMode, token]);

    const columns: IGenericDataGridColumn[] = useMemo(() => {
        const cols: IGenericDataGridColumn[] = [
            {
                dataField: 'id',
                caption: 'ID',
                allowEditing: false,
                visible: false,
            },
            {
                dataField: 'code',
                caption: 'Código',
                allowSorting: true,
                width: 150,
                validationRules: [{ type: 'required', message: 'El código es obligatorio' }],
            },
            {
                dataField: 'name',
                caption: 'Nombre',
                allowSorting: true,
                validationRules: [{ type: 'required', message: 'El nombre es obligatorio' }],
            },
            {
                dataField: 'description',
                caption: 'Descripción',
                allowSorting: true,
            },
            {
                dataField: 'billingUomCategoryName',
                caption: 'Categoría de Facturación',
                allowSorting: true,
                allowEditing: false,
                calculateDisplayValue: (rowData: any) => rowData.billingUomCategoryName,
            },
            {
                dataField: 'isDualUom',
                caption: 'U. Medida Doble',
                allowSorting: true,
                width: 100,
                alignment: 'center',
                cellRender: (cellData: any) => (
                    <div className="flex justify-center items-center h-full">
                        <CheckBox value={cellData.value} readOnly />
                    </div>
                )
            },
            {
                dataField: 'requiresSecondaryUom',
                caption: 'Req. U. Medida secundaria',
                allowSorting: true,
                width: 100,
                alignment: 'center',
                cellRender: (cellData: any) => (
                    <div className="flex justify-center items-center h-full">
                        <CheckBox value={cellData.value} readOnly />
                    </div>
                )
            },
            {
                dataField: 'active',
                caption: 'Activo',
                width: 100,
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
    }, [isRecoveryMode]);

    if (loading) {
        return null;
    }

    if (permissions && !canView) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full gap-y-5">
                <i className="dx-icon-eyeclose !text-[200px] !text-focus-500/20" />
                <p className="text-2xl font-bold text-main/60">No tienes permiso para acceder a esta página</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-w-full h-full rounded-dx font-sans overflow-hidden">
            <div className="w-full h-full flex flex-col">
                <div className="w-full flex-1 min-h-0">
                    <GenericDataGrid
                            recoveryVisibility={recoveryVisibility}
                        ref={gridRef}
                        gridId="sale-billing-modes-grid"
                        keyExpr="id"
                        dataSource={dataSource}
                        remoteOperations={false}
                        columns={columns}
                        actions={actions}
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
                            placeholder: 'Buscar modos de venta...',
                            highlightSearchText: true
                        }}
                        editing={{
                            allowAdding: isRecoveryMode ? false : canModify,
                            allowUpdating: false,
                            allowDeleting: false,
                            useIcons: true,
                            onAdd: () => {
                                setSelectedMode(null);
                                setIsModalOpen(true);
                            },
                        }}
                        export={{
                            enabled: true,
                            fileName: 'ModosDeVenta',
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
                                    displayFormat: 'Total: {0} registros'
                                },
                            ],
                        }}
                        stateStoring={{
                            enabled: true,
                            type: 'custom',
                            storageKey: 'sale-billing-modes-grid',
                            savingTimeout: 1000,
                            customLoad,
                            customSave,
                        }}
                        scrolling={{ mode: 'standard' }}
                    />
                </div>
            </div>
            <SaleBillingModesModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                }}
                onHidden={() => {
                    setSelectedMode(null);
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
                initialData={selectedMode}
            />
        </div>
    );
};

export default SaleBillingModesClient;
