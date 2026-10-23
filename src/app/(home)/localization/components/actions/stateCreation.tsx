"use client";

import { statesService } from "@repo/erp-services/location_services/states.service";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";

interface StatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    initialData?: any;
    defaultCountryCode?: string | null;
    defaultCountryId?: string | null;
}

const emptyStateData = {
    countryId: "",
    countryCode: "",
    code: "",
    name: "",
    active: true,
};

const StateCreationModal = ({
    isOpen,
    onClose,
    onSuccess,
    onHidden,
    initialData,
    defaultCountryCode,
    defaultCountryId
}: StatesModalProps) => {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const { token } = useAuth();

    const [formData, setFormData] = useState<any>(emptyStateData);

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    countryId: initialData.countryId || "",
                    countryCode: initialData.countryCode || "",
                    code: initialData.code || "",
                    name: initialData.name || "",
                    active: initialData.active ?? true,
                }
                : {
                    countryId: defaultCountryId || "",
                    countryCode: defaultCountryCode || "",
                    code: "",
                    name: "",
                    active: true,
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
    }, [isOpen, initialData, defaultCountryCode, defaultCountryId]);

    const handleHidden = useCallback(() => {
        setFormData(emptyStateData);
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
            if (initialData?.id) {
                await statesService.update(initialData.id, currentFormData, token);
                notify("Provincia actualizada exitosamente", "success", 3000);
            } else {
                await statesService.create(currentFormData, token);
                notify("Provincia creada exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving state:", error);
            notify(error?.message || "Error al guardar la provincia", "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData?.id, onClose, onSuccess, token]);

    const formContent = useMemo(() => (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
        >
            <GroupItem colCount={2}>
                <SimpleItem
                    dataField="countryId"
                    label={{ text: "ID País" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "UUID del país",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                        disabled: !!defaultCountryId || !!initialData
                    }}
                    validationRules={[{ type: 'required', message: "El ID de país es obligatorio" }]}
                />
                <SimpleItem
                    dataField="countryCode"
                    label={{ text: "Código País" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: AR, US",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                        disabled: !!defaultCountryCode || !!initialData
                    }}
                    validationRules={[{ type: 'required', message: "El código de país es obligatorio" }]}
                />
                <SimpleItem
                    dataField="code"
                    label={{ text: "Código Provincia" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: B, S",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                        maxLength: FIELD_LIMITS.stringTiny,
                    }}
                    validationRules={[
                        { type: 'required', message: "El código es obligatorio" },
                        { type: 'stringLength', max: FIELD_LIMITS.stringTiny, message: `El código no puede superar los ${FIELD_LIMITS.stringTiny} caracteres` }
                    ]}
                />
                <SimpleItem
                    dataField="name"
                    label={{ text: "Nombre" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Nombre de la provincia",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                        maxLength: FIELD_LIMITS.stringLong,
                    }}
                    validationRules={[
                        { type: 'required', message: "El nombre es obligatorio" },
                        { type: 'stringLength', max: FIELD_LIMITS.stringLong, message: `El nombre no puede superar los ${FIELD_LIMITS.stringLong} caracteres` }
                    ]}
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
            </GroupItem>
        </Form>
    ), [formData, defaultCountryId, defaultCountryCode, initialData]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Provincia" : "Nueva Provincia"}
            width={500}
            height="auto"
            maxHeight="88vh"
            className="custom-popup"
            deferRendering={false}
            onShown={(e) => {
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-5">
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

export default StateCreationModal;
