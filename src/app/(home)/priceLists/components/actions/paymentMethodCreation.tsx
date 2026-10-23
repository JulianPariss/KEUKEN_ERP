"use client";

import { paymentMethodsService } from "@repo/erp-services/payments_services/paymentMethods.service";
import { IFPaymentMethod, IFPaymentMethodCreation, IFPaymentMethodsUpdate } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: IFPaymentMethod | null;
}

const PaymentMethodCreationModal = ({ isOpen, onClose, onSuccess, initialData }: Props) => {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const { token, currentCompany } = useAuth();

    const [formData, setFormData] = useState<IFPaymentMethodCreation>({
        code: "",
        name: "",
        note: "",
        active: true,
        companyId: ""
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    code: initialData.code || "",
                    name: initialData.name || "",
                    note: initialData.note || "",
                    active: initialData.active ?? true,
                    companyId: initialData.companyId || currentCompany?.id || ""
                });
            } else {
                setFormData({
                    code: "",
                    name: "",
                    note: "",
                    active: true,
                    companyId: currentCompany?.id || ""
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData?.id, currentCompany?.id]);

    const handleSubmit = useCallback(async () => {
        const result = formRef.current?.instance().validate();
        if (!result?.isValid) return;

        setLoading(true);
        try {
            if (initialData?.id) {
                const updateData: IFPaymentMethodsUpdate = {
                    code: formData.code,
                    name: formData.name,
                    active: formData.active,
                    note: formData.note,
                };
                await paymentMethodsService.update(initialData.id, updateData, token, currentCompany?.id);
                notify("Método de pago actualizado exitosamente", "success", 3000);
            } else {
                const createData = {
                    ...formData,
                    companyId: currentCompany?.id || formData.companyId
                };
                await paymentMethodsService.create(createData, token, currentCompany?.id);
                notify("Método de pago creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving payment method:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al guardar el método de pago";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, initialData?.id, onClose, onSuccess, token]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Método de Pago" : "Nuevo Método de Pago"}
            width={450}
            height="auto"
            onShown={(e) => {
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-4">
                <Form
                    ref={formRef}
                    formData={formData}
                    labelLocation="top"
                >
                    <GroupItem colCount={1}>
                        <SimpleItem
                            dataField="code"
                            label={{ text: "Código" }}
                            editorType="dxTextBox"
                            editorOptions={{
                                placeholder: "Ej: EF, TR, DB",
                                stylingMode: "filled"
                            }}
                            validationRules={[{ type: 'required', message: "El código es obligatorio" }]}
                        />
                        <SimpleItem
                            dataField="name"
                            label={{ text: "Nombre" }}
                            editorType="dxTextBox"
                            editorOptions={{
                                placeholder: "Nombre del método de pago",
                                stylingMode: "filled"
                            }}
                            validationRules={[{ type: 'required', message: "El nombre es obligatorio" }]}
                        />
                        <SimpleItem
                            dataField="note"
                            label={{ text: "Nota" }}
                            editorType="dxTextArea"
                            editorOptions={{
                                placeholder: "Notas adicionales...",
                                stylingMode: "filled",
                                height: 80
                            }}
                        />
                        <SimpleItem
                            dataField="active"
                            label={{ text: "Estado" }}
                            editorType="dxCheckBox"
                            editorOptions={{
                                text: "Activo"
                            }}
                        />
                    </GroupItem>
                </Form>
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
                    className="rounded-dx! bg-main/10!"
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

export default PaymentMethodCreationModal;
