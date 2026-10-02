"use client";

import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";
import { establishmentsService } from "@/app/services/userContext/establishments.service";
import { IFEstablishment, IFEstablishmentCreate } from "@repo/api-contracts/erp";
import { GenericButton } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useRef, useState } from "react";

interface EstablishmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    initialData?: IFEstablishment | null;
}

const EstablishmentCreationModal = ({ isOpen, onClose, onSuccess, onHidden, initialData }: EstablishmentModalProps) => {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const { token, currentCompany } = useAuth();

    const [formData, setFormData] = useState<IFEstablishmentCreate & { active?: boolean }>({
        code: "",
        name: "",
        companyId: currentCompany?.id || "",
        active: true,
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    code: initialData.code || "",
                    name: initialData.name || "",
                    companyId: initialData.companyId || currentCompany?.id || "",
                    defaultIncomeAccountId: initialData.defaultIncomeAccountId || null,
                    defaultExpenseAccountId: initialData.defaultExpenseAccountId || null,
                    defaultCustomerAccountId: initialData.defaultCustomerAccountId || null,
                    defaultSupplierAccountId: initialData.defaultSupplierAccountId || null,
                    active: initialData.active ?? true,
                });
            } else {
                setFormData({
                    code: "",
                    name: "",
                    companyId: currentCompany?.id || "",
                    active: true,
                });
            }
        }
    }, [isOpen, initialData, currentCompany?.id]);

    const handleSubmit = useCallback(async () => {
        const result = formRef.current?.instance().validate();
        if (!result?.isValid) return;

        setLoading(true);
        try {
            const targetCompanyId = currentCompany?.id || formData.companyId;
            const payload = { ...formData, companyId: targetCompanyId };

            if (initialData?.id) {
                await establishmentsService.update(initialData.id, payload, token);
                notify("Establecimiento actualizado exitosamente", "success", 3000);
            } else {
                await establishmentsService.create(payload, token);
                notify("Establecimiento creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving establishment:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al guardar el establecimiento";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData?.id, currentCompany?.id, onClose, onSuccess, token]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={onHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Establecimiento" : "Nuevo Establecimiento"}
            width={550}
            height={420}
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
                    <GroupItem colCount={2}>
                        <SimpleItem
                            dataField="code"
                            label={{ text: "Código" }}
                            editorType="dxTextBox"
                            editorOptions={{
                                placeholder: "Código del establecimiento",
                                valueChangeEvent: "blur",
                                stylingMode: 'filled',
                                maxLength: FIELD_LIMITS.stringTeeny,
                            }}
                            validationRules={[
                                { type: 'required', message: "El código es obligatorio" },
                                { type: 'stringLength', max: FIELD_LIMITS.stringTeeny, message: `El código no puede superar los ${FIELD_LIMITS.stringTeeny} caracteres` }
                            ]}
                        />
                        <SimpleItem
                            dataField="name"
                            label={{ text: "Nombre" }}
                            editorType="dxTextBox"
                            editorOptions={{
                                placeholder: "Nombre del establecimiento",
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
            </div>

            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <GenericButton
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
                <GenericButton
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

export default EstablishmentCreationModal;
