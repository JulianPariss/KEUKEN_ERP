"use client";

import { useAuth } from "@/contexts/AuthContext";
import { fragilityService } from "@repo/erp-services/product_services/fragility.service";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { IFFragilityClass } from "@repo/api-contracts/erp";

interface FragilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

const FragilityInnerForm = forwardRef(({ initialData, isOpen }: { initialData?: any, isOpen: boolean }, ref) => {
    const formRef = useRef<any>(null);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                code: initialData?.code || "",
                name: initialData?.name || "",
            });
        } else {
            formRef.current?.instance()?.reset();
            setFormData({
                code: "",
                name: "",
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
                        placeholder: "Ej: GLASS_ONLY",
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
                        placeholder: "Ej: Solo vidrio",
                        valueChangeEvent: "keyup",
                        stylingMode: 'filled',
                    }}
                    validationRules={[{ type: 'required', message: "El nombre es obligatorio" }]}
                />
            </GroupItem>

        </Form>
    );
});
FragilityInnerForm.displayName = 'FragilityInnerForm';

const FragilityModal = ({ isOpen, onClose, onSuccess, initialData }: FragilityModalProps) => {
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
            const normalizedData: Partial<IFFragilityClass> = {
                code: formData.code,
                name: formData.name,
            };

            if (initialData?.id) {
                await fragilityService.update(currentCompany.id, initialData.id, normalizedData, token);
                notify("Nivel de fragilidad actualizado exitosamente", "success", 3000);
            } else {
                await fragilityService.create(currentCompany.id, normalizedData, token);
                notify("Nivel de fragilidad creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving fragility class:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al guardar el nivel de fragilidad";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [initialData, currentCompany, token, onClose, onSuccess]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Nivel de Fragilidad" : "Nuevo Nivel de Fragilidad"}
            width={550}
            height={300}
            className="custom-popup"
            deferRendering={false}
        >
            <Position at="center" my="center" />
            <div className="p-4">
                <FragilityInnerForm ref={innerFormRef} initialData={initialData} isOpen={isOpen} />
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

export default FragilityModal;
