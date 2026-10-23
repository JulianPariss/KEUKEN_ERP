"use client";

import { citiesService } from "@repo/erp-services/location_services/cities.service";
import { statesService } from "@repo/erp-services/location_services/states.service";
import { IFCitieCreation } from "@repo/api-contracts/erp";
import { IFState } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";

interface CitiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    initialData?: any;
    defaultStateId?: string | null;
}

const emptyCityData: IFCitieCreation = {
    stateId: "",
    code: "",
    name: "",
    active: true,
};

const CityCreationModal = ({
    isOpen,
    onClose,
    onSuccess,
    onHidden,
    initialData,
    defaultStateId
}: CitiesModalProps) => {
    const [loading, setLoading] = useState(false);
    const [states, setStates] = useState<IFState[]>([]);
    const formRef = useRef<any>(null);
    const { token } = useAuth();

    const [formData, setFormData] = useState<IFCitieCreation>(emptyCityData);

    useEffect(() => {
        let mounted = true;
        const fetchStates = async () => {
            try {
                const response = await statesService.getAll(token);
                if (mounted) setStates(response.items);
            } catch (error) {
                console.error("Error fetching states:", error);
            }
        };

        if (isOpen && states.length === 0) {
            fetchStates();
        }

        return () => { mounted = false; };
    }, [isOpen, token, states.length]);

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    stateId: initialData.stateId || "",
                    code: initialData.code || "",
                    name: initialData.name || "",
                    active: initialData.active ?? true,
                }
                : {
                    stateId: defaultStateId || "",
                    code: "",
                    name: "",
                    active: true,
                };

            setFormData(nextData);

            setTimeout(() => {
                const formInstance = formRef.current?.instance();
                if (formInstance) {
                    formInstance.option("formData", nextData);
                    if (typeof formInstance.reset === 'function') {
                        formInstance.reset();
                    }
                    formInstance.option("formData", nextData);
                }
            }, 0);
        }
    }, [isOpen, initialData, defaultStateId]);

    const handleHidden = useCallback(() => {
        setFormData(emptyCityData);
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
                await citiesService.update(initialData.id, currentFormData, token);
                notify("Ciudad actualizada exitosamente", "success", 3000);
            } else {
                await citiesService.create(currentFormData, token);
                notify("Ciudad creada exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving city:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al guardar la ciudad";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData?.id, onClose, onSuccess, token]);

    const formContent = useMemo(() => (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
        >
            <GroupItem colCount={2}>
                <SimpleItem
                    dataField="stateId"
                    label={{ text: "Provincia" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: states,
                        valueExpr: "id",
                        displayExpr: "name",
                        searchEnabled: true,
                        showClearButton: true,
                        stylingMode: 'filled',
                        disabled: !!defaultStateId || !!initialData,
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                    validationRules={[{ type: 'required', message: "La provincia es obligatoria" }]}
                />
                <SimpleItem
                    dataField="code"
                    label={{ text: "Código Ciudad" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Código postal o ISO",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                        maxLength: FIELD_LIMITS.stringSmall,
                    }}
                    validationRules={[
                        { type: 'required', message: "El código es obligatorio" },
                        { type: 'stringLength', max: FIELD_LIMITS.stringSmall, message: `El código no puede superar los ${FIELD_LIMITS.stringSmall} caracteres` }
                    ]}
                />
                <SimpleItem
                    dataField="name"
                    label={{ text: "Nombre" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Nombre de la ciudad",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                        maxLength: FIELD_LIMITS.stringLong,
                    }}
                    validationRules={[
                        { type: 'required', message: "El nombre es obligatorio" },
                        { type: 'stringLength', max: FIELD_LIMITS.stringLong, message: `El nombre no puede superar los ${FIELD_LIMITS.stringLong} caracteres` }
                    ]}
                />
                <SimpleItem
                    dataField="active"
                    label={{ text: "Estado" }}
                    editorType="dxCheckBox"
                    editorOptions={{
                        text: "Activo",
                        stylingMode: 'filled',
                    }}
                />
            </GroupItem>
        </Form>
    ), [formData, states, defaultStateId, initialData]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Ciudad" : "Nueva Ciudad"}
            width={500}
            height="auto"
            maxHeight="88vh"
            className="custom-popup"
            deferRendering={false}
            onShown={(e) => {
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-5">
                {formContent}
            </div>

            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text="Cancelar"
                    onClick={onClose}
                    disabled={loading}
                    stylingMode="text"
                />
            </ToolbarItem>
            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
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

export default CityCreationModal;
