"use client";

import { paymentMethodsService } from "@/app/services/payments_services/paymentMethods.service";
import { paymentTermsService } from "@/app/services/payments_services/paymentTerms.service";
import { IFPaymentMethod } from "@repo/api-contracts/erp";
import { IFPaymentTerm, IFPaymentTermCreation, IFPaymentTermUpdate } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import TagBox from "devextreme-react/tag-box";
import TextArea from "devextreme-react/text-area";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useRef, useState } from "react";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: IFPaymentTerm | null;
}

const PaymentTermCreationModal = ({ isOpen, onClose, onSuccess, initialData }: Props) => {
    const [loading, setLoading] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<IFPaymentMethod[]>([]);
    const formRef = useRef<any>(null);
    const { token, currentCompany } = useAuth();

    const [formData, setFormData] = useState<IFPaymentTermCreation & { active: boolean, allowedPaymentMethodIds: string[] }>({
        name: "",
        note: "",
        netDays: 0,
        allowedPaymentMethodIds: [],
        companyId: "",
        active: true
    });

    useEffect(() => {
        let mounted = true;
        const fetchPaymentMethods = async () => {
            try {
                const response = await paymentMethodsService.getAll(token, currentCompany?.id);
                if (mounted) setPaymentMethods(response.items);
            } catch (error) {
                console.error("Error fetching payment methods:", error);
            }
        };

        if (isOpen && paymentMethods.length === 0) {
            fetchPaymentMethods();
        }
        return () => { mounted = false; };
    }, [isOpen, token, currentCompany?.id, paymentMethods.length]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || "",
                    note: initialData.note || "",
                    netDays: initialData.netDays || 0,
                    allowedPaymentMethodIds: initialData.allowedPaymentMethods?.map(m => m.id) || [],
                    companyId: initialData.companyId || currentCompany?.id || "",
                    active: initialData.active ?? true,
                });
            } else {
                setFormData({
                    name: "",
                    note: "",
                    netDays: 0,
                    allowedPaymentMethodIds: [],
                    companyId: currentCompany?.id || "",
                    active: true,
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData?.id, currentCompany?.id]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        const currentFormData = formInstance?.option("formData");

        setLoading(true);
        try {
            if (initialData?.id) {
                const updateData: IFPaymentTermUpdate = {
                    name: currentFormData.name,
                    note: currentFormData.note,
                    netDays: currentFormData.netDays,
                    active: currentFormData.active,
                    allowedPaymentMethodIds: currentFormData.allowedPaymentMethodIds
                };
                await paymentTermsService.update(initialData.id, updateData, token, currentCompany?.id);
                notify("Condición de pago actualizada exitosamente", "success", 3000);
            } else {
                const createData = {
                    ...currentFormData,
                    companyId: currentCompany?.id || currentFormData.companyId
                };
                await paymentTermsService.create(createData, token, currentCompany?.id);
                notify("Condición de pago creada exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving payment term:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al guardar la condición de pago";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData?.id, onClose, onSuccess, token, currentCompany?.id]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Condición de Pago" : "Nueva Condición de Pago"}
            width={500}
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
                            dataField="name"
                            label={{ text: "Nombre" }}
                            editorType="dxTextBox"
                            editorOptions={{
                                placeholder: "Ej: 30 días netos",
                                maxLength: FIELD_LIMITS.stringLong,
                                stylingMode: 'filled',
                            }}
                            validationRules={[
                                { type: 'required', message: "El nombre es obligatorio" },
                                { type: 'stringLength', max: FIELD_LIMITS.stringLong, message: `El nombre no puede superar los ${FIELD_LIMITS.stringLong} caracteres` }
                            ]}
                        />
                        <SimpleItem
                            dataField="netDays"
                            label={{ text: "Días Netos" }}
                            editorType="dxNumberBox"
                            editorOptions={{
                                placeholder: "Ej: 30",
                                stylingMode: 'filled',
                                min: 0,
                                max: FIELD_LIMITS.smallIntMax,
                                mode: "number",
                            }}
                            validationRules={[
                                { type: 'required', message: "Los días netos son obligatorios" },
                                { type: 'range', min: 0, max: FIELD_LIMITS.smallIntMax, message: FIELD_LIMITS.smallIntMaxMessage }
                            ]}
                        />
                        <SimpleItem
                            dataField="allowedPaymentMethodIds"
                            label={{ text: "Métodos de Pago Permitidos" }}
                            editorType="dxTagBox"
                            editorOptions={{
                                dataSource: paymentMethods,
                                valueExpr: "id",
                                displayExpr: "name",
                                placeholder: "Seleccione métodos permitidos...",
                                searchEnabled: true,
                                showSelectionControls: true,
                                stylingMode: 'filled',
                                dropDownOptions: {
                                    wrapperAttr: {
                                        class: "popup-menu-container"
                                    }
                                }
                            }}
                        />
                        <SimpleItem
                            dataField="note"
                            label={{ text: "Nota" }}
                            editorType="dxTextArea"
                            editorOptions={{
                                placeholder: "Notas adicionales...",
                                maxLength: FIELD_LIMITS.stringLong,
                                stylingMode: 'filled',
                                height: 80,
                            }}
                            validationRules={[
                                { type: 'stringLength', max: FIELD_LIMITS.stringLong, message: `La nota no puede superar los ${FIELD_LIMITS.stringLong} caracteres` }
                            ]}
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
            {false && (
                <>
                    <TagBox />
                    <TextArea />
                </>
            )}
        </Popup>
    );
};

export default PaymentTermCreationModal;
