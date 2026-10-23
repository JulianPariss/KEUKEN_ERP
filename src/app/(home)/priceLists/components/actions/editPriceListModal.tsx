"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import notify from "devextreme/ui/notify";
import { Button } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { priceListsService } from "@repo/erp-services/priceLists/priceLists.service";
import { PRICE_LIST_STATES, FIELD_LIMITS } from "@/app/lib/constants/common.constants";
import { IFPriceList, IFPriceListUpdate } from "@repo/api-contracts/erp";

interface EditPriceListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHidden?: () => void;
    onSuccess: () => void;
    priceList: IFPriceList | null;
}

export default function EditPriceListModal({ isOpen, onClose, onHidden, onSuccess, priceList }: EditPriceListModalProps) {
    const { token } = useAuth();
    const formRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<{
        name: string;
        state: string;
        validFrom: string | Date | null;
    }>({
        name: priceList?.name || "",
        state: priceList?.state || "draft",
        validFrom: priceList?.validFrom ? new Date(priceList.validFrom) : null,
    });

    useEffect(() => {
        if (isOpen && priceList) {
            const nextData = {
                name: priceList.name || "",
                state: priceList.state || "draft",
                validFrom: priceList.validFrom ? new Date(priceList.validFrom) : null,
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
    }, [isOpen, priceList]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();

        if (!result?.isValid) return;

        if (!priceList?.id) {
            notify("No se encontró la lista de precios a editar", "error", 3000);
            return;
        }

        if (!token) {
            notify("Error de autenticación", "error", 3000);
            return;
        }

        const currentFormData = formInstance?.option("formData") || formData;

        let formattedValidFrom: string | undefined;
        if (currentFormData.validFrom) {
            const dateObj = new Date(currentFormData.validFrom);
            if (!isNaN(dateObj.getTime())) {
                formattedValidFrom = dateObj.toISOString();
            }
        }

        const payload: IFPriceListUpdate = {
            name: currentFormData.name,
            state: currentFormData.state,
            validFrom: formattedValidFrom,
        };

        setLoading(true);
        try {
            await priceListsService.update(priceList.id, payload, token);
            notify("Lista de precios actualizada exitosamente", "success", 3000);
            await onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error al actualizar la lista de precios:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al actualizar la lista de precios";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, priceList?.id, token, onSuccess, onClose]);

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
            title="Editar Lista de Precios"
            width={500}
            height="auto"
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
                                placeholder: "Nombre de la lista de precios",
                                valueChangeEvent: "blur",
                                stylingMode: "filled",
                                maxLength: FIELD_LIMITS.stringLong,
                            }}
                            validationRules={[
                                { type: "required", message: "El nombre es obligatorio" },
                                { type: "stringLength", max: FIELD_LIMITS.stringLong, message: `El nombre no puede superar los ${FIELD_LIMITS.stringLong} caracteres` }
                            ]}
                        />
                        <SimpleItem
                            dataField="state"
                            label={{ text: "Estado" }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                items: PRICE_LIST_STATES,
                                valueExpr: "value",
                                displayExpr: "label",
                                stylingMode: "filled",
                            }}
                            validationRules={[{ type: "required", message: "El estado es obligatorio" }]}
                        />
                        <SimpleItem
                            dataField="validFrom"
                            label={{ text: "Válido Desde" }}
                            editorType="dxDateBox"
                            editorOptions={{
                                type: "datetime",
                                displayFormat: "dd/MM/yyyy HH:mm",
                                stylingMode: "filled",
                                useMaskBehavior: true,
                            }}
                        />
                    </GroupItem>
                </Form>
            </div>

            <ToolbarItem toolbar="bottom" location="after">
                <Button
                    text="Cancelar"
                    onClick={onClose}
                    disabled={loading}
                    stylingMode="text"
                    className="!bg-main/10"
                />
            </ToolbarItem>
            <ToolbarItem toolbar="bottom" location="after">
                <Button
                    text={loading ? "Guardando..." : "Guardar Cambios"}
                    type="default"
                    stylingMode="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="!bg-focus-300 !text-variant"
                />
            </ToolbarItem>
        </Popup>
    );
}
