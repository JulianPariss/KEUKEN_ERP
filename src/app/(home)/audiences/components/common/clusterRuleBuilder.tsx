'use client';

import React, { useMemo } from 'react';
import { ClusterEntityType } from "@repo/api-contracts/erp";
import { getClusterStrategy } from "../strategy/strategyResolver";
import { ClusterPreviewBadge } from "./clusterPreviewBadge";
import { IFCustomerRuleSet } from "@repo/api-contracts/erp";

export interface ClusterRuleBuilderProps {
    entityType: ClusterEntityType;
    value: any;
    onChange: (value: any) => void;
    disabled?: boolean;
    isPreviewDisabled?: boolean;
    companyId?: string;
    token?: string;
}

export const ClusterRuleBuilder: React.FC<ClusterRuleBuilderProps> = ({
    entityType = 'customer',
    value,
    onChange,
    disabled = false,
    isPreviewDisabled = false,
    companyId,
    token,
}) => {
    const strategy = useMemo(() => getClusterStrategy(entityType), [entityType]);

    const effectiveValue = useMemo(() => {
        if (!value || Object.keys(value).length === 0) {
            return strategy.getDefaultRuleSet();
        }
        return value;
    }, [value, strategy]);

    const RuleEditor = strategy.RuleEditorComponent;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
                <h4 className="text-xs font-bold text-main">{strategy.rulesTitle}</h4>
                {strategy.rulesSubtitle && (
                    <p className="text-[11px] text-main/70">{strategy.rulesSubtitle}</p>
                )}
            </div>

            <RuleEditor
                value={effectiveValue}
                onChange={onChange}
                disabled={disabled}
            />

            {strategy.supportsPreview && (
                <div className="mt-2">
                    <ClusterPreviewBadge
                        ruleSet={effectiveValue as IFCustomerRuleSet}
                        companyId={companyId}
                        token={token}
                        disabled={disabled || isPreviewDisabled}
                    />
                </div>
            )}
        </div>
    );
};

export default ClusterRuleBuilder;
