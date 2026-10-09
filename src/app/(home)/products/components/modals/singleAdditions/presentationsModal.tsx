"use client";

import { presentationsService } from "@/app/services/product_services/presentations.service";
import { IFItem } from "@repo/api-contracts/erp";
import { IFUOM } from "@repo/api-contracts/erp";
import { IFPackagingLevel } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface PresentationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    items?: IFItem[];
    uoms: IFUOM[];
    packagingLevels: IFPackagingLevel[];
    initialData?: any;
    isEditing?: boolean;
}

const emptyPresentationData = {
    itemId: "",
    name: "",
    barcode: "",
    uomId: "",
    uomRatio: 1,
    packagingLevelId: "",
    active: true,
    isPrimary: false,
};

const PresentationsModal = ({ isOpen, onClose, onSuccess, onHidden, items = [], uoms, packagingLevels, initialData, isEditing = false }: PresentationsModalProps) => {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);

    const { token } = useAuth();

    const [formData, setFormData] = useState(emptyPresentationData);

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    itemId: initialData.itemId || "",
                    name: initialData.name || "",
                    barcode: initialData.barcode || "",
                    uomId: initialData.uomId || "",
                    uomRatio: initialData.uomRatio || 1,
                    packagingLevelId: initialData.packagingLevelId || "",
                    active: initialData.active ?? true,
                    isPrimary: initialData.isPrimary ?? false,
                }
                : { ...emptyPresentationData };

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
    }, [isOpen, initialData]);

    const handleHidden = useCallback(() => {
        setFormData({ ...emptyPresentationData });
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            const code = packagingLevels.find(pl => pl.id === currentFormData.packagingLevelId)?.code;
            if (isEditing && initialData?.id) {
                await presentationsService.update({ ...currentFormData, packagingLevelCode: code }, initialData.id, token);
                notify("Presentación actualizada exitosamente", "success", 3000);
            } else {
                await presentationsService.create({ ...currentFormData, itemId: currentFormData.itemId, packagingLevelCode: code }, token);
                notify("Presentación creada exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving presentation:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al guardar la presentación";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData, isEditing, onClose, onSuccess, packagingLevels, token]);

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
                    dataField="itemId"
                    label={{ text: "Item (SKU)" }}
                    editorType="dxSelectBox"
                    colSpan={2}
                    editorOptions={{
                        dataSource: items,
                        valueExpr: "id",
                        displayExpr: (item: any) => item ? `${item.code || item.sku || ""} - ${item.label || item.productName || item.name || ""}` : "",
                        searchExpr: ["code", "label", "sku", "productName"],
                        searchEnabled: true,
                        placeholder: "Seleccione un item...",
                        disabled: !!initialData && (!!initialData.id || !!initialData.itemId),
                        stylingMode: 'filled',
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                    validationRules={[{ type: 'required', message: "El item es obligatorio" }]}
                />

                <SimpleItem
                    dataField="name"
                    label={{ text: "Nombre de Presentación" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: Caja x12, Pack Económico",
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
                    dataField="barcode"
                    label={{ text: "Código de Barras" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: 7791234...",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                        maxLength: FIELD_LIMITS.stringMiddle,
                    }}
                    validationRules={[
                        { type: 'required', message: "El código de barras es obligatorio" },
                        { type: 'stringLength', max: FIELD_LIMITS.stringMiddle, message: `El código de barras no puede superar los ${FIELD_LIMITS.stringMiddle} caracteres` },
                        { type: 'pattern', pattern: /^[a-zA-Z0-9\-_]+$/, message: "El código de barras solo puede contener caracteres alfanuméricos, guiones y guiones bajos" }
                    ]}
                />

                <SimpleItem
                    dataField="uomId"
                    label={{ text: "Unidad de Medida" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: uoms,
                        valueExpr: "id",
                        displayExpr: "name",
                        searchEnabled: true,
                        stylingMode: 'filled',
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                    validationRules={[{ type: 'required', message: "La unidad de medida es obligatoria" }]}
                />

                <SimpleItem
                    dataField="uomRatio"
                    label={{ text: "Relación (Ratio)" }}
                    editorType="dxNumberBox"
                    editorOptions={{
                        min: 1,
                        max: FIELD_LIMITS.decimalMax,
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                    }}
                    validationRules={[
                        { type: 'required', message: "El ratio es obligatorio" },
                        { type: 'range', max: FIELD_LIMITS.decimalMax, message: FIELD_LIMITS.decimalMaxMessage }
                    ]}
                />

                <SimpleItem
                    dataField="packagingLevelId"
                    label={{ text: "Nivel de Empaque" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: packagingLevels,
                        valueExpr: "id",
                        displayExpr: "name",
                        searchEnabled: true,
                        stylingMode: 'filled',
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                    validationRules={[{ type: 'required', message: "El nivel de empaque es obligatorio" }]}
                />

                <SimpleItem
                    dataField="active"
                    label={{ text: "Estado" }}
                    editorType="dxCheckBox"
                    editorOptions={{
                        text: "Activo",
                        stylingMode: 'filled',
                    }}
                />

                <SimpleItem
                    dataField="isPrimary"
                    label={{ text: "Principal" }}
                    editorType="dxCheckBox"
                    editorOptions={{
                        text: "Es Principal",
                        stylingMode: 'filled',
                    }}
                />
            </GroupItem>
        </Form>
    ), [formData, items, uoms, packagingLevels, isEditing, initialData]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={isEditing ? "Editar Presentación" : "Añadir una nueva presentación"}
            width={600}
            height="auto"
            maxHeight="88vh"
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
                    className="!rounded-dx !bg-main/10"
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
                    className="!bg-focus-300 !rounded-dx shadow-lg shadow-black/20 !text-variant"
                />
            </ToolbarItem>
        </Popup>
    );
};

export default PresentationsModal;
