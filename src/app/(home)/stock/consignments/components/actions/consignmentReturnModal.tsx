"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { Button } from '@repo/devextreme';
import Form, { SimpleItem } from "devextreme-react/form";
import notify from "devextreme/ui/notify";
import { consignmentsService } from "@/app/services/consignments.service";
import { useAuth } from "@/contexts/AuthContext";
import { getZeroTimeDate } from "@/app/lib/utils/prittier";

interface ConsignmentReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    initialData?: any;
}

export default function ConsignmentReturnModal({
    isOpen,
    onClose,
    onSuccess,
    onHidden,
    initialData,
}: ConsignmentReturnModalProps) {
    const { token, currentCompany } = useAuth();
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);

    const [formData, setFormData] = useState<any>({
        quantityReturned: 0,
        returnDate: getZeroTimeDate(),
        serialNumberIds: [],
    });

    useEffect(() => {
        if (isOpen) {
            const nextData = {
                quantityReturned: 0,
                returnDate: getZeroTimeDate(),
                serialNumberIds: [],
            };
            setFormData(nextData);

            setTimeout(() => {
                const formInstance = formRef.current?.instance();
                if (formInstance) {
                    formInstance.option("formData", nextData);
                    if (typeof formInstance.reset === "function") {
                        formInstance.reset();
                    }
                    formInstance.option("formData", nextData);
                }
            }, 0);
        }
    }, [isOpen]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        if (!initialData?.id) {
            notify("No se ha seleccionado una consignación válida", "error", 3000);
            return;
        }

        const currentData = formInstance?.option("formData") || formData;
        const payload = {
            quantityReturned: Number(currentData.quantityReturned),
            returnDate: currentData.returnDate ? getZeroTimeDate(currentData.returnDate) : getZeroTimeDate(),
            serialNumberIds: currentData.serialNumberIds || [],
        };

        setLoading(true);
        try {
            await consignmentsService.returnItem(initialData.id, payload, token, currentCompany?.id);
            notify("Devolución registrada exitosamente", "success", 3000);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error al registrar devolución:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al registrar devolución";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData, token, currentCompany?.id, onClose, onSuccess]);

    const maxPending = useMemo(() => {
        if (!initialData) return 1;
        const total = Number(initialData.quantity || 0);
        const returned = Number(initialData.returnedQuantity || 0);
        return Math.max(1, total - returned);
    }, [initialData]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={onHidden}
            onShown={(e) => {
                e.component.repaint();
            }}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title="Devolución de Consignación"
            width={400}
            height="auto"
        >
            <Position at="center" my="center" />
            <div className="p-4">
                <Form
                    ref={formRef}
                    formData={formData}
                    labelLocation="top"
                >
                    <SimpleItem
                        dataField="quantityReturned"
                        label={{ text: `Cantidad Devuelta (Máx: ${maxPending})` }}
                        editorType="dxNumberBox"
                        editorOptions={{
                            stylingMode: "filled",
                            min: 1,
                            max: maxPending,
                        }}
                        validationRules={[
                            { type: "required", message: "La cantidad es requerida" },
                            { type: "range", min: 1, max: maxPending, message: `La cantidad a devolver debe estar entre 1 y ${maxPending}` }
                        ]}
                    />
                    <SimpleItem
                        dataField="returnDate"
                        label={{ text: "Fecha de Devolución" }}
                        editorType="dxDateBox"
                        editorOptions={{
                            stylingMode: "filled",
                            displayFormat: "dd/MM/yyyy",
                        }}
                    />
                </Form>
            </div>
            <ToolbarItem toolbar="bottom" location="after">
                <Button text="Cancelar" onClick={onClose} disabled={loading} stylingMode="text" className="!bg-main/10" />
            </ToolbarItem>
            <ToolbarItem toolbar="bottom" location="after">
                <Button text="Guardar" type="default" stylingMode="contained" onClick={handleSubmit} disabled={loading} className="!bg-focus-300 !text-variant" />
            </ToolbarItem>
        </Popup>
    );
}
