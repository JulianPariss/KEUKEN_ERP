import React from "react";
import { IGenericDataGridColumn } from '@repo/devextreme';
import {
    ClusterEntityType,
    IClusterItemOption,
    ICreateClusterData,
} from "@repo/api-contracts/erp";
import { IFClusterSummary } from "@repo/api-contracts/erp";
import { IFClusterAddMembersResponse } from "@repo/api-contracts/erp";

export interface IClusterStrategy<TCluster = any, TMember = any, TRuleSet = any> {
    entityType: ClusterEntityType;

    // Labels & Textos
    entityLabel: {
        singular: string;
        plural: string;
    };
    clusterEntityLabel: string;
    managerTitle: string;
    managerSubtitle: string;
    addMembersTitle: string;
    addMembersSearchPlaceholder: string;
    addMembersGridId: string;
    rulesTitle: string;
    rulesSubtitle: string;
    membersExportFileName: string;
    emptySelectDescription: string;

    // Operaciones CRUD de Clúster
    getById: (id: string, token: string, companyId?: string) => Promise<TCluster>;
    update: (id: string, data: Partial<TCluster>, token: string, companyId?: string) => Promise<TCluster>;
    delete: (id: string, token: string, companyId?: string) => Promise<any>;
    getAllClusters: (token: string, companyId?: string) => Promise<TCluster[]>;
    getClusterOptions: (token: string, companyId?: string) => Promise<IClusterItemOption[]>;
    createAndAddMembers: (
        data: ICreateClusterData,
        memberIds: string[],
        token: string,
        companyId?: string
    ) => Promise<IFClusterAddMembersResponse>;

    // Listado de Miembros del Clúster
    membersKeyExpr: string;
    membersColumns: IGenericDataGridColumn[];
    getMembers: (
        clusterId: string,
        limit: number,
        offset: number,
        token: string,
        companyId: string,
        excluded?: 'all' | boolean
    ) => Promise<{ items: TMember[]; metadata?: { totalItems: number } }>;
    removeMember: (
        clusterId: string,
        memberId: string,
        token: string,
        companyId: string
    ) => Promise<any>;
    removeMembers?: (
        clusterId: string,
        memberIds: string[],
        token: string,
        companyId: string
    ) => Promise<any>;

    // Exclusión (opcional, solo soportado por algunos clústeres)
    supportsExclusion?: boolean;
    excludeMember?: (
        clusterId: string,
        memberId: string,
        token: string,
        companyId: string
    ) => Promise<any>;
    includeMember?: (
        clusterId: string,
        memberId: string,
        token: string,
        companyId: string
    ) => Promise<any>;

    // Grilla de Selección para Añadir Miembros
    addMembersColumns: IGenericDataGridColumn[];
    loadAvailableMembers: (
        limit: number,
        offset: number,
        token: string,
        companyId: string
    ) => Promise<{ data: any[]; totalCount: number }>;
    addMembers: (
        clusterId: string,
        memberIds: string[],
        token: string,
        companyId?: string
    ) => Promise<IFClusterAddMembersResponse>;

    // Reglas Dinámicas
    supportsRules: boolean;
    supportsPreview: boolean;
    supportsSummary: boolean;
    getDefaultRuleSet: () => TRuleSet;
    validateRuleSet: (ruleSet: TRuleSet) => { isValid: boolean; errorMessage?: string };
    RuleEditorComponent: React.ComponentType<{
        value: TRuleSet;
        onChange: (value: TRuleSet) => void;
        disabled?: boolean;
    }>;

    // Métricas y Refresco
    refreshCluster: (clusterId: string, token: string, companyId?: string) => Promise<any>;
    getSummary?: (
        clusterId: string,
        lookbackDays: number,
        companyId: string,
        token: string
    ) => Promise<IFClusterSummary>;
}
