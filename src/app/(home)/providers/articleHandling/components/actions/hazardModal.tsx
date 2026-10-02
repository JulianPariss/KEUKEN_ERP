"use client";

import { useAuth } from "@/contexts/AuthContext";
import { hazardService } from "@/app/services/product_services/hazard.service";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { IFHazardClass } from "@repo/api-contracts/erp";

interface HazardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHidden?: () => void;
    onSuccess: () => void;
    initialData?: any;
}

const emptyHazardData = {
    code: "",
    name: "",
    adrClass: "",
    packingGroup: "",
    unNumber: "",
};

const HazardInnerForm = forwardRef(({ initialData, isOpen }: { initialData?: any, isOpen: boolean }, ref) => {
    const formRef = useRef<any>(null);
    const [formData, setFormData] = useState(emptyHazardData);

    useEffect(() => {
        if (isOpen) {
            const nextData = {
                code: initialData?.code || "",
                name: initialData?.name || "",
                adrClass: initialData?.adrClass || "",
                packingGroup: initialData?.packingGroup || "",
                unNumber: initialData?.unNumber || "",
            };
            setFormData(nextData);
            setTimeout(() => {
                const formInstance = formRef.current?.instance();
                if (formInstance) {
                    formInstance.option("formData", nextData);
                }
            }, 0);
        } else {
            setFormData({ ...emptyHazardData });
        }
    }, [isOpen, initialData]);

    useImperativeHandle(ref, () => ({
        validate: () => formRef.current?.instance().validate(),
        getData: () => formRef.current?.instance().option("formData") || formData
    }));

    return (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
            colCount={2}
        >
            <GroupItem colCount={2} colSpan={2}>
                <SimpleItem
                    dataField="code"
                    label={{ text: "Código" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: GAS_2.1",
                        stylingMode: 'filled',
                        disabled: !!initialData
                    }}
                    validationRules={[{ type: 'required', message: "El código es obligatorio" }]}
                />
                <SimpleItem
                    dataField="unNumber"
                    label={{ text: "Número UN" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: UN1978",
                        stylingMode: 'filled',
                        disabled: !!initialData
                    }}
                    validationRules={[{ type: 'required', message: "El número UN es obligatorio" }]}
                />
            </GroupItem>

            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="name"
                    label={{ text: "Nombre" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: Gas inflamable",
                        stylingMode: 'filled',
                    }}
                    validationRules={[{ type: 'required', message: "El nombre es obligatorio" }]}
                />
            </GroupItem>

            <GroupItem colCount={2} colSpan={2}>
                <SimpleItem
                    dataField="adrClass"
                    label={{ text: "Clase ADR" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: 2.1",
                        stylingMode: 'filled',
                        disabled: !!initialData
                    }}
                    validationRules={[{ type: 'required', message: "La clase ADR es obligatoria" }]}
                />
                <SimpleItem
                    dataField="packingGroup"
                    label={{ text: "Grupo de Embalaje" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: II",
                        stylingMode: 'filled',
                        maxLength: 4,
                    }}
                    validationRules={[{ type: 'required', message: "El grupo de embalaje es obligatorio" }]}
                />
            </GroupItem>
        </Form>
    );
});
HazardInnerForm.displayName = 'HazardInnerForm';

const HazardModal = ({ isOpen, onClose, onHidden, onSuccess, initialData }: HazardModalProps) => {
    const { token, currentCompany } = useAuth();
    const [loading, setLoading] = useState(false);
    const innerFormRef = useRef<any>(null);

    const handleHidden = useCallback(() => {
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    const handleSubmit = useCallback(async () => {
        const innerForm = innerFormRef.current;
        if (!innerForm) return;

        const result = innerForm.validate();
        if (!result?.isValid) return;

        if (!currentCompany?.id || !token) {
            notify("Error de autenticación", "error", 3000);
            return;
        }

        setLoading(true);
        try {
            const formData = innerForm.getData();
            const normalizedData: Partial<IFHazardClass> = {
                code: formData.code,
                name: formData.name,
                adrClass: formData.adrClass,
                packingGroup: formData.packingGroup,
                unNumber: formData.unNumber,
            };

            if (initialData?.id) {
                await hazardService.update(currentCompany.id, initialData.id, normalizedData, token);
                notify("Nivel de peligro actualizado exitosamente", "success", 3000);
            } else {
                await hazardService.create(currentCompany.id, normalizedData, token);
                notify("Nivel de peligro creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving hazard class:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al guardar el nivel de peligro";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [initialData, currentCompany, token, onClose, onSuccess]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Nivel de Peligro" : "Nuevo Nivel de Peligro"}
            width={600}
            height={450}
            className="custom-popup"
            deferRendering={false}
            onShown={(e) => {
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-4">
                <HazardInnerForm ref={innerFormRef} initialData={initialData} isOpen={isOpen} />
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

export default HazardModal;
