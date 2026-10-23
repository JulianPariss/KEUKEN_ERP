"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import Form, { SimpleItem } from "devextreme-react/form";
import notify from "devextreme/ui/notify";
import { Button } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { locationService } from "@repo/erp-services/warehouse/locations.service";
import { IBLocationStateUpdate } from "@repo/api-contracts/erp";
import { IFLocation, IFLocationStateUpdateCreation, TFLocationState } from "@repo/api-contracts/erp";

const STATE_OPTIONS: { id: TFLocationState; text: string }[] = [
    { id: 'available', text: 'Disponible' },
    { id: 'blocked', text: 'Bloqueado' },
    { id: 'maintenance', text: 'Mantenimiento' },
];

interface LocationChangeStateProps {
    visible: boolean;
    onHiding: () => void;
    onHidden?: () => void;
    location: IFLocation;
    onSuccess?: (location: IFLocation, isRecursive: boolean) => void;
}

const LocationChangeState = ({ visible, onHiding, onHidden, location, onSuccess }: LocationChangeStateProps) => {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const { token } = useAuth();

    const [formData, setFormData] = useState<Partial<IFLocationStateUpdateCreation>>({
        state: location?.state || 'available',
        recursive: false,
    });

    useEffect(() => {
        if (visible && location) {
            const nextData: Partial<IFLocationStateUpdateCreation> = {
                state: location.state || 'available',
                recursive: false,
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
    }, [visible, location]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();

        if (!result?.isValid) return;

        if (!location?.path) {
            notify("Ubicación inválida", "error", 3000);
            return;
        }

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            const payload: IBLocationStateUpdate = {
                state: currentFormData.state as TFLocationState,
                recursive: !!currentFormData.recursive,
            };

            await locationService.changeState(location.path, payload, token);

            const updatedLocation: IFLocation = {
                ...location,
                state: currentFormData.state as TFLocationState,
            };

            notify("Se ha cambiado el estado de la ubicación", "success", 2000);
            onSuccess?.(updatedLocation, !!currentFormData.recursive);
            onHiding();
        } catch (err: any) {
            console.error("Error al cambiar el estado de la ubicación:", err);
            const errorMessage = err instanceof Error && err.message ? err.message : "Error al cambiar el estado de la ubicación. Intente nuevamente.";
            notify(errorMessage, "error", 4000);
        } finally {
            setLoading(false);
        }
    }, [formData, location, token, onSuccess, onHiding]);

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
            title="Cambiar Estado de Ubicación"
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
                        dataField="state"
                        label={{ text: "Nuevo Estado" }}
                        editorType="dxSelectBox"
                        editorOptions={{
                            items: STATE_OPTIONS,
                            displayExpr: "text",
                            valueExpr: "id",
                            stylingMode: "filled",
                            dropDownOptions: {
                                wrapperAttr: {
                                    class: "popup-menu-container"
                                }
                            }
                        }}
                        validationRules={[{ type: "required", message: "El estado es obligatorio" }]}
                    />

                    <SimpleItem
                        dataField="recursive"
                        label={{ text: "Opciones Recursivas" }}
                        editorType="dxCheckBox"
                        editorOptions={{
                            text: "Aplicar de forma recursiva (afectará a todos los niveles inferiores)",
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
                    text={loading ? "Procesando..." : "Confirmar Cambio"}
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

export default LocationChangeState;