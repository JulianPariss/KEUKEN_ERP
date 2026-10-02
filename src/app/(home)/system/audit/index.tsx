'use client';

import { canDo } from "@/app/lib/utils/permission.helper";
import { systemService } from "@/app/services/system.service";
import { GenericDataGrid, IGenericDataGridColumn } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { createGridStateStorage } from "@/lib/storage/gridStateStorage";
import CustomStore from "devextreme/data/custom_store";
import notify from "devextreme/ui/notify";
import { useMemo, useRef } from "react";

const { customLoad, customSave } = createGridStateStorage({ gridId: 'system-audit-grid' });

interface ILoadOptions {
    take?: number;
    skip?: number;
    filter?: unknown;
}

function extractFilterValue(filter: unknown, fieldName: string): string | undefined {
    if (!filter) return undefined;
    if (Array.isArray(filter)) {
        if (filter.length >= 3 && typeof filter[0] === 'string' && filter[0] === fieldName) {
            return typeof filter[2] === 'string' ? filter[2] : undefined;
        }
        for (const item of filter) {
            if (Array.isArray(item)) {
                const val = extractFilterValue(item, fieldName);
                if (val !== undefined) return val;
            }
        }
    }
    return undefined;
}

const SystemAuditClient = () => {
    const { token, permissions, loading } = useAuth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gridRef = useRef<any>(null);

    const canView = useMemo(() => {
        return permissions ? canDo('view', ['system'], permissions) : false;
    }, [permissions]);

    const dataSource = useMemo(() => {
        return new CustomStore({
            key: 'virtualId',
            load: async (loadOptions: ILoadOptions) => {
                try {
                    const limit = loadOptions.take || 20;
                    const page = loadOptions.skip !== undefined ? Math.floor(loadOptions.skip / limit) + 1 : 1;
                    const settingKeyFilter = extractFilterValue(loadOptions.filter, 'settingKey');

                    const response = await systemService.getAudit(token, {
                        page,
                        limit,
                        setting_key: settingKeyFilter,
                    });

                    const itemsWithVirtualId = response.items.map((item, index) => ({
                        ...item,
                        virtualId: `${item.settingKey}-${item.changedAt}-${index}`,
                    }));

                    return {
                        data: itemsWithVirtualId,
                        totalCount: response.total,
                    };
                } catch (error: unknown) {
                    console.error('Error loading system audit settings:', error);
                    const msg = error instanceof Error && error.message ? error.message : 'Error al cargar los logs de auditoría';
                    notify(msg, 'error', 3000);
                    return {
                        data: [],
                        totalCount: 0,
                    };
                }
            },
        });
    }, [token]);

    const columns: IGenericDataGridColumn[] = useMemo(() => [
        {
            dataField: 'settingKey',
            caption: 'Clave de Configuración',
            allowSorting: false,
            allowEditing: false,
        },
        {
            dataField: 'action',
            caption: 'Acción',
            allowSorting: false,
            allowEditing: false,
        },
        {
            dataField: 'changedAt',
            caption: 'Fecha de Modificación',
            dataType: 'datetime',
            allowSorting: false,
            allowEditing: false,
        },
        {
            dataField: 'changedByLogin',
            caption: 'Usuario',
            allowSorting: false,
            allowEditing: false,
        },
    ], []);

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
        <div className="w-full h-full flex flex-col">
            <div className="w-full flex-1 min-h-0">
                <GenericDataGrid
                    ref={gridRef}
                    gridId="system-audit-grid"
                    keyExpr="virtualId"
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
                    sorting={{ mode: 'none' }}
                    filterRow={true}
                    headerFilter={true}
                    filterPanel={false}
                    grouping={{ autoExpandAll: false, contextMenuEnabled: false }}
                    groupPanel={false}
                    searchPanel={{
                        visible: true,
                        width: 350,
                        placeholder: 'Buscar por clave...',
                        highlightSearchText: true,
                    }}
                    selection={{ mode: 'none' }}
                    editing={{
                        allowAdding: false,
                        allowUpdating: false,
                        allowDeleting: false,
                        useIcons: false,
                    }}
                    actions={[]}
                    export={{
                        enabled: true,
                        fileName: 'AuditoriaSistema',
                        allowExportSelectedData: false,
                        formats: ['xlsx'],
                    }}
                    columnChooser={true}
                    columnFixing={true}
                    summary={{
                        totalItems: [
                            {
                                column: 'settingKey',
                                summaryType: 'count',
                                displayFormat: 'Total: {0} registros',
                            },
                        ],
                    }}
                    stateStoring={{
                        enabled: true,
                        type: 'custom',
                        storageKey: 'system-audit-grid',
                        savingTimeout: 1000,
                        customLoad,
                        customSave,
                    }}
                    scrolling={{ mode: 'standard' }}
                />
            </div>
        </div>
    );
};

export default SystemAuditClient;
