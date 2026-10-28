"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import PERMISSIONS_CONSTANTS from "@repo/access";
import { canDo } from "@repo/access";
import { locationService } from "@repo/erp-services/warehouse/locations.service";
import { IFLocationSimpleCreation } from "@repo/api-contracts/erp";
import { Button } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { useLocations } from "@/contexts/LocationsContext";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";

interface ILocationSimpleCreationProps {
    warehouseId: string;
    parentId: string;
    parentPath: string;
    onSuccess?: () => void;
}

const emptyFormData = (selectedLocation: any, parentPath: string, parentId: string, warehouseId: string): IFLocationSimpleCreation => ({
    name: "",
    usage: "view",
    path: selectedLocation?.path ?? parentPath,
    warehouseId,
    parentId: selectedLocation?.id ?? parentId,
    capacityVolume: 0,
    capacityWeight: 0,
    active: true,
    state: 'available',
    isMonoProduct: false,
    accessLevel: 'private',
    areaId: '',
});

const LocationsSimpleCreation = (props: ILocationSimpleCreationProps) => {
    const { warehouseId, parentId, parentPath, onSuccess } = props;
    const { triggerRefresh, selectedLocation } = useLocations();
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isStorage, setIsStorage] = useState(false);
    const formRef = useRef<any>(null);

    const { token, permissions } = useAuth();

    const [formData, setFormData] = useState<IFLocationSimpleCreation>(() =>
        emptyFormData(selectedLocation, parentPath, parentId, warehouseId)
    );

    const openPopup = useCallback(() => {
        const nextData = emptyFormData(selectedLocation, parentPath, parentId, warehouseId);
        setFormData(nextData);
        setIsStorage(false);
        setPopupVisible(true);

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
    }, [selectedLocation, parentPath, parentId, warehouseId]);

    const handleHiding = useCallback(() => {
        setPopupVisible(false);
    }, []);

    const handleHidden = useCallback(() => {
        setFormData(emptyFormData(selectedLocation, parentPath, parentId, warehouseId));
        setIsStorage(false);
    }, [selectedLocation, parentPath, parentId, warehouseId]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            await locationService.createSimple(currentFormData, token);
            notify('Ubicación creada con éxito', 'success', 3000);
            triggerRefresh();
            onSuccess?.();
            setPopupVisible(false);
        } catch (error: any) {
            console.error(error);
            const errorMessage = error instanceof Error && error.message ? error.message : 'Error al crear la ubicación';
            notify(errorMessage, 'error', 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, token, triggerRefresh, onSuccess]);

    const canModify = useMemo((): boolean => {
        return permissions ? canDo('modify', PERMISSIONS_CONSTANTS.modifyLocations, permissions) : false;
    }, [permissions]);

    return (
        <>
            {canModify &&
                <Button
                    width="100%"
                    stylingMode="contained"
                    type="default"
                    onClick={openPopup}
                    elementAttr={{ class: '!bg-gradient-to-r !pr-2 !from-focus-500/80 !to-focus-300/80 !rounded-dx !border-none shadow-lg hover:shadow-focus-500/20 transition-all group' }}
                >
                    <div className="flex items-center justify-center gap-2">
                        <i style={{ fontSize: '12px' }} className="dx-icon-add text-lg text-variant! group-hover:rotate-90 transition-transform duration-300"></i>
                        <span className="text-xs text-nowrap font-bold text-variant!">Crear Ubicación Individual</span>
                    </div>
                </Button>
            }

            <Popup
                visible={isPopupVisible}
                onHiding={handleHiding}
                onHidden={handleHidden}
                dragEnabled={false}
                hideOnOutsideClick={true}
                showCloseButton={true}
                showTitle={true}
                titleRender={() => (
                    <div className="flex flex-row items-center justify-between pr-6">
                        <h3 className="text-base font-semibold">Configuración de Ubicación</h3>
                        <div className="flex items-center gap-1.5 text-xs">
                            <i className="dx-icon-folder opacity-60 text-xs"></i>
                            <span className="opacity-60">Ruta:</span>
                            <span className="uppercase truncate max-w-[140px] text-focus-300! text-xs">{parentPath || 'Raíz'}</span>
                        </div>
                    </div>
                )}
                width={520}
                height="auto"
                maxHeight={'90vh'}
                deferRendering={false}
                onShown={(e) => {
                    e.component.repaint();
                }}
            >
                <Position at="center" my="center" />

                <div className="p-4">
                    <Form
                        ref={formRef}
                        formData={formData}
                        labelLocation="top"
                    >
                        <GroupItem colCount={2}>
                            <SimpleItem
                                dataField="name"
                                label={{ text: "Nombre de la Unidad *" }}
                                editorType="dxTextBox"
                                colSpan={1}
                                editorOptions={{
                                    placeholder: "Ej: Estantería Principal A1",
                                    stylingMode: "filled",
                                }}
                                validationRules={[{ type: 'required', message: "El nombre es obligatorio" }]}
                            />

                            <SimpleItem
                                dataField="usage"
                                label={{ text: "Uso" }}
                                editorType="dxSelectBox"
                                colSpan={1}
                                editorOptions={{
                                    items: [
                                        { id: 'internal', text: 'Almacén' },
                                        { id: 'view', text: 'Contenedor' }
                                    ],
                                    valueExpr: "id",
                                    displayExpr: "text",
                                    stylingMode: "filled",
                                    onValueChanged: (e: any) => {
                                        setIsStorage(e.value === 'internal');
                                    },
                                    dropDownOptions: {
                                        wrapperAttr: {
                                            class: "popup-menu-container"
                                        }
                                    }
                                }}
                            />

                            {isStorage && (
                                <>
                                    <SimpleItem
                                        dataField="capacityVolume"
                                        label={{ text: "m³ de Capacidad" }}
                                        editorType="dxNumberBox"
                                        colSpan={1}
                                        editorOptions={{
                                            min: 0,
                                            max: FIELD_LIMITS.decimalMax,
                                            step: 0.1,
                                            format: "#,##0.00 m³",
                                            stylingMode: "filled",
                                        }}
                                        validationRules={[
                                            { type: 'required', message: "La capacidad es obligatoria" },
                                            { type: 'range', min: 0, max: FIELD_LIMITS.decimalMax, message: FIELD_LIMITS.decimalMaxMessage }
                                        ]}
                                    />

                                    <SimpleItem
                                        dataField="capacityWeight"
                                        label={{ text: "Peso de Capacidad" }}
                                        editorType="dxNumberBox"
                                        colSpan={1}
                                        editorOptions={{
                                            min: 0,
                                            max: FIELD_LIMITS.decimalMax,
                                            step: 0.1,
                                            format: "#,##0.00 kg",
                                            stylingMode: "filled",
                                        }}
                                        validationRules={[
                                            { type: 'required', message: "El peso es obligatorio" },
                                            { type: 'range', min: 0, max: FIELD_LIMITS.decimalMax, message: FIELD_LIMITS.decimalMaxMessage }
                                        ]}
                                    />
                                </>
                            )}
                        </GroupItem>
                    </Form>
                </div>

                <ToolbarItem toolbar="bottom" location="after">
                    <Button
                        text="Cancelar"
                        onClick={handleHiding}
                        disabled={loading}
                        stylingMode="text"
                        className="!bg-main/10"
                    />
                </ToolbarItem>
                <ToolbarItem toolbar="bottom" location="after">
                    <Button
                        text={loading ? "Guardando..." : "Guardar"}
                        type="default"
                        stylingMode="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="!bg-focus-300 !text-variant"
                    />
                </ToolbarItem>
            </Popup>
        </>
    );
};

export default LocationsSimpleCreation;