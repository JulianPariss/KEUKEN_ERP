"use client";

import { vehiclesService } from "@/app/services/vehicles.service";
import { IFVehicleCreate } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usersService } from "@/app/services/users.service";
import { IFUser } from "@repo/api-contracts/erp";
import notify from "devextreme/ui/notify";
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import Popup, { Position, ToolbarItem } from "devextreme-react/popup";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";

interface VehicleCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHidden?: () => void;
    onSuccess: () => void;
    initialData?: any;
}

const emptyVehicleData: IFVehicleCreate = {
    licensePlate: "",
    modelName: "",
    driverId: "",
    capacityWeight: 0,
    capacityVolume: 0,
};

const VehicleCreationModal = ({ isOpen, onClose, onHidden, onSuccess, initialData }: VehicleCreationModalProps) => {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const { token, currentCompany } = useAuth();
    const [drivers, setDrivers] = useState<IFUser[]>([]);

    useEffect(() => {
        let mounted = true;
        const fetchDrivers = async () => {
            try {
                const response = await usersService.getDrivers({ limit: 100, offset: 0, companyId: currentCompany?.id }, token);
                if (mounted) {
                    setDrivers(response.items);
                }
            } catch (error) {
                console.error("Error fetching drivers:", error);
            }
        };

        if (isOpen) {
            fetchDrivers();
        }

        return () => {
            mounted = false;
        };
    }, [isOpen, token, currentCompany?.id]);

    const [formData, setFormData] = useState<IFVehicleCreate>(emptyVehicleData);

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    licensePlate: initialData.licensePlate || "",
                    modelName: initialData.modelName || "",
                    driverId: initialData.driverId || "",
                    capacityWeight: initialData.capacityWeight ?? 0,
                    capacityVolume: initialData.capacityVolume ?? 0,
                }
                : { ...emptyVehicleData };

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
        setFormData({ ...emptyVehicleData });
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
                await vehiclesService.update(initialData.id, currentFormData, token, currentCompany?.id);
                notify("Vehículo actualizado exitosamente", "success", 3000);
            } else {
                await vehiclesService.create(currentFormData, token, currentCompany?.id);
                notify("Vehículo creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving vehicle:", error);
            const errorMessage = error?.message || "Error al guardar el vehículo";
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
                    dataField="licensePlate"
                    label={{ text: "Patente / Matrícula" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej. ABC-123 o AA123BB",
                        stylingMode: 'filled',
                    }}
                    validationRules={[{ type: 'required', message: "La patente es obligatoria" }]}
                />
                <SimpleItem
                    dataField="modelName"
                    label={{ text: "Modelo" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej. Ford Cargo, Mercedes-Benz Sprinter",
                        stylingMode: 'filled',
                    }}
                    validationRules={[{ type: 'required', message: "El modelo es obligatorio" }]}
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
                    validationRules={[{ type: 'required', message: "El chofer es obligatorio" }]}
                />
                <GroupItem colCount={2}>
                    <SimpleItem
                        dataField="capacityWeight"
                        label={{ text: "Capacidad Peso (kg)" }}
                        editorType="dxNumberBox"
                        editorOptions={{
                            min: 0,
                            max: FIELD_LIMITS.decimalMax,
                            format: '#,##0.00',
                            stylingMode: 'filled',
                        }}
                        validationRules={[
                            { type: 'required', message: "El peso es obligatorio" },
                            { type: 'range', min: 0, max: FIELD_LIMITS.decimalMax, message: FIELD_LIMITS.decimalMaxMessage }
                        ]}
                    />
                    <SimpleItem
                        dataField="capacityVolume"
                        label={{ text: "Capacidad Volumen (m³)" }}
                        editorType="dxNumberBox"
                        editorOptions={{
                            min: 0,
                            max: FIELD_LIMITS.decimalMax,
                            format: '#,##0.00',
                            stylingMode: 'filled',
                        }}
                        validationRules={[
                            { type: 'required', message: "El volumen es obligatorio" },
                            { type: 'range', min: 0, max: FIELD_LIMITS.decimalMax, message: FIELD_LIMITS.decimalMaxMessage }
                        ]}
                    />
                </GroupItem>
            </GroupItem>
        </Form>
    ), [formData, drivers]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Vehículo de Reparto" : "Nuevo Vehículo de Reparto"}
            width={480}
            height={480}
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

export default VehicleCreationModal;
