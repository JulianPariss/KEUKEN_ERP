"use client";

import { IFUOM } from "@repo/api-contracts/erp";
import { IFPackagingLevel } from "@repo/api-contracts/erp";
import { CheckBox } from "devextreme-react";
import { Button } from '@repo/devextreme';
import { Tooltip } from "devextreme-react/tooltip";
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { CustomRule, RequiredRule } from "devextreme-react/validator";
import React, { useState } from "react";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";

import { generateUUID } from "@/lib/utils/id.helper";
import { createEmptyItem } from "./creation";
import ItemsCreatedList from "./itemsCreatedList";
import PresentationsManagement from "./presentationsManagement";

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

interface IItemsSectionProps {
    uoms: IFUOM[];
    formRef: React.RefObject<any>;
    itemsData: any[];
    setItemsData: React.Dispatch<React.SetStateAction<any[]>>;
    currentItem: any;
    setCurrentItem: React.Dispatch<React.SetStateAction<any>>;
    currentCompany: string;
    canCreatePresentation?: boolean;
    isAddingItem: boolean;
    setIsAddingItem: React.Dispatch<React.SetStateAction<boolean>>;
    productData: any;
    saleBillingModes: any[];
    packagingLevels: IFPackagingLevel[];
}

const costMethods = [
    { id: 'standard', name: 'Estándar' },
    { id: 'fifo', name: 'FIFO' },
    { id: 'average', name: 'Promedio' }
];

interface StatefulCheckBoxProps {
    label: string;
    value: boolean;
    onChange?: (value: boolean) => void;
    readOnly?: boolean;
    disabled?: boolean;
}

const StatefulCheckBox = ({ label, value: defaultValue, onChange, readOnly, disabled }: StatefulCheckBoxProps) => {
    const [value, setValue] = useState(defaultValue);

    React.useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    return (
        <CheckBox
            text={label}
            value={value}
            readOnly={readOnly}
            disabled={disabled}
            onValueChanged={(e) => {
                const newVal = !!e.value;
                setValue(newVal);
                onChange?.(newVal);
            }}
        />
    );
};

const ItemsSection = (props: IItemsSectionProps) => {
    const {
        uoms,
        formRef,
        itemsData,
        setItemsData,
        currentItem,
        setCurrentItem,
        currentCompany,
        canCreatePresentation,
        setIsAddingItem,
        isAddingItem,
        productData,
        saleBillingModes,
        packagingLevels
    } = props;

    const hasItems = itemsData.length > 0;

    const selectedMode = saleBillingModes?.find((m: any) => m.code === productData.saleBillingModeCode);
    const requiresSecondaryUom = selectedMode ? (selectedMode.requiresSecondaryUom || selectedMode.isDualUom) : false;

    const addItem = () => {
        const result = formRef.current?.instance().validate();
        if (!result?.isValid) {
            return;
        }

        setItemsData([...itemsData, {
            ...currentItem,
            active: currentItem.active !== undefined ? currentItem.active : true,
            isDualUom: requiresSecondaryUom,
            tempId: generateUUID(),
            presentations: [...(currentItem.presentations || [])]
        }]);
        clearAll();
    };

    const removeItem = (tempId: string) => {
        setItemsData(itemsData.filter(i => i.tempId !== tempId));
    };

    const clearAll = () => {
        setCurrentItem(createEmptyItem(currentCompany));
        setIsAddingItem(false);
    };

    return (
        <div>
            {isAddingItem &&
                <div className="p-4 bg-primary-0/40 rounded-dx border-1 border-focus-100/30 relative">
                    <div className="flex justify-between items-center mb-4 pr-8">
                        <h3 className="text-lg">Añadir Items</h3>
                        {hasItems &&
                            <Button
                                icon="trash"
                                type="danger"
                                stylingMode="text"
                                className="!absolute top-4 right-4"
                                onClick={clearAll}
                            />
                        }
                    </div>
                    <Form
                        ref={formRef}
                        formData={currentItem}
                        labelLocation="top"
                        scrollingEnabled={false}
                        colCount={4}
                    >
                        {/* Group Item for all item inputs to isolate them from the presentations block */}
                        <GroupItem colSpan={4} colCount={4} cssClass="!p-0">
                            <SimpleItem
                                dataField="itemName"
                                label={{ text: "Nombre de Item" }}
                                editorType="dxTextBox"
                                editorOptions={{
                                    placeholder: "Ingrese el nombre",
                                    valueChangeEvent: "blur",
                                    stylingMode: 'filled',
                                    maxLength: FIELD_LIMITS.stringLong,
                                }}
                            >
                                <RequiredRule message="El nombre es obligatorio" />
                                <CustomRule
                                    message="Este nombre ya existe en la lista"
                                    reevaluate={true}
                                    validationCallback={(e) => {
                                        const val = typeof e.value === 'string' ? e.value.trim().toLowerCase() : '';
                                        return !itemsData.some(i => i.itemName.trim().toLowerCase() === val);
                                    }}
                                />
                            </SimpleItem>

                            <SimpleItem
                                dataField="sku"
                                label={{ text: "SKU" }}
                                editorType="dxTextBox"
                                editorOptions={{
                                    placeholder: "Identificador único",
                                    valueChangeEvent: "blur",
                                    stylingMode: 'filled',
                                    maxLength: FIELD_LIMITS.stringShort,
                                }}
                            >
                                <RequiredRule message="El SKU es obligatorio" />
                                <CustomRule
                                    message="Este SKU ya existe en la lista"
                                    reevaluate={true}
                                    validationCallback={(e) => {
                                        const val = typeof e.value === 'string' ? e.value.trim().toLowerCase() : '';
                                        return !itemsData.some(i => i.sku.trim().toLowerCase() === val);
                                    }}
                                />
                            </SimpleItem>

                            <SimpleItem
                                dataField="companyId"
                                label={{ text: "Compañía" }}
                                editorType="dxSelectBox"
                                visible={false}
                                editorOptions={{
                                    dataSource: [currentCompany],
                                    valueExpr: "id",
                                    displayExpr: "name",
                                    readOnly: true,
                                    stylingMode: 'filled',
                                }}
                                validationRules={[{ type: 'required', message: "La compañía es obligatoria" }]}
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
                                    dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } }
                                }}
                                validationRules={[{ type: 'required', message: "El método de costo es obligatorio" }]}
                            />

                            <SimpleItem
                                dataField="weight"
                                label={{ text: "Peso" }}
                                editorType="dxNumberBox"
                                editorOptions={{
                                    min: 0,
                                    max: FIELD_LIMITS.decimalMax,
                                    valueChangeEvent: "blur",
                                    stylingMode: 'filled',
                                }}
                                validationRules={[{ type: 'range', max: FIELD_LIMITS.decimalMax, message: FIELD_LIMITS.decimalMaxMessage }]}
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
                                validationRules={[{ type: 'range', max: FIELD_LIMITS.decimalMax, message: FIELD_LIMITS.decimalMaxMessage }]}
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
                                dataField="palletUomId"
                                label={{ text: "U. Medida Pallet" }}
                                editorType="dxSelectBox"
                                editorOptions={{
                                    dataSource: uoms,
                                    valueExpr: "id",
                                    displayExpr: "name",
                                    searchEnabled: true,
                                    stylingMode: 'filled',
                                    dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } }
                                }}
                                validationRules={[{ type: 'required', message: "La UoM de Pallet es obligatoria" }]}
                            />

                            <SimpleItem
                                dataField="uomRatio"
                                label={{ text: "Ratio de Unidad" }}
                                editorType="dxNumberBox"
                                visible={requiresSecondaryUom}
                                editorOptions={{
                                    min: 0,
                                    max: FIELD_LIMITS.decimalMax,
                                    valueChangeEvent: "blur",
                                    stylingMode: 'filled',
                                    placeholder: "Ej: 4.15"
                                }}
                                validationRules={[{ type: 'range', max: FIELD_LIMITS.decimalMax, message: FIELD_LIMITS.decimalMaxMessage }]}
                            >
                                {requiresSecondaryUom && <RequiredRule message="El ratio de unidad es obligatorio" />}
                            </SimpleItem>
                        </GroupItem>

                        <GroupItem colSpan={4} colCount={4} cssClass="!p-0 mt-4">
                            <SimpleItem colSpan={4} label={{ visible: false }} cssClass="!p-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-2">
                                    <CheckboxContainer
                                        description="Permite el registro de dos unidades de medida diferentes para el mismo artículo."
                                        showTooltip={true}
                                    >
                                        <StatefulCheckBox
                                            label="U.Medida Doble"
                                            value={requiresSecondaryUom}
                                            readOnly
                                            disabled
                                        />
                                    </CheckboxContainer>

                                    <CheckboxContainer
                                        description="Determina si el artículo se almacena en inventario y realiza movimientos de stock."
                                        showTooltip={true}
                                    >
                                        <StatefulCheckBox
                                            label="Controla Stock"
                                            value={currentItem.isInventoryItem}
                                            onChange={(val) => {
                                                currentItem.isInventoryItem = val;
                                            }}
                                        />
                                    </CheckboxContainer>

                                    <CheckboxContainer
                                        description="Exige el registro de fecha de caducidad para este lote de artículos."
                                        showTooltip={true}
                                    >
                                        <StatefulCheckBox
                                            label="Requiere Vencimiento"
                                            value={currentItem.requiresExpiry}
                                            onChange={(val) => {
                                                currentItem.requiresExpiry = val;
                                            }}
                                        />
                                    </CheckboxContainer>

                                    <CheckboxContainer
                                        description="Permite realizar el seguimiento individual de cada unidad mediante un número de serie único."
                                        showTooltip={true}
                                    >
                                        <StatefulCheckBox
                                            label="Es Serializable"
                                            value={currentItem.isSerializable}
                                            onChange={(val) => {
                                                currentItem.isSerializable = val;
                                            }}
                                        />
                                    </CheckboxContainer>

                                    <CheckboxContainer
                                        description="Habilita la recepción y entrega de mercadería bajo la modalidad de consignación."
                                        showTooltip={true}
                                    >
                                        <StatefulCheckBox
                                            label="Admite Consignación"
                                            value={currentItem.isConsignmentItem}
                                            onChange={(val) => {
                                                currentItem.isConsignmentItem = val;
                                            }}
                                        />
                                    </CheckboxContainer>

                                    <CheckboxContainer
                                        description="Define si el artículo se encuentra activo en el sistema para operaciones comerciales."
                                        showTooltip={true}
                                    >
                                        <StatefulCheckBox
                                            label="Activo"
                                            value={currentItem.active}
                                            onChange={(val) => {
                                                currentItem.active = val;
                                            }}
                                        />
                                    </CheckboxContainer>
                                </div>
                            </SimpleItem>
                        </GroupItem>

                        {/* Presentations Group is now guaranteed to occupy its own row underneath */}
                        <GroupItem
                            caption="Presentaciones"
                            colSpan={4}
                            colCount={4}
                            cssClass="!bg-primary-300 px-4 rounded-dx shadow-inner shadow-black/25 mt-4"
                        >
                            <SimpleItem colSpan={4} cssClass="!p-0" label={{ visible: false }}>
                                <PresentationsManagement
                                    currentItem={currentItem}
                                    setCurrentItem={setCurrentItem}
                                    uoms={uoms}
                                    itemsData={itemsData}
                                    packagingLevels={packagingLevels}
                                />
                            </SimpleItem>
                        </GroupItem>
                    </Form>
                    <div className="flex justify-end mt-4">
                        <Button
                            type="default"
                            stylingMode="contained"
                            text="Añadir Item con sus Presentaciones"
                            onClick={addItem}
                            className="!bg-focus-300 shadow-lg shadow-black/20 !text-variant"
                        />
                    </div>
                </div>
            }

            <h2 className="text-lg my-4">Items a crear <span>({itemsData.length})</span></h2>
            {hasItems ?
                <ItemsCreatedList
                    itemsData={itemsData}
                    currentPresentationsMap={{}}
                    setCurrentPresentationsMap={() => { }}
                    uoms={uoms}
                    costMethods={costMethods}
                    removeItem={removeItem}
                    canCreatePresentation={canCreatePresentation}
                    setItemsData={setItemsData}
                    setIsAddingItem={setIsAddingItem}
                    packagingLevels={packagingLevels}
                />
                :
                <div className="mt-2 p-4 bg-main/5 rounded-dx">
                    <p className="text-sm  opacity-60">No se han añadido items</p>
                </div>
            }
        </div>
    );
};

export default ItemsSection;
