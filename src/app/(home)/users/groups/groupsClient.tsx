'use client'

import { GenericDataGrid, IGenericDataGridColumn } from '@repo/devextreme';

// TODO: Reemplazar con llamada real al servicio de grupos
const dataItems: any[] = [];

const columns: IGenericDataGridColumn[] = [
    { dataField: 'code', caption: 'Código', dataType: 'string', allowSorting: true, allowFiltering: false, allowHeaderFiltering: false },
    { dataField: 'groupName', caption: 'Nombre del grupo', dataType: 'string', allowSorting: true, allowFiltering: false, allowHeaderFiltering: false },
];

export default function GroupsClient() {
    return (
        <div className="flex flex-col w-full min-w-full h-full bg-dx-primary/10 rounded-dx items-start justify-center font-sans overflow-y-scroll">
            <div className="w-full h-full">
                <GenericDataGrid
                    gridId="groups-grid"
                    keyExpr="id"
                    dataSource={dataItems}
                    columns={columns}
                    columnDefaults={{ allowFiltering: false, allowHeaderFiltering: true }}
                    showBorders={true}
                    headerFilter={true}
                    hoverStateEnabled={true}
                    paging={{ enabled: false }}
                    filterRow={false}
                    filterPanel={false}
                    searchPanel={{ visible: false }}
                    selection={{ mode: 'single', showCheckBoxesMode: 'always' }}
                    editing={{
                        mode: 'row',
                        allowAdding: false,
                        allowUpdating: true,
                        allowDeleting: true,
                        useIcons: true,
                    }}
                    columnChooser={false}
                    columnFixing={false}
                    scrolling={{ mode: 'virtual', showScrollbar: 'always' }}
                    onRowDblClick={() => { }}
                    height="100%"
                    showDefaultToolbarItems={false}
                />
            </div>
        </div>
    );
}