"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Form, { CustomRule, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { Button } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { useLocations } from "@/contexts/LocationsContext";
import { inventoryService } from "@/app/services/warehouse/inventory.service";

interface CompleteInventoryProps {
    onHiding: () => void;
    onHidden?: () => void;
    inventoryId: string;
    visible: boolean;
    onSuccess?: () => void;
}

const emptyCompleteData = () => ({
    disclaimer: false,
});

const CompleteInventory = ({ onHiding, onHidden, inventoryId, visible, onSuccess }: CompleteInventoryProps) => {
    const { setActiveInventory } = useLocations();
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const { token } = useAuth();

    const [formData, setFormData] = useState(emptyCompleteData);

    useEffect(() => {
        if (visible) {
            const nextData = emptyCompleteData();
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
        setFormData(emptyCompleteData());
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    const handleCompleteInventory = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        setLoading(true);
        try {
            await inventoryService.confirm(inventoryId, token);
            setActiveInventory(null);
            notify("Inventario finalizado con éxito", "success", 3000);
            onSuccess?.();
            onHiding();
        } catch (error: any) {
            console.error('Error completing inventory:', error);
            const errorMessage = error instanceof Error && error.message ? error.message : (error?.detail || 'Error al finalizar el inventariado');
            notify(errorMessage, 'error', 3000);
        } finally {
            setLoading(false);
        }
    }, [inventoryId, token, setActiveInventory, onSuccess, onHiding]);

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
            title="Finalizar proceso de Inventariado"
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
                        dataField="disclaimer"
                        label={{ visible: false }}
                        editorType="dxCheckBox"
                        editorOptions={{
                            text: "Confirmo que el inventariado de esta ubicación ha sido verificado y deseo finalizar el proceso.",
                            stylingMode: "filled",
                        }}
                    >
                        <CustomRule
                            validationCallback={(params: any) => params.value === true}
                            message="Debe confirmar para poder finalizar el proceso"
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
                    stylingMode="contained"
                    text={loading ? "Finalizando..." : "Finalizar Inventario"}
                    onClick={handleCompleteInventory}
                    disabled={loading}
                    className="!bg-focus-300 !text-variant"
                />
            </ToolbarItem>
        </Popup>
    );
};

export default CompleteInventory;
