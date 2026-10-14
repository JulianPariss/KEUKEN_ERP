'use client';

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { metadataService } from "@/app/services/metadata.service";
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { CheckIcon, CrossIcon } from "@repo/icons";
import MetadataFieldsClient from "@/components/metadata/MetadataFieldsClient";
import PresentationsTable from "./PresentationsTable";
import ItemMediaGallery from "./ItemMediaGallery";
import ItemHandlingSection from "./ItemHandlingSection";
import ItemSuppliersSection from "./ItemSuppliersSection";
import ItemPlatformsSection from "./ItemPlatformsSection";
import { IFProductFullItem, IFItemMedia } from "@repo/api-contracts/erp";

type IFProductFullItemItem = IFProductFullItem['items'][number];

interface ItemDetailContentProps {
    item: IFProductFullItemItem;
    uoms: any[];
    packagingLevels: any[];
    getUomName: (id: string) => string;
    onMediaChange?: (updatedMedia: IFItemMedia[]) => void;
}

export default function ItemDetailContent({
    item,
    uoms,
    packagingLevels,
    getUomName,
    onMediaChange
}: ItemDetailContentProps) {
    const { token } = useAuth();
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

    const operationalFlags = useMemo(() => [
        {
            key: 'isDualUom',
            label: 'U.Medida Doble',
            value: Boolean(item.isDualUom),
            description: 'Permite el registro de dos unidades de medida diferentes para el mismo artículo.',
        },
        {
            key: 'isInventoryItem',
            label: 'Controla Stock',
            value: Boolean(item.isInventoryItem),
            description: 'Determina si el artículo se almacena en inventario y realiza movimientos de stock.',
        },
        {
            key: 'requiresExpiry',
            label: 'Requiere Vencimiento',
            value: Boolean(item.requiresExpiry),
            description: 'Exige el registro de fecha de caducidad para este lote de artículos.',
        },
        {
            key: 'isSerializable',
            label: 'Es Serializable',
            value: Boolean(item.isSerializable),
            description: 'Permite realizar el seguimiento individual de cada unidad mediante un número de serie único.',
        },
        {
            key: 'isConsignmentItem',
            label: 'Admite Consignación',
            value: Boolean(item.isConsignmentItem),
            description: 'Habilita la recepción y entrega de mercadería bajo la modalidad de consignación.',
        },
    ], [item.isConsignmentItem, item.isDualUom, item.isInventoryItem, item.isSerializable, item.requiresExpiry]);

    const handleToggleMetadata = useCallback(async (forceRefresh?: boolean) => {
        const hasNoAttributes = metadataState.attributes && metadataState.attributes.filter(a => a.isVisible && !a.isSystemInternal).length === 0;

        if (!metadataState.loading && metadataState.attributes && !forceRefresh && !hasNoAttributes) {
            setMetadataState(prev => ({
                ...prev,
                visible: !prev.visible
            }));
            return;
        }

        setMetadataState(prev => ({
            ...prev,
            loading: true,
            visible: true,
        }));

        try {
            const [attributes, groups, values] = await Promise.all([
                metadataService.getAttributes("common.item", token, true),
                metadataService.getGroups("common.item", token),
                metadataService.getValues("common.item", item.id, token)
            ]);

            setMetadataState({
                loading: false,
                visible: true,
                attributes,
                groups,
                values
            });
        } catch (err: any) {
            console.error("Error al cargar metadatos:", err);
            setMetadataState({
                loading: false,
                visible: true,
                error: err instanceof Error && err.message ? err.message : "No se pudieron cargar los metadatos de este ítem."
            });
        }
    }, [token, item.id, metadataState.loading, metadataState.attributes]);

    return (
        <div className="p-4 bg-primary-0/20 flex flex-col gap-4">
            <Form
                formData={{
                    itemName: item.itemName,
                    sku: item.sku,
                    costMethod: item.costMethod === 'average' ? 'Promedio' : item.costMethod === 'fifo' ? 'FIFO' : 'Estándar',
                    weight: item.weight,
                    volume: item.volume,
                    palletUnits: item.palletUnits,
                    palletUomId: item.palletUomId ? getUomName(item.palletUomId) : '-',
                    uomRatio: item.uomRatio
                }}
                readOnly={true}
                labelLocation="top"
                scrollingEnabled={false}
                colCount={4}
            >
                <GroupItem colSpan={4} colCount={4} cssClass="!p-0">
                    <SimpleItem
                        dataField="itemName"
                        label={{ text: "Nombre de Item" }}
                        editorType="dxTextBox"
                        editorOptions={{ stylingMode: 'filled' }}
                    />
                    <SimpleItem
                        dataField="sku"
                        label={{ text: "SKU" }}
                        editorType="dxTextBox"
                        editorOptions={{ stylingMode: 'filled' }}
                    />
                    <SimpleItem
                        dataField="costMethod"
                        label={{ text: "Método de Costo" }}
                        editorType="dxTextBox"
                        editorOptions={{ stylingMode: 'filled' }}
                    />
                    <SimpleItem
                        dataField="weight"
                        label={{ text: "Peso" }}
                        editorType="dxNumberBox"
                        editorOptions={{ stylingMode: 'filled' }}
                    />
                    <SimpleItem
                        dataField="volume"
                        label={{ text: "Volumen" }}
                        editorType="dxNumberBox"
                        editorOptions={{ stylingMode: 'filled' }}
                    />
                    <SimpleItem
                        dataField="palletUnits"
                        label={{ text: "Unidades por Pallet" }}
                        editorType="dxNumberBox"
                        editorOptions={{ stylingMode: 'filled' }}
                    />
                    <SimpleItem
                        dataField="palletUomId"
                        label={{ text: "U. Medida Pallet" }}
                        editorType="dxTextBox"
                        editorOptions={{ stylingMode: 'filled' }}
                    />
                    <SimpleItem
                        dataField="uomRatio"
                        label={{ text: "Ratio de Unidad" }}
                        editorType="dxNumberBox"
                        visible={item.isDualUom}
                        editorOptions={{ stylingMode: 'filled' }}
                    />
                </GroupItem>
            </Form>

            {/* Políticas y Controles Operativos */}
            <div className="flex flex-col gap-1.5 w-full mt-1 border-t border-main/10 pt-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-main/40 uppercase tracking-wider">
                        Políticas y Controles Operativos
                    </span>
                    <span className="text-[11px] text-main/40">
                        {operationalFlags.filter(f => f.value).length} de {operationalFlags.length} activos
                    </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {operationalFlags.map(flag => (
                        <div
                            key={flag.key}
                            title={flag.description}
                            className={`flex items-center gap-2 p-2 rounded-dx border transition-all cursor-default select-none ${
                                flag.value
                                    ? 'bg-primary-0/25 border-focus-500/30 shadow-xs'
                                    : 'bg-primary-950/20 border-main/5 opacity-55 hover:opacity-85'
                            }`}
                        >
                            <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                    flag.value
                                        ? 'bg-focus-500/15 text-focus-300 border border-focus-500/30'
                                        : 'bg-main/5 text-main/40 border border-main/10'
                                }`}
                            >
                                {flag.value ? (
                                    <CheckIcon size={11} className="text-focus-300" />
                                ) : (
                                    <CrossIcon size={11} className="text-main/40" />
                                )}
                            </span>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className={`text-xs font-semibold truncate ${flag.value ? 'text-main' : 'text-main/60'}`}>
                                    {flag.label}
                                </span>
                                <span className={`text-[10px] truncate ${flag.value ? 'text-focus-300 font-medium' : 'text-main/40'}`}>
                                    {flag.value ? 'Habilitado' : 'No configurado'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Manejo y Logística del Item */}
            <ItemHandlingSection
                logisticsProfileId={item.logisticsProfileId || (item as any).logistics_profile_id}
                temperatureClassId={item.temperatureClassId || (item as any).temperature_class_id}
                hazardClassId={item.hazardClassId || (item as any).hazard_class_id}
                segregationGroupId={item.segregationGroupId || (item as any).segregation_group_id}
            />

            {/* Proveedores del Item */}
            <ItemSuppliersSection
                suppliers={item.suppliers}
            />

            {/* Plataformas Comerciales del Item */}
            <ItemPlatformsSection
                platforms={item.platforms || (item as any).platformIds}
            />

            {/* Metadatos Dinámicos */}
            <MetadataFieldsClient
                entityType="common.item"
                entityId={item.id}
                title="Metadatos del Item"
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

            <PresentationsTable
                presentations={item.presentations}
                uoms={uoms}
                packagingLevels={packagingLevels}
                getUomName={getUomName}
            />

            {/* Galería Multimedia */}
            <ItemMediaGallery
                itemId={item.id}
                itemSku={item.sku}
                itemName={item.itemName}
                initialMedia={item.media || []}
                onMediaChange={onMediaChange}
            />
        </div>
    );
}
