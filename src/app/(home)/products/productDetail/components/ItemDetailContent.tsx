'use client';

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { metadataService } from "@/app/services/metadata.service";
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { CheckBox } from "devextreme-react";
import MetadataFieldsClient from "@/components/metadata/MetadataFieldsClient";
import PresentationsTable from "./PresentationsTable";
import { IFProductFullItem } from "@repo/api-contracts/erp";

type IFProductFullItemItem = IFProductFullItem['items'][number];

interface CheckboxContainerProps {
    children: React.ReactNode;
    description: string;
}

const CheckboxContainer = ({ children, description }: CheckboxContainerProps) => {
    return (
        <div className="flex flex-col gap-1 p-3 bg-primary-900/40 rounded-dx border border-main/5 hover:border-main/10 transition-colors">
            <div>
                {children}
            </div>
            <p className="text-[11px] text-main/50 pl-6 leading-normal">
                {description}
            </p>
        </div>
    );
};

interface ItemDetailContentProps {
    item: IFProductFullItemItem;
    uoms: any[];
    packagingLevels: any[];
    getUomName: (id: string) => string;
}

export default function ItemDetailContent({
    item,
    uoms,
    packagingLevels,
    getUomName
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
                    palletUomId: getUomName(item.palletUomId),
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-2 border-t border-main/10 pt-4">
                <CheckboxContainer description="Permite el registro de dos unidades de medida diferentes para el mismo artículo.">
                    <CheckBox
                        text="U.Medida Doble"
                        value={item.isDualUom || false}
                        readOnly
                        disabled
                    />
                </CheckboxContainer>

                <CheckboxContainer description="Determina si el artículo se almacena en inventario y realiza movimientos de stock.">
                    <CheckBox
                        text="Controla Stock"
                        value={item.isInventoryItem || false}
                        readOnly
                        disabled
                    />
                </CheckboxContainer>

                <CheckboxContainer description="Exige el registro de fecha de caducidad para este lote de artículos.">
                    <CheckBox
                        text="Requiere Vencimiento"
                        value={item.requiresExpiry || false}
                        readOnly
                        disabled
                    />
                </CheckboxContainer>

                <CheckboxContainer description="Permite realizar el seguimiento individual de cada unidad mediante un número de serie único.">
                    <CheckBox
                        text="Es Serializable"
                        value={item.isSerializable || false}
                        readOnly
                        disabled
                    />
                </CheckboxContainer>

                <CheckboxContainer description="Habilita la recepción y entrega de mercadería bajo la modalidad de consignación.">
                    <CheckBox
                        text="Admite Consignación"
                        value={item.isConsignmentItem || false}
                        readOnly
                        disabled
                    />
                </CheckboxContainer>
            </div>

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
        </div>
    );
}
