"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { Button } from '@repo/devextreme';
import Form, { SimpleItem } from "devextreme-react/form";
import "devextreme-react/select-box";
import notify from "devextreme/ui/notify";
import { serialNumbersService } from "@repo/erp-services/serialNumbers.service";
import { useAuth } from "@/contexts/AuthContext";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";



interface SerialNumberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    initialData?: any;
    defaultItemId?: string | null;
}

const emptySerialNumberData = {
    serialNumber: "",
    itemId: "",
    batchId: null,
    companyId: "",
    currentLocationId: null,
    notes: "",
};

export default function SerialNumberModal({
    isOpen,
    onClose,
    onSuccess,
    onHidden,
    initialData,
    defaultItemId
}: SerialNumberModalProps) {
    const { token, currentCompany } = useAuth();
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);

    const [formData, setFormData] = useState<any>({
        ...emptySerialNumberData,
        itemId: defaultItemId || "",
        companyId: currentCompany?.id || "",
    });

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    serialNumber: initialData.serialNumber || "",
                    itemId: initialData.itemId || "",
                    batchId: initialData.batchId || null,
                    companyId: initialData.companyId || currentCompany?.id || "",
                    currentLocationId: initialData.currentLocationId || null,
                    notes: "",
                }
                : {
                    ...emptySerialNumberData,
                    itemId: defaultItemId || "",
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
        } else {
            setFormData({
                ...emptySerialNumberData,
                itemId: defaultItemId || "",
                companyId: currentCompany?.id || "",
            });
        }
    }, [isOpen, initialData, currentCompany?.id, defaultItemId]);

    const handleHidden = useCallback(() => {
        setFormData({
            ...emptySerialNumberData,
            itemId: defaultItemId || "",
            companyId: currentCompany?.id || "",
        });
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden, defaultItemId, currentCompany?.id]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            if (initialData?.id) {
                await serialNumbersService.update(initialData.id, currentFormData, token, currentCompany?.id);
                notify("Actualizado exitosamente", "success", 3000);
            } else {
                await serialNumbersService.create(currentFormData, token, currentCompany?.id);
                notify("Creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving serial number:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al guardar el número de serie";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData, token, currentCompany?.id, onClose, onSuccess]);

    const formContent = useMemo(() => (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
        >
            <SimpleItem
                dataField="serialNumber"
                label={{ text: "Número de Serie" }}
                editorType="dxTextBox"
                editorOptions={{
                    placeholder: "Ej. SN-987654321",
                    stylingMode: "filled",
                    maxLength: FIELD_LIMITS.stringMiddle,
                }}
                validationRules={[
                    { type: 'required', message: "El número de serie es obligatorio" },
                    { type: 'stringLength', max: FIELD_LIMITS.stringMiddle, message: `El número de serie no puede superar los ${FIELD_LIMITS.stringMiddle} caracteres` }
                ]}
            />

            <SimpleItem
                dataField="itemId"
                visible={false}
                label={{ text: "ID de Artículo" }}
                editorType="dxTextBox"
                editorOptions={{
                    placeholder: "Ej. ITEM-001",
                    readOnly: !!initialData,
                    stylingMode: "filled",
                }}
                validationRules={[{ type: 'required', message: "El ID de artículo es obligatorio" }]}
            />

            <SimpleItem
                dataField="notes"
                label={{ text: "Notas" }}
                editorType="dxTextArea"
                editorOptions={{
                    placeholder: "Observaciones o notas adicionales...",
                    stylingMode: "filled",
                    height: 80,
                    maxLength: FIELD_LIMITS.stringLong,
                }}
                validationRules={[
                    { type: 'stringLength', max: FIELD_LIMITS.stringLong, message: `Las notas no pueden superar los ${FIELD_LIMITS.stringLong} caracteres` }
                ]}
            />
        </Form>
    ), [formData, initialData]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Número de Serie" : "Nuevo Número de Serie"}
            width={420}
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
}
