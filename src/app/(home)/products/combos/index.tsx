"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { GenericDataGrid, IGenericDataGridColumn } from "@repo/devextreme";
import CustomStore from "devextreme/data/custom_store";
import notify from "devextreme/ui/notify";
import { custom } from "devextreme/ui/dialog";
import { createGridStateStorage } from "@/lib/storage/gridStateStorage";
import { combosService } from "@/app/services/combos.service";
import PERMISSIONS_CONSTANTS from "@/app/lib/constants/permissions.constants";
import { canDo } from "@/app/lib/utils/permission.helper";
import { IFCombo } from "@repo/api-contracts/erp";
import {
    getProcurementTypeLabel,
    getComboStatusLabel
} from "@/app/lib/constants/combos.constants";
import ComboModal from "./components/actions/comboModal";
import ComboDetailModal from "./components/actions/comboDetailModal";

const { customLoad, customSave } = createGridStateStorage({
    gridId: "combos-grid"
});

export default function CombosClient() {
    const { token, currentCompany, permissions, isSuperAdmin, includeInactive } = useAuth();
    const gridRef = useRef<any>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedCombo, setSelectedCombo] = useState<IFCombo | null>(null);
    const [detailComboId, setDetailComboId] = useState<string | null>(null);

    // Permisos
    const canView = useMemo(() => {
        if (isSuperAdmin) return true;
        return permissions ? canDo("view", ["combos"], permissions) : false;
    }, [permissions, isSuperAdmin]);

    const canModify = useMemo(() => {
        if (isSuperAdmin) return true;
        return permissions ? canDo("modify", PERMISSIONS_CONSTANTS.modifyCombos, permissions) : false;
    }, [permissions, isSuperAdmin]);

    // Refrescar grilla
    const handleRefresh = useCallback(() => {
        if (gridRef.current?.instance?.refresh) {
            gridRef.current.instance.refresh();
        } else if (gridRef.current?.refresh) {
            gridRef.current.refresh();
        }
    }, []);

    // Re-ejecutar load cuando cambie includeInactive
    useEffect(() => {
        handleRefresh();
    }, [includeInactive, handleRefresh]);

    const dataSource = useMemo(() => {
        return new CustomStore({
            key: "id",
            load: async (loadOptions: any) => {
                if (!currentCompany?.id || !token) {
                    return { data: [], totalCount: 0 };
                }

                try {
                    const params = {
                        limit: loadOptions.take || 20,
                        offset: loadOptions.skip || 0,
                        q: loadOptions.searchValue || undefined
                    };

                    const response = await combosService.getAll(
                        currentCompany.id,
                        params,
                        token,
                        includeInactive
                    );

                    return {
                        data: response.items,
                        totalCount: response.metadata.totalItems
                    };
                } catch (error: any) {
                    const message = error?.message || "Error al cargar los combos";
                    notify(message, "error", 3000);
                    return { data: [], totalCount: 0 };
                }
            }
        });
    }, [token, currentCompany?.id, includeInactive]);

    const handleEditCombo = useCallback(async (combo: IFCombo) => {
        try {
            // Cargar el combo completo con su composición para inicializar el modal de edición
            const fullCombo = await combosService.getFullById(combo.id, token, currentCompany?.id);
            setSelectedCombo(fullCombo);
            setIsModalOpen(true);
        } catch (error: any) {
            notify(error?.message || "Error al obtener datos completos del combo", "error", 3000);
        }
    }, [token, currentCompany?.id]);

    const handleDeleteCombo = useCallback(async (combo: IFCombo) => {
        const result = await custom({
            title: "Eliminar Combo",
            messageHtml: `¿Está seguro de que desea eliminar el combo <b>${combo.name}</b>?`,
            buttons: [
                { text: "Eliminar", onClick: () => true, type: "danger" },
                { text: "Cancelar", onClick: () => false, type: "normal" }
            ]
        }).show();

        if (result) {
            try {
                await combosService.deleteCombo(combo.id, token, currentCompany?.id);
                notify("Combo eliminado exitosamente", "success", 3000);
                handleRefresh();
            } catch (error: any) {
                notify(error?.message || "Error al eliminar el combo", "error", 3000);
            }
        }
    }, [token, currentCompany?.id, handleRefresh]);

    const columns: IGenericDataGridColumn[] = useMemo(() => [
        {
            dataField: "name",
            caption: "Nombre del Combo",
            minWidth: 220,
            allowSorting: true,
            allowFiltering: true,
            cellTemplate: (container: HTMLElement, options: any) => {
                container.innerHTML = `
                    <div class="flex items-center gap-2">
                        <i class="dx-icon-box text-focus-300 text-sm"></i>
                        <span class="font-medium text-main">${options.value || "-"}</span>
                    </div>
                `;
            }
        },
        {
            dataField: "skuPrefix",
            caption: "Prefijo SKU",
            defaultWidth: 140,
            alignment: "center",
            allowSorting: true,
            allowFiltering: true,
            cellTemplate: (container: HTMLElement, options: any) => {
                container.innerHTML = `<span class="font-mono text-xs text-main font-medium">${options.value || "-"}</span>`;
            }
        },
        {
            dataField: "uomName",
            caption: "Unidad",
            defaultWidth: 130,
            calculateCellValue: (rowData: any) => rowData.uomName || rowData.uomId || "-"
        },
        {
            dataField: "procurementType",
            caption: "Aprovisionamiento",
            defaultWidth: 160,
            alignment: "center",
            cellTemplate: (container: HTMLElement, options: any) => {
                const label = getProcurementTypeLabel(options.value);
                container.innerHTML = `<span class="text-xs text-main">${label}</span>`;
            }
        },
        {
            dataField: "categoryName",
            caption: "Categoría",
            defaultWidth: 160,
            calculateCellValue: (rowData: any) => rowData.categoryName || "-"
        },
        {
            dataField: "brandName",
            caption: "Marca",
            defaultWidth: 150,
            calculateCellValue: (rowData: any) => rowData.brandName || "-"
        },
        {
            dataField: "active",
            caption: "Estado",
            defaultWidth: 120,
            alignment: "center",
            cellTemplate: (container: HTMLElement, options: any) => {
                const isActive = Boolean(options.value);
                const dotColorClass = isActive ? "bg-success" : "bg-main/30";
                const textColorClass = isActive ? "text-main" : "text-main/50";
                const label = getComboStatusLabel(isActive);
                container.innerHTML = `
                    <div class="inline-flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full ${dotColorClass} shrink-0"></span>
                        <span class="text-xs ${textColorClass}">${label}</span>
                    </div>
                `;
            }
        }
    ], []);

    if (!canView) {
        return (
            <div className="flex items-center justify-center h-full text-main/60 text-sm">
                No posee permisos suficientes para visualizar el módulo de Combos.
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full rounded-dx">
            <GenericDataGrid
                ref={gridRef}
                gridId="combos-grid"
                keyExpr="id"
                dataSource={dataSource}
                remoteOperations={true}
                columns={columns}
                export={{
                    enabled: true,
                    fileName: "Combos"
                }}
                editing={{
                    allowAdding: canModify,
                    allowUpdating: false,
                    allowDeleting: false,
                    useIcons: true,
                    onAdd: () => {
                        setSelectedCombo(null);
                        setIsModalOpen(true);
                    }
                }}
                actions={[
                    {
                        icon: "eye",
                        hint: "Ver estructura y componentes",
                        onClick: (data: any) => {
                            setDetailComboId(data.id);
                            setIsDetailModalOpen(true);
                        }
                    },
                    {
                        icon: "edit",
                        hint: "Editar combo y composición",
                        visible: () => canModify,
                        onClick: (data: any) => {
                            handleEditCombo(data);
                        }
                    },
                    {
                        icon: "trash",
                        hint: "Eliminar combo",
                        visible: () => canModify,
                        onClick: (data: any) => {
                            handleDeleteCombo(data);
                        }
                    }
                ]}
                stateStoring={{
                    enabled: true,
                    type: "custom",
                    storageKey: "combos-grid",
                    customLoad,
                    customSave
                }}
            />

            {/* Modal de Alta / Edición */}
            <ComboModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleRefresh}
                onHidden={() => setSelectedCombo(null)}
                initialData={selectedCombo}
            />

            {/* Modal de Detalle de Estructura */}
            <ComboDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onHidden={() => setDetailComboId(null)}
                comboId={detailComboId}
            />
        </div>
    );
}
