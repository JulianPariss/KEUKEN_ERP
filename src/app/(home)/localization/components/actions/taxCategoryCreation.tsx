"use client";

import { codelistsService } from "@repo/erp-services/codelists.service";
import { taxCategoriesService } from "@repo/erp-services/payments_services/taxCategories.service";
import { IFCodelistTaxCategory } from "@repo/api-contracts/erp";
import { IFTaxCategoryCreation } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { useAccess } from "@repo/access";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface TaxCategoriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    initialData?: any;
    selectedCountryCode?: string | null;
}

const emptyTaxCategoryData: IFTaxCategoryCreation = {
    countryCode: "",
    taxCategoryCode: "",
    localName: "",
    localLabel: "",
    taxCategoryName: "",
    taxRate: 0,
    active: true,
};

const TaxCategoryCreationModal = ({ isOpen, onClose, onSuccess, onHidden, initialData, selectedCountryCode }: TaxCategoriesModalProps) => {
    const [loading, setLoading] = useState(false);
    const [codelistOptions, setCodelistOptions] = useState<IFCodelistTaxCategory[]>([]);
    const formRef = useRef<any>(null);
    const { token, currentCompany } = useAuth();
    const { canAccess } = useAccess();
    const canUseTaxCategoryCodelist = canAccess("billing.codelists.taxCategories.view");

    const [formData, setFormData] = useState<IFTaxCategoryCreation>(emptyTaxCategoryData);

    useEffect(() => {
        if (isOpen) {
            const fetchCodelists = async () => {
                if (!canUseTaxCategoryCodelist) {
                    setCodelistOptions([]);
                    return;
                }
                try {
                    const data = await codelistsService.getTaxCategories(token, currentCompany?.id);
                    setCodelistOptions(data);
                } catch (error) {
                    console.error("Error fetching tax categories codelist:", error);
                }
            };
            fetchCodelists();

            const nextData = initialData
                ? {
                    countryCode: initialData.countryCode || selectedCountryCode || "",
                    taxCategoryCode: initialData.taxCategoryCode || "",
                    localName: initialData.localName || "",
                    localLabel: initialData.localLabel || "",
                    taxRate: initialData.taxRate || 0,
                    active: initialData.active ?? true,
                    taxCategoryName: initialData.taxCategoryName || "",
                }
                : {
                    ...emptyTaxCategoryData,
                    countryCode: selectedCountryCode || "",
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
    }, [isOpen, initialData, selectedCountryCode, canUseTaxCategoryCodelist, token, currentCompany?.id]);

    const handleHidden = useCallback(() => {
        setFormData(emptyTaxCategoryData);
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
                await taxCategoriesService.update(initialData.id, currentFormData, token, currentCompany?.id);
                notify("Rubro de impuesto actualizado exitosamente", "success", 3000);
            } else {
                await taxCategoriesService.create(currentFormData, token, currentCompany?.id);
                notify("Rubro de impuesto creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving tax category:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al guardar el rubro de impuesto";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData?.id, onClose, onSuccess, token, currentCompany?.id]);

    const formContent = useMemo(() => (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
        >
            <GroupItem colCount={2}>
                <SimpleItem
                    dataField="countryCode"
                    label={{ text: "Código País" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: AR, US",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                        readOnly: true,
                    }}
                    validationRules={[{ type: 'required', message: "El código de país es obligatorio" }]}
                />
                <SimpleItem
                    dataField="taxCategoryCode"
                    visible={canUseTaxCategoryCodelist}
                    label={{ text: "Código de Rubro" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: codelistOptions,
                        valueExpr: "code",
                        displayExpr: (item: any) => (item ? `${item.code} - ${item.description}` : ""),
                        itemRender: (item: any) => (
                            <div className="whitespace-normal break-words py-1 text-xs leading-normal">
                                <span className="font-semibold">{item?.code}</span> - {item?.description}
                            </div>
                        ),
                        wrapItemText: true,
                        placeholder: "Seleccione el código de rubro...",
                        searchEnabled: true,
                        stylingMode: 'filled',
                    }}
                    validationRules={
                        canUseTaxCategoryCodelist
                            ? [{ type: 'required', message: "El código es obligatorio" }]
                            : []
                    }
                />

                <SimpleItem
                    dataField="localName"
                    label={{ text: "Nombre Local" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Nombre local",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                    }}
                />
                <SimpleItem
                    dataField="localLabel"
                    label={{ text: "Etiqueta Local" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Etiqueta local (Ej: IVA)",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                    }}
                />
                <SimpleItem
                    dataField="taxRate"
                    label={{ text: "Tasa de Impuesto (%)" }}
                    editorType="dxNumberBox"
                    editorOptions={{
                        placeholder: "Ej: 21",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                        format: "#0.00'%'",
                    }}
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
    ), [formData, codelistOptions, canUseTaxCategoryCodelist]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Rubro de Impuesto" : "Nuevo Rubro de Impuesto"}
            width={600}
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

export default TaxCategoryCreationModal;
