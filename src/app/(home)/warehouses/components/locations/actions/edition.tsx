"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import notify from "devextreme/ui/notify";
import { Button } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { locationService } from "@repo/erp-services/warehouse/locations.service";
import { IFLocation, IFLocationCreation } from "@repo/api-contracts/erp";

interface LocationEditionProps {
    visible: boolean;
    onHiding: () => void;
    onHidden?: () => void;
    location: IFLocation;
    onSuccess?: (updatedLocation: IFLocation) => void;
}

const LocationEdition = ({ visible, onHiding, onHidden, location, onSuccess }: LocationEditionProps) => {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const { token } = useAuth();

    const [formData, setFormData] = useState<Partial<IFLocationCreation>>({
        title: location?.name || "",
        usage: location?.usage || "internal",
        capacityWeight: location?.capacityWeight || 0,
        capacityVolume: location?.capacityVolume || 0,
        active: location?.active ?? true,
    });

    useEffect(() => {
        if (visible && location) {
            const nextData: Partial<IFLocationCreation> = {
                title: location.name,
                usage: location.usage,
                capacityWeight: location.capacityWeight || 0,
                capacityVolume: location.capacityVolume || 0,
                active: location.active,
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

        if (!location?.id) {
            notify("Ubicación inválida", "error", 3000);
            return;
        }

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            const response = await locationService.update(currentFormData, location.id, token);

            notify("Ubicación actualizada con éxito", "success", 2000);
            onSuccess?.(response);
            onHiding();
        } catch (err: any) {
            console.error("Error al actualizar la ubicación:", err);
            const errorMessage = err instanceof Error && err.message ? err.message : "Error al actualizar la ubicación. Intente nuevamente.";
            notify(errorMessage, "error", 4000);
        } finally {
            setLoading(false);
        }
    }, [formData, location?.id, token, onSuccess, onHiding]);

    const isStorage = formData.usage === "internal";

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
            title="Editar Ubicación"
            width={550}
            height="auto"
        >
            <Position at="center" my="center" />

            <div className="p-4">
                <Form
                    ref={formRef}
                    formData={formData}
                    labelLocation="top"
                >
                    <GroupItem colCount={isStorage ? 2 : 1}>
                        <SimpleItem
                            dataField="title"
                            label={{ text: "Nombre de la Unidad" }}
                            editorType="dxTextBox"
                            colSpan={isStorage ? 2 : 1}
                            editorOptions={{
                                disabled: true,
                                stylingMode: "filled",
                            }}
                            validationRules={[{ type: "required", message: "El nombre es obligatorio" }]}
                        />

                        {isStorage && (
                            <>
                                <SimpleItem
                                    dataField="capacityVolume"
                                    label={{ text: "m³ por Unidad" }}
                                    editorType="dxNumberBox"
                                    editorOptions={{
                                        min: 0,
                                        format: "#,##0.00 m³",
                                        stylingMode: "filled",
                                    }}
                                />

                                <SimpleItem
                                    dataField="capacityWeight"
                                    label={{ text: "Peso por Unidad" }}
                                    editorType="dxNumberBox"
                                    editorOptions={{
                                        min: 0,
                                        format: "#,##0.00 kg",
                                        stylingMode: "filled",
                                    }}
                                />
                            </>
                        )}

                        <SimpleItem
                            dataField="active"
                            label={{ text: "Estado" }}
                            editorType="dxCheckBox"
                            colSpan={isStorage ? 2 : 1}
                            editorOptions={{
                                text: "Ubicación Activa (Define si la unidad está disponible para su uso)",
                                stylingMode: "filled",
                            }}
                        />
                    </GroupItem>
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
};

export default LocationEdition;
