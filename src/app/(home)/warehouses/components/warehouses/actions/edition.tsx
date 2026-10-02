"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import Form, { SimpleItem } from "devextreme-react/form";
import notify from "devextreme/ui/notify";
import { Button } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { warehouseService } from "@/app/services/warehouse/warehouse.service";
import { IWarehouseCreate } from "@repo/api-contracts/erp";
import { IWarehouse } from "@repo/api-contracts/erp";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";

interface WarehouseEditionProps {
    visible: boolean;
    onHiding: () => void;
    onHidden?: () => void;
    warehouse: IWarehouse;
    onSuccess: () => Promise<void>;
}

const WarehouseEdition = ({ visible, onHiding, onHidden, warehouse, onSuccess }: WarehouseEditionProps) => {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const { token, currentCompany } = useAuth();

    const [formData, setFormData] = useState<IWarehouseCreate>({
        name: warehouse?.title || "",
        code: warehouse?.code || "",
        company_id: currentCompany?.id || "",
    });

    useEffect(() => {
        if (visible && warehouse) {
            const nextData: IWarehouseCreate = {
                name: warehouse.title || "",
                code: warehouse.code || "",
                company_id: currentCompany?.id || "",
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
    }, [visible, warehouse, currentCompany?.id]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();

        if (!result?.isValid) return;

        if (!warehouse?.id) {
            notify("No se encontró el almacén a editar", "error", 3000);
            return;
        }

        const currentFormData = formInstance?.option("formData") || formData;
        const payload = {
            name: currentFormData.name,
            code: currentFormData.code,
        };

        setLoading(true);
        try {
            await warehouseService.update(warehouse.id, payload, token);
            notify("Almacén actualizado con éxito", "success", 2000);
            await onSuccess();
            onHiding();
        } catch (err: any) {
            console.error("Error al actualizar el almacén:", err);
            const errorMessage = err instanceof Error && err.message ? err.message : "Error al actualizar el almacén. Intente nuevamente.";
            notify(errorMessage, "error", 4000);
        } finally {
            setLoading(false);
        }
    }, [formData, warehouse?.id, token, onSuccess, onHiding]);

    return (
        <Popup
            visible={visible}
            onHiding={onHiding}
            onHidden={onHidden}
            onShown={(e) => {
                e.component.repaint();
            }}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title="Editar Almacén"
            width={450}
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
                        dataField="code"
                        label={{ text: "Código" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            placeholder: "Código del almacén",
                            valueChangeEvent: "blur",
                            stylingMode: "filled",
                            maxLength: FIELD_LIMITS.stringTeeny,
                        }}
                        validationRules={[
                            { type: "required", message: "El código es obligatorio" },
                            { type: "stringLength", max: FIELD_LIMITS.stringTeeny, message: `El código no puede superar los ${FIELD_LIMITS.stringTeeny} caracteres` },
                        ]}
                    />
                    <SimpleItem
                        dataField="name"
                        label={{ text: "Nombre del Almacén" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            placeholder: "Nombre del almacén",
                            valueChangeEvent: "blur",
                            stylingMode: "filled",
                            maxLength: FIELD_LIMITS.stringLong,
                        }}
                        validationRules={[
                            { type: "required", message: "El nombre del almacén es obligatorio" },
                            { type: "stringLength", max: FIELD_LIMITS.stringLong, message: `El nombre no puede superar los ${FIELD_LIMITS.stringLong} caracteres` },
                        ]}
                    />
                    <SimpleItem
                        dataField="companyName"
                        label={{ text: "Empresa" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            value: currentCompany?.name || "",
                            disabled: true,
                            stylingMode: "filled",
                        }}
                    />
                </Form>
            </div>

            <ToolbarItem toolbar="bottom" location="after">
                <Button
                    text="Cancelar"
                    onClick={onHiding}
                    disabled={loading}
                    stylingMode="text"
                    className="!bg-main/10"
                />
            </ToolbarItem>
            <ToolbarItem toolbar="bottom" location="after">
                <Button
                    text="Guardar"
                    type="default"
                    stylingMode="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="!bg-focus-300 !text-variant"
                />
            </ToolbarItem>
        </Popup>
    );
};

export default WarehouseEdition;
