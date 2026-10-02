"use client";

import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";
import { IFCashRegisterSettlementCreation } from "@repo/api-contracts/erp";
import React from "react";

interface CashRegisterSettlementFormProps {
    formRef: React.RefObject<any>;
    formData: IFCashRegisterSettlementCreation;
}

const CashRegisterSettlementForm = ({ formRef, formData }: CashRegisterSettlementFormProps) => {
    return (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
        >
            <GroupItem colCount={1}>
                <SimpleItem
                    dataField="amountRendered"
                    label={{ text: "Monto Físico Entregado (Efectivo)" }}
                    editorType="dxNumberBox"
                    editorOptions={{
                        placeholder: "Ingrese el total de efectivo contado",
                        format: "$ #,##0.00",
                        min: 0,
                        stylingMode: "filled",
                    }}
                    validationRules={[
                        { type: "required", message: "El monto entregado es obligatorio" },
                        { type: "custom", validationCallback: (e: any) => e.value >= 0, message: "El monto no puede ser negativo" }
                    ]}
                />
                <SimpleItem
                    dataField="notes"
                    label={{ text: "Observaciones / Notas" }}
                    editorType="dxTextArea"
                    editorOptions={{
                        placeholder: "Escriba observaciones adicionales sobre este arqueo de turno...",
                        height: 100,
                        stylingMode: "filled",
                        maxLength: FIELD_LIMITS.stringLong,
                    }}
                />
            </GroupItem>
        </Form>
    );
};

export default CashRegisterSettlementForm;
