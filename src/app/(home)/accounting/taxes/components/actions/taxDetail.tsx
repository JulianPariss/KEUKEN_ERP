'use client';

import { accountsService } from '@/app/services/accountant/accounts.service';
import { IFAccount } from "@repo/api-contracts/erp";
import { IFTax } from "@repo/api-contracts/erp";
import { useAuth } from '@/contexts/AuthContext';
import Form, { GroupItem, Item } from 'devextreme-react/form';
import { Popup } from 'devextreme-react/popup';
import { useEffect, useMemo, useState } from 'react';
import {
    TAX_USE_OPTIONS,
    TAX_AMOUNT_TYPE_OPTIONS,
    TAX_RATE_STORAGE_OPTIONS,
    TAX_NOMINAL_BASIS_OPTIONS,
    TAX_BASE_CALCULATION_OPTIONS,
    TAX_SCOPE_OPTIONS
} from '@/app/lib/constants/accounting.constants';


interface TaxDetailProps {
    isOpen: boolean;
    onClose: () => void;
    data?: IFTax | null;
}

const TaxDetail = ({ isOpen, onClose, data }: TaxDetailProps) => {
    const { token, currentCompany } = useAuth();
    const [accounts, setAccounts] = useState<IFAccount[]>([]);

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

        if (isOpen) {
            fetchAccounts();
        }
    }, [isOpen, token, currentCompany?.id]);

    const accountsDataSource = useMemo(() => {
        return accounts.map(acc => ({
            id: acc.id,
            displayLabel: `${acc.code} - ${acc.name}`
        }));
    }, [accounts]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title="Detalle del Impuesto"
            width={650}
            height="auto"
            wrapperAttr={{ class: "rounded-dx" }}
        >
            <div className="p-4">
                <Form
                    formData={data || {}}
                    labelLocation="top"
                    showColonAfterLabel={false}
                    readOnly={true}
                >
                    <GroupItem colCount={2} caption="Información General">
                        <Item
                            dataField="name"
                            label={{ text: "Nombre" }}
                            colSpan={2}
                        />
                        <Item
                            dataField="amountType"
                            editorType="dxSelectBox"
                            label={{ text: "Tipo de Importe" }}
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
                            editorOptions={{
                                format: "#,##0.####"
                            }}
                        />
                        <Item
                            dataField="typeTaxUse"
                            editorType="dxSelectBox"
                            label={{ text: "Aplicación / Uso" }}
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
                        />
                    </GroupItem>

                    <GroupItem colCount={2} caption="Parámetros de Cálculo">
                        <Item
                            dataField="rateStorage"
                            editorType="dxSelectBox"
                            label={{ text: "Almacenamiento de Tasa" }}
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
                                displayExpr: 'displayLabel'
                            }}
                        />
                        <Item
                            dataField="accountCreditId"
                            editorType="dxSelectBox"
                            label={{ text: "Cuenta de Crédito" }}
                            editorOptions={{
                                items: accountsDataSource,
                                valueExpr: 'id',
                                displayExpr: 'displayLabel'
                            }}
                        />
                        <Item
                            dataField="taxAuthoritySchemeId"
                            label={{ text: "Esquema Autoridad de Impuesto" }}
                            colSpan={2}
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
                </Form>
            </div>
        </Popup>
    );
};

export default TaxDetail;
