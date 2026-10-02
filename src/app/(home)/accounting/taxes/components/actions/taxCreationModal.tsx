'use client';

import { accountsService } from '@/app/services/accountant/accounts.service';
import { taxesService } from '@/app/services/accountant/taxes.service';
import { localizationService } from '@/app/services/localization.service';
import { IFAccount } from "@repo/api-contracts/erp";
import { IFTax } from "@repo/api-contracts/erp";
import { IFTaxAuthorityScheme } from "@repo/api-contracts/erp";
import { useAuth } from '@/contexts/AuthContext';
import Form, { ButtonItem, GroupItem, Item } from 'devextreme-react/form';
import { Popup } from 'devextreme-react/popup';
import notify from 'devextreme/ui/notify';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    TAX_USE_OPTIONS,
    TAX_AMOUNT_TYPE_OPTIONS,
    TAX_SCOPE_OPTIONS,
    TAX_RATE_STORAGE_OPTIONS,
    TAX_NOMINAL_BASIS_OPTIONS,
    TAX_BASE_CALCULATION_OPTIONS
} from '@/app/lib/constants/accounting.constants';

interface TaxCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: IFTax | null;
}

const TaxCreationModal = ({ isOpen, onClose, onSuccess, initialData }: TaxCreationModalProps) => {
    const { token, currentCompany } = useAuth();
    const formRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [accounts, setAccounts] = useState<IFAccount[]>([]);
    const [taxAuthoritySchemes, setTaxAuthoritySchemes] = useState<IFTaxAuthorityScheme[]>([]);
    const [loadingAuthoritySchemes, setLoadingAuthoritySchemes] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        const fetchAccounts = async () => {
            if (!token || !currentCompany?.id) return;
            try {
                const response = await accountsService.getAll(token, currentCompany.id);
                setAccounts(response.items);
            } catch (error) {
                console.error("Error fetching accounts:", error);
            }
        };

        const fetchTaxAuthoritySchemes = async () => {
            if (!token) return;
            setLoadingAuthoritySchemes(true);
            try {
                const countryCode = (currentCompany as any)?.countryCode || (currentCompany as any)?.country_code || 'AR';
                const schemes = await localizationService.getTaxAuthoritySchemes(countryCode, token);
                setTaxAuthoritySchemes(schemes);
            } catch (error) {
                console.error("Error fetching tax authority schemes:", error);
            } finally {
                setLoadingAuthoritySchemes(false);
            }
        };

        if (isOpen) {
            fetchAccounts();
            fetchTaxAuthoritySchemes();
            if (initialData) {
                setFormData({ ...initialData });
            } else {
                setFormData({
                    name: '',
                    amount: 0,
                    amountType: 'percent',
                    rateStorage: 'effective',
                    nominalBasis: 'exclusive',
                    baseCalculation: 'net',
                    taxScope: 'line',
                    typeTaxUse: 'sale',
                    isVariable: false,
                    isInternalTax: false,
                    minAmount: 0,
                    accountDebitId: null,
                    accountCreditId: null,
                    taxAuthoritySchemeId: null,
                    active: true
                });
            }
        }
    }, [isOpen, initialData, token, currentCompany]);

    const accountsDataSource = useMemo(() => {
        return accounts.map(acc => ({
            id: acc.id,
            displayLabel: `${acc.code} - ${acc.name}`
        }));
    }, [accounts]);

    const taxAuthoritySchemesDataSource = useMemo(() => {
        return taxAuthoritySchemes.map(tas => ({
            id: tas.id,
            displayLabel: `${tas.localName} (${tas.authorityCode} - ${tas.schemeCode})`
        }));
    }, [taxAuthoritySchemes]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const formInstance = formRef.current?.instance();
        const isValid = formInstance?.validate().isValid;
        if (!isValid) return;

        const currentFormData = formInstance?.option("formData");

        setIsLoading(true);
        try {
            if (!currentCompany) throw new Error("Compañía no seleccionada");

            if (initialData) {
                await taxesService.update(initialData.id, currentFormData, token, currentCompany.id);
                notify('Impuesto actualizado exitosamente', 'success', 3000);
            } else {
                await taxesService.create(currentFormData, token, currentCompany.id);
                notify('Impuesto creado exitosamente', 'success', 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            notify(error.message || 'Error al guardar el impuesto', 'error', 3000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Impuesto" : "Nuevo Impuesto"}
            width={650}
            height="auto"
            wrapperAttr={{ class: "rounded-dx" }}
        >
            <form onSubmit={handleSubmit} className="p-4">
                <Form
                    ref={formRef}
                    formData={formData}
                    labelLocation="top"
                    showColonAfterLabel={false}
                >
                    <GroupItem colCount={2} caption="Información General">
                        <Item
                            dataField="name"
                            label={{ text: "Nombre" }}
                            editorOptions={{ placeholder: "Ej. IVA 21% (Ventas)" }}
                            isRequired={true}
                            colSpan={2}
                        />
                        <Item
                            dataField="amountType"
                            editorType="dxSelectBox"
                            label={{ text: "Tipo de Importe" }}
                            isRequired={true}
                            editorOptions={{
                                items: TAX_AMOUNT_TYPE_OPTIONS,
                                valueExpr: 'id',
                                displayExpr: 'name'
                            }}
                        />
                        <Item
                            dataField="amount"
                            editorType="dxNumberBox"
                            label={{ text: "Valor / Alícuota" }}
                            isRequired={true}
                            editorOptions={{
                                placeholder: "Ej. 0.21 para 21%",
                                format: "#,##0.####"
                            }}
                        />
                        <Item
                            dataField="typeTaxUse"
                            editorType="dxSelectBox"
                            label={{ text: "Aplicación / Uso" }}
                            isRequired={true}
                            editorOptions={{
                                items: TAX_USE_OPTIONS,
                                valueExpr: 'id',
                                displayExpr: 'name'
                            }}
                        />
                        <Item
                            dataField="minAmount"
                            editorType="dxNumberBox"
                            label={{ text: "Importe Mínimo" }}
                            isRequired={true}
                            editorOptions={{
                                min: 0
                            }}
                        />
                    </GroupItem>

                    <GroupItem colCount={2} caption="Parámetros de Cálculo">
                        <Item
                            dataField="rateStorage"
                            editorType="dxSelectBox"
                            label={{ text: "Almacenamiento de Tasa" }}
                            isRequired={true}
                            editorOptions={{
                                items: TAX_RATE_STORAGE_OPTIONS,
                                valueExpr: 'id',
                                displayExpr: 'name'
                            }}
                        />
                        <Item
                            dataField="nominalBasis"
                            editorType="dxSelectBox"
                            label={{ text: "Base Nominal" }}
                            isRequired={true}
                            editorOptions={{
                                items: TAX_NOMINAL_BASIS_OPTIONS,
                                valueExpr: 'id',
                                displayExpr: 'name'
                            }}
                        />
                        <Item
                            dataField="baseCalculation"
                            editorType="dxSelectBox"
                            label={{ text: "Base de Cálculo" }}
                            isRequired={true}
                            editorOptions={{
                                items: TAX_BASE_CALCULATION_OPTIONS,
                                valueExpr: 'id',
                                displayExpr: 'name'
                            }}
                        />
                        <Item
                            dataField="taxScope"
                            editorType="dxSelectBox"
                            label={{ text: "Ámbito del Impuesto" }}
                            isRequired={true}
                            editorOptions={{
                                items: TAX_SCOPE_OPTIONS,
                                valueExpr: 'id',
                                displayExpr: 'name'
                            }}
                        />
                    </GroupItem>

                    <GroupItem colCount={2} caption="Cuentas Contables y Entidades">
                        <Item
                            dataField="accountDebitId"
                            editorType="dxSelectBox"
                            label={{ text: "Cuenta de Débito" }}
                            editorOptions={{
                                items: accountsDataSource,
                                valueExpr: 'id',
                                displayExpr: 'displayLabel',
                                searchEnabled: true,
                                showClearButton: true,
                                placeholder: "Seleccionar cuenta..."
                            }}
                        />
                        <Item
                            dataField="accountCreditId"
                            editorType="dxSelectBox"
                            label={{ text: "Cuenta de Crédito" }}
                            editorOptions={{
                                items: accountsDataSource,
                                valueExpr: 'id',
                                displayExpr: 'displayLabel',
                                searchEnabled: true,
                                showClearButton: true,
                                placeholder: "Seleccionar cuenta..."
                            }}
                        />
                        <Item
                            dataField="taxAuthoritySchemeId"
                            editorType="dxSelectBox"
                            label={{ text: "Esquema Autoridad de Impuesto" }}
                            colSpan={2}
                            editorOptions={{
                                items: taxAuthoritySchemesDataSource,
                                valueExpr: 'id',
                                displayExpr: 'displayLabel',
                                searchEnabled: true,
                                showClearButton: true,
                                placeholder: loadingAuthoritySchemes ? "Cargando esquemas de autoridad..." : "Seleccionar esquema de autoridad...",
                                dropDownOptions: {
                                    wrapperAttr: {
                                        class: "popup-menu-container"
                                    }
                                }
                            }}
                        />
                    </GroupItem>

                    <GroupItem colCount={3} caption="Opciones Adicionales">
                        <Item
                            dataField="isVariable"
                            editorType="dxCheckBox"
                            label={{ visible: false }}
                            editorOptions={{
                                text: "Es variable"
                            }}
                        />
                        <Item
                            dataField="isInternalTax"
                            editorType="dxCheckBox"
                            label={{ visible: false }}
                            editorOptions={{
                                text: "Es impuesto interno"
                            }}
                        />
                        <Item
                            dataField="active"
                            editorType="dxCheckBox"
                            label={{ visible: false }}
                            editorOptions={{
                                text: "Activo"
                            }}
                        />
                    </GroupItem>

                    <ButtonItem
                        horizontalAlignment="right"
                        buttonOptions={{
                            text: isLoading ? "Guardando..." : "Guardar",
                            type: "default",
                            useSubmitBehavior: true,
                            disabled: isLoading
                        }}
                    />
                </Form>
            </form>
        </Popup>
    );
};

export default TaxCreationModal;
