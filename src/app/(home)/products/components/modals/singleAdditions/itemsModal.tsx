"use client";

import { itemsService } from "@/app/services/product_services/items.service";
import { IFUOM } from "@repo/api-contracts/erp";
import { Button } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { CheckBox } from "devextreme-react";
import Form, { EmptyItem, GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";
import notify from "devextreme/ui/notify";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tooltip } from "devextreme-react/tooltip";
import { currenciesService } from "@/app/services/payments_services/currencies.service";
import { providerService } from "@/app/services/location_services/provider.service";
import { commercialPlatformsService } from "@/app/services/partners/commercialPlatforms.service";
import { logisticProfileService } from "@/app/services/product_services/logisticProfile.service";
import { temperatureService } from "@/app/services/product_services/temperature.service";
import { hazardService } from "@/app/services/product_services/hazard.service";
import { segregationGroupsService } from "@/app/services/product_services/segregationGroups.service";
import { IFCurrency, IFLogisticProfile, IFTemperatureClass, IFHazardClass, IFSegregationGroup, IFProvider, IFCommercialPlatform } from "@repo/api-contracts/erp";

interface ItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    uoms: IFUOM[];
    products?: any[];
    initialData?: any;
    isEditing?: boolean;
}

const costMethods = [
    { id: 'standard', name: 'Estándar' },
    { id: 'fifo', name: 'FIFO' },
    { id: 'average', name: 'Promedio' }
];

const emptyItemData = {
    productId: "",
    sku: "",
    itemName: "",
    costMethod: "average",
    wheight: 0,
    volume: 0,
    palletUnits: 0,
    palletUomId: null as string | null,
    uomRatio: null as number | null,
    minDaysToExpiryReception: 0,
    minDaysToExpiryOrder: 0,
    isDualUom: false,
    active: true,
    isInventoryItem: true,
    requiresExpiry: false,
    isSerializable: false,
    isConsignmentItem: false,
    companyId: "",
};

interface CheckboxContainerProps {
    children: React.ReactNode;
    description: string;
    showTooltip?: boolean;
    className?: string;
}

const CheckboxContainer = ({ children, description, showTooltip = false, className = "" }: CheckboxContainerProps) => {
    const id = React.useId();
    const targetId = `tooltip-${id.replace(/:/g, "")}`;

    return (
        <div className={`flex flex-col gap-1 p-3 rounded-dx border border-main/5 hover:border-main/10 transition-colors ${className}`}>
            <div className="flex justify-between items-center w-full">
                <div className="flex-grow">
                    {children}
                </div>
                {showTooltip && (
                    <>
                        <i
                            id={targetId}
                            className="dx-icon dx-icon-info text-main/60 hover:text-main cursor-pointer text-sm ml-2"
                        />
                        <Tooltip
                            target={`#${targetId}`}
                            showEvent="mouseenter"
                            hideEvent="mouseleave"
                            hideOnOutsideClick={false}
                        >
                            <div className="text-xs leading-normal">
                                {description}
                            </div>
                        </Tooltip>
                    </>
                )}
            </div>
            {!showTooltip && (
                <p className="text-[11px] text-main/50 pl-6 leading-normal">
                    {description}
                </p>
            )}
        </div>
    );
};


const ItemsModal = ({ isOpen, onClose, onSuccess, onHidden, uoms, products = [], initialData, isEditing = false }: ItemsModalProps) => {
    const { currentCompany, token } = useAuth();

    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);

    const [formData, setFormData] = useState({
        ...emptyItemData,
        companyId: currentCompany?.id || "",
        currencyId: currentCompany?.currencyId ?? null,
    });

    const [currencies, setCurrencies] = useState<IFCurrency[]>([]);
    const [suppliers, setSuppliers] = useState<IFProvider[]>([]);
    const [platforms, setPlatforms] = useState<IFCommercialPlatform[]>([]);
    const [logisticsProfiles, setLogisticsProfiles] = useState<IFLogisticProfile[]>([]);
    const [temperatureClasses, setTemperatureClasses] = useState<IFTemperatureClass[]>([]);
    const [hazardClasses, setHazardClasses] = useState<IFHazardClass[]>([]);
    const [segregationGroups, setSegregationGroups] = useState<IFSegregationGroup[]>([]);

    // Check if initial data has any handling value
    const hasHandlingData = !!initialData?.logisticsProfileId || !!initialData?.temperatureClassId || !!initialData?.hazardClassId || !!initialData?.segregationGroupId;

    useEffect(() => {
        if (!isOpen || !token) return;
        currenciesService.getAll(token).then(res => setCurrencies(res.items)).catch(console.error);
        providerService.getAll(token, currentCompany?.id).then(res => setSuppliers(res.items)).catch(console.error);
        commercialPlatformsService.getAll({ companyId: currentCompany?.id, limit: 500, offset: 0 }, token).then(res => setPlatforms(res.items)).catch(console.error);
        logisticProfileService.getAll(currentCompany?.id ?? '', token).then(setLogisticsProfiles).catch(console.error);
        temperatureService.getAll(currentCompany?.id ?? '', token).then(setTemperatureClasses).catch(console.error);
        hazardService.getAll(currentCompany?.id ?? '', token).then(setHazardClasses).catch(console.error);
        segregationGroupsService.getAll(currentCompany?.id ?? '', token).then(setSegregationGroups).catch(console.error);
    }, [isOpen, token, currentCompany?.id]);

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    productId: initialData.productId || initialData.id || "",
                    sku: initialData.sku || "",
                    itemName: initialData.itemName || "",
                    costMethod: initialData.costMethod || "average",
                    wheight: initialData.wheight || initialData.weight || 0,
                    volume: initialData.volume || 0,
                    palletUnits: initialData.palletUnits || 0,
                    palletUomId: initialData.palletUomId || null,
                    uomRatio: initialData.uomRatio ?? null,
                    minDaysToExpiryReception: initialData.minDaysToExpiryReception || 0,
                    minDaysToExpiryOrder: initialData.minDaysToExpiryOrder || 0,
                    isDualUom: initialData.isDualUom ?? false,
                    active: initialData.active ?? true,
                    isInventoryItem: initialData.isInventoryItem ?? true,
                    requiresExpiry: initialData.requiresExpiry ?? false,
                    isSerializable: initialData.isSerializable ?? false,
                    isConsignmentItem: initialData.isConsignmentItem ?? false,
                    companyId: currentCompany?.id || "",
                    currencyId: initialData.currencyId || currentCompany?.currencyId || null,
                    suppliers: initialData.suppliers || [],
                    platformIds: initialData.platformIds || [],
                    logisticsProfileId: initialData.logisticsProfileId || null,
                    temperatureClassId: initialData.temperatureClassId || null,
                    hazardClassId: initialData.hazardClassId || null,
                    segregationGroupId: initialData.segregationGroupId || null,
                }
                : {
                    ...emptyItemData,
                    companyId: currentCompany?.id || "",
                    currencyId: currentCompany?.currencyId ?? null,
                };

            setFormData(nextData);

            setTimeout(() => {
                const formInstance = formRef.current?.instance();
                if (formInstance) {
                    formInstance.option("formData", nextData);
                    if (typeof formInstance.reset === 'function') {
                        formInstance.reset();
                    }
                    formInstance.option("formData", nextData);
                }
            }, 0);
        }
    }, [isOpen, initialData, currentCompany?.id]);

    const handleHidden = useCallback(() => {
        setFormData({
            ...emptyItemData,
            companyId: currentCompany?.id || "",
            currencyId: currentCompany?.currencyId ?? null,
        });
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden, currentCompany?.id]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            if (initialData?.id && isEditing) {
                await itemsService.update(currentFormData, initialData.id, token, currentCompany?.id);
                notify("Item actualizado exitosamente", "success", 3000);
            } else {
                await itemsService.create(currentFormData, token, currentCompany?.id);
                notify("Item creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving item:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al guardar el item";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData, isEditing, onClose, onSuccess, token, currentCompany?.id]);

    const formContent = useMemo(() => (
        <>
            <Form
                ref={formRef}
                formData={formData}
                labelLocation="top"
                colCount={2}
            >
                <GroupItem colSpan={2} colCount={2}>
                    <SimpleItem
                        visible={!isEditing}
                        dataField="productId"
                        label={{ text: "Producto" }}
                        editorType="dxSelectBox"
                        colSpan={2}
                        editorOptions={{
                            dataSource: products,
                            valueExpr: "id",
                            displayExpr: "label",
                            searchEnabled: true,
                            stylingMode: 'filled',
                            disabled: !!initialData && (!!initialData.id || !!initialData.productId),
                            onValueChanged: (e: any) => {
                                if (e.event) {
                                    const selectedProduct = products.find(p => p.id === e.value);
                                    if (selectedProduct?.classification === 'SERVICIO') {
                                        formRef.current?.instance().updateData("isInventoryItem", false);
                                    }
                                }
                            },
                            dropDownOptions: {
                                wrapperAttr: {
                                    class: "popup-menu-container"
                                }
                            }
                        }}
                        validationRules={[{ type: 'required', message: "El producto es obligatorio" }]}
                    />
                    <SimpleItem
                        dataField="sku"
                        label={{ text: "SKU" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            placeholder: "Ej: SKU-001",
                            valueChangeEvent: "blur",
                            stylingMode: 'filled',
                            maxLength: FIELD_LIMITS.stringShort,
                        }}
                        validationRules={[
                            { type: 'required', message: "El SKU es obligatorio" },
                            { type: 'stringLength', max: FIELD_LIMITS.stringShort, message: `El SKU no puede superar los ${FIELD_LIMITS.stringShort} caracteres` },
                        ]}
                    />
                    <SimpleItem
                        dataField="itemName"
                        label={{ text: "Nombre de Item" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            placeholder: products.find(p => p.id === formData.productId)?.label || "Nombre del Producto por defecto",
                            valueChangeEvent: "blur",
                            stylingMode: 'filled',
                            maxLength: FIELD_LIMITS.stringLong,
                        }}
                        validationRules={[
                            { type: 'stringLength', max: FIELD_LIMITS.stringLong, message: `El nombre no puede superar los ${FIELD_LIMITS.stringLong} caracteres` },
                        ]}
                    />

                    <SimpleItem
                        dataField="costMethod"
                        label={{ text: "Método de Costo" }}
                        editorType="dxSelectBox"
                        editorOptions={{
                            dataSource: costMethods,
                            valueExpr: "id",
                            displayExpr: "name",
                            stylingMode: 'filled',
                            dropDownOptions: {
                                wrapperAttr: {
                                    class: "popup-menu-container"
                                }
                            }
                        }}
                        validationRules={[{ type: 'required', message: "El método de costo es obligatorio" }]}
                    />

                    <SimpleItem
                        dataField="palletUomId"
                        label={{ text: "U. Medida Pallet" }}
                        editorType="dxSelectBox"
                        editorOptions={{
                            dataSource: uoms,
                            valueExpr: "id",
                            displayExpr: "name",
                            stylingMode: 'filled',
                            dropDownOptions: {
                                wrapperAttr: {
                                    class: "popup-menu-container"
                                }
                            }
                        }}
                        validationRules={[{ type: 'required', message: "La U. Medida Pallet es obligatoria" }]}
                    />

                    <SimpleItem
                        dataField="wheight"
                        label={{ text: "Peso" }}
                        editorType="dxNumberBox"
                        editorOptions={{
                            min: 0,
                            max: FIELD_LIMITS.decimalMax,
                            valueChangeEvent: "blur",
                            stylingMode: 'filled',
                        }}
                        validationRules={[{ type: 'range', min: 0, max: FIELD_LIMITS.decimalMax, message: FIELD_LIMITS.decimalMaxMessage }]}
                    />
                    <SimpleItem
                        dataField="volume"
                        label={{ text: "Volumen" }}
                        editorType="dxNumberBox"
                        editorOptions={{
                            min: 0,
                            max: FIELD_LIMITS.decimalMax,
                            valueChangeEvent: "blur",
                            stylingMode: 'filled',
                        }}
                        validationRules={[{ type: 'range', min: 0, max: FIELD_LIMITS.decimalMax, message: FIELD_LIMITS.decimalMaxMessage }]}
                    />

                    <SimpleItem
                        dataField="palletUnits"
                        label={{ text: "Unidades por Pallet" }}
                        editorType="dxNumberBox"
                        editorOptions={{
                            min: 0,
                            max: FIELD_LIMITS.smallIntMax,
                            valueChangeEvent: "blur",
                            stylingMode: 'filled',
                        }}
                        validationRules={[{ type: 'range', min: 0, max: FIELD_LIMITS.smallIntMax, message: FIELD_LIMITS.smallIntMaxMessage }]}
                    />

                    <SimpleItem
                        dataField="uomRatio"
                        label={{ text: "Ratio UoM Secundaria" }}
                        editorType="dxNumberBox"
                        editorOptions={{
                            min: 0,
                            format: "#,##0.########",
                            valueChangeEvent: "blur",
                            stylingMode: 'filled',
                            placeholder: "Ej: 1.5",
                            disabled: !formData.isDualUom,
                        }}
                    />

                    <SimpleItem
                        colSpan={2}
                        render={() => {
                            const formInstance = formRef.current?.instance();
                            const currentData = formInstance?.option("formData") || formData;
                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-2">
                                    <CheckboxContainer description="Permite el registro de dos unidades de medida diferentes para el mismo artículo.">
                                        <CheckBox
                                            text="U.Medida Doble"
                                            value={currentData.isDualUom}
                                            readOnly
                                            disabled
                                        />
                                    </CheckboxContainer>

                                    <CheckboxContainer description="Determina si el artículo se almacena en inventario y realiza movimientos de stock.">
                                        <CheckBox
                                            text="Controla Stock"
                                            defaultValue={currentData.isInventoryItem}
                                            onValueChanged={(e) => {
                                                if (formInstance) {
                                                    formInstance.updateData("isInventoryItem", !!e.value);
                                                }
                                            }}
                                        />
                                    </CheckboxContainer>
                                    <CheckboxContainer description="Exige el registro de fecha de caducidad para este lote de artículos.">
                                        <CheckBox
                                            text="Requiere Vencimiento"
                                            defaultValue={currentData.requiresExpiry}
                                            onValueChanged={(e) => {
                                                if (formInstance) {
                                                    formInstance.updateData("requiresExpiry", !!e.value);
                                                }
                                            }}
                                        />
                                    </CheckboxContainer>
                                    <CheckboxContainer description="Permite realizar el seguimiento individual de cada unidad mediante un número de serie único.">
                                        <CheckBox
                                            text="Es Serializable"
                                            defaultValue={currentData.isSerializable}
                                            onValueChanged={(e) => {
                                                if (formInstance) {
                                                    formInstance.updateData("isSerializable", !!e.value);
                                                }
                                            }}
                                        />
                                    </CheckboxContainer>
                                    <CheckboxContainer description="Habilita la recepción y entrega de mercadería bajo la modalidad de consignación.">
                                        <CheckBox
                                            text="Admite Consignación"
                                            defaultValue={currentData.isConsignmentItem}
                                            onValueChanged={(e) => {
                                                if (formInstance) {
                                                    formInstance.updateData("isConsignmentItem", !!e.value);
                                                }
                                            }}
                                        />
                                    </CheckboxContainer>
                                    <CheckboxContainer description="Define si el artículo se encuentra activo en el sistema para operaciones comerciales.">
                                        <CheckBox
                                            text="Activo"
                                            defaultValue={currentData.active}
                                            onValueChanged={(e) => {
                                                if (formInstance) {
                                                    formInstance.updateData("active", !!e.value);
                                                }
                                            }}
                                        />
                                    </CheckboxContainer>
                                </div>
                            );
                        }}
                    />
                </GroupItem>
            </Form>

            <details
                className="group border border-main/10 rounded-dx bg-primary-0/40 shadow-sm mt-4 transition-all duration-300"
                open={hasHandlingData}
                onToggle={(e: any) => {
                    if (!e.target.open) {
                        const handlingForm = formRef.current?.instance();
                        if (handlingForm) {
                            handlingForm.updateData("logisticsProfileId", null);
                            handlingForm.updateData("temperatureClassId", null);
                            handlingForm.updateData("hazardClassId", null);
                            handlingForm.updateData("segregationGroupId", null);
                        }
                    }
                }}
            >
                <summary className="p-5 cursor-pointer list-none flex justify-between items-center focus:outline-none rounded-dx">
                    <div>
                        <h3 className="text-lg font-bold text-dx-primary mb-1 group-open:text-focus-300 transition-colors">Manejo de Artículos</h3>
                        <p className="text-xs opacity-60">Configuración por defecto del item (sobrescribe la del producto)</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-xs font-semibold text-main/60 bg-main/5 px-3 py-1 rounded-full group-open:hidden">
                            Usando valores por defecto
                        </div>
                        <div className="text-xs font-semibold text-focus-300 bg-focus-300/10 px-3 py-1 rounded-full hidden group-open:block">
                            Definiendo valores manualmente
                        </div>
                        <i className="dx-icon-chevronright group-open:rotate-90 transition-transform duration-300 text-main/50" />
                    </div>
                </summary>

                <div className="px-5 pb-5 border-t border-main/5 pt-5">
                    <Form
                        formData={formData}
                        colCount={2}
                        scrollingEnabled={false}
                    >

                        <SimpleItem
                            dataField="logisticsProfileId"
                            label={{ text: "Perfil Logístico" }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                dataSource: logisticsProfiles,
                                valueExpr: "id",
                                displayExpr: "name",
                                searchEnabled: true,
                                showClearButton: true,
                                stylingMode: 'filled',
                                placeholder: "Seleccione...",
                                dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } }
                            }}
                        />

                        <SimpleItem
                            dataField="temperatureClassId"
                            label={{ text: "Clase de Temperatura" }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                dataSource: temperatureClasses,
                                valueExpr: "id",
                                displayExpr: "name",
                                searchEnabled: true,
                                showClearButton: true,
                                stylingMode: 'filled',
                                placeholder: "Seleccione...",
                                dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } }
                            }}
                        />

                        <SimpleItem
                            dataField="hazardClassId"
                            label={{ text: "Clase de Peligro" }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                dataSource: hazardClasses,
                                valueExpr: "id",
                                displayExpr: "name",
                                searchEnabled: true,
                                showClearButton: true,
                                stylingMode: 'filled',
                                placeholder: "Seleccione...",
                                dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } }
                            }}
                        />

                        <SimpleItem
                            dataField="segregationGroupId"
                            label={{ text: "Grupo de Segregación" }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                dataSource: segregationGroups,
                                valueExpr: "id",
                                displayExpr: "name",
                                searchEnabled: true,
                                showClearButton: true,
                                stylingMode: 'filled',
                                placeholder: "Seleccione...",
                                dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } }
                            }}
                        />
                    </Form>
                </div>
            </details>
        </>
    ), [formData, products, uoms, isEditing, initialData, currencies, suppliers, platforms, logisticsProfiles, temperatureClasses, hazardClasses, segregationGroups, hasHandlingData]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={isEditing ? "Editar Item" : "Añadir un nuevo item"}
            width={850}
            height="auto"
            maxHeight="90vh"
            className="custom-popup"
            deferRendering={false}
            onShown={(e) => {
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-4">
                {formContent}
            </div>

            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text="Cancelar"
                    onClick={onClose}
                    disabled={loading}
                    stylingMode="text"
                />
            </ToolbarItem>
            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text="Guardar"
                    type="default"
                    stylingMode="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                />
            </ToolbarItem>
        </Popup>
    );
};

export default ItemsModal;
