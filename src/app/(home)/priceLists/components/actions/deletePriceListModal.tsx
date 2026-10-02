"use client";

import { useCallback, useState } from "react";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { Button } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { priceListsService } from "@/app/services/priceLists/priceLists.service";
import { IFPriceList } from "@repo/api-contracts/erp";

interface DeletePriceListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHidden?: () => void;
    onSuccess: () => void;
    priceList: IFPriceList | null;
}

export default function DeletePriceListModal({ isOpen, onClose, onHidden, onSuccess, priceList }: DeletePriceListModalProps) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleDelete = useCallback(async () => {
        if (!priceList?.id) return;

        if (!token) {
            notify("Error de autenticación", "error", 3000);
            return;
        }

        setLoading(true);
        try {
            await priceListsService.delete(priceList.id, token);
            notify("Lista de precios eliminada con éxito", "success", 3000);
            await onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error al eliminar la lista de precios:", err);
            const errorMessage = err instanceof Error && err.message ? err.message : "Error al eliminar la lista de precios";
            notify(errorMessage, "error", 4000);
        } finally {
            setLoading(false);
        }
    }, [priceList?.id, token, onSuccess, onClose]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={onHidden}
            onShown={(e) => {
                e.component.repaint();
            }}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title="Eliminar Lista de Precios"
            width={450}
            height="auto"
        >
            <Position at="center" my="center" />

            <div className="p-4 flex flex-col gap-2">
                <p className="text-sm text-main/80 leading-relaxed">
                    ¿Está seguro de que desea eliminar la lista de precios <span className="font-semibold text-main">"{priceList?.name}"</span>?
                </p>
                <p className="text-xs text-main/50">
                    Esta acción no se puede deshacer.
                </p>
            </div>

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
                    text={loading ? "Eliminando..." : "Eliminar"}
                    type="danger"
                    stylingMode="contained"
                    onClick={handleDelete}
                    disabled={loading}
                    className="!text-white"
                />
            </ToolbarItem>
        </Popup>
    );
}
