'use client';

import { useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { taxesService } from "@/app/services/accountant/taxes.service";
import { IFTax } from "@repo/api-contracts/erp";
import { IFProductFullItem } from "@repo/api-contracts/erp";
import MetadataFieldsClient from "@/components/metadata/MetadataFieldsClient";
import { metadataService } from "@/app/services/metadata.service";


interface InfoFieldProps {
    label: string;
    value?: string | number | null;
    variant?: 'default' | 'badge' | 'bold';
    className?: string;
    children?: ReactNode;
}

function InfoField({ label, value, variant = 'default', className = '', children }: InfoFieldProps) {
    const valueClass =
        variant === 'badge'
            ? 'text-sm font-semibold bg-primary-0/30 px-2 py-0.5 rounded-dx border border-primary-500/10 w-fit'
            : variant === 'bold'
                ? 'text-sm font-semibold text-main'
                : 'text-sm font-medium text-main/90';

    return (
        <div className={`flex flex-col gap-0.5 ${className}`}>
            <span className="!text-main/40 text-[10px] font-bold uppercase tracking-wider">{label}</span>
            {children ?? <span className={valueClass}>{value || '-'}</span>}
        </div>
    );
}

interface IProductInfoSectionProps {
    product: IFProductFullItem;
    brands: any[];
}

export default function ProductInfoSection({ product, brands }: IProductInfoSectionProps) {
    const { token, currentCompany } = useAuth();
    const [taxes, setTaxes] = useState<IFTax[]>([]);
    const [loadingTaxes, setLoadingTaxes] = useState(false);

    const [metadataState, setMetadataState] = useState<{
        loading: boolean;
        visible: boolean;
        attributes?: any[];
        groups?: any[];
        values?: any;
        error?: string;
    }>({
        loading: false,
        visible: false,
    });

    useEffect(() => {
        const fetchTaxes = async () => {
            const taxIds = product.taxIds;
            if (!taxIds || taxIds.length === 0 || !token || !currentCompany?.id) {
                setTaxes([]);
                return;
            }
            setLoadingTaxes(true);
            try {
                const fetchedTaxes = await Promise.all(
                    taxIds.map(id => taxesService.getById(id, token, currentCompany.id))
                );
                setTaxes(fetchedTaxes);
            } catch (err) {
                console.error("Error fetching taxes for product:", err);
            } finally {
                setLoadingTaxes(false);
            }
        };
        fetchTaxes();
    }, [product.taxIds, token, currentCompany?.id]);

    const handleToggleMetadata = useCallback(async (forceRefresh?: boolean) => {
        const hasNoAttributes =
            metadataState.attributes &&
            metadataState.attributes.filter(a => a.isVisible && !a.isSystemInternal).length === 0;

        if (!metadataState.loading && metadataState.attributes && !forceRefresh && !hasNoAttributes) {
            setMetadataState(prev => ({ ...prev, visible: !prev.visible }));
            return;
        }

        setMetadataState(prev => ({ ...prev, loading: true, visible: true }));

        try {
            const [attributes, groups, values] = await Promise.all([
                metadataService.getAttributes("common.product", token!, true),
                metadataService.getGroups("common.product", token!),
                metadataService.getValues("common.product", product.id, token!),
            ]);
            setMetadataState({ loading: false, visible: true, attributes, groups, values });
        } catch (err: any) {
            console.error("Error al cargar metadatos del producto:", err);
            setMetadataState({
                loading: false,
                visible: true,
                error: err instanceof Error && err.message ? err.message : "No se pudieron cargar los metadatos de este producto.",
            });
        }
    }, [token, product.id, metadataState.loading, metadataState.attributes]);

    const brandName = brands.find(b => b.id === product.brandId)?.name || product.brandId || '-';

    return (
        <div className="relative overflow-hidden bg-primary-500/95 rounded-dx border border-main/10 shadow-md p-4 flex flex-col gap-4 w-full h-full min-h-0">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-main">Detalles</h2>
                    <div className="!text-[9px] px-2 py-0.5 bg-focus-500 rounded-full hidden sm:flex items-center gap-1.5 text-xs !text-focus-300">
                        <span className="uppercase font-semibold">ID:</span>
                        <span className="font-semibold">{product.id}</span>
                    </div>
                </div>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-dx border ${product.active
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>
                    {product.active ? "Activo" : "Inactivo"}
                </span>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-focus-100 to-focus-500/5 shrink-0" />

            {/* Scrollable Container */}
            <div className="w-full flex-1 min-h-0 overflow-y-auto pr-3.5 rounded-dx flex flex-col gap-4">
                {/* Grilla de campos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-2 gap-4">
                    <InfoField label="Prefijo SKU" value={product.prefix} variant="badge" />
                    <InfoField label="Clasificación" value={product.classification} variant="bold" />
                    <InfoField label="UoM" value={product.uomName} />
                    <InfoField label="Categoría" value={product.categoryName} />
                    <InfoField label="Categoría Padre" value={product.categoryParentName} />
                    <InfoField label="Marca" value={brandName} />
                    <InfoField label="Modo de Venta" value={product.saleBillingMode?.name || product.saleBillingModeCode} />
                    <InfoField label="UoM Secundaria" value={product.defaultSecUomName} />

                    {/* Impuestos: contenido custom vía children */}
                    <InfoField
                        label="Impuestos Asociados"
                        className="col-span-2 sm:col-span-3 md:col-span-6 lg:col-span-2 mt-2"
                    >
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {loadingTaxes ? (
                                <span className="text-xs text-main/50 animate-pulse">...</span>
                            ) : taxes.length > 0 ? (
                                taxes.map(tax => (
                                    <span
                                        key={tax.id}
                                        className="px-2.5 py-0.5 text-xs font-semibold bg-focus-500/10 text-focus-300 rounded-dx border border-focus-500/20"
                                    >
                                        {tax.name}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-main/40 font-medium">-</span>
                            )}
                        </div>
                    </InfoField>
                </div>

                {/* Metadatos Dinámicos */}
                <div className="border-t border-main/10 pt-3">
                    <MetadataFieldsClient
                        entityType="common.product"
                        entityId={product.id}
                        title="Metadatos del Producto"
                        mode="tabs"
                        canEdit={true}
                        onToggle={handleToggleMetadata}
                        isToggled={metadataState.visible}
                        loading={metadataState.loading}
                        error={metadataState.error}
                        attributes={metadataState.attributes}
                        groups={metadataState.groups}
                        initialFetchedValues={metadataState.values}
                    />
                </div>
            </div>
        </div>
    );
}
