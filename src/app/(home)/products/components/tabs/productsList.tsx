'use client';
import { useRecovery } from "@/contexts/RecoveryContext";
import { commonService } from "@/app/services/common.service";
import { RECOVERY_ENTITIES } from "@/app/lib/constants/recoveryWhiteList";

import { brandsService } from "@/app/services/product_services/brand.service";
import { categoriesService } from "@/app/services/product_services/categories.service";
import { productsService } from "@/app/services/product_services/products.service";
import { uomsService } from "@/app/services/product_services/uoms.service";
import { IFBrand } from "@repo/api-contracts/erp";
import { IFCategory } from "@repo/api-contracts/erp";
import { IFListBasicParams } from "@repo/api-contracts/erp";
import { IFUOM } from "@repo/api-contracts/erp";
import { taxesService } from "@/app/services/accountant/taxes.service";
import { IFTax } from "@repo/api-contracts/erp";
import { GenericDataGrid, IGenericDataGridColumn } from '@repo/devextreme';
import { createGridStateStorage } from "@/lib/storage/gridStateStorage";
import CustomStore from "devextreme/data/custom_store";
import { CheckBox } from 'devextreme-react/check-box';
import notify from "devextreme/ui/notify";
import dynamic from "next/dynamic";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import ProductModal from "../modals/singleAdditions/productModal";

import PERMISSIONS_CONSTANTS from "@/app/lib/constants/permissions.constants";
import { canDo } from "@/app/lib/utils/permission.helper";
import { IFPackagingLevel } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { packagingLevelService } from "@/app/services/product_services/packagingLevel.service";

/** Lazy: evita cargar el wizard completo (Forms DX + steps) con la página de productos */
const Creation = dynamic(() => import("../modals/fullAdditions/creation"), {
    ssr: false,
    loading: () => null,
});

export const preloadCreationModal = () => {
    if (typeof window !== "undefined") {
        void import("../modals/fullAdditions/creation");
    }
};


const { customLoad, customSave } = createGridStateStorage({ gridId: 'products-grid' });

export interface ProductsClientProps {
    onSelectionChange?: (selectedProduct: any | null) => void;
    selectionMode?: 'single' | 'multiple' | 'none';
    clearSelectionTrigger?: number;
    openCreationTrigger?: number;
    onCreationSuccess?: () => void;
}

const ProductsClient: React.FC<ProductsClientProps> = ({
    onSelectionChange,
    selectionMode = 'none',
    clearSelectionTrigger = 0,
    openCreationTrigger = 0,
    onCreationSuccess,
}) => {
    const [packagingLevels, setPackagingLevels] = useState<IFPackagingLevel[]>([]);
    const gridRef = useRef<any>(null);
    const [uoms, setUoms] = useState<IFUOM[]>([]);
    const [categories, setCategories] = useState<IFCategory[]>([]);
    const [brands, setBrands] = useState<IFBrand[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [isCreationOpen, setIsCreationOpen] = useState(false);
    /** Solo montar el wizard cuando el usuario lo abre (antes destruía el hilo al cargar la página) */
    const [mountCreation, setMountCreation] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [taxes, setTaxes] = useState<IFTax[]>([]);

    const { token, permissions, currentCompany, includeInactive, isSuperAdmin } = useAuth();
    const { isRecoveryMode, recoveryVisibility } = useRecovery();
    const [refreshVersion, setRefreshVersion] = useState(0);
    const selectedRowKeyRef = useRef<any>(null);
    const justSelectedKeyRef = useRef<any>(null);
    const isProgrammaticClearRef = useRef(false);

    // Refetch reactivo cuando cambia el switch de RecoveryMode o RecoveryVisibility
    useEffect(() => {
        setRefreshVersion(prev => prev + 1);
        if (gridRef.current?.instance?.refresh) {
            gridRef.current.instance.refresh();
        } else if (gridRef.current?.refresh) {
            gridRef.current.refresh();
        }
    }, [isRecoveryMode, recoveryVisibility]);

    // Limpiar selección externa cuando se dispara el trigger (sin notificar al padre)
    useEffect(() => {
        if (clearSelectionTrigger > 0) {
            const gridInstance = gridRef.current?.instance ? gridRef.current.instance() : gridRef.current;
            isProgrammaticClearRef.current = true;
            gridInstance?.clearSelection?.();
            selectedRowKeyRef.current = null;
            justSelectedKeyRef.current = null;
            // Si no había selección, onSelectionChanged puede no dispararse
            setTimeout(() => {
                isProgrammaticClearRef.current = false;
            }, 0);
        }
    }, [clearSelectionTrigger]);

    const openCreationModal = () => {
        preloadCreationModal();
        setMountCreation(true);
        startTransition(() => {
            setIsCreationOpen(true);
        });
    };

    // Abrir modal de creación completa externamente cuando se dispara el trigger
    useEffect(() => {
        if (openCreationTrigger > 0) {
            openCreationModal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo reaccionar al trigger externo
    }, [openCreationTrigger]);

    const canModify = useMemo((): boolean => {
        return permissions ? canDo('modify', PERMISSIONS_CONSTANTS.modifyProducts, permissions) : false;
    }, [permissions]);

    const dataSource = useMemo(() => {
        return new CustomStore({
            key: 'virtualId',
            load: async (loadOptions) => {
                const searchParams: IFListBasicParams = {
                    limit: loadOptions.take || 5000,
                    offset: loadOptions.skip || 0,
                    sort: loadOptions.sort,
                    filter: loadOptions.filter,
                    search: loadOptions.searchValue,
                };

                if (!currentCompany?.id) {
                    return {
                        data: [],
                        totalCount: 0
                    };
                }

                try {
                    const response = await productsService.getAll(currentCompany.id, searchParams, token, includeInactive);
                    const itemsWithId = response.items.map((item: any) => ({
                        ...item,
                        virtualId: `${item.id}`
                    }));

                    return {
                        data: itemsWithId,
                        totalCount: response.metadata.totalItems
                    };
                } catch (error: any) {
                    console.error('Error loading products:', error);
                    const errorMessage = error instanceof Error && error.message ? error.message : 'Error al cargar los productos';
                    notify(errorMessage, 'error', 3000);
                    return {
                        data: [],
                        totalCount: 0
                    };
                }
            }
        });
    }, [currentCompany?.id, token, includeInactive, isRecoveryMode, recoveryVisibility, refreshVersion]);

    useEffect(() => {
        if (!token || !currentCompany?.id) return;
        const loadData = async () => {
            try {
                const [uomsResponse, categoriesResponse, productsResponse, brandsResponse, taxesResponse, plResponse] = await Promise.all([
                    uomsService.getAll({ offset: 0, limit: 500 }, token),
                    categoriesService.getAll(currentCompany.id, { offset: 0, limit: 500 }, token),
                    productsService.getOptions(currentCompany.id, { limit: 200, offset: 0 }, token),
                    brandsService.getAll(currentCompany.id, { offset: 0, limit: 500 }, token),
                    taxesService.getAll(token, currentCompany.id),
                    packagingLevelService.getAll(token),
                ]);
                setUoms(uomsResponse.items);
                setCategories(categoriesResponse.items);
                setProducts(productsResponse.items);
                setBrands(brandsResponse.items);
                setTaxes(taxesResponse.items);
                setPackagingLevels(plResponse);
            } catch (error: any) {
                console.error('Error loading dropdown data:', error);
                const errorMessage = error instanceof Error && error.message ? error.message : 'Error al cargar los datos';
                notify(errorMessage, 'error', 3000);
            }
        };
        loadData();
    }, [refreshVersion, currentCompany?.id, token]);

    const handleRowInserted = async (e: any) => {
        if (!currentCompany?.id) {
            notify("No hay una empresa activa seleccionada", "error", 3000);
            return;
        }
        try {
            const newData = e.data;
            await productsService.create(currentCompany.id, newData, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Producto creado exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error creating product:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al crear el producto";
            notify(errorMessage, "error", 3000);
        }
    };

    const handleRowUpdated = async (e: any) => {
        try {
            const updatedData = { ...e.data };
            await productsService.update(updatedData, updatedData.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Producto actualizado exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error updating product:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al actualizar el producto";
            notify(errorMessage, "error", 3000);
        }
    };

    const handleRowRemoved = async (data: any) => {
        try {
            const message = await productsService.delete(data.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify(message || "Producto eliminado exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error deleting product:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al eliminar el producto";
            notify(errorMessage, "error", 3000);
        }
    };

    const handleRestore = async (data: any) => {
        if (!currentCompany?.id) {
            notify("No hay una empresa activa seleccionada", "error", 3000);
            return;
        }
        try {
            await commonService.restore(RECOVERY_ENTITIES.PRODUCT.schema, RECOVERY_ENTITIES.PRODUCT.table, data.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Producto restaurado exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error al restaurar producto:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al restaurar el registro";
            notify(errorMessage, "error", 3000);
        }
    };

    const columns: IGenericDataGridColumn[] = useMemo(() => {
        const cols: IGenericDataGridColumn[] = [
            {
                dataField: 'id',
                caption: 'ID',
                allowEditing: false,
                visible: false,
                width: 200,
            },
            {
                dataField: 'name',
                caption: 'Nombre',
                allowSorting: true,
                width: 220,
                minWidth: 160,
                validationRules: [{ type: 'required', message: 'El nombre es obligatorio' }],
            },
            {
                dataField: 'classificationName',
                caption: 'Clasificación',
                allowSorting: true,
                width: 150,
                minWidth: 120,
                validationRules: [{ type: 'required', message: 'La clasificación es obligatoria' }],
            },
            {
                dataField: 'prefix',
                caption: 'Prefijo SKU',
                allowSorting: true,
                width: 130,
                minWidth: 110,
                validationRules: [{ type: 'required', message: 'El prefijo es obligatorio' }],
            },
            {
                dataField: 'uomId',
                caption: 'Unidad de Medida',
                allowSorting: true,
                allowEditing: false,
                width: 150,
                minWidth: 120,
                lookup: {
                    dataSource: uoms,
                    valueExpr: 'id',
                    displayExpr: 'name'
                }
            },
            {
                dataField: 'categoryId',
                caption: 'Categoría',
                allowSorting: true,
                allowEditing: false,
                width: 160,
                minWidth: 130,
                lookup: {
                    dataSource: categories,
                    valueExpr: 'id',
                    displayExpr: 'name'
                }
            },
            {
                dataField: 'brandId',
                caption: 'Marca',
                allowSorting: true,
                width: 140,
                minWidth: 120,
                lookup: {
                    dataSource: brands,
                    valueExpr: 'id',
                    displayExpr: 'name',
                },
            },
            {
                dataField: 'active',
                caption: 'Activo',
                allowSorting: true,
                width: 90,
                minWidth: 80,
                alignment: 'center',
                visible: includeInactive,
                cellRender: (cellData: any) => (
                    <div className="flex justify-center items-center h-full">
                        <CheckBox value={cellData.value} readOnly />
                    </div>
                )
            },
            {
                dataField: 'categoryParentName',
                caption: 'Categoría Padre',
                allowSorting: true,
                allowEditing: false,
                width: 160,
                minWidth: 130,
            },
            {
                dataField: 'taxIds',
                caption: 'Impuestos',
                allowSorting: false,
                allowEditing: false,
                width: 180,
                minWidth: 140,
                cellTemplate: (container: HTMLElement, options: any) => {
                    const taxIds = options.value as string[] | null | undefined;
                    if (!taxIds || taxIds.length === 0) {
                        container.innerHTML = `<span>-</span>`;
                        return;
                    }
                    const names = taxIds.map(id => {
                        const tax = taxes.find(t => t.id === id);
                        return tax ? tax.name : id;
                    });
                    const joinedNames = names.join(', ');
                    container.innerHTML = `<span title="${joinedNames}">${joinedNames}</span>`;
                }
            },
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
    }, [brands, uoms, categories, taxes, includeInactive, isRecoveryMode]);

    const actions = useMemo(() => [
        {
            icon: "eyeopen",
            hint: "Detalle",
            onClick: (data: any) => {
                window.open(`/products/productDetail?id=${data.id}`, '_blank');
            },
            visible: () => true,
        },
        {
            icon: "edit",
            hint: "Editar",
            onClick: (data: any) => {
                setSelectedProduct(data);
                setIsProductModalOpen(true);
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
    ], [canModify, isSuperAdmin, isRecoveryMode, token, currentCompany?.id]);

    const handleRowClick = (e: any) => {
        if (selectionMode !== 'single' || e.rowType !== 'data') return;
        if (e.column?.type === 'buttons') return;

        // Si la fila acaba de seleccionarse en esta misma acción de puntero, ignorar para no deseleccionarla
        if (justSelectedKeyRef.current !== null && String(justSelectedKeyRef.current) === String(e.key)) {
            justSelectedKeyRef.current = null;
            return;
        }

        if (
            selectedRowKeyRef.current !== null &&
            String(selectedRowKeyRef.current) === String(e.key)
        ) {
            e.component.clearSelection();
            selectedRowKeyRef.current = null;
            justSelectedKeyRef.current = null;
            if (onSelectionChange) {
                onSelectionChange(null);
            }
        }
    };

    const handleSelectionChanged = (e: any) => {
        const keys = e.selectedRowKeys || [];
        const newKey = keys.length > 0 ? keys[0] : null;
        if (newKey !== null && String(newKey) !== String(selectedRowKeyRef.current)) {
            justSelectedKeyRef.current = newKey;
            setTimeout(() => {
                justSelectedKeyRef.current = null;
            }, 250);
        }
        selectedRowKeyRef.current = newKey;
        // El clear externo (clearSelectionTrigger) ya sincronizó el padre; no re-notificar
        if (isProgrammaticClearRef.current) {
            isProgrammaticClearRef.current = false;
            return;
        }
        if (onSelectionChange) {
            const product = e.selectedRowsData?.[0] || null;
            onSelectionChange(product);
        }
    };

    return (
        <div className="flex flex-col w-full  min-w-full h-full rounded-dx font-sans overflow-hidden">
            <div className="w-full h-full flex flex-col">
                <div className="w-full flex-1 min-h-0">
                    <GenericDataGrid
                            recoveryVisibility={recoveryVisibility}
                        ref={gridRef}
                        gridId="products-grid"
                        keyExpr="virtualId"
                        dataSource={dataSource}
                        remoteOperations={false}
                        columns={columns}
                        columnDefaults={{ allowFiltering: true, allowHeaderFiltering: true, minWidth: 110 }}
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
                            placeholder: 'Buscar productos...',
                            highlightSearchText: true
                        }}
                        selection={selectionMode === 'none' ? { mode: 'none' } : { mode: selectionMode }}
                        onRowClick={handleRowClick}
                        onSelectionChanged={handleSelectionChanged}
                        editing={{
                            allowAdding: isRecoveryMode ? false : canModify,
                            allowUpdating: false,
                            allowDeleting: false,
                            allowDetail: false,
                            useIcons: true,
                            onAdd: () => {
                                openCreationModal();
                            }
                        }}
                        actions={actions}
                        export={{
                            enabled: true,
                            fileName: 'Productos',
                            allowExportSelectedData: true,
                            formats: ['xlsx']
                        }}
                        columnChooser={true}
                        columnFixing={true}
                        stateStoring={{
                            enabled: true,
                            type: 'custom',
                            storageKey: 'products-grid',
                            savingTimeout: 1000,
                            customLoad,
                            customSave,
                        }}
                        scrolling={{ mode: 'standard' }}
                        onInitNewRow={(e) => {
                            e.data.active = true;
                        }}
                        onRowInserted={handleRowInserted}
                        onRowUpdated={handleRowUpdated}
                        onRowRemoved={handleRowRemoved}
                    />
                </div>
            </div>
            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => {
                    setIsProductModalOpen(false);
                }}
                onHidden={() => {
                    setSelectedProduct(null);
                }}
                onSuccess={() => {
                    setRefreshVersion(prev => prev + 1);
                    if (gridRef.current?.instance?.refresh) {
                        gridRef.current.instance.refresh();
                    } else if (gridRef.current?.refresh) {
                        gridRef.current.refresh();
                    }
                }}
                uoms={uoms}
                categories={categories}
                brands={brands}
                taxes={taxes}
                initialData={selectedProduct}
            />
            {mountCreation ? (
                <Creation
                    isOpen={isCreationOpen}
                    onClose={() => setIsCreationOpen(false)}
                    onHidden={() => {
                        setIsCreationOpen(false);
                        setMountCreation(false);
                    }}
                    onSuccess={() => {
                        setRefreshVersion(prev => prev + 1);
                        if (gridRef.current?.instance?.refresh) {
                            gridRef.current.instance.refresh();
                        } else if (gridRef.current?.refresh) {
                            gridRef.current.refresh();
                        }
                        if (onCreationSuccess) {
                            onCreationSuccess();
                        }
                    }}
                    products={products}
                    uoms={uoms}
                    categories={categories}
                    brands={brands}
                    taxes={taxes}
                    packagingLevels={packagingLevels}
                    initialData={null}
                />
            ) : null}
        </div>
    );
};

export default ProductsClient;
