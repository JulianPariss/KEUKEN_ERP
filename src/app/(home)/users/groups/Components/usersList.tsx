'use client'

import { GenericDataGrid, IGenericDataGridColumn } from '@repo/devextreme';
import { CheckBox } from 'devextreme-react/check-box';

// TODO: Reemplazar con llamada real al servicio de usuarios del grupo
const dataItems: any[] = [];

const columns: IGenericDataGridColumn[] = [
    { dataField: 'id', caption: 'Identificador', dataType: 'number', allowSorting: true },
    { dataField: 'username', caption: 'Usuario', dataType: 'string', allowSorting: true },
    { dataField: 'name', caption: 'Nombre', dataType: 'string', allowSorting: true },
    { dataField: 'role', caption: 'Rol', dataType: 'string', allowSorting: true },
    {
        dataField: 'active',
        caption: 'Activo',
        alignment: 'center',
        allowSorting: true,
        width: 80,
        cellRender: (cellData: any) => (
            <div className="flex justify-center items-center h-full">
                <CheckBox value={cellData.value} readOnly />
            </div>
        )
    },
    { dataField: 'mobile', caption: 'Móvil', dataType: 'string', allowSorting: true },
    {
        dataField: 'isAdmin',
        caption: 'Admin',
        alignment: 'center',
        allowSorting: true,
        width: 80,
        cellRender: (cellData: any) => (
            <div className="flex justify-center items-center h-full">
                <CheckBox value={cellData.value} readOnly />
            </div>
        )
    },
    {
        dataField: 'isEmployee',
        caption: 'Empleado',
        alignment: 'center',
        allowSorting: true,
        width: 100,
        cellRender: (cellData: any) => (
            <div className="flex justify-center items-center h-full">
                <CheckBox value={cellData.value} readOnly />
            </div>
        )
    },
    { dataField: 'code', caption: 'Código', dataType: 'string', allowSorting: true },
    {
        dataField: 'isEnabled',
        caption: 'Habilitado',
        alignment: 'center',
        allowSorting: true,
        width: 100,
        cellRender: (cellData: any) => (
            <div className="flex justify-center items-center h-full">
                <CheckBox value={cellData.value} readOnly />
            </div>
        )
    },
];


export default function UsersList() {
    return (
        <div className="flex flex-col w-full min-w-full h-full bg-dx-primary/10 rounded-dx items-start justify-center font-sans overflow-hidden">
            <div className="w-full h-full">
                <GenericDataGrid
                    gridId="groups-users-list"
                    keyExpr="id"
                    dataSource={dataItems}
                    columns={columns}
                    columnDefaults={{ allowFiltering: false, allowHeaderFiltering: true }}
                    showBorders={true}
                    hoverStateEnabled={true}
                    selection={{ mode: 'multiple', showCheckBoxesMode: 'always' }}
                    paging={{ enabled: false }}
                    filterRow={false}
                    headerFilter={true}
                    filterPanel={false}
                    searchPanel={{ visible: false }}
                    columnChooser={false}
                    columnFixing={false}
                    scrolling={{ mode: 'virtual', showScrollbar: 'always' }}
                    height="100%"
                    showDefaultToolbarItems={false}
                />
            </div>
        </div>
    );
}