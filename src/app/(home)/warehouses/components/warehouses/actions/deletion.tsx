"use client";

import { useCallback, useEffect, useState } from "react";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { TextBox } from "devextreme-react/text-box";
import notify from "devextreme/ui/notify";
import { useRouter, useSearchParams } from "next/navigation";
import { warehouseService } from "@repo/erp-services/warehouse/warehouse.service";
import { IWarehouse } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';

interface WarehouseDeletionProps {
    visible: boolean;
    onHiding: () => void;
    onHidden?: () => void;
    warehouse: IWarehouse;
    onSuccess: () => Promise<void>;
}

const WarehouseDeletion = ({ visible, onHiding, onHidden, warehouse, onSuccess }: WarehouseDeletionProps) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [confirmationName, setConfirmationName] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (visible) {
            setConfirmationName("");
        }
    }, [visible]);

    const isConfirmed = confirmationName === warehouse?.title;

    const handleDelete = useCallback(async () => {
        if (!isConfirmed || !warehouse?.id) return;

        setLoading(true);
        try {
            await warehouseService.delete(warehouse.id, token);
            notify("Almacén eliminado con éxito", "success", 2000);
            await onSuccess();

            const currentWarehouseId = searchParams.get("warehouseId");
            if (currentWarehouseId === warehouse.id) {
                router.push("/warehouses");
            }

            onHiding();
        } catch (err: any) {
            console.error("Error al eliminar el almacén:", err);
            const errorMessage = err instanceof Error && err.message ? err.message : "Error al eliminar el almacén. Intente nuevamente.";
            notify(errorMessage, "error", 4000);
        } finally {
            setLoading(false);
        }
    }, [isConfirmed, warehouse?.id, warehouse?.title, token, onSuccess, searchParams, router, onHiding]);

    return (
        <Popup
            visible={visible}
            onHiding={onHiding}
            onHidden={onHidden}
            onShown={(e) => {
                e.component.repaint();
            }}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title="Eliminar Almacén"
            width={450}
            height="auto"
        >
            <Position at="center" my="center" />

            <div className="p-4 flex flex-col gap-4">
                <p className="text-sm text-main/60 leading-relaxed">
                    Esta acción es permanente. Para confirmar la eliminación, escriba el nombre del almacén: <span className="font-semibold text-main">"{warehouse?.title}"</span>
                </p>

                <TextBox
                    value={confirmationName}
                    onValueChanged={(e) => setConfirmationName(e.value)}
                    placeholder="Escriba el nombre aquí..."
                    valueChangeEvent="keyup"
                    stylingMode="filled"
                    onPaste={(e) => {
                        e.event?.preventDefault();
                        notify("El pegado está deshabilitado. Por favor, escriba el nombre manualmente.", "warning", 2000);
                    }}
                />
            </div>

            <ToolbarItem toolbar="bottom" location="after">
                <Button
                    text="Cancelar"
                    onClick={onHiding}
                    disabled={loading}
                    stylingMode="text"
                    className="!bg-main/10"
                />
            </ToolbarItem>
            <ToolbarItem toolbar="bottom" location="after">
                <Button
                    text="Eliminar"
                    type="danger"
                    stylingMode="contained"
                    onClick={handleDelete}
                    disabled={loading || !isConfirmed}
                    className="!bg-red-600 !text-white"
                />
            </ToolbarItem>
        </Popup>
    );
};

export default WarehouseDeletion;
