"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import PERMISSIONS_CONSTANTS from "@/app/lib/constants/permissions.constants";
import { canDo } from "@/app/lib/utils/permission.helper";
import { areaService } from "@/app/services/warehouse/areas.service";
import { IFAreaCreate, IFAreaType } from "@repo/api-contracts/erp";
import { Button } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";

interface ICreateAreaModalProps {
    warehouseId: string;
    onSuccess?: () => void;
    onHidden?: () => void;
}

const emptyAreaFormData: IFAreaCreate = {
    areaTypeId: "",
    name: "",
    code: "",
};

const CreateAreaModal = ({ warehouseId, onSuccess, onHidden }: ICreateAreaModalProps) => {
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [areaTypes, setAreaTypes] = useState<IFAreaType[]>([]);
    const [loadingTypes, setLoadingTypes] = useState(false);
    const formRef = useRef<any>(null);

    const { token, permissions } = useAuth();

    const [formData, setFormData] = useState<IFAreaCreate>(emptyAreaFormData);

    const openPopup = useCallback(() => {
        const nextData = { ...emptyAreaFormData };
        setFormData(nextData);
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

        if (token) {
            setLoadingTypes(true);
            areaService.getAreaTypes(token)
                .then(types => setAreaTypes(types))
                .catch(err => {
                    console.error("Error loading area types:", err);
                    notify("No se pudieron cargar los tipos de área", "error", 3000);
                })
                .finally(() => setLoadingTypes(false));
        }
    }, [token]);

    const handleHiding = useCallback(() => {
        setPopupVisible(false);
    }, []);

    const handleHidden = useCallback(() => {
        setFormData({ ...emptyAreaFormData });
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        const currentFormData: IFAreaCreate = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            await areaService.createArea(warehouseId, currentFormData, token);
            notify("Área creada con éxito", "success", 3000);
            onSuccess?.();
            setPopupVisible(false);
        } catch (error: any) {
            console.error("Error creating area:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Ocurrió un error al crear el área";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, warehouseId, token, onSuccess]);

    const canModify = useMemo((): boolean => {
        return permissions ? canDo('modify', PERMISSIONS_CONSTANTS.modifyLocations, permissions) : false;
    }, [permissions]);

    return (
        <>
            {canModify && (
                <Button
                    width="100%"
                    stylingMode="contained"
                    type="default"
                    onClick={openPopup}
                    elementAttr={{ class: '!bg-gradient-to-r !pr-2 !from-focus-500/80 !to-focus-300/80 !rounded-dx !border-none shadow-lg hover:shadow-focus-500/20 transition-all group' }}
                >
                    <div className="flex items-center justify-center gap-2">
                        <i style={{ fontSize: '12px' }} className="dx-icon-add text-lg text-variant! group-hover:rotate-90 transition-transform duration-300"></i>
                        <span className="text-xs text-nowrap font-bold text-variant!">Crear Área</span>
                    </div>
                </Button>
            )}

            <Popup
                visible={isPopupVisible}
                onHiding={handleHiding}
                onHidden={handleHidden}
                onShown={(e) => {
                    e.component.repaint();
                }}
                dragEnabled={false}
                hideOnOutsideClick={true}
                showCloseButton={true}
                showTitle={true}
                title="Crear Nueva Área"
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
                                dataField="code"
                                label={{ text: "Código del Área *" }}
                                editorType="dxTextBox"
                                editorOptions={{
                                    placeholder: "Ej: F01.PICK",
                                    stylingMode: "filled",
                                    maxLength: FIELD_LIMITS.stringTeeny,
                                }}
                                validationRules={[
                                    { type: 'required', message: "El código es obligatorio" },
                                    { type: 'stringLength', max: FIELD_LIMITS.stringTeeny, message: `El código no puede superar los ${FIELD_LIMITS.stringTeeny} caracteres` }
                                ]}
                            />

                            <SimpleItem
                                dataField="name"
                                label={{ text: "Nombre del Área *" }}
                                editorType="dxTextBox"
                                editorOptions={{
                                    placeholder: "Ej: Área de Picking",
                                    stylingMode: "filled",
                                    maxLength: FIELD_LIMITS.stringLong,
                                }}
                                validationRules={[
                                    { type: 'required', message: "El nombre es obligatorio" },
                                    { type: 'stringLength', max: FIELD_LIMITS.stringLong, message: `El nombre no puede superar los ${FIELD_LIMITS.stringLong} caracteres` }
                                ]}
                            />

                            <SimpleItem
                                dataField="areaTypeId"
                                label={{ text: "Tipo de Área *" }}
                                editorType="dxSelectBox"
                                editorOptions={{
                                    items: areaTypes,
                                    valueExpr: "id",
                                    displayExpr: "name",
                                    placeholder: loadingTypes ? "Cargando tipos de área..." : "Seleccione tipo...",
                                    searchEnabled: true,
                                    stylingMode: "filled",
                                    dropDownOptions: {
                                        wrapperAttr: {
                                            class: "popup-menu-container"
                                        }
                                    }
                                }}
                                validationRules={[{ type: 'required', message: "El tipo de área es obligatorio" }]}
                            />
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

export default CreateAreaModal;
