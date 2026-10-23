"use client";

import { useCallback, useMemo, useState } from "react";

import PERMISSIONS_CONSTANTS from "@/app/lib/constants/permissions.constants";
import { canDo } from "@/app/lib/utils/permission.helper";
import { inventoryService } from "@repo/erp-services/warehouse/inventory.service";
import { useAuth } from "@/contexts/AuthContext";
import { useLocations } from "@/contexts/LocationsContext";
import { Button } from '@repo/devextreme';
import notify from "devextreme/ui/notify";
import CompleteInventory from "../completeInventory";
import StartInventory from "../startInventory";
import AddArticles from "./addArticles";

const LocationsAdjustInventory = ({ locationId, locationName, onSuccess, isInventory = false }: { locationId: string, locationName: string, onSuccess?: () => void, isInventory?: boolean }) => {
    const { triggerRefresh, activeInventory } = useLocations();
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [isInventoryVisible, setInventoryVisible] = useState(false);
    const [isCompleteVisible, setCompleteVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const { token, permissions } = useAuth();

    const handleInventorySuccess = () => {
        triggerRefresh();
        onSuccess?.();
    };

    const openPopup = useCallback(() => {
        setPopupVisible(true);
    }, []);

    const closePopup = useCallback(() => {
        setPopupVisible(false);
    }, []);

    const handleSubmit = async (data: any, quantity: number) => {
        setLoading(true);

        try {
            if (!activeInventory?.id) {
                notify('No hay un inventario activo para esta ubicación.', 'error');
                setLoading(false);
                return;
            }

            await inventoryService.patch(activeInventory.id, {
                lines: [{
                    lineId: null,
                    itemId: data.item.id,
                    batchId: null,
                    realQty: quantity * data.item.presentations[0].factor,
                    realSecQty: 0,
                    batchName: "",
                    batchExpirationDate: null,
                    batchSupplierBatch: "",
                    batchInternalCode: "",
                    batchProperties: null
                }]
            }, token);

            notify('Cantidades registradas con éxito', 'success');
            triggerRefresh();
            closePopup();
            onSuccess?.();
        } catch (err: any) {
            console.error(err);
            const errorMessage = err instanceof Error && err.message ? err.message : 'La operación falló, por favor intenta nuevamente.';
            notify(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const canModify = useMemo((): boolean => {
        return permissions ? canDo('modify', PERMISSIONS_CONSTANTS.modifyInventory, permissions) : false;
    }, [permissions])

    return (
        <>
            {canModify ?
                activeInventory ? (
                    <div className="flex items-center gap-x-2 w-full">
                        <Button
                            width="100%"
                            stylingMode="contained"
                            type="default"
                            onClick={openPopup}
                            disabled={!isInventory}
                            elementAttr={{ class: `!bg-gradient-to-r !pr-2 !from-focus-500/80 !to-focus-300/80 !rounded-dx !border-none shadow-lg hover:shadow-focus-500/20 transition-all group ${!isInventory ? '!opacity-40' : ''}` }}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <i style={{ fontSize: '12px' }} className={`dx-icon-${!isInventory ? 'lock' : 'add'} text-lg text-variant! group-hover:rotate-90 transition-transform duration-300`}></i>
                                <span className="text-xs text-nowrap font-bold text-variant!">Cargar Stock</span>
                            </div>
                        </Button>
                        <Button
                            width="100%"
                            stylingMode="contained"
                            type="default"
                            onClick={() => setCompleteVisible(true)}
                            disabled={!isInventory}
                            elementAttr={{ class: `!bg-gradient-to-r !pr-2 !from-focus-500/80 !to-focus-300/80 !rounded-dx !border-none shadow-lg hover:shadow-focus-500/20 transition-all group ${!isInventory ? '!opacity-40' : ''}` }}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <i style={{ fontSize: '12px' }} className="dx-icon-check text-lg text-variant!"></i>
                                <span className="text-xs text-nowrap font-bold text-variant!">Confirmar Inventario</span>
                            </div>
                        </Button>
                    </div>
                ) : (
                    <Button
                        width="100%"
                        stylingMode="contained"
                        type="default"
                        onClick={() => setInventoryVisible(true)}
                        disabled={!isInventory}
                        elementAttr={{ class: `!bg-gradient-to-r !pr-2 !from-focus-500/80 !to-focus-300/80 !rounded-dx !border-none shadow-lg hover:shadow-focus-500/20 transition-all group ${!isInventory ? '!opacity-40' : ''}` }}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <i style={{ fontSize: '12px' }} className={`dx-icon-${!isInventory ? 'lock' : 'add'} text-lg text-variant! group-hover:rotate-90 transition-transform duration-300`}></i>
                            <span className="text-xs text-nowrap font-bold text-variant!">Comenzar Inventariado</span>
                        </div>
                    </Button>
                )
                : null}

            <AddArticles
                isPopupVisible={isPopupVisible}
                closePopup={closePopup}
                locationName={locationName}
                handleSubmit={handleSubmit}
                loading={loading}
            />

            <StartInventory
                visible={isInventoryVisible}
                onHiding={() => setInventoryVisible(false)}
                locationId={locationId}
                onSuccess={handleInventorySuccess}
            />
            {activeInventory && (
                <CompleteInventory
                    visible={isCompleteVisible}
                    onHiding={() => setCompleteVisible(false)}
                    inventoryId={activeInventory.id}
                    onSuccess={handleInventorySuccess}
                />
            )}
        </>
    );
};

export default LocationsAdjustInventory;
