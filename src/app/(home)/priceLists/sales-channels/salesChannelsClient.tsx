'use client';

import { canDo } from "@/app/lib/utils/permission.helper";
import { salesChannelsService } from "@/app/services/salesChannels.service";
import { GenericDataGrid, IGenericDataGridColumn } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { createGridStateStorage } from "@/lib/storage/gridStateStorage";
import CustomStore from "devextreme/data/custom_store";
import { CheckBox } from 'devextreme-react/check-box';
import notify from "devextreme/ui/notify";
import { useMemo, useRef } from "react";

const { customLoad, customSave } = createGridStateStorage({ gridId: 'sales-channels-grid' });

const SalesChannelsClient = () => {
    const { token, permissions, loading } = useAuth();
    const gridRef = useRef<any>(null);

    const canView = useMemo(() => {
        return permissions ? canDo('view', ['sales-channels'], permissions) : false;
    }, [permissions]);

    const dataSource = useMemo(() => {
        return new CustomStore({
            key: 'id',
            load: async (loadOptions) => {
                try {
                    const limit = loadOptions.take || 50;
                    const offset = loadOptions.skip || 0;
                    const response = await salesChannelsService.getAll(token, limit, offset);
                    return {
                        data: response.items,
                        totalCount: response.metadata.totalItems
                    };
                } catch (error: any) {
                    console.error('Error loading sales channels:', error);
                    const errorMessage = error instanceof Error && error.message 
                        ? error.message 
                        : 'Error al cargar los canales de venta';
                    notify(errorMessage, 'error', 3000);
                    return {
                        data: [],
                        totalCount: 0
                    };
                }
            }
        });
    }, [token]);

    const columns: IGenericDataGridColumn[] = [
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
        },
        {
            dataField: 'name',
            caption: 'Nombre',
            allowSorting: true,
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
                        gridId="sales-channels-grid"
                        keyExpr="id"
                        dataSource={dataSource}
                        remoteOperations={{ paging: true, filtering: false, sorting: false, grouping: false }}
                        columns={columns}
                        columnDefaults={{ allowFiltering: true, allowHeaderFiltering: true }}
                        allowColumnReordering={true}
                        allowColumnResizing={true}
                        showBorders={true}
                        rowAlternationEnabled={true}
                        hoverStateEnabled={true}
                        paging={{ enabled: true, pageSize: 50, pageSizes: [20, 50, 100] }}
                        sorting={{ mode: 'multiple' }}
                        filterRow={true}
                        headerFilter={true}
                        filterPanel={true}
                        grouping={{ autoExpandAll: false, contextMenuEnabled: true }}
                        groupPanel={true}
                        searchPanel={{
                            visible: true,
                            width: 350,
                            placeholder: 'Buscar canales de venta...',
                            highlightSearchText: true
                        }}
                        noDataText="No se encontraron canales de venta"
                        selection={{ mode: 'none' }}
                        editing={{
                            allowAdding: false,
                            allowUpdating: false,
                            allowDeleting: false,
                            useIcons: true,
                        }}
                        export={{
                            enabled: true,
                            fileName: 'Canales_de_Venta',
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
                                    displayFormat: 'Total: {0} canales'
                                },
                            ],
                        }}
                        stateStoring={{
                            enabled: true,
                            type: 'custom',
                            storageKey: 'sales-channels-grid',
                            savingTimeout: 1000,
                            customLoad,
                            customSave,
                        }}
                        scrolling={{ mode: 'standard' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SalesChannelsClient;
