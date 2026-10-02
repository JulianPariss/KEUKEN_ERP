'use client';

import React from 'react';
import { Button } from '@repo/devextreme';
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { ClusterEntityType } from "@repo/api-contracts/erp";

export interface DeleteMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    count: number;
    entityType: ClusterEntityType;
    isDeleting?: boolean;
}

export const DeleteMembersModal: React.FC<DeleteMembersModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    count,
    entityType,
    isDeleting = false,
}) => {
    const entityLabel = entityType === 'customer'
        ? (count === 1 ? 'cliente' : 'clientes')
        : (count === 1 ? 'ítem' : 'ítems');

    return (
        <Popup
            visible={isOpen}
            onHiding={!isDeleting ? onClose : undefined}
            dragEnabled={false}
            hideOnOutsideClick={!isDeleting}
            showCloseButton={!isDeleting}
            showTitle={true}
            title={`Eliminar ${entityLabel} del clúster`}
            width={460}
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
                            ¿Estás seguro de que deseas eliminar los elementos seleccionados?
                        </span>
                        <p className="text-main/70 text-xs">
                            Se eliminarán <strong>{count} {entityLabel}</strong> del clúster. Esta acción removerá los miembros del grupo.
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
                    text={isDeleting ? "Eliminando..." : `Eliminar (${count})`}
                    stylingMode="contained"
                    onClick={onConfirm}
                    disabled={isDeleting || count === 0}
                    className="shadow-lg !text-main"
                />
            </ToolbarItem>
        </Popup>
    );
};

export default DeleteMembersModal;
