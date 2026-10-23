"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { LoadPanel, ScrollView } from "devextreme-react";
import { Popup, Position } from "devextreme-react/popup";
import ValidationGroup from "devextreme-react/validation-group";
import notify from "devextreme/ui/notify";
import PERMISSIONS_CONSTANTS from "@/app/lib/constants/permissions.constants";
import { canDo } from "@/app/lib/utils/permission.helper";
import { locationService } from "@repo/erp-services/warehouse/locations.service";
import { IFItemCreation, IFItemsCreation } from "@repo/api-contracts/erp";
import { IFLocationCreation } from "@repo/api-contracts/erp";
import { Button } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { useLocations } from "@/contexts/LocationsContext";
import { generateUUID } from "@/lib/utils/id.helper";
import CreationItem from "./creationItem";
import GridDisplay from "./gridDisplay";

interface ILocationsMassiveCreationProps {
    warehouseId: string;
    parentPath: string;
    onSuccess?: () => void;
    onHidden?: () => void;
}

const LocationsMassiveCreation = ({ warehouseId, parentPath, onSuccess, onHidden }: ILocationsMassiveCreationProps) => {
    const { triggerRefresh } = useLocations();
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const validationGroupRef = useRef<any>(null);
    const scrollViewRef = useRef<any>(null);
    const [simulated, setSimulated] = useState(false);
    const [simulationResult, setSimulationResult] = useState<IFItemsCreation | null>(null);

    const { token, permissions } = useAuth();

    const createInitialItem = useCallback((): IFLocationCreation => ({
        id: generateUUID(),
        title: "",
        usage: "view",
        unitCount: 1,
        capacityVolume: 0,
        capacityWeight: 0,
        format: "N",
        unitFrom: "1",
        unitTo: "1",
        unitFromFormatted: "1",
        padding: 0
    }), []);

    const [formItems, setFormItems] = useState<IFLocationCreation[]>(() => [createInitialItem()]);

    const openPopup = useCallback(() => {
        setFormItems([createInitialItem()]);
        setSimulated(false);
        setSimulationResult(null);
        setPopupVisible(true);
    }, [createInitialItem]);

    const closePopup = useCallback(() => {
        setPopupVisible(false);
    }, []);

    const handleHiding = useCallback(() => {
        setPopupVisible(false);
    }, []);

    const handleHidden = useCallback(() => {
        validationGroupRef.current?.instance()?.reset();
        setFormItems([createInitialItem()]);
        setSimulated(false);
        setSimulationResult(null);
        if (onHidden) {
            onHidden();
        }
    }, [createInitialItem, onHidden]);

    const addItem = useCallback(() => {
        setFormItems(prev => [...prev, createInitialItem()]);
        setSimulated(false);
        setTimeout(() => {
            scrollViewRef.current?.instance()?.scrollTo(scrollViewRef.current?.instance()?.scrollHeight());
        }, 100);
    }, [createInitialItem]);

    const removeItem = useCallback((id: string) => {
        setFormItems(prev => prev.filter(item => item.id !== id));
        setSimulated(false);
    }, []);

    const updateItem = useCallback((id: string, newData: any) => {
        setFormItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...newData } : item
        ));
        setSimulated(false);
    }, []);

    const validateSimulation = useCallback((items: IFItemCreation[]) => {
        return items.some((item) => item.status === 'ERROR');
    }, []);

    const handleSubmit = useCallback(async () => {
        const result = validationGroupRef.current?.instance()?.validate();
        if (!result?.isValid) return;

        setLoading(true);
        try {
            const res: IFItemsCreation = await locationService.create(formItems, warehouseId, parentPath, !simulated, token);
            if (simulated) {
                notify('Estructuras creadas con éxito', 'success', 3000);
                triggerRefresh();
                closePopup();
                onSuccess?.();
            } else {
                if (validateSimulation(res.items)) {
                    notify('La simulación falló, por favor, intenta nuevamente con otros parámetros.', 'error', 4000);
                } else {
                    setSimulated(true);
                    setSimulationResult(res);
                    notify('Simulación completada con éxito', 'success', 3000);
                    setTimeout(() => {
                        scrollViewRef.current?.instance()?.scrollTo(scrollViewRef.current?.instance()?.scrollHeight());
                    }, 100);
                }
            }
        } catch (err: any) {
            setSimulated(false);
            setSimulationResult(null);
            const errorMessage = err instanceof Error && err.message ? err.message : 'La operación falló, por favor, intenta nuevamente con otros parámetros.';
            notify(errorMessage, 'error', 4000);
        } finally {
            setLoading(false);
        }
    }, [formItems, warehouseId, parentPath, simulated, token, triggerRefresh, closePopup, onSuccess, validateSimulation]);

    const canModify = useMemo((): boolean => {
        return permissions ? canDo('modify', PERMISSIONS_CONSTANTS.modifyLocations, permissions) : false;
    }, [permissions]);

    return (
        <>
            {canModify &&
                <Button
                    width="100%"
                    stylingMode="contained"
                    type="default"
                    onClick={openPopup}
                    elementAttr={{ class: '!bg-gradient-to-r !pr-2 !from-focus-500/80 !to-focus-300/80 !rounded-dx !border-none shadow-lg hover:shadow-focus-500/20 transition-all group' }}
                >
                    <div className="flex items-center justify-center gap-2">
                        <i style={{ fontSize: '12px' }} className="dx-icon-add text-lg text-variant! group-hover:rotate-90 transition-transform duration-300"></i>
                        <span className="text-xs text-nowrap font-bold text-variant!">Creación Masiva</span>
                    </div>
                </Button>
            }

            <Popup
                visible={isPopupVisible}
                onHiding={handleHiding}
                onHidden={handleHidden}
                dragEnabled={false}
                hideOnOutsideClick={true}
                showCloseButton={true}
                showTitle={true}
                titleRender={() => (
                    <div className="flex flex-row items-center justify-between pr-6">
                        <h3 className="text-base font-semibold">Configuración de Ubicaciones</h3>
                        <div className="flex items-center gap-1.5 text-xs">
                            <i className="dx-icon-folder opacity-60 text-xs"></i>
                            <span className="opacity-60">Ruta:</span>
                            <span className="uppercase truncate max-w-[450px] !text-focus-300 text-xs">{parentPath || 'Raíz'}</span>
                        </div>
                    </div>
                )}
                width={950}
                height='auto'
                maxHeight={'90vh'}
                deferRendering={false}
                onShown={(e) => {
                    e.component.repaint();
                }}
            >
                <Position at="center" my="center" />
                <div className="flex w-full h-full gap-x-4 p-4">
                    <div className="flex flex-col h-full w-3/5 overflow-hidden relative border-r border-variant/20 pr-4">
                        <LoadPanel
                            visible={loading}
                            showPane={false}
                            message={simulated ? "Creando estructuras..." : "Simulando cambios..."}
                        />
                        <ScrollView ref={scrollViewRef} className="flex-1 w-full" useNative={true} showScrollbar="onHover">
                            <div className="p-1 flex flex-col gap-6">
                                <ValidationGroup ref={validationGroupRef}>
                                    {formItems.map((item, index) => {
                                        const isLast = index === formItems.length - 1;
                                        return (
                                            <div key={item.id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500 mb-4">
                                                <CreationItem
                                                    formData={item}
                                                    updateFormData={(data) => updateItem(item.id, data)}
                                                    onDelete={formItems.length > 1 ? () => removeItem(item.id) : undefined}
                                                    isLast={isLast}
                                                />
                                                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-focus-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                        );
                                    })}
                                </ValidationGroup>

                                <Button
                                    width="100%"
                                    stylingMode="outlined"
                                    type="default"
                                    onClick={addItem}
                                    disabled={formItems[formItems.length - 1]?.usage === 'internal'}
                                    text={formItems[formItems.length - 1]?.usage === 'internal'
                                        ? "No se pueden agregar más estructuras después de un Almacén"
                                        : "Agregar otra estructura"
                                    }
                                    icon={formItems[formItems.length - 1]?.usage === 'internal' ? undefined : "plus"}
                                    elementAttr={{ class: "!border-dashed" }}
                                />

                                {simulated && simulationResult && (
                                    <div className="p-4 bg-focus-500/10 border border-focus-500/30 rounded-dx flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-x-2">
                                            <i className="dx-icon-info !text-focus-500" style={{ fontSize: '18px' }} />
                                            <span className="font-bold text-sm uppercase !text-focus-500">Resumen de Simulación</span>
                                        </div>
                                        <p className="text-xs mt-1">
                                            {`Se crearán ${simulationResult.items.length} ubicaciones`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </ScrollView>

                        <div className="pt-4 border-t border-variant/20 flex justify-end gap-3">
                            <Button
                                text="Cancelar"
                                onClick={closePopup}
                                disabled={loading}
                                stylingMode="text"
                                className="!bg-main/10"
                            />

                            <Button
                                text="Simular"
                                type="default"
                                stylingMode="contained"
                                onClick={handleSubmit}
                                disabled={loading || simulated}
                                width={150}
                                className="!bg-focus-300/80 !text-focus-300 border border-focus-500/30 shadow-md shadow-black/20"
                            />

                            <Button
                                text="Crear Todo"
                                type="default"
                                stylingMode="contained"
                                onClick={handleSubmit}
                                disabled={loading || !simulated}
                                className="!bg-focus-300 !text-variant shadow-md shadow-black/20"
                            />
                        </div>
                    </div>

                    <div className="flex w-2/5 flex-col">
                        <GridDisplay
                            structure={formItems.map(item => item.unitCount)}
                            titles={formItems.map(item => item.title || `Nivel ${formItems.indexOf(item) + 1}`)}
                        />
                    </div>
                </div>
            </Popup>
        </>
    );
};

export default LocationsMassiveCreation;
