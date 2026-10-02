'use client';

import { useMemo, useRef } from 'react';
import { localizationService } from '@/app/services/localization.service';
import { GenericDataGrid, IGenericDataGridColumn } from '@repo/devextreme';
import { useAuth } from '@/contexts/AuthContext';
import CustomStore from 'devextreme/data/custom_store';
import { CheckBox } from 'devextreme-react/check-box';
import notify from 'devextreme/ui/notify';

export default function IdentitySchemesList() {
    const { token, includeInactive } = useAuth();
    const gridRef = useRef<any>(null);

    const dataSource = useMemo(() => {
        return new CustomStore({
            key: 'id',
            load: async () => {
                try {
                    const data = await localizationService.getIdentitySchemes('AR', token);
                    return {
                        data,
                        totalCount: data.length
                    };
                } catch (error: any) {
                    console.error('Error loading identity schemes:', error);
                    const errorMessage = error instanceof Error && error.message ? error.message : 'Error al cargar esquemas de identidad';
                    notify(errorMessage, 'error', 3000);
                    return { data: [], totalCount: 0 };
                }
            }
        });
    }, [token]);

    const columns: IGenericDataGridColumn[] = useMemo(() => [
        {
            dataField: 'id',
            caption: 'ID',
            visible: false,
            allowEditing: false,
        },
        {
            dataField: 'countryCode',
            caption: 'País',
            width: 100,
            alignment: 'center',
            allowEditing: false,
            defaultValue: 'AR',
        },
        {
            dataField: 'unIdTypeCode',
            caption: 'Código Tipo UN',
            width: 150,
            alignment: 'center',
            allowEditing: false,
        },
        {
            dataField: 'localLabel',
            caption: 'Etiqueta Local',
            allowEditing: false,
        },
        {
            dataField: 'active',
            caption: 'Activo',
            width: 100,
            alignment: 'center',
            allowEditing: false,
            visible: includeInactive,
            cellRender: (cellData: any) => (
                <div className="flex justify-center items-center h-full">
                    <CheckBox value={cellData.value} readOnly />
                </div>
            )
        }
    ], [includeInactive]);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="w-full flex-1 min-h-0">
                <GenericDataGrid
                    ref={gridRef}
                    gridId="identity-schemes-grid"
                    keyExpr="id"
                    dataSource={dataSource}
                    remoteOperations={false}
                    columns={columns}
                    columnDefaults={{ allowFiltering: true, allowHeaderFiltering: true }}
                    allowColumnReordering={true}
                    allowColumnResizing={true}
                    showBorders={true}
                    rowAlternationEnabled={true}
                    hoverStateEnabled={true}
                    paging={{ enabled: true, pageSize: 20 }}
                    sorting={{ mode: 'multiple' }}
                    filterRow={true}
                    headerFilter={true}
                    searchPanel={{
                        visible: true,
                        width: 350,
                        placeholder: 'Buscar esquemas de identidad...',
                        highlightSearchText: true
                    }}
                    noDataText="No se encontraron esquemas de identidad"
                    selection={{ mode: 'none' }}
                    editing={{
                        allowAdding: false,
                        allowUpdating: false,
                        allowDeleting: false,
                        useIcons: true,
                    }}
                    export={{
                        enabled: true,
                        fileName: 'Esquemas_Identificacion',
                        formats: ['xlsx']
                    }}
                />
            </div>
        </div>
    );
}
