"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Form, { CustomRule, RequiredRule, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { Button } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { inventoryService } from "@repo/erp-services/warehouse/inventory.service";

interface ReserveModalProps {
    onHiding: () => void;
    onHidden?: () => void;
    locationId: string;
    visible: boolean;
    onSuccess?: () => void;
}

const emptyInventoryData = () => ({
    name: `Inventario ${new Date().toLocaleDateString()}`,
    disclaimer: false,
});

const StartInventory = ({ onHiding, onHidden, locationId, visible, onSuccess }: ReserveModalProps) => {
    const { currentCompany, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);

    const [formData, setFormData] = useState(emptyInventoryData);

    useEffect(() => {
        if (visible) {
            const nextData = emptyInventoryData();
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
    }, [visible]);

    const handleHidden = useCallback(() => {
        setFormData(emptyInventoryData());
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    const handleAddInventory = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            await inventoryService.create({ name: currentFormData.name, locationId, companyId: currentCompany?.id || "" }, token);
            notify("Proceso de inventariado iniciado con éxito", "success", 3000);
            onSuccess?.();
            onHiding();
        } catch (error: any) {
            console.error('Error starting inventory:', error);
            const errorMessage = error instanceof Error && error.message ? error.message : (error?.detail || 'Error al iniciar el inventariado');
            notify(errorMessage, 'error', 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, locationId, currentCompany?.id, token, onSuccess, onHiding]);

    return (
        <Popup
            visible={visible}
            onHiding={onHiding}
            onHidden={handleHidden}
            onShown={(e) => {
                e.component.repaint();
            }}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title="Comenzar proceso de Inventariado"
            width={550}
            height="auto"
        >
            <Position at="center" my="center" />
            <div className="p-4">
                <Form
                    ref={formRef}
                    formData={formData}
                    labelLocation="top"
                    colCount={1}
                >
                    <SimpleItem
                        dataField="name"
                        label={{ text: "Nombre del Inventario" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            placeholder: "Ingrese el nombre del inventario",
                            stylingMode: "filled",
                        }}
                    >
                        <RequiredRule message="El nombre es obligatorio" />
                    </SimpleItem>

                    <SimpleItem
                        dataField="disclaimer"
                        label={{ visible: false }}
                        cssClass="flex items-center p-3 bg-primary-950/20 rounded-dx border border-main/5 mt-4"
                        editorType="dxCheckBox"
                        editorOptions={{
                            text: "Entiendo que la ubicación quedará bloqueada hasta que resuelva el inventariado",
                            stylingMode: "filled",
                        }}
                    >
                        <CustomRule
                            validationCallback={(params: any) => params.value === true}
                            message="Debe confirmar que entiende que la ubicación será bloqueada"
                        />
                    </SimpleItem>
                </Form>
            </div>

            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text="Cancelar"
                    onClick={onHiding}
                    disabled={loading}
                    stylingMode="text"
                    className="!bg-main/10"
                />
            </ToolbarItem>
            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    type="default"
                    text={loading ? "Iniciando..." : "Comenzar"}
                    stylingMode="contained"
                    onClick={handleAddInventory}
                    disabled={loading}
                    className="!bg-focus-300 !text-variant"
                />
            </ToolbarItem>
        </Popup>
    );
};

export default StartInventory;