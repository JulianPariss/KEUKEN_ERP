'use client';

import { salesRoutesService } from '@repo/erp-services/priceLists/salesRoutes.service';
import { IFSalesRoute, IFSalesRouteCreate } from "@repo/api-contracts/erp";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@repo/devextreme';
import Form, { SimpleItem } from 'devextreme-react/form';
import { Popup, Position, ToolbarItem } from 'devextreme-react/popup';
import notify from 'devextreme/ui/notify';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface AddNewSalesRouteProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    initialData?: IFSalesRoute | null;
    users: any[];
    zones: any[];
}

const emptyRouteData = {
    name: '',
    salesmanUserId: '',
    zoneId: '',
    active: true,
};

export default function AddNewSalesRoute({
    isOpen,
    onClose,
    onSuccess,
    onHidden,
    initialData,
    users,
    zones
}: AddNewSalesRouteProps) {
    const { token, currentCompany } = useAuth();
    const formRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>(emptyRouteData);

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    name: initialData.name || '',
                    salesmanUserId: initialData.salesmanUserId || '',
                    zoneId: initialData.zoneId || '',
                    active: initialData.active ?? true,
                }
                : { ...emptyRouteData };

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
    }, [isOpen, initialData]);

    const handleHidden = useCallback(() => {
        setFormData(emptyRouteData);
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        if (!token || !currentCompany) {
            notify('Error de autenticación', 'error', 3000);
            return;
        }

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            if (initialData?.id) {
                await salesRoutesService.update(initialData.id, { active: currentFormData.active }, token);
                notify('Ruta de venta actualizada exitosamente', 'success', 3000);
            } else {
                const dataToCreate: IFSalesRouteCreate = {
                    companyId: currentCompany.id,
                    name: currentFormData.name,
                    salesmanUserId: currentFormData.salesmanUserId,
                    zoneId: currentFormData.zoneId,
                };
                await salesRoutesService.create(dataToCreate, token);
                notify('Ruta de venta creada exitosamente', 'success', 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : 'Error al guardar la ruta de venta';
            notify(errorMessage, 'error', 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData?.id, token, currentCompany, onClose, onSuccess]);

    const formContent = useMemo(() => (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
        >
            <SimpleItem
                dataField="name"
                label={{ text: "Nombre" }}
                editorType="dxTextBox"
                editorOptions={{
                    placeholder: "Ej: Ruta Norte",
                    valueChangeEvent: "blur",
                    stylingMode: 'filled',
                    disabled: !!initialData
                }}
                validationRules={[{ type: 'required', message: "El nombre es obligatorio" }]}
            />
            <SimpleItem
                dataField="salesmanUserId"
                label={{ text: "Vendedor" }}
                editorType="dxSelectBox"
                editorOptions={{
                    dataSource: users,
                    valueExpr: "id",
                    displayExpr: "label",
                    searchEnabled: true,
                    placeholder: "Seleccione un vendedor...",
                    stylingMode: 'filled',
                    disabled: !!initialData,
                    dropDownOptions: {
                        wrapperAttr: {
                            class: "popup-menu-container"
                        }
                    }
                }}
                validationRules={[{ type: 'required', message: "El vendedor es obligatorio" }]}
            />
            <SimpleItem
                dataField="zoneId"
                label={{ text: "Zona" }}
                editorType="dxSelectBox"
                editorOptions={{
                    dataSource: zones,
                    valueExpr: "id",
                    displayExpr: "label",
                    searchEnabled: true,
                    placeholder: "Seleccione una zona...",
                    stylingMode: 'filled',
                    disabled: !!initialData,
                    dropDownOptions: {
                        wrapperAttr: {
                            class: "popup-menu-container"
                        }
                    }
                }}
                validationRules={[{ type: 'required', message: "La zona es obligatoria" }]}
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
    ), [formData, users, zones, initialData]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Ruta de Venta" : "Crear Nueva Ruta de Venta"}
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
                    text={loading ? "Guardando..." : "Guardar Ruta de Venta"}
                    type="default"
                    stylingMode="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                />
            </ToolbarItem>
        </Popup>
    );
}
