"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { cashRegistersService } from "@/app/services/accountant/cashRegisters.service";
import { IFCashRegister, IFCashRegisterSettlementCreation, IFCashRegisterSettlementResponse } from "@repo/api-contracts/erp";
import { Button } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import CashRegisterSettlementForm from "./cashRegisterSettlementForm";
import CashRegisterSettlementResult from "./cashRegisterSettlementResult";

interface CashRegisterSettlementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHidden?: () => void;
    onSuccess: () => void;
    register: IFCashRegister | null;
}

const emptySettlementData = (): IFCashRegisterSettlementCreation => ({
    amountRendered: 0,
    notes: "",
});

const CashRegisterSettlementModal = ({ isOpen, onClose, onHidden, onSuccess, register }: CashRegisterSettlementModalProps) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"input" | "result">("input");
    const [settlementResult, setSettlementResult] = useState<IFCashRegisterSettlementResponse | null>(null);
    const formRef = useRef<any>(null);

    const [formData, setFormData] = useState<IFCashRegisterSettlementCreation>(emptySettlementData);

    useEffect(() => {
        if (isOpen) {
            setStep("input");
            setSettlementResult(null);
            const initialData = emptySettlementData();
            setFormData(initialData);

            setTimeout(() => {
                const formInstance = formRef.current?.instance();
                if (formInstance) {
                    formInstance.option("formData", initialData);
                    if (typeof formInstance.reset === "function") {
                        formInstance.reset();
                    }
                    formInstance.option("formData", initialData);
                }
            }, 0);
        }
    }, [isOpen]);

    const handleHidden = useCallback(() => {
        setStep("input");
        setSettlementResult(null);
        setFormData(emptySettlementData());
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    const handleSubmit = useCallback(async () => {
        if (!register?.id) return;
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            const res = await cashRegistersService.settle(register.id, currentFormData, token);
            setSettlementResult(res);
            setStep("result");
            notify("Rendición de caja procesada exitosamente", "success", 3000);
            onSuccess();
        } catch (error: any) {
            console.error("Error performing settlement:", error);
            const errorMessage = error?.message || "Error al procesar la rendición de caja";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [register?.id, token, onSuccess, formData]);

    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
        }).format(amount);
    }, []);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            onShown={(e) => {
                e.component.repaint();
            }}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={step === "input" ? `Rendir Caja: ${register?.name || ""}` : "Resultado de Rendición de Caja"}
            width={550}
            height="auto"
            maxHeight={550}
        >
            <Position at="center" my="center" />
            <div className="p-4">
                {step === "input" ? (
                    <CashRegisterSettlementForm
                        formRef={formRef}
                        formData={formData}
                    />
                ) : (
                    settlementResult && (
                        <CashRegisterSettlementResult
                            settlementResult={settlementResult}
                            register={register}
                            formatCurrency={formatCurrency}
                        />
                    )
                )}
            </div>

            {step === "input" ? (
                <>
                    <ToolbarItem toolbar="bottom" location="after">
                        <Button
                            text="Cancelar"
                            onClick={onClose}
                            disabled={loading}
                            stylingMode="text"
                            className="!bg-main/10"
                        />
                    </ToolbarItem>
                    <ToolbarItem toolbar="bottom" location="after">
                        <Button
                            type="default"
                            stylingMode="contained"
                            text={loading ? "Procesando..." : "Ejecutar Arqueo"}
                            onClick={handleSubmit}
                            disabled={loading}
                            className="!bg-focus-300 !text-variant"
                        />
                    </ToolbarItem>
                </>
            ) : (
                <ToolbarItem toolbar="bottom" location="after">
                    <Button
                        type="default"
                        stylingMode="contained"
                        text="Cerrar"
                        onClick={onClose}
                        className="!bg-focus-300 !text-variant"
                    />
                </ToolbarItem>
            )}
        </Popup>
    );
};

export default CashRegisterSettlementModal;
