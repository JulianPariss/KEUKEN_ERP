'use client';

import { accountsService } from "@/app/services/accountant/accounts.service";
import { categoriesService } from "@/app/services/product_services/categories.service";
import { commonService } from "@/app/services/common.service";
import { RECOVERY_ENTITIES } from "@/app/lib/constants/recoveryWhiteList";
import PERMISSIONS_CONSTANTS from "@/app/lib/constants/permissions.constants";
import { canDo } from "@/app/lib/utils/permission.helper";
import { IFCategory } from "@repo/api-contracts/erp";
import { IFListBasicParams } from "@repo/api-contracts/erp";
import { GenericDataGrid, IGenericDataGridColumn } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { useRecovery } from "@/contexts/RecoveryContext";
import { createGridStateStorage } from "@/lib/storage/gridStateStorage";
import CustomStore from "devextreme/data/custom_store";
import notify from "devextreme/ui/notify";
import { useEffect, useMemo, useRef, useState } from "react";
import CategoriesModal from "../components/modals/singleAdditions/categoriesModal";

const { customLoad, customSave } = createGridStateStorage({ gridId: 'categories-grid' });

const CategoriesClient = () => {
    const { isRecoveryMode, recoveryVisibility } = useRecovery();
    const gridRef = useRef<any>(null);
    const [categories, setCategories] = useState<IFCategory[]>([]);
    const [accounts, setAccounts] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [refreshVersion, setRefreshVersion] = useState(0);

    const { token, permissions, isSuperAdmin, currentCompany } = useAuth();

    const canModify = useMemo(() => {
        if (isSuperAdmin) return true;
        return permissions ? canDo('modify', PERMISSIONS_CONSTANTS.categories, permissions) : false;
    }, [permissions, isSuperAdmin]);

    // Refetch reactivo al cambiar los switches de RecoveryMode o RecoveryVisibility
    useEffect(() => {
        setRefreshVersion(prev => prev + 1);
        if (gridRef.current?.instance?.refresh) {
            gridRef.current.instance.refresh();
        } else if (gridRef.current?.refresh) {
            gridRef.current.refresh();
        }
    }, [isRecoveryMode, recoveryVisibility]);

    const dataSource = useMemo(() => {
        return new CustomStore({
            key: 'id',
            load: async (loadOptions) => {
                if (!currentCompany?.id) {
                    return {
                        data: [],
                        totalCount: 0
                    };
                }
                try {
                    const searchParams: IFListBasicParams = {
                        limit: loadOptions.take || 500,
                        offset: loadOptions.skip || 0,
                    };
                    const response = await categoriesService.getAll(currentCompany.id, searchParams, token);
                    return {
                        data: response.items,
                        totalCount: response.metadata.totalItems
                    };
                } catch (error: any) {
                    console.error('Error loading categories:', error);
                    notify(error?.message || 'Error al cargar las categorías', 'error', 3000);
                    return {
                        data: [],
                        totalCount: 0
                    };
                }
            }
        });
    }, [refreshVersion, currentCompany?.id, token, isRecoveryMode, recoveryVisibility]);

    useEffect(() => {
        const loadDropdownData = async () => {
            if (!currentCompany?.id) return;
            try {
                const [categoriesRes, accountsRes] = await Promise.all([
                    categoriesService.getAll(currentCompany.id, { offset: 0, limit: 500 }, token),
                    token ? accountsService.getAll(token, currentCompany.id) : Promise.resolve({ items: [] })
                ]);
                setCategories(categoriesRes.items);
                if (accountsRes) {
                    setAccounts(accountsRes);
                }
            } catch (error) {
                console.error('Error loading dropdown data:', error);
            }
        };
        loadDropdownData();
    }, [refreshVersion, currentCompany?.id, token]);

    const handleRowInserted = async (e: any) => {
        try {
            const newData = e.data;
            await categoriesService.create(newData, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Categoría creada exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error creating category:", error);
            notify(error?.message || "Error al crear la categoría", "error", 3000);
        }
    };

    const handleRowUpdated = async (e: any) => {
        try {
            const updatedData = { ...e.data };
            await categoriesService.update(updatedData, updatedData.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Categoría actualizada exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error updating category:", error);
            notify(error?.message || "Error al actualizar la categoría", "error", 3000);
        }
    };

    const handleRowRemoved = async (e: any) => {
        try {
            const data = e.data || e;
            const message = await categoriesService.delete(data.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify(message || "Categoría eliminada exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error deleting category:", error);
            notify(error?.message || "Error al eliminar la categoría", "error", 3000);
        }
    };

    const handleRestore = async (data: any) => {
        try {
            await commonService.restore(RECOVERY_ENTITIES.PRODUCT_CATEGORY.schema, RECOVERY_ENTITIES.PRODUCT_CATEGORY.table, data.id, token);
            setRefreshVersion(prev => prev + 1);
            if (gridRef.current?.instance?.refresh) {
                gridRef.current.instance.refresh();
            } else if (gridRef.current?.refresh) {
                gridRef.current.refresh();
            }
            notify("Categoría restaurada exitosamente", "success", 3000);
        } catch (error: any) {
            console.error("Error al restaurar categoría:", error);
            notify(error?.message || "Error al restaurar el registro", "error", 3000);
        }
    };

    const actions = useMemo(() => [
        {
            icon: "edit",
            hint: "Editar",
            onClick: (data: any) => {
                setSelectedCategory(data);
                setIsModalOpen(true);
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
    ], [canModify, isSuperAdmin, isRecoveryMode, token]);

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
                dataField: 'code',
                caption: 'Código',
                allowSorting: true,
                validationRules: [{ type: 'required', message: 'El código es obligatorio' }],
            },
            {
                dataField: 'name',
                caption: 'Nombre',
                allowSorting: true,
                validationRules: [{ type: 'required', message: 'El nombre es obligatorio' }],
            },
            {
                dataField: 'parentId',
                caption: 'Categoría Padre',
                allowSorting: true,
                lookup: {
                    dataSource: categories,
                    valueExpr: 'id',
                    displayExpr: 'name'
                }
            },
            {
                dataField: 'companyId',
                caption: 'Compañía',
                allowSorting: true,
                visible: false,
            },
            {
                dataField: 'expenseAccountId',
                caption: 'Cuenta Debe',
                allowSorting: true,
                validationRules: [{ type: 'required', message: 'La cuenta debe es obligatoria' }],
                lookup: {
                    dataSource: accounts?.items || [],
                    valueExpr: 'id',
                    displayExpr: (item: any) => item ? `${item.name} (${item.code})` : ''
                }
            },
            {
                dataField: 'incomeAccountId',
                caption: 'Cuenta Haber',
                allowSorting: true,
                validationRules: [{ type: 'required', message: 'La cuenta haber es obligatoria' }],
                lookup: {
                    dataSource: accounts?.items || [],
                    valueExpr: 'id',
                    displayExpr: (item: any) => item ? `${item.name} (${item.code})` : ''
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
    }, [categories, accounts, isRecoveryMode]);

    return (
        <div className="flex flex-col w-full min-w-full h-full rounded-dx font-sans overflow-hidden">
            <div className="w-full h-full flex flex-col">
                <div className="w-full flex-1 min-h-0">
                    <GenericDataGrid
                            recoveryVisibility={recoveryVisibility}
                        ref={gridRef}
                        gridId="categories-grid"
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
                            placeholder: 'Buscar categorías...',
                            highlightSearchText: true
                        }}
                        selection={{ mode: 'none' }}
                        editing={{
                            allowAdding: isRecoveryMode ? false : canModify,
                            allowUpdating: false,
                            allowDeleting: false,
                            useIcons: true,
                            onAdd: () => {
                                setSelectedCategory(null);
                                setIsModalOpen(true);
                            },
                        }}
                        export={{
                            enabled: true,
                            fileName: 'Categorías',
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
                                    displayFormat: 'Total: {0} categorías'
                                },
                            ],
                        }}
                        stateStoring={{
                            enabled: true,
                            type: 'custom',
                            storageKey: 'categories-grid',
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
            <CategoriesModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                }}
                onHidden={() => {
                    setSelectedCategory(null);
                }}
                onSuccess={() => {
                    setRefreshVersion(prev => prev + 1);
                    if (gridRef.current?.instance?.refresh) {
                        gridRef.current.instance.refresh();
                    } else if (gridRef.current?.refresh) {
                        gridRef.current.refresh();
                    }
                }}
                categories={categories}
                initialData={selectedCategory}
            />
        </div>
    );
};

export default CategoriesClient;
