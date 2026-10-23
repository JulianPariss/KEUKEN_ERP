"use client";

import { metadataService } from "@repo/erp-services/metadata.service";
import { IFMetadataAttribute, IFMetadataGroup } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface MetadataAttributeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHidden?: () => void;
    onSuccess: () => void;
    initialData?: any;
    entityType: string;
    groups: IFMetadataGroup[];
}

const emptyMetadataData: Partial<IFMetadataAttribute> = {
    code: "",
    name: "",
    shortDescription: "",
    longDescription: "",
    groupCode: "",
    dataType: "string",
    isRequired: false,
    isVisible: true,
    isSystemInternal: false,
    sortOrder: 0,
    active: true,
};

const MetadataAttributeModal = ({ isOpen, onClose, onHidden, onSuccess, initialData, entityType, groups }: MetadataAttributeModalProps) => {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const { token } = useAuth();

    const [formData, setFormData] = useState<Partial<IFMetadataAttribute>>({
        entityType: entityType,
        ...emptyMetadataData,
    });

    useEffect(() => {
        if (isOpen) {
            const nextData: Partial<IFMetadataAttribute> = initialData
                ? {
                    id: initialData.id,
                    entityType: initialData.entityType || entityType,
                    code: initialData.code || "",
                    name: initialData.name || "",
                    shortDescription: initialData.shortDescription || "",
                    longDescription: initialData.longDescription || "",
                    groupCode: initialData.groupCode || "",
                    dataType: (initialData.dataType as IFMetadataAttribute['dataType']) || "string",
                    isRequired: initialData.isRequired ?? false,
                    isVisible: initialData.isVisible ?? true,
                    isSystemInternal: initialData.isSystemInternal ?? false,
                    sortOrder: initialData.sortOrder ?? 0,
                    active: initialData.active ?? true,
                }
                : {
                    entityType: entityType,
                    ...emptyMetadataData,
                };

            setFormData(nextData);

            setTimeout(() => {
                const formInstance = formRef.current?.instance();
                if (formInstance) {
                    formInstance.option("formData", nextData);
                }
            }, 0);
        } else {
            setFormData({ entityType: entityType, ...emptyMetadataData });
        }
    }, [isOpen, initialData, entityType]);

    const handleHidden = useCallback(() => {
        setFormData({ entityType: entityType, ...emptyMetadataData });
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden, entityType]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            if (initialData?.id) {
                await metadataService.updateAttribute(initialData.id, currentFormData, token);
                notify("Atributo actualizado exitosamente", "success", 3000);
            } else {
                await metadataService.createAttribute({ ...currentFormData, entityType }, token);
                notify("Atributo creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving metadata attribute:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al guardar el atributo de metadata";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData?.id, onClose, onSuccess, token, entityType]);

    const dataTypes = useMemo(() => [
        { id: "string", name: "Texto" },
        { id: "integer", name: "Entero" },
        { id: "decimal", name: "Decimal" },
        { id: "boolean", name: "Booleano" },
        { id: "date", name: "Fecha" },
        { id: "datetime", name: "Fecha y Hora" },
        { id: "list", name: "Lista" },
        { id: "json", name: "JSON" }
    ], []);

    const formContent = useMemo(() => (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
        >
            <GroupItem colCount={2}>
                <SimpleItem
                    dataField="code"
                    label={{ text: "Código" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: peso_neto",
                        stylingMode: 'filled',
                        disabled: !!initialData,
                        elementAttr: { class: "rounded-dx" }
                    }}
                    validationRules={[
                        { type: 'required', message: "El código es obligatorio" },
                        { type: 'pattern', pattern: '^[a-z0-9_]+$', message: "Solo letras minúsculas, números y guión bajo" }
                    ]}
                />
                <SimpleItem
                    dataField="name"
                    label={{ text: "Nombre" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: Peso Neto",
                        stylingMode: 'filled',
                        elementAttr: { class: "rounded-dx" }
                    }}
                    validationRules={[{ type: 'required', message: "El nombre es obligatorio" }]}
                />
                <SimpleItem
                    dataField="dataType"
                    label={{ text: "Tipo de Dato" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: dataTypes,
                        valueExpr: "id",
                        displayExpr: "name",
                        stylingMode: 'filled',
                        disabled: !!initialData,
                        elementAttr: { class: "rounded-dx" }
                    }}
                    validationRules={[{ type: 'required', message: "El tipo de dato es obligatorio" }]}
                />
                <SimpleItem
                    dataField="groupCode"
                    label={{ text: "Grupo de Metadato" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: groups,
                        valueExpr: "code",
                        displayExpr: "name",
                        stylingMode: 'filled',
                        showClearButton: true,
                        placeholder: "Seleccionar grupo (opcional)",
                        elementAttr: { class: "rounded-dx" }
                    }}
                />
                <SimpleItem
                    dataField="shortDescription"
                    label={{ text: "Descripción Corta" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Descripción de ayuda",
                        stylingMode: 'filled',
                        elementAttr: { class: "rounded-dx" }
                    }}
                />
                <SimpleItem
                    dataField="sortOrder"
                    label={{ text: "Orden de Visualización" }}
                    editorType="dxNumberBox"
                    editorOptions={{
                        min: 0,
                        stylingMode: 'filled',
                        elementAttr: { class: "rounded-dx" }
                    }}
                />
            </GroupItem>
            <GroupItem colCount={2} cssClass="mt-4">
                <SimpleItem
                    dataField="isRequired"
                    label={{ text: "Obligatorio" }}
                    editorType="dxCheckBox"
                    editorOptions={{
                        text: "Requerido",
                    }}
                />
                <SimpleItem
                    dataField="isVisible"
                    label={{ text: "Visible" }}
                    editorType="dxCheckBox"
                    editorOptions={{
                        text: "Mostrar en UI",
                    }}
                />
                <SimpleItem
                    dataField="isSystemInternal"
                    label={{ text: "Interno de Sistema" }}
                    editorType="dxCheckBox"
                    editorOptions={{
                        text: "Sólo Backend",
                    }}
                />
                <SimpleItem
                    dataField="active"
                    label={{ text: "Estado" }}
                    editorType="dxCheckBox"
                    editorOptions={{
                        text: "Activo",
                    }}
                />
            </GroupItem>
        </Form>
    ), [formData, initialData, dataTypes, groups]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Atributo de Metadato" : "Nuevo Atributo de Metadato"}
            width={600}
            height={500}
            onShown={(e) => {
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-4">
                {formContent}
            </div>

            <ToolbarItem toolbar="bottom" location="after">
                <Button
                    text="Cancelar"
                    onClick={onClose}
                    disabled={loading}
                    stylingMode="text"
                />
            </ToolbarItem>
            <ToolbarItem toolbar="bottom" location="after">
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

export default MetadataAttributeModal;
