'use client';

import React, { useEffect, useState } from 'react';
import { SelectBox } from "@repo/devextreme";
import { useAuth } from "@/contexts/AuthContext";
import { IFItemRuleSet, ScopeType } from "@repo/api-contracts/erp";
import { categoriesService } from "@/app/services/product_services/categories.service";
import { itemClustersService } from "@/app/services/audiences/itemClusters.service";
import { IFCategory } from "@repo/api-contracts/erp";

export interface ItemRuleEditorProps {
    value: IFItemRuleSet;
    onChange: (value: IFItemRuleSet) => void;
    disabled?: boolean;
}

export const ItemRuleEditor: React.FC<ItemRuleEditorProps> = ({
    value,
    onChange,
    disabled = false,
}) => {
    const { token, currentCompany } = useAuth();
    const [scopeType, setScopeType] = useState<ScopeType>(
        value?.scope?.itemClusterId ? 'cluster' : 'category'
    );
    const [categories, setCategories] = useState<IFCategory[]>([]);
    const [itemClusters, setItemClusters] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (value?.scope?.itemClusterId) {
            setScopeType('cluster');
        } else if (value?.scope?.productCategoryId) {
            setScopeType('category');
        }
    }, [value?.scope?.itemClusterId, value?.scope?.productCategoryId]);

    useEffect(() => {
        if (!token || !currentCompany?.id) return;

        let isMounted = true;
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [catsRes, clustersRes] = await Promise.all([
                    categoriesService.getAll(currentCompany.id, { limit: 200, offset: 0 }, token).catch(() => ({ items: [] })),
                    itemClustersService.getAll(200, 0, token, currentCompany.id).catch(() => ({ items: [] })),
                ]);
                if (isMounted) {
                    setCategories(catsRes.items || []);
                    setItemClusters(clustersRes.items || []);
                }
            } catch (err) {
                console.error("Error al cargar opciones para reglas de ítems:", err);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [token, currentCompany?.id]);

    const handleScopeTypeChange = (newType: ScopeType) => {
        setScopeType(newType);
        onChange({
            scope: {},
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="p-3 bg-main/5 border border-main/10 rounded-dx">
                <span className="text-xs font-semibold text-main/80 block mb-2">
                    Alcance de expansión para el clúster:
                </span>
                <div className="flex border border-main/15 rounded-dx overflow-hidden p-1 bg-main/5">
                    <button
                        type="button"
                        onClick={() => handleScopeTypeChange('category')}
                        disabled={disabled}
                        className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-dx transition-all ${scopeType === 'category'
                            ? 'bg-focus-300 text-variant font-bold shadow'
                            : 'text-main/70 hover:text-main'
                            }`}
                    >
                        Por Categoría de Productos
                    </button>
                    <button
                        type="button"
                        onClick={() => handleScopeTypeChange('cluster')}
                        disabled={disabled}
                        className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-dx transition-all ${scopeType === 'cluster'
                            ? 'bg-focus-300 text-variant font-bold shadow'
                            : 'text-main/70 hover:text-main'
                            }`}
                    >
                        Por Clúster Base de Ítems
                    </button>
                </div>
            </div>

            {scopeType === 'category' ? (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-main/80">
                        Seleccionar Categoría de Productos <span className="text-red-500">*</span>
                    </label>
                    <SelectBox
                        items={categories}
                        valueExpr="id"
                        displayExpr="name"
                        value={value?.scope?.productCategoryId || null}
                        onValueChanged={(e) => {
                            if (e.event) {
                                onChange({ scope: { productCategoryId: e.value } });
                            }
                        }}
                        placeholder={isLoading ? "Cargando categorías..." : "Buscar o seleccionar categoría..."}
                        disabled={disabled || isLoading}
                        searchEnabled={true}
                        stylingMode="filled"
                    />
                    <p className="text-[11px] text-main/60">
                        Todos los artículos pertenecientes a esta categoría se integrarán dinámicamente al clúster.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-main/80">
                        Seleccionar Clúster Base de Ítems <span className="text-red-500">*</span>
                    </label>
                    <SelectBox
                        items={itemClusters}
                        valueExpr="id"
                        displayExpr="name"
                        value={value?.scope?.itemClusterId || null}
                        onValueChanged={(e) => {
                            if (e.event) {
                                onChange({ scope: { itemClusterId: e.value } });
                            }
                        }}
                        placeholder={isLoading ? "Cargando clústeres..." : "Buscar o seleccionar clúster..."}
                        disabled={disabled || isLoading}
                        searchEnabled={true}
                        stylingMode="filled"
                    />
                    <p className="text-[11px] text-main/60">
                        Se incluirán los artículos derivados del clúster seleccionado.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ItemRuleEditor;
