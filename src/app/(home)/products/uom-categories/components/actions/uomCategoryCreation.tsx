'use client';

import { uomCategoriesService } from "@/app/services/product_services/uomCategories.service";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IFUoMCategory } from "@repo/api-contracts/erp";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";

interface UoMCategoryCreationProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: IFUoMCategory | null;
}

const emptyCategory: Partial<IFUoMCategory> = {
    name: "",
};

const UoMCategoryCreation = ({ isOpen, onClose, onSuccess, initialData }: UoMCategoryCreationProps) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState<Partial<IFUoMCategory>>(emptyCategory);
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? { ...initialData } : { ...emptyCategory });
        }
    }, [isOpen, initialData]);

    const handleHidden = useCallback(() => {
        setFormData(emptyCategory);
        setLoading(false);
    }, []);

    const handleSubmit = useCallback(async () => {
        const result = formRef.current?.instance().validate();
        if (!result?.isValid) return;

        setLoading(true);
        try {
            if (initialData && initialData.id) {
                await uomCategoriesService.update(formData as IFUoMCategory, initialData.id, token);
                notify("Categoría de UoM actualizada exitosamente", "success", 3000);
            } else {
                await uomCategoriesService.create(formData, token);
                notify("Categoría de UoM creada exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving UoM Category:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al guardar la categoría de UoM";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData, onClose, onSuccess, token]);

    const formContent = useMemo(() => (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
        >
            <GroupItem colCount={1}>
                <SimpleItem
                    dataField="name"
                    label={{
                        text: 'Nombre'
                    }}
                    editorType="dxTextBox"
                    editorOptions={{
                        stylingMode: 'filled',
                        maxLength: FIELD_LIMITS.stringLong,
                    }}
                    validationRules={[
                        { type: 'required', message: 'El nombre es obligatorio' },
                        { type: 'stringLength', max: FIELD_LIMITS.stringLong, message: `El nombre no puede superar los ${FIELD_LIMITS.stringLong} caracteres` },
                    ]}
                />
            </GroupItem>
        </Form>
    ), [formData]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Categoría de UoM" : "Nueva Categoría de UoM"}
            width={500}
            height="auto"
            onShown={(e) => { e.component.repaint(); }}
        >
            <Position at="center" my="center" />
            <div className="p-4">
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
                    className="!rounded-dx !bg-main/10"
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

export default UoMCategoryCreation;
