"use client";

import { currenciesService } from "@/app/services/payments_services/currencies.service";
import { IFCurrencyCreation } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";

interface CurrenciesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    initialData?: any;
}

const emptyCurrencyData = {
    name: "",
    symbol: "",
    isoCode: "",
    rounding: 2,
    active: true,
};

const CurrencyCreationModal = ({ isOpen, onClose, onSuccess, onHidden, initialData }: CurrenciesModalProps) => {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const { token, currentCompany } = useAuth();

    const [formData, setFormData] = useState<IFCurrencyCreation & { active: boolean }>(emptyCurrencyData);

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    name: initialData.name || "",
                    symbol: initialData.symbol || "",
                    isoCode: initialData.isoCode || "",
                    rounding: initialData.rounding ?? 2,
                    active: initialData.active ?? true,
                }
                : { ...emptyCurrencyData };

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
    }, [isOpen, initialData]);

    const handleHidden = useCallback(() => {
        setFormData(emptyCurrencyData);
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid || !currentCompany) return;

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            if (initialData?.id) {
                await currenciesService.update(initialData.id, currentFormData, token, currentCompany.id);
                notify("Moneda actualizada exitosamente", "success", 3000);
            } else {
                await currenciesService.create(currentFormData, token, currentCompany.id);
                notify("Moneda creada exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving currency:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al guardar la moneda";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData?.id, onClose, onSuccess, token, currentCompany]);

    const formContent = useMemo(() => (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
        >
            <GroupItem colCount={2}>
                <SimpleItem
                    dataField="isoCode"
                    label={{ text: "Código ISO" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: ARS, USD, EUR",
                        maxLength: FIELD_LIMITS.stringTeeny,
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                        disabled: !!initialData
                    }}
                    validationRules={[
                        { type: 'required', message: "El código ISO es obligatorio" },
                        { type: 'stringLength', max: FIELD_LIMITS.stringTeeny, message: `El código ISO debe tener como máximo ${FIELD_LIMITS.stringTeeny} caracteres` }
                    ]}
                />
                <SimpleItem
                    dataField="name"
                    label={{ text: "Nombre" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Nombre de la moneda",
                        maxLength: FIELD_LIMITS.stringMedium,
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                    }}
                    validationRules={[
                        { type: 'required', message: "El nombre es obligatorio" },
                        { type: 'stringLength', max: FIELD_LIMITS.stringMedium, message: `El nombre debe tener como máximo ${FIELD_LIMITS.stringMedium} caracteres` }
                    ]}
                />
                <SimpleItem
                    dataField="symbol"
                    label={{ text: "Símbolo" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: $, €",
                        maxLength: FIELD_LIMITS.stringNano,
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                    }}
                    validationRules={[
                        { type: 'required', message: "El símbolo es obligatorio" },
                        { type: 'stringLength', max: FIELD_LIMITS.stringNano, message: `El símbolo debe tener como máximo ${FIELD_LIMITS.stringNano} caracteres` }
                    ]}
                />
                <SimpleItem
                    dataField="rounding"
                    label={{ text: "Redondeo" }}
                    editorType="dxNumberBox"
                    editorOptions={{
                        placeholder: "Decimales",
                        min: 0,
                        max: 9999.999999,
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                    }}
                    validationRules={[
                        { type: 'range', min: 0, max: 9999.999999, message: "El redondeo debe ser un valor numérico menor a 10000" }
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
            title={initialData ? "Editar Moneda" : "Nueva Moneda"}
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
            <div className="p-4">
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

export default CurrencyCreationModal;
