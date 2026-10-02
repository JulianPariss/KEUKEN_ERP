'use client';

import { saleOrdersService } from "@/app/services/priceLists/saleOrders.service";
import { GenericDataGrid, IGenericDataGridColumn } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { createGridStateStorage } from "@/lib/storage/gridStateStorage";
import CustomStore from "devextreme/data/custom_store";
import notify from "devextreme/ui/notify";
import { useMemo, useRef, useState } from "react";

const { customLoad, customSave } = createGridStateStorage({ gridId: 'saleorders-grid' });

const SaleOrdersClient = () => {
    const { token, loading, currentCompany } = useAuth();
    const gridRef = useRef<any>(null);
    const [refreshVersion, setRefreshVersion] = useState(0);

    const dataSource = useMemo(() => {
        return new CustomStore({
            key: 'id',
            load: async (loadOptions) => {
                if (!currentCompany?.id || !token) {
                    return { data: [], totalCount: 0 };
                }

                try {
                    const skip = loadOptions.skip || 0;
                    const take = loadOptions.take || 50;

                    const response = await saleOrdersService.getAll(
                        token,
                        take,
                        skip,
                        { companyId: currentCompany.id }
                    );
                    return {
                        data: response.items,
                        totalCount: response.metadata.totalItems
                    };
                } catch (error: any) {
                    console.error('Error loading sale orders:', error);
                    const errorMessage = error instanceof Error && error.message 
                        ? error.message 
                        : 'Error al cargar los pedidos de venta';
                    notify(errorMessage, 'error', 3000);
                    return { data: [], totalCount: 0 };
                }
            }
        });
    }, [refreshVersion, token, currentCompany?.id]);

    const columns: IGenericDataGridColumn[] = useMemo(() => [
        { dataField: 'id', caption: 'ID', visible: false, allowEditing: false },
        { dataField: 'name', caption: 'Nombre', allowEditing: false },
        { dataField: 'dateOrder', caption: 'Fecha de Orden', dataType: 'datetime', allowEditing: false },
        { dataField: 'customerName', caption: 'Cliente', allowEditing: false },
        { dataField: 'customerCode', caption: 'Código Cliente', allowEditing: false },
        { dataField: 'pricelistName', caption: 'Lista de Precios', allowEditing: false },
        { dataField: 'salesChannelName', caption: 'Canal de Ventas', allowEditing: false },
        { dataField: 'platformName', caption: 'Plataforma', allowEditing: false },
        { dataField: 'amountTotal', caption: 'Monto Total', dataType: 'number', format: 'currency', allowEditing: false },
        {
            dataField: 'state',
            caption: 'Estado',
            allowEditing: false,
            calculateDisplayValue: (rowData: any) => {
                const stateMap: Record<string, string> = {
                    draft: 'Borrador',
                    sale: 'Venta'
                };
                return stateMap[rowData.state] || rowData.state;
            },
            lookup: {
                dataSource: [
                    { id: 'draft', name: 'Borrador' },
                    { id: 'sale', name: 'Venta' }
                ],
                valueExpr: 'id',
                displayExpr: 'name'
            }
        },
        { dataField: 'invoiceStatus', caption: 'Estado de Factura', allowEditing: false },
        { dataField: 'branchName', caption: 'Sucursal', allowEditing: false },
        { dataField: 'userName', caption: 'Usuario', allowEditing: false },
    ], []);

    const editing = useMemo(() => ({
        allowAdding: false,
        allowUpdating: false,
        allowDeleting: false,
        allowDetail: true,
        useIcons: true,
        onViewDetails: (data: any) => {
            window.open(`/priceLists/saleOrderDetail?id=${data.id}`, '_blank');
        }
    }), []);

    if (loading) {
        return null;
    }

    return (
        <div className="flex flex-col w-full h-full rounded-dx">
            <GenericDataGrid
                ref={gridRef}
                gridId="saleorders-grid"
                keyExpr="id"
                dataSource={dataSource}
                remoteOperations={true}
                columns={columns}
                editing={editing}
                stateStoring={{
                    enabled: true,
                    type: "custom",
                    storageKey: "saleorders-grid",
                    customLoad,
                    customSave,
                }}
            />
        </div>
    );
};

export default SaleOrdersClient;
