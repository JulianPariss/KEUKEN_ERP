"use client";

import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";
import { logisticsCentersService } from "@repo/erp-services/userContext/logisticsCenters.service";
import { IFLogisticsCenter, IFLogisticsCenterCreate } from "@repo/api-contracts/erp";
import { GenericButton } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface LogisticCenterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    initialData?: IFLogisticsCenter | null;
}

const emptyCenterData = {
    code: "",
    name: "",
    companyId: "",
    active: true,
};

const LogisticCenterCreationModal = ({ isOpen, onClose, onSuccess, onHidden, initialData }: LogisticCenterModalProps) => {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const { token, currentCompany } = useAuth();

    const [formData, setFormData] = useState<IFLogisticsCenterCreate & { active?: boolean }>({
        ...emptyCenterData,
        companyId: currentCompany?.id || "",
    });

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    code: initialData.code || "",
                    name: initialData.name || "",
                    companyId: initialData.companyId || currentCompany?.id || "",
                    active: initialData.active ?? true,
                }
                : {
                    code: "",
                    name: "",
                    companyId: currentCompany?.id || "",
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
    }, [isOpen, initialData, currentCompany?.id]);

    const handleHidden = useCallback(() => {
        setFormData({
            ...emptyCenterData,
            companyId: currentCompany?.id || "",
        });
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden, currentCompany?.id]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            const targetCompanyId = currentCompany?.id || currentFormData.companyId;
            const payload = { ...currentFormData, companyId: targetCompanyId };

            if (initialData?.id) {
                await logisticsCentersService.update(initialData.id, payload, token);
                notify("Centro logístico actualizado exitosamente", "success", 3000);
            } else {
                await logisticsCentersService.create(payload, token);
                notify("Centro logístico creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving logistics center:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al guardar el centro logístico";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData?.id, currentCompany?.id, onClose, onSuccess, token]);

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
                        placeholder: "Código del centro logístico",
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
                        placeholder: "Nombre del centro logístico",
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
    ), [formData]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Centro Logístico" : "Nuevo Centro Logístico"}
            width={550}
            height="auto"
            maxHeight="88vh"
            className="custom-popup"
            deferRendering={false}
            onShown={(e) => {
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-4">
                {formContent}
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

export default LogisticCenterCreationModal;
