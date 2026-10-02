'use client';

import React, { useState } from 'react';
import { Button } from '@repo/devextreme';
import notify from "devextreme/ui/notify";
import { IFCustomerRuleSet, IFClusterPreviewResult } from "@repo/api-contracts/erp";
import { clusterRulesService } from "@/app/services/audiences/clusterRules.service";
import { customerStrategy } from "../customer/customerStrategy";

export interface ClusterPreviewBadgeProps {
    ruleSet: IFCustomerRuleSet;
    companyId?: string;
    token?: string;
    disabled?: boolean;
}

export const ClusterPreviewBadge: React.FC<ClusterPreviewBadgeProps> = ({
    ruleSet,
    companyId,
    token,
    disabled = false,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [previewResult, setPreviewResult] = useState<IFClusterPreviewResult | null>(null);

    const handlePreview = async () => {
        if (!companyId) {
            notify("Debe seleccionar una compañía para previsualizar reglas", "warning", 3000);
            return;
        }

        const validation = customerStrategy.validateRuleSet(ruleSet);
        if (!validation.isValid) {
            notify(validation.errorMessage || "Configure al menos una regla válida", "warning", 3000);
            return;
        }

        setIsLoading(true);
        try {
            const result = await clusterRulesService.previewCustomerRules(ruleSet, companyId, 100, token);
            setPreviewResult(result);
            notify(`Simulación completada: ${result.totalMatched} clientes coinciden`, "success", 2500);
        } catch (error: any) {
            console.error("Error en preview de reglas:", error);
            const msg = error instanceof Error && error.message ? error.message : "Error al previsualizar reglas";
            notify(msg, "error", 3000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-focus-500/10 border border-focus-500/30 rounded-dx">
            <div className="flex items-center gap-2">
                <i className="dx-icon-search text-focus-300 text-base" />
                <div>
                    <h5 className="text-xs font-bold text-main">Simulación de Clúster</h5>
                    <p className="text-[11px] text-main/70">
                        Calcula cuántos clientes coinciden con estas reglas antes de guardar.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {previewResult !== null && (
                    <div className="flex items-center gap-1.5 bg-focus-500/20 px-3 py-1.5 rounded-dx border border-focus-500/40">
                        <span className="text-xs text-main/80">Coincidencias:</span>
                        <span className="text-sm font-bold text-focus-300">
                            {previewResult.totalMatched} clientes
                        </span>
                        {previewResult.truncated && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                                +100
                            </span>
                        )}
                    </div>
                )}

                <Button
                    text={isLoading ? "Calculando..." : "Previsualizar"}
                    icon="search"
                    onClick={handlePreview}
                    disabled={disabled || isLoading}
                    stylingMode="contained"
                    className="!bg-focus-300 !text-variant !text-xs !border-none"
                />
            </div>
        </div>
    );
};

export default ClusterPreviewBadge;
