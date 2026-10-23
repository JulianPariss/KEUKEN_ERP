'use client';

import PERMISSIONS_CONSTANTS from "@/app/lib/constants/permissions.constants";
import { canDo } from "@/app/lib/utils/permission.helper";
import { currenciesService } from "@repo/erp-services/payments_services/currencies.service";
import { GenericDataGrid, IGenericDataGridColumn } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { createGridStateStorage } from "@/lib/storage/gridStateStorage";
import CustomStore from "devextreme/data/custom_store";
import { CheckBox } from 'devextreme-react/check-box';
import notify from "devextreme/ui/notify";
import { useMemo, useRef, useState } from "react";
import CurrencyCreationModal from "../components/actions/currencyCreation";

const { customLoad, customSave } = createGridStateStorage({ gridId: 'currencies-grid' });

const CurrenciesClient = () => {
    const { token, currentCompany, permissions, loading, includeInactive, isSuperAdmin } = useAuth();
    const gridRef = useRef<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
    const [refreshVersion, setRefreshVersion] = useState(0);

    const canView = useMemo(() => {
        if (isSuperAdmin) return true;
        return permissions ? canDo('view', ['currencies'], permissions) : false;
    }, [permissions, isSuperAdmin]);

    const canModify = useMemo(() => {
        if (isSuperAdmin) return true;
        return permissions ? canDo('modify', PERMISSIONS_CONSTANTS.modifyCurrencies, permissions) : false;
    }, [permissions, isSuperAdmin]);

    const dataSource = useMemo(() => {
        return new CustomStore({
            key: 'id',
            load: async (loadOptions) => {
                try {
                    const response = await currenciesService.getAll(token, includeInactive);
                    return {
                        data: response.items,
                        totalCount: response.metadata.totalItems
                    };
                } catch (error: any) {
                    console.error('Error loading currencies:', error);
                    const errorMessage = error instanceof Error && error.message 
                        ? error.message 
                        : 'Error al cargar las monedas';
                    notify(errorMessage, 'error', 3000);
                    return {
                        data: [],
                        totalCount: 0
                    };
                }
            }
        });
    }, [refreshVersion, token, includeInactive]);

    const handleRowInserted = async (e: any) => {
        if (!currentCompany) return;
        try {
            await currenciesService.create(e.data, token, currentCompany.id);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Moneda creada exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error creating currency:", error);
            const errorMessage = error instanceof Error && error.message 
                ? error.message 
                : "Error al crear la moneda";
            notify(errorMessage, "error", 3000);
        }
    };

    const handleRowUpdated = async (e: any) => {
        if (!currentCompany) return;
        try {
            const updatedData = { ...e.data };
            await currenciesService.update(updatedData.id, updatedData, token, currentCompany.id);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Moneda actualizada exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error updating currency:", error);
            const errorMessage = error instanceof Error && error.message 
                ? error.message 
                : "Error al actualizar la moneda";
            notify(errorMessage, "error", 3000);
        }
    };

    const handleRowRemoved = async (e: any) => {
        if (!currentCompany) return;
        try {
            const data = e.data || e;
            await currenciesService.delete(data.id, token, currentCompany.id);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Moneda eliminada exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error deleting currency:", error);
            const errorMessage = error instanceof Error && error.message 
                ? error.message 
                : "Error al eliminar la moneda";
            notify(errorMessage, "error", 3000);
        }
    };

    const actions = useMemo(() => [
        {
            icon: "edit",
            hint: "Editar",
            onClick: (data: any) => {
                setSelectedCurrency(data);
                setIsModalOpen(true);
            },
            visible: () => canModify,
        },
        {
            icon: "trash",
            hint: "Eliminar",
            onClick: (data: any) => handleRowRemoved(data),
            visible: (e: any) => e.active && canModify,
        }
    ], [canModify]);

    const columns: IGenericDataGridColumn[] = useMemo(() => [
        {
            dataField: 'id',
            caption: 'ID',
            allowEditing: false,
            visible: false,
        },
        {
            dataField: 'isoCode',
            caption: 'ISO',
            allowSorting: true,
            width: 100,
            validationRules: [{ type: 'required', message: 'El código ISO es obligatorio' }],
        },
        {
            dataField: 'name',
            caption: 'Nombre',
            allowSorting: true,
            validationRules: [{ type: 'required', message: 'El nombre es obligatorio' }],
        },
        {
            dataField: 'symbol',
            caption: 'Símbolo',
            width: 80,
        },
        {
            dataField: 'rounding',
            caption: 'Redondeo',
            dataType: 'number',
            width: 100,
        },
        {
            dataField: 'active',
            caption: 'Activo',
            width: 100,
            alignment: 'center',
            visible: includeInactive,
            cellRender: (cellData: any) => (
                <div className="flex justify-center items-center h-full">
                    <CheckBox value={cellData.value} readOnly />
                </div>
            )
        }
    ], [includeInactive]);

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
                        ref={gridRef}
                        gridId="currencies-grid"
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
                        searchPanel={{
                            visible: true,
                            width: 350,
                            placeholder: 'Buscar monedas...',
                            highlightSearchText: true
                        }}
                        selection={{ mode: 'none' }}
                        editing={{
                            allowAdding: canModify,
                            allowUpdating: false,
                            allowDeleting: false,
                            useIcons: true,
                            onAdd: () => {
                                setSelectedCurrency(null);
                                setIsModalOpen(true);
                            },
                        }}
                        export={{
                            enabled: true,
                            fileName: 'Monedas',
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
                                    displayFormat: 'Total: {0} monedas'
                                },
                            ],
                        }}
                        stateStoring={{
                            enabled: true,
                            type: 'custom',
                            storageKey: 'currencies-grid',
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
            <CurrencyCreationModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                }}
                onHidden={() => {
                    setSelectedCurrency(null);
                }}
                onSuccess={() => {
                    setRefreshVersion(prev => prev + 1);
                    if (gridRef.current?.instance?.refresh) {
                        gridRef.current.instance.refresh();
                    } else if (gridRef.current?.refresh) {
                        gridRef.current.refresh();
                    }
                }}
                initialData={selectedCurrency}
            />
        </div>
    );
};

export default CurrenciesClient;
