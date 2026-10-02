'use client';

import { listTypesService } from '@/app/services/priceLists/listTypes.service';
import { IFListTypeCreate } from "@repo/api-contracts/erp";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from 'devextreme-react/form';
import { Popup, Position, ToolbarItem } from 'devextreme-react/popup';
import notify from 'devextreme/ui/notify';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { LIST_TYPE_OPERATION_OPTIONS } from '@/app/lib/constants/priceList.constants';

interface AddNewListTypeProps {
    isOpen: boolean;
    onClose: () => void;
    onHidden?: () => void;
    onSuccess: () => void;
    initialData?: any;
}

const operationOptions = LIST_TYPE_OPERATION_OPTIONS;

const emptyListTypeData = {
    code: '',
    name: '',
    operation: 'sale',
    maxDiscountPctItem: 0,
    maxDiscountPctOrder: 0,
    defaultMarginOverCostPct: 0,
    active: true,
};

export default function AddNewListType({ isOpen, onClose, onHidden, onSuccess, initialData }: AddNewListTypeProps) {
    const { token, currentCompany } = useAuth();
    const formRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState(emptyListTypeData);

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    code: initialData.code || '',
                    name: initialData.name || '',
                    operation: initialData.operation || 'sale',
                    maxDiscountPctItem: initialData.discountPolicy?.maxDiscountPctItem ?? initialData.maxDiscountPctItem ?? 0,
                    maxDiscountPctOrder: initialData.discountPolicy?.maxDiscountPctOrder ?? initialData.maxDiscountPctOrder ?? 0,
                    defaultMarginOverCostPct: initialData.defaultMarginOverCostPct ?? 0,
                    active: initialData.active ?? true,
                }
                : { ...emptyListTypeData };

            setFormData(nextData);
            setTimeout(() => {
                const formInstance = formRef.current?.instance();
                if (formInstance) {
                    formInstance.option("formData", nextData);
                }
            }, 0);
        } else {
            setFormData({ ...emptyListTypeData });
        }
    }, [isOpen, initialData]);

    const handleHidden = useCallback(() => {
        setFormData({ ...emptyListTypeData });
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    const handleCreate = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        if (!token || !currentCompany) {
            notify('Error de autenticación', 'error', 3000);
            return;
        }

        setLoading(true);
        try {
            const currentFormData = formInstance?.option("formData") || formData;
            const data: IFListTypeCreate = {
                companyId: currentCompany.id,
                code: currentFormData.code,
                name: currentFormData.name,
                operation: currentFormData.operation,
                maxDiscountPctItem: currentFormData.maxDiscountPctItem,
                maxDiscountPctOrder: currentFormData.maxDiscountPctOrder,
                defaultMarginOverCostPct: currentFormData.defaultMarginOverCostPct,
                active: currentFormData.active ?? true,
            };

            if (initialData?.id) {
                await listTypesService.update(initialData.id, {
                    name: currentFormData.name,
                    maxDiscountPctItem: currentFormData.maxDiscountPctItem,
                    maxDiscountPctOrder: currentFormData.maxDiscountPctOrder,
                    defaultMarginOverCostPct: currentFormData.defaultMarginOverCostPct,
                    active: currentFormData.active ?? true,
                }, token);
                notify('Tipo de lista actualizado exitosamente', 'success', 3000);
            } else {
                await listTypesService.create(data, token);
                notify('Tipo de lista creado exitosamente', 'success', 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : 'Error al guardar el tipo de lista';
            notify(errorMessage, 'error', 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, token, currentCompany, initialData?.id, onSuccess, onClose]);

    const formContent = useMemo(() => (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
            colCount={2}
        >
            <GroupItem colSpan={2} colCount={2}>
                <SimpleItem
                    dataField="code"
                    label={{ text: 'Código *' }}
                    editorType="dxTextBox"
                    colSpan={2}
                    editorOptions={{
                        placeholder: 'Ej: MAYOR',
                        stylingMode: 'filled',
                        disabled: !!initialData?.id,
                    }}
                    validationRules={[{ type: 'required', message: 'El código es obligatorio' }]}
                />

                <SimpleItem
                    dataField="name"
                    label={{ text: 'Nombre *' }}
                    editorType="dxTextBox"
                    colSpan={2}
                    editorOptions={{
                        placeholder: 'Ej: Mayorista',
                        stylingMode: 'filled',
                    }}
                    validationRules={[{ type: 'required', message: 'El nombre es obligatorio' }]}
                />

                <SimpleItem
                    dataField="operation"
                    label={{ text: 'Operación' }}
                    editorType="dxSelectBox"
                    colSpan={2}
                    editorOptions={{
                        dataSource: operationOptions,
                        valueExpr: 'id',
                        displayExpr: 'name',
                        stylingMode: 'filled',
                        disabled: !!initialData?.id,
                        dropDownOptions: {
                            wrapperAttr: {
                                class: 'popup-menu-container'
                            }
                        }
                    }}
                />

                <SimpleItem
                    dataField="maxDiscountPctItem"
                    label={{ text: 'Desc. Máx Item (%)' }}
                    editorType="dxNumberBox"
                    editorOptions={{
                        min: 0,
                        max: 100,
                        showSpinButtons: true,
                        stylingMode: 'filled',
                    }}
                />

                <SimpleItem
                    dataField="maxDiscountPctOrder"
                    label={{ text: 'Desc. Máx Orden (%)' }}
                    editorType="dxNumberBox"
                    editorOptions={{
                        min: 0,
                        max: 100,
                        showSpinButtons: true,
                        stylingMode: 'filled',
                    }}
                />

                <SimpleItem
                    dataField="defaultMarginOverCostPct"
                    label={{ text: 'Margen por defecto sobre costo (%)' }}
                    editorType="dxNumberBox"
                    colSpan={2}
                    editorOptions={{
                        min: 0,
                        showSpinButtons: true,
                        stylingMode: 'filled',
                    }}
                />

                <SimpleItem
                    dataField="active"
                    label={{ text: 'Estado' }}
                    editorType="dxCheckBox"
                    colSpan={2}
                    editorOptions={{
                        text: 'Activo',
                        stylingMode: 'filled',
                    }}
                />
            </GroupItem>
        </Form>
    ), [formData, initialData?.id]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData?.id ? "Editar Tipo de Lista" : "Crear Nuevo Tipo de Lista"}
            width={600}
            height="auto"
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

            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text="Cancelar"
                    onClick={onClose}
                    disabled={loading}
                    stylingMode="text"
                    className="!bg-main/10"
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
                    onClick={handleCreate}
                    disabled={loading}
                    className="!bg-focus-300 !text-variant"
                />
            </ToolbarItem>
        </Popup>
    );
}
