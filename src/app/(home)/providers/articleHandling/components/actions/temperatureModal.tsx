"use client";

import { useAuth } from "@/contexts/AuthContext";
import { temperatureService } from "@repo/erp-services/product_services/temperature.service";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle, useMemo } from "react";
import { IFTemperatureClass } from "@repo/api-contracts/erp";

interface TemperatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHidden?: () => void;
    onSuccess: () => void;
    initialData?: any;
}

const emptyTemperatureData = {
    code: "",
    name: "",
    minC: null as number | null,
    maxC: null as number | null,
};

const TemperatureInnerForm = forwardRef(({ initialData, isOpen }: { initialData?: any, isOpen: boolean }, ref) => {
    const formRef = useRef<any>(null);
    const [formData, setFormData] = useState(emptyTemperatureData);

    useEffect(() => {
        if (isOpen) {
            const nextData = {
                code: initialData?.code || "",
                name: initialData?.name || "",
                minC: initialData?.minC ?? null,
                maxC: initialData?.maxC ?? null,
            };
            setFormData(nextData);
            setTimeout(() => {
                const formInstance = formRef.current?.instance();
                if (formInstance) {
                    formInstance.option("formData", nextData);
                }
            }, 0);
        } else {
            setFormData({ ...emptyTemperatureData });
        }
    }, [isOpen, initialData]);

    useImperativeHandle(ref, () => ({
        validate: () => formRef.current?.instance().validate(),
        getData: () => formRef.current?.instance().option("formData") || formData
    }));

    return (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
            colCount={2}
        >
            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="code"
                    label={{ text: "Código" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: AMBIENT, CHILLED",
                        stylingMode: 'filled',
                        disabled: !!initialData
                    }}
                    validationRules={[{ type: 'required', message: "El código es obligatorio" }]}
                />
            </GroupItem>

            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="name"
                    label={{ text: "Nombre" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: Ambiente, Fresco",
                        stylingMode: 'filled',
                    }}
                    validationRules={[{ type: 'required', message: "El nombre es obligatorio" }]}
                />
            </GroupItem>

            <GroupItem colCount={2} colSpan={2}>
                <SimpleItem
                    dataField="minC"
                    label={{ text: "Temperatura Mínima (°C)" }}
                    editorType="dxNumberBox"
                    editorOptions={{
                        stylingMode: 'filled',
                        disabled: !!initialData
                    }}
                    validationRules={[{ type: 'required', message: "La mínima es obligatoria" }]}
                />
                <SimpleItem
                    dataField="maxC"
                    label={{ text: "Temperatura Máxima (°C)" }}
                    editorType="dxNumberBox"
                    editorOptions={{
                        stylingMode: 'filled',
                    }}
                    validationRules={[{ type: 'required', message: "La máxima es obligatoria" }]}
                />
            </GroupItem>
        </Form>
    );
});
TemperatureInnerForm.displayName = 'TemperatureInnerForm';


const TemperatureModal = ({ isOpen, onClose, onHidden, onSuccess, initialData }: TemperatureModalProps) => {
    const { token, currentCompany } = useAuth();
    const [loading, setLoading] = useState(false);
    const innerFormRef = useRef<any>(null);

    const handleHidden = useCallback(() => {
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    const handleSubmit = useCallback(async () => {
        const innerForm = innerFormRef.current;
        if (!innerForm) return;

        const result = innerForm.validate();
        if (!result?.isValid) return;

        if (!currentCompany?.id || !token) {
            notify("Error de autenticación", "error", 3000);
            return;
        }

        setLoading(true);
        try {
            const formData = innerForm.getData();
            const normalizedData: Partial<IFTemperatureClass> = {
                code: formData.code,
                name: formData.name,
                minC: formData.minC as number,
                maxC: formData.maxC as number,
            };

            if (initialData?.id) {
                await temperatureService.update(currentCompany.id, initialData.id, normalizedData, token);
                notify("Nivel de temperatura actualizado exitosamente", "success", 3000);
            } else {
                await temperatureService.create(currentCompany.id, normalizedData, token);
                notify("Nivel de temperatura creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving temperature class:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al guardar el nivel de temperatura";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [initialData, currentCompany, token, onClose, onSuccess]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Nivel de Temperatura" : "Nuevo Nivel de Temperatura"}
            width={550}
            height={400}
            className="custom-popup"
            deferRendering={false}
            onShown={(e) => {
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-4">
                <TemperatureInnerForm ref={innerFormRef} initialData={initialData} isOpen={isOpen} />
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

export default TemperatureModal;
