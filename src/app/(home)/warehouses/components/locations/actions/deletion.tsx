"use client";

import { useCallback, useEffect, useState } from "react";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { TextBox } from "devextreme-react/text-box";
import { CheckBox } from "devextreme-react/check-box";
import notify from "devextreme/ui/notify";
import { Button } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { locationService } from "@/app/services/warehouse/locations.service";
import { IFLocation } from "@repo/api-contracts/erp";

interface LocationDeletionProps {
    visible: boolean;
    onHiding: () => void;
    onHidden?: () => void;
    location: IFLocation;
    onSuccess: () => void;
    warehouseId: string;
}

const LocationDeletion = ({ visible, onHiding, onHidden, location, onSuccess, warehouseId }: LocationDeletionProps) => {
    const [loading, setLoading] = useState(false);
    const [confirmationName, setConfirmationName] = useState("");
    const [deleteFullBranch, setDeleteFullBranch] = useState(false);

    const { token } = useAuth();

    useEffect(() => {
        if (visible) {
            setConfirmationName("");
            setDeleteFullBranch(false);
        }
    }, [visible]);

    const isConfirmed = confirmationName === location?.name;

    const handleDelete = useCallback(async () => {
        if (!isConfirmed || !location) return;

        setLoading(true);

        try {
            if (deleteFullBranch) {
                await locationService.delete({
                    path: location.path,
                    warehouseId: warehouseId,
                    simulate: false,
                    archiveIfUsed: false
                }, token);
            } else {
                await locationService.deleteSimple(location.id, warehouseId, token);
            }
            notify("Ubicación eliminada con éxito", "success", 2000);
            onSuccess();
            onHiding();
        } catch (err: any) {
            console.error("Error al eliminar la ubicación:", err);
            const errorMessage = err instanceof Error && err.message ? err.message : "Error al eliminar la ubicación. Intente nuevamente.";
            notify(errorMessage, "error", 4000);
        } finally {
            setLoading(false);
        }
    }, [isConfirmed, location, deleteFullBranch, warehouseId, token, onSuccess, onHiding]);

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
            title="Eliminar Ubicación"
            width={450}
            height="auto"
        >
            <Position at="center" my="center" />

            <div className="p-4 flex flex-col gap-4">
                <p className="text-sm text-main/80 leading-relaxed">
                    Esta acción es permanente. Para confirmar, escriba el nombre de la ubicación: <span className="font-semibold text-main">"{location?.name}"</span>
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

                <div className="flex flex-col gap-3 p-3 bg-primary-950/20 rounded-dx border border-main/10">
                    <CheckBox
                        text="Eliminar toda la rama (todos los niveles)"
                        value={deleteFullBranch}
                        onValueChanged={(e) => setDeleteFullBranch(e.value)}
                    />

                    {deleteFullBranch && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-dx flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <i className="dx-icon-warning text-red-500 text-lg" />
                                <span className="text-red-500 text-sm font-bold">Atención</span>
                            </div>
                            <p className="text-xs text-red-200 leading-relaxed">
                                Esta acción eliminará todas las sub-ubicaciones y productos contenidos en ellas de forma irremediable.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text="Cancelar"
                    onClick={onHiding}
                    disabled={loading}
                    stylingMode="text"
                    className="!bg-main/10"
                />
            </ToolbarItem>

            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text={loading ? "Eliminando..." : "Eliminar"}
                    type="danger"
                    stylingMode="contained"
                    onClick={handleDelete}
                    disabled={loading || !isConfirmed}
                    className="!text-white"
                />
            </ToolbarItem>
        </Popup>
    );
};

export default LocationDeletion;
