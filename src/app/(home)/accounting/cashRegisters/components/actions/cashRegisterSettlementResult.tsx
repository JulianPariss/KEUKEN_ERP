"use client";

import React from "react";
import { IFCashRegister, IFCashRegisterSettlementResponse } from "@repo/api-contracts/erp";

interface CashRegisterSettlementResultProps {
    settlementResult: IFCashRegisterSettlementResponse;
    register: IFCashRegister | null;
    formatCurrency: (amount: number) => string;
}

const CashRegisterSettlementResult = ({ settlementResult, register, formatCurrency }: CashRegisterSettlementResultProps) => {
    return (
        <div className="flex flex-col gap-4 font-sans text-main">
            <div className="p-5 rounded-dx bg-primary-900/40 border border-main/10 flex flex-col items-center justify-center text-center gap-2 shadow-sm">
                <div className="p-3 rounded-full bg-focus-500/20 border border-focus-500/30 text-focus-300 flex items-center justify-center">
                    <i className="dx-icon-money text-2xl" />
                </div>
                <h3 className="text-base font-bold text-main">
                    {settlementResult.message || "Rendición Registrada"}
                </h3>
                <span className="text-xs font-medium text-main/50 font-mono">
                    ID Arqueo: {settlementResult.settlementId}
                </span>
            </div>

            <div className="border border-main/10 rounded-dx overflow-hidden shadow-sm bg-primary-900/40">
                <div className="px-4 py-2.5 bg-main/5 border-b border-main/10 flex justify-between items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-main/60">
                        Concepto / Detalle
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-main/60">
                        Monto
                    </span>
                </div>

                <div className="p-4 flex flex-col gap-3 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-main/10">
                        <span className="text-main/70 font-medium">Caja Registradora</span>
                        <span className="font-semibold text-main">{register?.name || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-main/10">
                        <span className="text-main/70 font-medium">Saldo del Sistema</span>
                        <span className="font-mono font-semibold text-main">{formatCurrency(settlementResult.systemBalance)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-main/10">
                        <span className="text-main/70 font-medium">Monto Entregado</span>
                        <span className="font-mono font-bold text-focus-300">{formatCurrency(settlementResult.amountRendered)}</span>
                    </div>

                    {settlementResult.difference === 0 ? (
                        <div className="flex justify-between items-center p-3 rounded-dx bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <span className="text-xs font-semibold flex items-center gap-1.5">
                                <i className="dx-icon-check text-base" /> Diferencia (Arqueo Cuadrado)
                            </span>
                            <span className="font-mono font-bold text-sm">{formatCurrency(settlementResult.difference)}</span>
                        </div>
                    ) : settlementResult.difference < 0 ? (
                        <div className="flex flex-col gap-1 p-3 rounded-dx bg-rose-500/10 border border-rose-500/20 text-rose-400">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold flex items-center gap-1.5">
                                    <i className="dx-icon-warning text-base" /> Diferencia (Faltante)
                                </span>
                                <span className="font-mono font-bold text-sm">{formatCurrency(settlementResult.difference)}</span>
                            </div>
                            <p className="text-[11px] opacity-80 mt-0.5">
                                Se reporta un faltante de efectivo en el arqueo de turno.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 p-3 rounded-dx bg-focus-500/10 border border-focus-500/20 text-focus-300">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold flex items-center gap-1.5">
                                    <i className="dx-icon-plus text-base" /> Diferencia (Sobrante)
                                </span>
                                <span className="font-mono font-bold text-sm">+{formatCurrency(settlementResult.difference)}</span>
                            </div>
                            <p className="text-[11px] opacity-80 mt-0.5">
                                Se detectó un sobrante de efectivo en el conteo manual.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-1">
                        <span className="text-xs text-main/50 uppercase font-bold tracking-wider">Estado Operación</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-main/10 text-main/80 uppercase">
                            {settlementResult.status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashRegisterSettlementResult;
