"use client";

import { saleBillingModesService } from "@/app/services/product_services/saleBillingModes.service";
import { IFUoMCategory } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface SaleBillingModesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHidden?: () => void;
    onSuccess: () => void;
    categories: IFUoMCategory[];
    initialData?: any;
}

const emptySaleBillingModeData = {
    id: "",
    code: "",
    name: "",
    description: "",
    billingUomCategoryId: "",
    isDualUom: false,
    requiresSecondaryUom: false,
    secondaryUomCategoryId: null as string | null,
    active: true,
};

const SaleBillingModesModal = ({ isOpen, onClose, onHidden, onSuccess, categories, initialData }: SaleBillingModesModalProps) => {
    const { token, currentCompany } = useAuth();
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);

    const [formData, setFormData] = useState(emptySaleBillingModeData);

    const secondaryUomCategories = useMemo(() => {
        return categories.filter(c => c.id !== formData.billingUomCategoryId);
    }, [categories, formData.billingUomCategoryId]);

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    id: initialData.id || "",
                    code: initialData.code || "",
                    name: initialData.name || "",
                    description: initialData.description || "",
                    billingUomCategoryId: initialData.billingUomCategoryId || "",
                    isDualUom: initialData.isDualUom || false,
                    requiresSecondaryUom: initialData.requiresSecondaryUom || false,
                    secondaryUomCategoryId: initialData.secondaryUomCategoryId || null,
                    active: initialData.active ?? true,
                }
                : { ...emptySaleBillingModeData };

            setFormData(nextData);

            setTimeout(() => {
                const formInstance = formRef.current?.instance();
                if (formInstance) {
                    formInstance.option("formData", nextData);
                    const shouldEnable = nextData.isDualUom || nextData.requiresSecondaryUom;
                    const secEditor = formInstance.getEditor("secondaryUomCategoryId");
                    if (secEditor) {
                        secEditor.option("disabled", !shouldEnable);
                        const filteredSec = categories.filter(c => c.id !== nextData.billingUomCategoryId);
                        secEditor.option("dataSource", filteredSec);
                    }
                }
            }, 0);
        }
    }, [isOpen, initialData, categories]);

    const handleHidden = useCallback(() => {
        setFormData({ ...emptySaleBillingModeData });
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
            if (initialData && initialData.id) {
                await saleBillingModesService.update(currentFormData, initialData.id, token, currentCompany?.id);
                notify("Modo de venta actualizado exitosamente", "success", 3000);
            } else {
                await saleBillingModesService.create(currentFormData, token, currentCompany?.id);
                notify("Modo de venta creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving Sale Billing Mode:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al guardar el modo de venta";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData, onClose, onSuccess, token, currentCompany?.id]);

    const formContent = useMemo(() => (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
            colCount={2}
        >
            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="name"
                    label={{ text: "Nombre" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: Por unidad",
                        stylingMode: 'filled',
                        maxLength: FIELD_LIMITS.stringLong,
                    }}
                    validationRules={[
                        { type: 'required', message: "El nombre es obligatorio" },
                        { type: 'stringLength', max: FIELD_LIMITS.stringLong, message: `El nombre no puede superar los ${FIELD_LIMITS.stringLong} caracteres` },
                    ]}
                />
            </GroupItem>

            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="code"
                    label={{ text: "Código" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: by_unit",
                        stylingMode: 'filled',
                        disabled: !!initialData,
                    }}
                    validationRules={initialData ? [] : [
                        { type: 'required', message: "El código es obligatorio" },
                        {
                            type: 'pattern',
                            pattern: /^[a-z][a-z0-9_]{1,30}$/,
                            message: "El código debe estar en minúsculas, empezar con una letra y contener entre 2 y 31 caracteres (solo letras, números y guión bajo)"
                        }
                    ]}
                />
            </GroupItem>

            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="description"
                    label={{ text: "Descripción" }}
                    editorType="dxTextArea"
                    editorOptions={{
                        placeholder: "Descripción detallada del modo de venta...",
                        height: 70,
                        stylingMode: 'filled',
                    }}
                />
            </GroupItem>

            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="billingUomCategoryId"
                    label={{ text: "Categoría de UoM Principal (Facturación)" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: categories,
                        valueExpr: "id",
                        displayExpr: "name",
                        searchEnabled: true,
                        stylingMode: 'filled',
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        },
                        onValueChanged: (e: any) => {
                            if (!e.event) return;
                            const formInstance = formRef.current?.instance();
                            if (!formInstance) return;

                            const selectedCatId = e.value;
                            const filteredSecondary = categories.filter(c => c.id !== selectedCatId);
                            const secEditor = formInstance.getEditor("secondaryUomCategoryId");
                            if (secEditor) {
                                secEditor.option("dataSource", filteredSecondary);
                                if (secEditor.option("value") === selectedCatId) {
                                    secEditor.option("value", null);
                                    formInstance.updateData("secondaryUomCategoryId", null);
                                }
                            }
                        }
                    }}
                    validationRules={[{ type: 'required', message: "La categoría principal es obligatoria" }]}
                />
            </GroupItem>

            <SimpleItem
                dataField="isDualUom"
                label={{ text: "U. Medida Doble" }}
                editorType="dxCheckBox"
                editorOptions={{
                    text: "Habilitar modo doble",
                    stylingMode: 'filled',
                    onValueChanged: (e: any) => {
                        if (!e.event) return;
                        const formInstance = formRef.current?.instance();
                        if (!formInstance) return;

                        const isDual = e.value;
                        const reqEditor = formInstance.getEditor("requiresSecondaryUom");
                        let requiresSec = reqEditor?.option("value") ?? false;

                        if (!isDual && requiresSec) {
                            requiresSec = false;
                            reqEditor?.option("value", false);
                            formInstance.updateData("requiresSecondaryUom", false);
                        }

                        const shouldEnable = isDual || requiresSec;
                        const secEditor = formInstance.getEditor("secondaryUomCategoryId");
                        if (secEditor) {
                            secEditor.option("disabled", !shouldEnable);
                            if (!shouldEnable) {
                                secEditor.option("value", null);
                                formInstance.updateData("secondaryUomCategoryId", null);
                            }
                        }
                    }
                }}
            />

            <SimpleItem
                dataField="requiresSecondaryUom"
                label={{ text: "Req. U. Medida Secundaria" }}
                editorType="dxCheckBox"
                editorOptions={{
                    text: "Obligatorio secundaria",
                    stylingMode: 'filled',
                    onValueChanged: (e: any) => {
                        if (!e.event) return;
                        const formInstance = formRef.current?.instance();
                        if (!formInstance) return;

                        const requiresSec = e.value;
                        if (requiresSec) {
                            const dualEditor = formInstance.getEditor("isDualUom");
                            if (dualEditor) {
                                dualEditor.option("value", true);
                                formInstance.updateData("isDualUom", true);
                            }
                        }

                        const isDual = formInstance.getEditor("isDualUom")?.option("value") ?? false;
                        const shouldEnable = isDual || requiresSec;
                        const secEditor = formInstance.getEditor("secondaryUomCategoryId");
                        if (secEditor) {
                            secEditor.option("disabled", !shouldEnable);
                            if (!shouldEnable) {
                                secEditor.option("value", null);
                                formInstance.updateData("secondaryUomCategoryId", null);
                            }
                        }
                    }
                }}
            />

            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="secondaryUomCategoryId"
                    label={{ text: "Categoría de U. Medida Secundaria" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: secondaryUomCategories,
                        valueExpr: "id",
                        displayExpr: "name",
                        searchEnabled: true,
                        showClearButton: true,
                        stylingMode: 'filled',
                        disabled: !formData.isDualUom && !formData.requiresSecondaryUom,
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                    validationRules={[
                        {
                            type: 'custom',
                            message: 'Debe especificar la categoría secundaria si está habilitado U. Medida doble o es requerido',
                            validationCallback: (e: any) => {
                                const formInstance = formRef.current?.instance();
                                const currentData = formInstance?.option("formData") || formData;
                                const isDual = formInstance?.getEditor("isDualUom")?.option("value") ?? currentData.isDualUom;
                                const reqSec = formInstance?.getEditor("requiresSecondaryUom")?.option("value") ?? currentData.requiresSecondaryUom;
                                if (isDual || reqSec) {
                                    return !!e.value;
                                }
                                return true;
                            }
                        }
                    ]}
                />
            </GroupItem>

            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="active"
                    label={{ text: "Estado" }}
                    editorType="dxCheckBox"
                    editorOptions={{
                        text: "Activo",
                        stylingMode: 'filled',
                    }}
                />
            </GroupItem>
        </Form>
    ), [formData, categories, secondaryUomCategories]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Modo de Venta" : "Nuevo Modo de Venta"}
            width={550}
            height={550}
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

export default SaleBillingModesModal;
