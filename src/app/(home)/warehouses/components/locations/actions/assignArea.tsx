"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import notify from "devextreme/ui/notify";
import { Button } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { areaService } from "@repo/erp-services/warehouse/areas.service";
import { IFArea } from "@repo/api-contracts/erp";
import { IFLocation } from "@repo/api-contracts/erp";

interface IAssignAreaModalProps {
    visible: boolean;
    onHiding: () => void;
    onHidden?: () => void;
    location: IFLocation | null;
    warehouseId: string;
    onSuccess?: () => void;
}

interface IAssignAreaFormData {
    locationPath: string;
    areaId: string;
    recursive: boolean;
    simulate: boolean;
}

const AssignAreaModal = ({ visible, onHiding, onHidden, location, warehouseId, onSuccess }: IAssignAreaModalProps) => {
    const [loading, setLoading] = useState(false);
    const [areas, setAreas] = useState<IFArea[]>([]);
    const [loadingAreas, setLoadingAreas] = useState(false);
    const formRef = useRef<any>(null);
    const { token } = useAuth();

    const [formData, setFormData] = useState<IAssignAreaFormData>({
        locationPath: location?.path || "",
        areaId: "",
        recursive: false,
        simulate: false,
    });

    useEffect(() => {
        if (visible && location) {
            const nextData: IAssignAreaFormData = {
                locationPath: location.path || "",
                areaId: "",
                recursive: false,
                simulate: false,
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

            if (warehouseId && token) {
                setLoadingAreas(true);
                areaService.getAreasByWarehouse(warehouseId, token)
                    .then(list => setAreas(list))
                    .catch(err => {
                        console.error("Error loading areas:", err);
                        notify("No se pudieron cargar las áreas", "error", 3000);
                    })
                    .finally(() => setLoadingAreas(false));
            }
        }
    }, [visible, location, warehouseId, token]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        if (!location) {
            notify("Ubicación no seleccionada", "error", 3000);
            return;
        }

        const currentFormData: IAssignAreaFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            const res = await areaService.assignArea(
                warehouseId,
                currentFormData.areaId,
                {
                    root: location.path,
                    recursive: !!currentFormData.recursive,
                    simulate: !!currentFormData.simulate,
                },
                token
            );

            if (currentFormData.simulate) {
                notify(
                    `[SIMULACIÓN] Éxito: ${res.message}. Coincidentes: ${res.matchedCount}, Actualizadas: ${res.updatedCount}`,
                    "info",
                    5000
                );
            } else {
                notify(
                    `Área asignada con éxito. Actualizadas: ${res.updatedCount}`,
                    "success",
                    3000
                );
                onSuccess?.();
                onHiding();
            }
        } catch (error: any) {
            console.error("Error assigning area:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Ocurrió un error al asignar el área";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, location, warehouseId, token, onSuccess, onHiding]);

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
            title="Asignar Área a Ubicación"
            width={500}
            height="auto"
        >
            <Position at="center" my="center" />

            <div className="p-4 flex flex-col gap-4">
                <Form
                    ref={formRef}
                    formData={formData}
                    labelLocation="top"
                >
                    <GroupItem colCount={1}>
                        <SimpleItem
                            dataField="locationPath"
                            label={{ text: "Ubicación Raíz" }}
                            editorType="dxTextBox"
                            editorOptions={{
                                disabled: true,
                                stylingMode: 'filled',
                            }}
                        />

                        <SimpleItem
                            dataField="areaId"
                            label={{ text: "Área *" }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                items: areas,
                                valueExpr: "id",
                                displayExpr: "name",
                                placeholder: loadingAreas ? "Cargando áreas..." : "Seleccione un área...",
                                searchEnabled: true,
                                stylingMode: 'filled',
                                dropDownOptions: {
                                    wrapperAttr: {
                                        class: 'popup-menu-container'
                                    }
                                }
                            }}
                            validationRules={[{ type: 'required', message: "El área es obligatoria" }]}
                        />

                        <SimpleItem
                            dataField="recursive"
                            label={{ text: "Opciones de Asignación" }}
                            editorType="dxCheckBox"
                            editorOptions={{
                                text: "Asignar recursivamente a sub-ubicaciones",
                                stylingMode: 'filled',
                            }}
                        />

                        <SimpleItem
                            dataField="simulate"
                            label={{ text: "" }}
                            editorType="dxCheckBox"
                            editorOptions={{
                                text: "Simular asignación (no aplica cambios reales)",
                                stylingMode: 'filled',
                            }}
                        />
                    </GroupItem>
                </Form>

                {location?.areaId && (
                    <div className="flex items-start gap-3 p-3 rounded-dx border border-focus-500/30 bg-focus-500/10">
                        <i className="dx-icon-warning text-focus-300 text-xl mt-0.5 shrink-0" />
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold text-focus-300">Reemplazar Área Existente</p>
                            <p className="text-xs text-main/60">
                                Esta ubicación ya posee el área asignada: <span className="font-semibold text-main/80">{location.areaName || location.areaCode}</span>.
                                Al proceder, se reemplazará por la nueva área seleccionada.
                            </p>
                        </div>
                    </div>
                )}
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
                    text={loading ? "Procesando..." : "Asignar"}
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

export default AssignAreaModal;
