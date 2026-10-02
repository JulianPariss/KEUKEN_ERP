"use client";

import { uomsService } from "@/app/services/product_services/uoms.service";
import { IFUoMCategory } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { generateUUID } from "@/lib/utils/id.helper";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useRef, useState } from "react";

interface UoMModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    categories: IFUoMCategory[];
    initialData?: any;
}

const uomTypes = [
    { id: 'reference', name: 'Referencia' },
    { id: 'bigger', name: 'Mayor' },
    { id: 'smaller', name: 'Menor' }
];

const UoMModal = ({ isOpen, onClose, onSuccess, onHidden, categories, initialData }: UoMModalProps) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        type: "reference",
        categoryId: "",
        factor: 1,
        rounding: 0.01,
        active: true,
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    id: initialData.id || "",
                    name: initialData.name || "",
                    type: initialData.type || "reference",
                    categoryId: initialData.categoryId || "",
                    factor: initialData.factor ?? 1,
                    rounding: initialData.rounding ?? 0.01,
                    active: initialData.active ?? true,
                });
            } else {
                setFormData({
                    id: generateUUID(),
                    name: "",
                    type: "reference",
                    categoryId: "",
                    factor: 1,
                    rounding: 0.01,
                    active: true,
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = useCallback(async () => {
        const result = formRef.current?.instance().validate();
        if (!result?.isValid) return;
        setLoading(true);
        try {
            if (initialData) {
                await uomsService.update(formData, initialData.id, token);
                notify("Unidad de medida actualizada exitosamente", "success", 3000);
            } else {
                await uomsService.create(formData, token);
                notify("Unidad de medida creada exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving UoM:", error);
            notify(error?.message || "Error al guardar la unidad de medida", "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData, onClose, onSuccess, token]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={onHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Unidad de Medida" : "Nueva Unidad de Medida"}
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
                <Form
                    ref={formRef}
                    formData={formData}
                    labelLocation="top"
                    colCount={2}
                >
                    <GroupItem colSpan={2}>
                        <SimpleItem
                            dataField="name"
                            label={{ text: "Nombre de la Unidad" }}
                            editorType="dxTextBox"
                            editorOptions={{
                                placeholder: "Ej: Unidad, Caja, Litro",
                                valueChangeEvent: "blur",
                                stylingMode: 'filled',
                                maxLength: FIELD_LIMITS.stringLong,
                            }}
                            validationRules={[
                                { type: 'required', message: "El nombre es obligatorio" },
                                { type: 'stringLength', max: FIELD_LIMITS.stringLong, message: `El nombre no puede superar los ${FIELD_LIMITS.stringLong} caracteres` },
                            ]}
                        />
                    </GroupItem>

                    <GroupItem colSpan={2}>
                        <SimpleItem
                            dataField="categoryId"
                            label={{ text: "Categoría" }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                dataSource: categories,
                                valueExpr: "id",
                                displayExpr: "name",
                                searchEnabled: true,
                                stylingMode: 'filled',
                                dropDownOptions: {
                                    wrapperAttr: {
                                        class: "popup-menu-container"
                                    }
                                }
                            }}
                            validationRules={[{ type: 'required', message: "La categoría es obligatoria" }]}
                        />
                    </GroupItem>

                    <SimpleItem
                        dataField="type"
                        label={{ text: "Tipo" }}
                        editorType="dxSelectBox"
                        editorOptions={{
                            dataSource: uomTypes,
                            valueExpr: "id",
                            displayExpr: "name",
                            stylingMode: 'filled',
                            dropDownOptions: {
                                wrapperAttr: {
                                    class: "popup-menu-container"
                                }
                            }
                        }}
                        validationRules={[{ type: 'required', message: "El tipo es obligatorio" }]}
                    />

                    <SimpleItem
                        dataField="factor"
                        label={{ text: "Factor" }}
                        editorType="dxNumberBox"
                        editorOptions={{
                            min: 1,
                            format: "#,##0.########",
                            valueChangeEvent: "blur",
                            stylingMode: 'filled',
                        }}
                        validationRules={[{ type: 'required', message: "El factor es obligatorio" }]}
                    />

                    <SimpleItem
                        dataField="rounding"
                        label={{ text: "Redondeo" }}
                        editorType="dxNumberBox"
                        editorOptions={{
                            min: 0.1,
                            format: "#,##0.########",
                            valueChangeEvent: "blur",
                            stylingMode: 'filled',
                        }}
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
                </Form>
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

export default UoMModal;
