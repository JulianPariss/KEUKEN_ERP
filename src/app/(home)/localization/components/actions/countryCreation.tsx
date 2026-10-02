"use client";

import { countriesService } from "@/app/services/location_services/countries.service";
import { currenciesService } from "@/app/services/payments_services/currencies.service";
import { IFCountryCreation } from "@repo/api-contracts/erp";
import { IFCurrency } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface CountriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    initialData?: any;
}

const emptyCountryData: IFCountryCreation = {
    code: "",
    name: "",
    currencyId: "",
    phoneCode: 0,
    active: true,
};

const CountryCreationModal = ({ isOpen, onClose, onSuccess, onHidden, initialData }: CountriesModalProps) => {
    const [loading, setLoading] = useState(false);
    const [currencies, setCurrencies] = useState<IFCurrency[]>([]);
    const formRef = useRef<any>(null);
    const { token } = useAuth();

    const [formData, setFormData] = useState<IFCountryCreation>(emptyCountryData);

    useEffect(() => {
        let mounted = true;
        const fetchCurrencies = async () => {
            try {
                const response = await currenciesService.getAll(token);
                if (mounted) setCurrencies(response.items);
            } catch (error) {
                console.error("Error fetching currencies:", error);
            }
        };

        if (isOpen && currencies.length === 0) {
            fetchCurrencies();
        }
        return () => { mounted = false; };
    }, [isOpen, token, currencies.length]);

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    code: initialData.code || "",
                    name: initialData.name || "",
                    currencyId: initialData.currencyId || "",
                    phoneCode: initialData.phoneCode || 0,
                    active: initialData.active ?? true,
                }
                : { ...emptyCountryData };

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
        setFormData(emptyCountryData);
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
                const { code, ...updateData } = currentFormData;
                await countriesService.update(initialData.id, updateData, token);
                notify("País actualizado exitosamente", "success", 3000);
            } else {
                await countriesService.create(currentFormData, token);
                notify("País creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving country:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al guardar el país";
            notify(errorMessage, "error", 3000);
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
                    dataField="code"
                    label={{ text: "Código ISO" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: AR, US, ES",
                        maxLength: FIELD_LIMITS.stringPico,
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                        disabled: !!initialData
                    }}
                    validationRules={[
                        { type: 'required', message: "El código es obligatorio" },
                        { type: 'stringLength', max: FIELD_LIMITS.stringPico, message: `El código ISO debe tener como máximo ${FIELD_LIMITS.stringPico} caracteres` }
                    ]}
                />
                <SimpleItem
                    dataField="name"
                    label={{ text: "Nombre" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Nombre del país",
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
                    dataField="phoneCode"
                    label={{ text: "Código Telefónico" }}
                    editorType="dxNumberBox"
                    editorOptions={{
                        placeholder: "Ej: 54",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                        min: 0,
                        max: FIELD_LIMITS.smallIntMax,
                        mode: "number",
                        format: "#",
                        step: 1,
                    }}
                    validationRules={[
                        { type: 'numeric', message: "El código telefónico solo puede contener números" },
                        { type: 'range', min: 0, max: FIELD_LIMITS.smallIntMax, message: FIELD_LIMITS.smallIntMaxMessage }
                    ]}
                />
                <SimpleItem
                    dataField="currencyId"
                    label={{ text: "Moneda" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: currencies,
                        valueExpr: "id",
                        displayExpr: (item: IFCurrency) => item ? `${item.name} (${item.symbol})` : "",
                        searchEnabled: true,
                        showClearButton: true,
                        stylingMode: 'filled',
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                    validationRules={[{ type: 'required', message: "La moneda es obligatoria" }]}
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
    ), [formData, currencies, initialData]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar País" : "Nuevo País"}
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

export default CountryCreationModal;
