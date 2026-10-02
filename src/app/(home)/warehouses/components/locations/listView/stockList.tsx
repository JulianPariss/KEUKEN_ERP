'use client';

import { GenericDataGrid, IGenericDataGridColumn } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { useLocations } from "@/contexts/LocationsContext";
import { Template } from "devextreme-react/core/template";
import notify from "devextreme/ui/notify";
import CustomStore from "devextreme/data/custom_store";
import { useEffect, useMemo } from "react";
import LocationsAdjustInventory from "../actions/inventory";
import { inventoryService } from "@/app/services/warehouse/inventory.service";

const StockList = () => {
    const { fetchStock, stock, loadingStock, selectedLocation, activeInventory, setActiveInventory } = useLocations();
    const { token } = useAuth();

    useEffect(() => {
        fetchStock();
    }, []);

    const dataSource = useMemo(() => {
        if (!stock) return [];
        return new CustomStore({
            key: 'virtualId',
            load: async () => {
                const itemsWithId = stock.lines.map((item: any) => {
                    const invLine = activeInventory?.lines.find((l: any) => l.itemId === item.itemId && l.batchId === item.batchId);
                    return {
                        ...item,
                        locationPath: stock.locationPath,
                        locationName: stock.locationName,
                        virtualId: item.id,
                        realQty: invLine ? invLine.realQty : null
                    };
                });
                return {
                    data: itemsWithId
                };
            },
            update: async (key, values) => {
                if (!activeInventory) {
                    notify("No hay un inventario activo en esta ubicación", "warning", 3000);
                    throw new Error("No active inventory");
                }

                const item = stock.lines.find((l: any) => {
                    return l.id === key;
                });

                if (!item) {
                    throw new Error("Item not found");
                }

                const newQty = values.realQty;
                if (newQty === undefined || newQty === null) return;
                if (newQty < 0) {
                    notify("La cantidad no puede ser negativa", "error", 3000);
                    throw new Error("Negative quantity");
                }

                try {
                    const updatedInventory = await inventoryService.patch(activeInventory.id, {
                        lines: [{
                            lineId: null,
                            itemId: item.itemId,
                            batchId: item.batchId,
                            realQty: newQty,
                            realSecQty: 0,
                            batchName: item.batchName || "",
                            batchExpirationDate: item.batchExpirationDate || null,
                            batchSupplierBatch: "",
                            batchInternalCode: "",
                            batchProperties: null
                        }]
                    }, token);

                    notify("Cantidad registrada correctamente", "success", 3000);

                    if (setActiveInventory) {
                        setActiveInventory(updatedInventory);
                    }
                } catch (error: any) {
                    console.error("Error saving stock in CustomStore update:", error);
                    const errorMessage = error instanceof Error && error.message ? error.message : (error?.detail || "Error al registrar la cantidad");
                    notify(errorMessage, "error", 3000);
                    throw error;
                }
            }
        });
    }, [stock, activeInventory, token, fetchStock, setActiveInventory]);

    const columns: IGenericDataGridColumn[] = [
        {
            dataField: "itemSku",
            caption: "SKU",
            defaultWidth: 120,
            minWidth: 50,
            alignment: "left",
            allowSorting: false,
            allowEditing: false,
        },
        {
            dataField: "itemName",
            caption: "Producto",
            allowSorting: false,
            defaultWidth: 'max',
            minWidth: 50,
            allowEditing: false,
        },
        {
            dataField: "itemId",
            caption: "ID",
            defaultWidth: 380,
            minWidth: 50,
            visible: false,
            allowSorting: false,
            allowEditing: false,
        },
        {
            dataField: "locationPath",
            caption: "Ubicación",
            defaultWidth: 180,
            minWidth: 50,
            visible: false,
            allowSorting: false,
            allowEditing: false,
        },
        {
            dataField: "batchName",
            caption: "Lote",
            defaultWidth: 120,
            minWidth: 50,
            alignment: "center",
            allowSorting: false,
            allowEditing: false,
        },
        {
            dataField: "quantity",
            caption: "Stock Físico",
            alignment: "left",
            defaultWidth: 110,
            minWidth: 50,
            allowSorting: false,
            allowEditing: false,
        },
        {
            dataField: "realQty",
            caption: "Cantidad Real",
            alignment: "left",
            defaultWidth: 140,
            minWidth: 80,
            dataType: "number",
            allowSorting: false,
            allowEditing: !!activeInventory,
            customizeText: (cellInfo: any) => {
                return cellInfo.value === null || cellInfo.value === undefined ? '-' : String(cellInfo.value);
            }
        },
        {
            dataField: "available",
            caption: "Disponible",
            defaultWidth: 110,
            minWidth: 50,
            alignment: "left",
            allowSorting: false,
            allowEditing: false,
        },
    ];

    return (
        <div className="w-full h-full">
            <GenericDataGrid
                gridId="location-stock-list"
                className="[&_.dx-datagrid-header-panel]:!pb-1.5 [&_.dx-data-row_.dx-cell-modified]:!py-0 [&_.dx-data-row_td]:!py-0 [&_.dx-data-row_td]:!leading-none [&_.dx-data-row_td]:!align-middle [&_.dx-row]:!h-7 [&_.dx-data-row]:!h-7"
                dataSource={dataSource}
                showBorders={true}
                keyExpr="virtualId"
                columns={columns}
                rowAlternationEnabled={true}
                hoverStateEnabled={true}
                loadPanel={loadingStock}
                searchPanel={{
                    visible: true,
                    width: 200,
                    placeholder: "Buscar en stock...",
                    highlightSearchText: false
                }}
                paging={{ enabled: true, pageSize: 20 }}
                pager={{
                    showPageSizeSelector: true,
                    allowedPageSizes: [10, 20, 50, 100],
                    showInfo: true,
                    displayMode: "full"
                }}
                editing={{
                    mode: "row",
                    allowUpdating: !!activeInventory,
                    useIcons: true
                }}
                noDataText="No hay stock disponible en esta ubicación"
                toolbarItems={[
                    { location: 'after', template: 'inventoryTemplate' },
                    { name: 'searchPanel' }
                ]}
            >
                <Template name="inventoryTemplate">
                    <div className="flex items-center h-[36px]">
                        <LocationsAdjustInventory
                            locationId={selectedLocation?.id || ''}
                            locationName={selectedLocation?.name || ''}
                            onSuccess={fetchStock}
                            isInventory={true}
                        />
                    </div>
                </Template>
            </GenericDataGrid>
        </div>
    );
};

export default StockList;
