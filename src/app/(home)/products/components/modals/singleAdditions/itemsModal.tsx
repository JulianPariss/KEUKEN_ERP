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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

const ItemsModal = ({ isOpen, onClose, onSuccess, onHidden, uoms, products = [], initialData, isEditing = false }: ItemsModalProps) => {
    const { currentCompany, token } = useAuth();

    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);

    const [formData, setFormData] = useState({
        ...emptyItemData,
        companyId: currentCompany?.id || "",
    });

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
                }
                : {
                    ...emptyItemData,
                    companyId: currentCompany?.id || "",
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
                        placeholder: "Ingrese el nombre",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                        maxLength: FIELD_LIMITS.stringLong,
                    }}
                    validationRules={[
                        { type: 'required', message: "El nombre es obligatorio" },
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
    ), [formData, products, uoms, isEditing, initialData]);

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
            width={650}
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
