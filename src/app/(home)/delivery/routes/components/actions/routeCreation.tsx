"use client";

import { routesService } from "@repo/erp-services/routes.service";
import { vehiclesService } from "@repo/erp-services/vehicles.service";
import { IFRouteCreate } from "@repo/api-contracts/erp";
import { IFVehicle } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import Popup, { Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import "devextreme-react/select-box";
import "devextreme-react/text-box";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usersService } from "@repo/erp-services/users.service";
import { IFUser } from "@repo/api-contracts/erp";

interface RouteCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHidden?: () => void;
    onSuccess: () => void;
    initialData?: any;
}

const emptyRouteData: IFRouteCreate = {
    driverId: "",
    vehicleId: "",
    name: "",
};

const RouteCreationModal = ({ isOpen, onClose, onHidden, onSuccess, initialData }: RouteCreationModalProps) => {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const { token, currentCompany } = useAuth();
    const [vehicles, setVehicles] = useState<IFVehicle[]>([]);
    const [drivers, setDrivers] = useState<IFUser[]>([]);

    const [formData, setFormData] = useState<IFRouteCreate>(emptyRouteData);

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    driverId: initialData.driverId || "",
                    vehicleId: initialData.vehicleId || "",
                    name: initialData.name || "",
                }
                : { ...emptyRouteData };

            setFormData(nextData);

            setTimeout(() => {
                const formInstance = formRef.current?.instance();
                if (formInstance) {
                    formInstance.option("formData", nextData);
                }
            }, 0);
        }
    }, [isOpen, initialData]);

    const handleHidden = useCallback(() => {
        setFormData({ ...emptyRouteData });
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    useEffect(() => {
        let mounted = true;
        const fetchDependencies = async () => {
            try {
                const [vehiclesRes, driversRes] = await Promise.all([
                    vehiclesService.getAll(token, 100, 0, currentCompany?.id),
                    usersService.getDrivers({ limit: 100, offset: 0, companyId: currentCompany?.id }, token)
                ]);
                if (mounted) {
                    setVehicles(vehiclesRes.items);
                    setDrivers(driversRes.items);
                }
            } catch (error) {
                console.error("Error fetching dependencies:", error);
            }
        };

        if (isOpen) {
            fetchDependencies();
        }

        return () => {
            mounted = false;
        };
    }, [isOpen, token, currentCompany?.id]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            if (initialData?.id) {
                const updatePayload = {
                    driver_id: currentFormData.driverId,
                    vehicle_id: currentFormData.vehicleId,
                    name: currentFormData.name,
                };
                await routesService.update(initialData.id, updatePayload, token, currentCompany?.id);
                notify("Ruta actualizada exitosamente", "success", 3000);
            } else {
                const createData = {
                    ...currentFormData,
                    companyId: currentCompany?.id || (currentFormData as any).companyId
                };
                await routesService.create(createData, token, currentCompany?.id);
                notify("Ruta creada exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving route:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al guardar la ruta";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData?.id, token, currentCompany?.id, onClose, onSuccess]);

    const formContent = useMemo(() => (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
        >
            <GroupItem colCount={1}>
                <SimpleItem
                    dataField="name"
                    label={{ text: "Nombre de la Ruta" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej. Ruta Norte - Distribución",
                        stylingMode: 'filled',
                    }}
                    validationRules={[{ type: 'required', message: "El nombre es obligatorio" }]}
                />
                <SimpleItem
                    dataField="vehicleId"
                    label={{ text: "Vehículo" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: vehicles,
                        valueExpr: "id",
                        displayExpr: (item: IFVehicle) => item ? `${item.licensePlate} - ${item.modelName}` : "",
                        searchEnabled: true,
                        stylingMode: 'filled',
                        onValueChanged: (e: any) => {
                            if (e.event) {
                                const selectedVehicle = vehicles.find(v => v.id === e.value);
                                const driverId = selectedVehicle?.driverId ?? "";
                                formRef.current?.instance()?.updateData("driverId", driverId);
                            }
                        },
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                    validationRules={[{ type: 'required', message: "El Vehículo es obligatorio" }]}
                />
                <SimpleItem
                    dataField="driverId"
                    label={{ text: "Chofer asignado" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: drivers,
                        valueExpr: "id",
                        displayExpr: "name",
                        searchEnabled: true,
                        placeholder: "Seleccione un chofer",
                        stylingMode: 'filled',
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                    validationRules={[{ type: 'required', message: "El Chofer es obligatorio" }]}
                />
            </GroupItem>
        </Form>
    ), [formData, vehicles, drivers]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Ruta" : "Nueva Ruta"}
            width={450}
            height={360}
            onShown={(e) => {
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-4">
                {formContent}
            </div>

            <ToolbarItem toolbar="bottom" location="after">
                <Button
                    text="Cancelar"
                    onClick={onClose}
                    disabled={loading}
                    stylingMode="text"
                />
            </ToolbarItem>
            <ToolbarItem toolbar="bottom" location="after">
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

export default RouteCreationModal;
