'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@repo/devextreme';
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useAuth } from "@/contexts/AuthContext";
import { ClusterEntityType } from "@repo/api-contracts/erp";
import { getClusterStrategy } from "../strategy/strategyResolver";
import { IClusterCardData } from './clusterSummaryCard';

export interface DeleteClusterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    onHidden?: () => void;
    clusterId: string;
    entityType: ClusterEntityType;
    cluster?: IClusterCardData | null;
}

export const DeleteClusterModal: React.FC<DeleteClusterModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    onHidden,
    clusterId,
    entityType,
    cluster,
}) => {
    const { token, currentCompany } = useAuth();
    const strategy = useMemo(() => getClusterStrategy(entityType), [entityType]);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleHidden = useCallback(() => {
        setIsDeleting(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    const handleDelete = async () => {
        if (!clusterId || !token) return;

        setIsDeleting(true);
        try {
            const res = await strategy.delete(clusterId, token, currentCompany?.id);
            notify(res?.detail || `${strategy.entityLabel.singular} eliminada exitosamente`, "success", 3000);
            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (error: any) {
            console.error("Error al eliminar el clúster:", error);
            const msg = error instanceof Error && error.message ? error.message : "Error al eliminar el clúster";
            notify(msg, "error", 3000);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={`Eliminar ${strategy.entityLabel.singular}`}
            width={480}
            height="auto"
            className="custom-popup"
            onShown={(e) => {
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="flex flex-col gap-3 p-4 font-sans text-xs">
                <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/25 rounded-dx">
                    <i className="dx-icon-warning text-red-400 text-xl mt-0.5" />
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-main text-sm">
                            ¿Estás seguro de que deseas eliminar este clúster?
                        </span>
                        <p className="text-main/70 text-xs">
                            Se eliminará el clúster <strong>{cluster?.name || clusterId}</strong>
                            {cluster?.code ? ` (${cluster.code})` : ''}. Podrá ser recuperada desde la papelera de reciclaje por un administrador.
                        </p>
                    </div>
                </div>
            </div>

            <ToolbarItem toolbar="bottom" location="after">
                <Button
                    text="Cancelar"
                    onClick={onClose}
                    disabled={isDeleting}
                    stylingMode="text"
                    className="!rounded-dx !bg-main/10"
                />
            </ToolbarItem>
            <ToolbarItem toolbar="bottom" location="after">
                <Button
                    type="danger"
                    text={isDeleting ? "Eliminando..." : "Eliminar Clúster"}
                    stylingMode="contained"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="shadow-lg !text-main"
                />
            </ToolbarItem>
        </Popup>
    );
};

export default DeleteClusterModal;
