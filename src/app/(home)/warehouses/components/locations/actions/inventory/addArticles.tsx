'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckBox, NumberBox, TextBox } from "devextreme-react";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { Template } from "devextreme-react/core/template";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { categoriesService } from "@/app/services/product_services/categories.service";
import { productsService } from "@/app/services/product_services/products.service";
import { IFCategory } from "@repo/api-contracts/erp";
import { IFProductFullItem } from "@repo/api-contracts/erp";
import { GenericDataGrid, IGenericDataGridColumn, Button } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { getSubtreeCategoryIds } from "@/lib/utils/categories.helper";

interface IAddArticlesProps {
    isPopupVisible: boolean;
    closePopup: () => void;
    locationName: string;
    handleSubmit: (items: any, quantity: number) => void;
    loading: boolean;
    onHidden?: () => void;
}

const AddArticles = ({ isPopupVisible, closePopup, locationName, handleSubmit, loading, onHidden }: IAddArticlesProps) => {
    const { token, currentCompany } = useAuth();

    const [itemSelected, setItemSelected] = useState<any>();
    const [quantity, setQuantity] = useState<number>(1);
    const [allProductsData, setAllProductsData] = useState<any[]>([]);
    const isFetchingRef = useRef<boolean>(false);
    const [categories, setCategories] = useState<IFCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const gridRef = useRef<any>(null);

    const addArticle = useCallback((item: any) => {
        setItemSelected(item);
        setQuantity(1);
    }, []);

    const modifyQuantity = useCallback((newQuantity: number) => {
        setQuantity(newQuantity);
    }, []);

    const columns: IGenericDataGridColumn[] = useMemo(() => [
        {
            dataField: 'virtualId',
            caption: 'ID',
            allowEditing: false,
            visible: false,
        },
        {
            dataField: 'productName',
            caption: 'Producto',
            allowSorting: true,
            allowEditing: false,
            visible: false,
            width: 200,
        },
        {
            dataField: 'sku',
            caption: 'SKU',
            allowSorting: true,
            visible: false,
        },
        {
            dataField: 'itemName',
            caption: 'Item',
            allowSorting: true,
            groupIndex: 0,
            groupCellRender: (cellInfo: any) => {
                const firstItem = cellInfo.data?.items?.[0] || allProductsData.find((p) => p.itemName === cellInfo.displayValue);
                return (
                    <div className="grid grid-cols-[20%_15%_25%_1fr] items-center gap-4 w-full pr-4 opacity-70">
                        <span className="text-sm font-bold truncate" title={cellInfo.displayValue}>
                            {cellInfo.displayValue}
                        </span>

                        {firstItem && (
                            <>
                                <span className="bg-primary-950/40 px-2 py-0.5 rounded-full text-xs text-start truncate" title={`SKU: ${firstItem.sku}`}>
                                    SKU: {firstItem.sku}
                                </span>
                                <span className="opacity-60 text-xs truncate" title={firstItem.productName}>
                                    {firstItem.productName}
                                </span>
                                <span className="opacity-80 text-[11px] uppercase bg-focus-500/10 text-focus-500 px-2 py-1 rounded-dx w-fit truncate" title={firstItem.categoryName}>
                                    {firstItem.categoryName ?? 'Sin categoría'}
                                </span>
                            </>
                        )}
                    </div>
                );
            }
        },
        {
            dataField: 'presentationName',
            caption: 'Presentación',
            width: 250,
            allowSorting: true,
        },
        {
            dataField: 'barcode',
            caption: 'Código de Barras',
            allowSorting: true,
        },
        {
            dataField: 'factor',
            caption: 'Factor',
            allowSorting: false,
            dataType: 'number',
            alignment: 'center',
            format: '#,##0.00',
            visible: true,
        },
        {
            dataField: 'weight',
            caption: 'Peso',
            alignment: 'center',
            allowSorting: true,
            dataType: 'number',
            format: '#,##0.00',
        },
        {
            dataField: 'volume',
            caption: 'Volumen',
            alignment: 'center',
            allowSorting: true,
            dataType: 'number',
            format: '#,##0.00',
        },
        {
            dataField: 'palletUnits',
            caption: 'Unidades por Pallet',
            allowSorting: true,
            alignment: 'center',
            dataType: 'number',
        },
        {
            dataField: 'action',
            caption: 'Añadir',
            width: 80,
            alignment: 'center',
            allowSorting: false,
            cellTemplate: 'actionCellTemplate',
        },
    ], [allProductsData]);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!token || !currentCompany?.id || isFetchingRef.current) return;
            isFetchingRef.current = true;
            try {
                const [response, categoriesResponse] = await Promise.all([
                    productsService.getFull({ limit: 50000, offset: 0 }, token, currentCompany.id),
                    categoriesService.getAll(currentCompany.id, { limit: 500, offset: 0 }, token)
                ]);

                const flattened: any[] = [];
                response.items.forEach((prodFull: IFProductFullItem) => {
                    const validItems = prodFull.items?.filter(item => item.presentations && item.presentations.length > 0) || [];
                    validItems.forEach((item: any) => {
                        item.presentations.forEach((pres: any) => {
                            flattened.push({
                                virtualId: `${item.sku}-${pres.barcode || pres.name}`,
                                productName: prodFull.name,
                                sku: item.sku,
                                itemName: item.itemName,
                                presentationName: pres.name,
                                barcode: pres.barcode,
                                weight: Number((item.weight * pres.factor).toFixed(2)),
                                volume: item.volume,
                                palletUnits: item.palletUnits,
                                categoryId: prodFull.categoryId,
                                categoryName: prodFull.categoryName,
                                categoryParentId: prodFull.categoryParentId,
                                categoryParentName: prodFull.categoryParentName,
                                description: `${item.itemName} ${pres.name}`,
                                id: item.sku,
                                factor: pres.factor,
                                items: {
                                    item: {
                                        ...item,
                                        presentations: [pres]
                                    }
                                }
                            });
                        });
                    });
                });

                setCategories(categoriesResponse.items);
                setAllProductsData(flattened);
            } catch (error: any) {
                console.error('Error fetching all products:', error);
                const errorMessage = error instanceof Error && error.message ? error.message : 'Error al cargar los productos';
                notify(errorMessage, 'error', 3000);
            } finally {
                isFetchingRef.current = false;
            }
        };

        if (isPopupVisible) {
            fetchAllData();
        }
    }, [token, isPopupVisible, currentCompany?.id]);

    const handleHiding = useCallback(() => {
        closePopup();
    }, [closePopup]);

    const handleHidden = useCallback(() => {
        setItemSelected(undefined);
        gridRef.current?.instance()?.clearFilter();
        setSelectedCategory(null);
        setQuantity(1);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    const dataSource = useMemo(() => {
        const validCategoryIds = selectedCategory
            ? getSubtreeCategoryIds(categories, selectedCategory)
            : null;

        const dataToRender = validCategoryIds
            ? allProductsData.filter(item => validCategoryIds.has(item.categoryId))
            : allProductsData;

        return new DataSource({
            store: {
                type: 'array',
                data: dataToRender,
                key: 'virtualId'
            },
            searchExpr: ['sku', 'barcode', 'description', 'itemName', 'productName']
        });
    }, [allProductsData, selectedCategory, categories]);

    const handleConfirmSubmit = useCallback(() => {
        if (itemSelected) {
            handleSubmit(itemSelected.items, quantity);
        }
    }, [handleSubmit, itemSelected, quantity]);

    return (
        <Popup
            visible={isPopupVisible}
            onHiding={handleHiding}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            titleRender={() => (
                <div className="flex flex-row items-center justify-between pr-6">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-base font-bold">Ajustar Inventario</h3>
                        <div className="flex text-focus-100 items-center gap-1.5 text-xs uppercase">
                            <span>{locationName}</span>
                        </div>
                    </div>
                </div>
            )}
            width={'60vw'}
            maxHeight={'95vh'}
            deferRendering={true}
            onShown={(e) => {
                e.component.repaint();
            }}
            className="custom-rounded-popup"
        >
            <Position at="center" my="center" />

            <div className="flex flex-col h-full p-4">
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 min-h-0">
                        <GenericDataGrid
                            ref={gridRef}
                            height="100%"
                            gridId="products-grid"
                            keyExpr="virtualId"
                            dataSource={dataSource}
                            remoteOperations={false}
                            columns={columns}
                            columnDefaults={{ allowFiltering: true, allowHeaderFiltering: true }}
                            allowColumnReordering={false}
                            allowColumnResizing={false}
                            showBorders={true}
                            rowAlternationEnabled={false}
                            hoverStateEnabled={true}
                            paging={{ enabled: true, pageSize: 20 }}
                            sorting={{ mode: 'multiple' }}
                            filterRow={false}
                            headerFilter={false}
                            onOptionChanged={(e) => {
                                if (e.fullName === 'searchPanel.text') {
                                    if (e.value) {
                                        gridRef.current?.instance()?.expandAll();
                                    } else {
                                        gridRef.current?.instance()?.collapseAll();
                                    }
                                }
                            }}
                            filterPanel={false}
                            grouping={{ autoExpandAll: false, contextMenuEnabled: false, expandMode: 'rowClick', allowCollapsing: true }}
                            groupPanel={false}
                            searchPanel={{
                                visible: true,
                                width: 350,
                                placeholder: 'Buscar por SKU, código o descripción...',
                                highlightSearchText: true,
                            }}
                            toolbarItems={[
                                {
                                    location: 'before',
                                    widget: 'dxSelectBox',
                                    options: {
                                        items: categories,
                                        valueExpr: 'id',
                                        displayExpr: 'name',
                                        value: selectedCategory,
                                        onValueChanged: (e: any) => setSelectedCategory(e.value),
                                        placeholder: 'Filtrar por categoría...',
                                        showClearButton: true,
                                        searchEnabled: true,
                                        width: 250
                                    }
                                },
                                { name: 'searchPanel', location: 'after' }
                            ]}
                            selection={{ mode: 'none' }}
                            editing={{
                                allowAdding: false,
                                allowUpdating: false,
                                allowDeleting: false,
                                useIcons: true,
                            }}
                            columnChooser={false}
                            columnFixing={false}
                            scrolling={{ mode: 'virtual' }}
                            pager={{ visible: false }}
                        >
                            <Template name="actionCellTemplate" render={(cellData: any) => {
                                const rowData = cellData.data || cellData.row?.data;
                                if (!rowData) return null;
                                return (
                                    <CheckBox
                                        value={itemSelected?.virtualId === rowData.virtualId}
                                        onValueChanged={(e) => {
                                            if (!e.event) return;

                                            if (e.value) {
                                                addArticle(rowData);
                                            } else if (itemSelected?.virtualId === rowData.virtualId) {
                                                setItemSelected(undefined);
                                            }
                                        }}
                                    />
                                );
                            }} />

                            <Template name="actions2CellTemplate" render={(cellData: any) => {
                                const rowData = cellData.data || cellData.row?.data;
                                if (!rowData) return null;
                                return (
                                    <div className="size-5 bg-red-500"></div>
                                );
                            }} />
                        </GenericDataGrid>
                    </div>

                    {itemSelected && (
                        <div className="py-4 flex flex-row items-start overflow-y-auto gap-2 w-full">
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-xs font-medium opacity-60 ml-1">Item</label>
                                <TextBox
                                    value={`${itemSelected.itemName} - ${itemSelected.presentationName}`}
                                    readOnly
                                    stylingMode="filled"
                                    height={36}
                                    className="custom-input-compact !text-lg !font-bold !bg-primary-900/80 !rounded-dx"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium opacity-60 ml-1">Cantidad</label>
                                <NumberBox
                                    value={quantity}
                                    onValueChanged={(e) => modifyQuantity(e.value || 0)}
                                    min={0}
                                    showSpinButtons={true}
                                    height={36}
                                    className="custom-input-compact !text-lg !font-bold !rounded-dx"
                                    stylingMode="filled"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium opacity-60 ml-1">Peso Estimado</label>
                                <NumberBox
                                    value={itemSelected?.weight ? quantity * parseFloat(itemSelected.weight) : 0}
                                    readOnly={true}
                                    format="#,##0.00"
                                    height={36}
                                    className="!text-lg !font-bold !rounded-dx opacity-70 pointer-events-none !bg-primary-900 !border-main/5"
                                    stylingMode="filled"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text="Cerrar"
                    onClick={closePopup}
                    disabled={loading}
                    stylingMode="text"
                    className="!bg-main/10"
                />
            </ToolbarItem>
            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    type="default"
                    text={loading ? "Cargando..." : "Cargar"}
                    stylingMode="contained"
                    onClick={handleConfirmSubmit}
                    disabled={loading || !itemSelected}
                    className="!bg-focus-300 !text-variant shadow-lg shadow-black/20"
                />
            </ToolbarItem>
        </Popup>
    );
};

export default AddArticles;