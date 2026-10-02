"use client";

import { locationService } from "@/app/services/warehouse/locations.service";
import { useAuth } from "@/contexts/AuthContext";
import { LoadPanel, TextBox } from "devextreme-react";
import { Button } from '@repo/devextreme';
import { Popup, Position } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useEffect, useState } from "react";

interface ListEditionProps {
    visible: boolean;
    onHiding: () => void;
    searchPattern: string | null;
    warehouseId: string;
    onSuccess?: () => void;
}

const ListEdition = ({ visible, onHiding, searchPattern, warehouseId, onSuccess }: ListEditionProps) => {
    const [level, setLevel] = useState("");
    const [loading, setLoading] = useState(false);
    const [simulated, setSimulated] = useState(false);
    const [simulationResult, setSimulationResult] = useState<any>(null);

    const { token } = useAuth();

    useEffect(() => {
        if (!visible) {
            setLevel("");
            setSimulated(false);
            setSimulationResult(null);
        }
    }, [visible]);

    useEffect(() => {
        setSimulated(false);
        setSimulationResult(null);
    }, [level, searchPattern]);

    const handleAction = async (isSimulation: boolean) => {
        setLoading(true);
        try {
            const response = await locationService.updateLevelByPattern(warehouseId, searchPattern ?? "%%", level, isSimulation, token);

            if (isSimulation) {
                setSimulated(true);
                setSimulationResult(response);
                notify({ message: "Simulación completada con éxito. Revise los cambios antes de confirmar.", type: "success", displayTime: 3000, className: '!text-red-500' });
            } else {
                notify({ message: "Niveles actualizados con éxito", type: "success", displayTime: 3000 });
                onSuccess?.();
                onHiding();
            }
        } catch (error: any) {
            console.error("Error in updateLevelByPattern:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Ocurrió un error al procesar la solicitud";
            notify(errorMessage, "error", 4000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Popup
            visible={visible}
            onHiding={onHiding}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title="Edición por Patrón"
            width={500}
            height="auto"
            className="custom-popup"
        >
            <Position at="center" my="center" />

            <div className="p-4 flex flex-col gap-6 relative">
                <LoadPanel
                    visible={loading}
                    showPane={false}
                    message={simulated ? "Actualizando accesibilidades..." : "Simulando cambios..."}
                />
                <div className="flex flex-col gap-2">
                    {!!!searchPattern ? (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-dx flex gap-1 flex flex-col">
                            <div className="flex items-center gap-2">
                                <i className="dx-icon-warning text-red-500 text-lg"></i>
                                <span className="text-red-500 mb-0.5 text-md">Atención</span>
                            </div>
                            <p className="text-xs  text-red-200">
                                Esta acción modificará la accesibilidad de todas las ubicaciones.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm ">
                                Estás a punto de editar masivamente las ubicaciones que coinciden con el patrón:
                            </p>
                            <div className="bg-primary-950/40 p-3 rounded-dx border border-main/5 font-mono text-focus-400 text-center">
                                {searchPattern}
                            </div>
                        </>
                    )}
                    <div className="mt-4">
                        <TextBox
                            label="Accesibilidad"
                            labelMode="outside"
                            value={level}
                            onValueChanged={(e) => setLevel(e.value || "")}
                            stylingMode="filled"
                            valueChangeEvent="keyup"
                            showClearButton={true}
                            elementAttr={{ class: '!bg-main/5 !rounded-dx' }}
                        />
                        <p className="text-xs  mt-1.5 px-1">
                            Define la accesibilidad de la ubicación, este cambio afectara a todas las ubicaciones que coincidan con el patrón.
                        </p>
                    </div>

                    {simulated && simulationResult && (
                        <div className="mt-4 p-3 bg-focus-500/10 border border-focus-500/30 rounded-dx flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-x-2">
                                <i className="dx-icon-info !text-focus-500" style={{ fontSize: '18px' }} />
                                <span className="font-bold text-sm  uppercase !text-focus-500">Resumen de Simulación</span>
                            </div>
                            <p className="text-xs  leading-relaxed mt-1">
                                {`Se asignara la accesibilidad "${level}" a ${simulationResult.matched_count} ubicaciones que coinciden con el patrón`}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-4 border-t border-main/5 pt-4">
                    <Button
                        onClick={onHiding}
                        stylingMode="text"
                        disabled={loading}
                        text="Cancelar"

                    />
                    <Button
                        text="Simular"
                        onClick={() => handleAction(true)}
                        stylingMode="contained"
                        type="default"
                        disabled={loading || simulated || !level.trim()}
                        className={`shadow-lg shadow-black/20 ${simulated || !level.trim() ? '!opacity-50' : ''}`}
                    />
                    <Button
                        text="Confirmar"
                        onClick={() => handleAction(false)}
                        stylingMode="contained"
                        type="default"
                        disabled={loading || !simulated}
                        className={`shadow-lg shadow-black/20 ${!simulated ? '!opacity-50' : ''}`}
                    />
                </div>
            </div>
        </Popup>
    );
};

export default ListEdition;
