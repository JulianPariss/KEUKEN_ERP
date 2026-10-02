"use client";

import { useAuth } from "@/contexts/AuthContext";
import { segregationGroupsService } from "@/app/services/product_services/segregationGroups.service";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { IFSegregationGroup } from "@repo/api-contracts/erp";

interface SegregationGroupsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    initialData?: any;
}

const SegregationGroupsInnerForm = forwardRef(({ initialData, isOpen }: { initialData?: any, isOpen: boolean }, ref) => {
    const formRef = useRef<any>(null);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                code: initialData?.code || "",
                name: initialData?.name || "",
                description: initialData?.description || "",
            });
        } else {
            formRef.current?.instance()?.reset();
            setFormData({
                code: "",
                name: "",
                description: "",
            });
        }
    }, [isOpen, initialData]);

    useImperativeHandle(ref, () => ({
        validate: () => formRef.current?.instance().validate(),
        getData: () => formData
    }));

    return (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
            colCount={2}

        >
            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="code"
                    label={{ text: "Código" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: FOOD, PET_FOOD",
                        valueChangeEvent: "keyup",
                        stylingMode: 'filled',
                        disabled: !!initialData
                    }}
                    validationRules={[{ type: 'required', message: "El código es obligatorio" }]}
                />
            </GroupItem>

            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="name"
                    label={{ text: "Nombre" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: Alimentos",
                        valueChangeEvent: "keyup",
                        stylingMode: 'filled',
                    }}
                    validationRules={[{ type: 'required', message: "El nombre es obligatorio" }]}
                />
            </GroupItem>

            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="description"
                    label={{ text: "Descripción" }}
                    editorType="dxTextArea"
                    editorOptions={{
                        placeholder: "Ej: Productos alimenticios para consumo humano o animal.",
                        height: 90,
                        valueChangeEvent: "keyup",
                        stylingMode: 'filled',
                    }}
                />
            </GroupItem>

        </Form>
    );
});
SegregationGroupsInnerForm.displayName = 'SegregationGroupsInnerForm';

const SegregationGroupsModal = ({ isOpen, onClose, onSuccess, onHidden, initialData }: SegregationGroupsModalProps) => {
    const { token, currentCompany } = useAuth();
    const [loading, setLoading] = useState(false);
    const innerFormRef = useRef<any>(null);

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
            const normalizedData: Partial<IFSegregationGroup> = {
                code: formData.code,
                name: formData.name,
                description: formData.description,
            };

            if (initialData?.id) {
                await segregationGroupsService.update(currentCompany.id, initialData.id, normalizedData, token);
                notify("Grupo de segregación actualizado exitosamente", "success", 3000);
            } else {
                await segregationGroupsService.create(currentCompany.id, normalizedData, token);
                notify("Grupo de segregación creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving segregation group:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al guardar el grupo de segregación";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [initialData, currentCompany, token, onClose, onSuccess]);

    return (
        <Popup
            visible={isOpen}
            onHiding={() => {
                onClose();
                onHidden?.();
            }}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Grupo de Segregación" : "Nuevo Grupo de Segregación"}
            width={550}
            height={400}
            className="custom-popup"
            deferRendering={false}
        >
            <Position at="center" my="center" />
            <div className="p-4">
                <SegregationGroupsInnerForm ref={innerFormRef} initialData={initialData} isOpen={isOpen} />
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

export default SegregationGroupsModal;
