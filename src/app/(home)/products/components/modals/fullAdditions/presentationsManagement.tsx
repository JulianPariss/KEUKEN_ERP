"use client";

import { IFUOM } from "@repo/api-contracts/erp";
import { IFPackagingLevel } from "@repo/api-contracts/erp";
import { generateUUID } from "@/lib/utils/id.helper";
import { NumberBox, TextBox, CheckBox } from "devextreme-react";
import { Button, SelectBox } from '@repo/devextreme';
import { ValidationGroup } from "devextreme-react/validation-group";
import Validator, { CustomRule, RequiredRule, PatternRule, AsyncRule } from "devextreme-react/validator";
import notify from "devextreme/ui/notify";
import { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { presentationsService } from "@/app/services/product_services/presentations.service";

interface IPresentationsManagementProps {
    currentItem: any;
    setCurrentItem: (item: any) => void;
    uoms: IFUOM[];
    itemsData: any[];
    packagingLevels: IFPackagingLevel[];
}

const PresentationsManagement = ({
    currentItem,
    setCurrentItem,
    uoms,
    itemsData,
    packagingLevels,
}: IPresentationsManagementProps) => {
    const { token } = useAuth();
    const validationGroupRef = useRef<any>(null);
    /** Remount del borrador solo si ValidationGroup.reset no alcanza */
    const [groupKey, setGroupKey] = useState(0);
    /** Refresco de la lista (mutación in-place) sin remount del borrador */
    const [listTick, setListTick] = useState(0);

    const emptyPresentation = () => ({
        name: "",
        barcode: "",
        uomId: "",
        uomRatio: 1,
        packagingLevelId: "",
        active: true,
        isPrimary: false,
    });

    const tempPresentationRef = useRef(emptyPresentation());

    /**
     * Tras un validate() OK, ValidationGroup.reset() vacía los editores y DX
     * re-valida el cambio → Required/Pattern en vacío muestran error en rojo.
     * Con defaultValue no controlado, el remount (groupKey) deja el borrador prístino.
     */
    const resetDraftEditors = () => {
        tempPresentationRef.current = emptyPresentation();
        setGroupKey((k) => k + 1);
        setListTick((t) => t + 1);
    };

    const addPresentationToCurrentItem = () => {
        const validationResult = validationGroupRef.current?.instance().validate();

        if (!validationResult?.isValid) {
            const messages = [...new Set(
                (validationResult?.brokenRules || [])
                    .map((r: any) => r?.message)
                    .filter((m: unknown): m is string => typeof m === "string" && m.trim().length > 0)
            )];
            notify(
                messages.length
                    ? `Presentación incompleta: ${messages.slice(0, 3).join(" · ")}`
                    : "Complete los campos obligatorios de la presentación (nombre, código de barras, UoM, nivel y ratio)",
                "warning",
                4000
            );
            return;
        }

        const matchedLevel = packagingLevels.find(pl => pl.id === tempPresentationRef.current.packagingLevelId);
        const packagingLevelId = tempPresentationRef.current.packagingLevelId;

        if (!currentItem.presentations) {
            currentItem.presentations = [];
        }

        const sameLevel = currentItem.presentations.filter(
            (p: any) => p.packagingLevelId === packagingLevelId
        );
        // Primera del nivel → principal automática; si el usuario marca principal → desmarcar la anterior
        const shouldBePrimary = !!tempPresentationRef.current.isPrimary || sameLevel.length === 0;

        if (shouldBePrimary) {
            sameLevel.forEach((p: any) => {
                p.isPrimary = false;
            });
        }

        const newPresentation = {
            ...tempPresentationRef.current,
            isPrimary: shouldBePrimary,
            packagingLevelCode: matchedLevel?.code,
            tempId: generateUUID()
        };

        currentItem.presentations.push(newPresentation);
        resetDraftEditors();
    };

    const removePresentationFromCurrentItem = (tempId: string) => {
        if (!currentItem.presentations) return;

        const removed = currentItem.presentations.find((p: any) => p.tempId === tempId);
        currentItem.presentations = currentItem.presentations.filter((p: any) => p.tempId !== tempId);

        // Si se eliminó la principal, promover la primera restante del mismo nivel
        if (removed?.isPrimary && removed.packagingLevelId) {
            const remaining = currentItem.presentations.filter(
                (p: any) => p.packagingLevelId === removed.packagingLevelId
            );
            if (remaining.length > 0 && !remaining.some((p: any) => p.isPrimary)) {
                remaining[0].isPrimary = true;
            }
        }

        setListTick((t) => t + 1);
    };

    return (
        <div>
            <ValidationGroup key={groupKey} ref={validationGroupRef}>
                <div className="grid grid-cols-6 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs opacity-60">Nombre</label>
                        <TextBox
                            defaultValue={tempPresentationRef.current.name}
                            onValueChanged={(e) => {
                                tempPresentationRef.current.name = e.value || "";
                            }}
                            placeholder="Ej: Caja x12"
                            stylingMode="filled"
                        >
                            <Validator>
                                <RequiredRule message="Nombre requerido" />
                                <CustomRule
                                    message="Ya existe en este ítem"
                                    validationCallback={(e) => {
                                        const val = typeof e.value === 'string' ? e.value.trim().toLowerCase() : '';
                                        if (!val) return true;
                                        return !(currentItem.presentations || []).some((p: any) =>
                                            (typeof p.name === 'string' ? p.name.trim().toLowerCase() : '') === val
                                        );
                                    }}
                                />
                            </Validator>
                        </TextBox>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs opacity-60">Código de Barras</label>
                        <TextBox
                            defaultValue={tempPresentationRef.current.barcode}
                            onValueChanged={(e) => {
                                tempPresentationRef.current.barcode = e.value || "";
                            }}
                            placeholder="Ej: 7791234..."
                            stylingMode="filled"
                        >
                            <Validator>
                                <RequiredRule message="Código requerido" />
                                <PatternRule pattern={/^[a-zA-Z0-9\-_]+$/} message="Solo alfanuméricos y guiones" />
                                <CustomRule
                                    message="Código ya en uso"
                                    validationCallback={(e) => {
                                        const val = typeof e.value === 'string' ? e.value.trim().toLowerCase() : '';
                                        if (!val) return true;
                                        const allPresentations = itemsData.flatMap((i: any) => i.presentations || []);
                                        const isDuplicateGlobal = allPresentations.some((p: any) =>
                                            (typeof p.barcode === 'string' ? p.barcode.trim().toLowerCase() : '') === val
                                        );
                                        const isDuplicateLocal = (currentItem.presentations || []).some((p: any) =>
                                            (typeof p.barcode === 'string' ? p.barcode.trim().toLowerCase() : '') === val
                                        );
                                        return !isDuplicateGlobal && !isDuplicateLocal;
                                    }}
                                />
                                <AsyncRule
                                    message="Código de barras ya registrado en el catálogo"
                                    validationCallback={async (e) => {
                                        const val = typeof e.value === 'string' ? e.value.trim() : '';
                                        if (!val || !token) return true;
                                        try {
                                            const res = await presentationsService.checkBarcodeAvailability({
                                                barcode: val
                                            }, token);
                                            return res.available;
                                        } catch {
                                            return true;
                                        }
                                    }}
                                />
                            </Validator>
                        </TextBox>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs opacity-60">UoM</label>
                        <SelectBox
                            dataSource={uoms}
                            valueExpr="id"
                            displayExpr="name"
                            defaultValue={tempPresentationRef.current.uomId}
                            onValueChanged={(e) => {
                                tempPresentationRef.current.uomId = e.value || "";
                            }}
                            searchEnabled={true}
                            placeholder="Seleccione..."
                            stylingMode="filled"
                            dropDownOptions={{ wrapperAttr: { class: "popup-menu-container" } }}
                        >
                            <Validator>
                                <RequiredRule message="UoM requerida" />
                            </Validator>
                        </SelectBox>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs opacity-60">Nivel Empaque</label>
                        <SelectBox
                            dataSource={packagingLevels}
                            valueExpr="id"
                            displayExpr="name"
                            defaultValue={tempPresentationRef.current.packagingLevelId}
                            onValueChanged={(e) => {
                                tempPresentationRef.current.packagingLevelId = e.value || "";
                            }}
                            searchEnabled={true}
                            placeholder="Seleccione..."
                            stylingMode="filled"
                            dropDownOptions={{ wrapperAttr: { class: "popup-menu-container" } }}
                        >
                            <Validator>
                                <RequiredRule message="Nivel requerido" />
                            </Validator>
                        </SelectBox>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs opacity-60">Ratio</label>
                        <div className="flex gap-2 items-center">
                            <NumberBox
                                className="flex-1"
                                min={1}
                                defaultValue={tempPresentationRef.current.uomRatio}
                                onValueChanged={(e) => {
                                    if (e.value !== undefined && e.value !== null) {
                                        tempPresentationRef.current.uomRatio = e.value;
                                    }
                                }}
                                stylingMode="filled"
                            >
                                <Validator>
                                    <RequiredRule message="Ratio requerido" />
                                </Validator>
                            </NumberBox>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs opacity-60">Es Principal</label>
                        <div className="flex gap-2 items-center h-[34px]">
                            <CheckBox
                                defaultValue={tempPresentationRef.current.isPrimary}
                                onValueChanged={(e) => {
                                    tempPresentationRef.current.isPrimary = !!e.value;
                                }}
                            />
                            <Button
                                text="Añadir"
                                icon="add"
                                type="default"
                                stylingMode="outlined"
                                onClick={addPresentationToCurrentItem}
                                className="flex-shrink-0 ml-auto"
                            />
                        </div>
                    </div>
                </div>
            </ValidationGroup>

            {/* listTick fuerza re-pintado de la tabla tras mutación in-place */}
            {(currentItem.presentations || []).length > 0 ? (
                <div key={`pres-list-${listTick}`} className="mt-4 p-2 bg-main/5 rounded-dx">
                    {Array.from(new Set(currentItem.presentations.map((p: any) => p.packagingLevelId))).map((levelId: any) => {
                        const levelName = packagingLevels.find((pl: any) => pl.id === levelId)?.name || "Desconocido";
                        const levelPresentations = currentItem.presentations.filter((p: any) => p.packagingLevelId === levelId);
                        
                        return (
                            <div key={levelId} className="mb-4 last:mb-0">
                                <h4 className="text-sm font-bold text-dx-primary opacity-80 border-b border-main/10 pb-1 mb-2 px-1">
                                    Nivel: {levelName}
                                </h4>
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-main/10 text-left text-dx-primary opacity-60">
                                            <th className="p-1">Nombre</th>
                                            <th className="p-1">Barras</th>
                                            <th className="p-1">UoM</th>
                                            <th className="p-1">Ratio</th>
                                            <th className="p-1 text-center w-[80px]">Principal</th>
                                            <th className="p-1 text-end w-[60px]">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {levelPresentations.map((p: any) => (
                                            <tr key={p.tempId} className="border-b border-main/5 last:border-0 hover:bg-main/5 transition-colors">
                                                <td className="p-1">{p.name}</td>
                                                <td className="p-1">{p.barcode}</td>
                                                <td className="p-1">{uoms.find((u: any) => u.id === p.uomId)?.name}</td>
                                                <td className="p-1">{p.uomRatio}</td>
                                                <td className="p-1 text-center">
                                                    <div className="flex justify-center">
                                                        <CheckBox
                                                            value={p.isPrimary}
                                                            onValueChanged={(e) => {
                                                                if (!e.event) return;
                                                                const val = !!e.value;

                                                                if (!val) {
                                                                    // No permitir dejar el nivel sin principal
                                                                    const hasOtherPrimary = levelPresentations.some(
                                                                        (pres: any) =>
                                                                            pres.tempId !== p.tempId && pres.isPrimary
                                                                    );
                                                                    if (!hasOtherPrimary) {
                                                                        notify(
                                                                            "Cada nivel de empaque debe tener al menos una presentación principal",
                                                                            "warning",
                                                                            3000
                                                                        );
                                                                        e.component.option("value", true);
                                                                        return;
                                                                    }
                                                                    p.isPrimary = false;
                                                                    setListTick((t) => t + 1);
                                                                    return;
                                                                }

                                                                // Marcar esta como principal y desmarcar las demás del nivel
                                                                currentItem.presentations.forEach((pres: any) => {
                                                                    if (pres.packagingLevelId === levelId) {
                                                                        pres.isPrimary = pres.tempId === p.tempId;
                                                                    }
                                                                });
                                                                setListTick((t) => t + 1);
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-1 text-end">
                                                    <Button
                                                        icon="trash"
                                                        type="danger"
                                                        stylingMode="text"
                                                        onClick={() => removePresentationFromCurrentItem(p.tempId)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="mt-4 p-4 bg-main/5 rounded-dx">
                    <p className="text-sm opacity-60">No se han añadido presentaciones</p>
                </div>
            )}
        </div>
    );
};

export default PresentationsManagement;
