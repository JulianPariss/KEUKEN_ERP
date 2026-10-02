"use client";

import { IFUOM } from "@repo/api-contracts/erp";
import { IFPackagingLevel } from "@repo/api-contracts/erp";
import { generateUUID } from "@/lib/utils/id.helper";
import { NumberBox, TextBox } from "devextreme-react";
import { Button, SelectBox } from '@repo/devextreme';
import { ValidationGroup } from "devextreme-react/validation-group";
import Validator, { CustomRule, RequiredRule, PatternRule } from "devextreme-react/validator";
import notify from "devextreme/ui/notify";
import { useRef, useState } from "react";

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
    const validationGroupRef = useRef<any>(null);
    const [groupKey, setGroupKey] = useState(0);

    const tempPresentationRef = useRef({
        name: "",
        barcode: "",
        uomId: "",
        uomRatio: 1,
        packagingLevelId: "",
        active: true,
    });

    const addPresentationToCurrentItem = () => {
        const validationResult = validationGroupRef.current?.instance().validate();

        if (!validationResult?.isValid) {
            notify("Por favor complete los campos de la presentación correctamente", "warning", 2000);
            return;
        }

        const matchedLevel = packagingLevels.find(pl => pl.id === tempPresentationRef.current.packagingLevelId);
        const newPresentation = {
            ...tempPresentationRef.current,
            packagingLevelCode: matchedLevel?.code,
            tempId: generateUUID()
        };

        // Mutar el arreglo de presentaciones directamente en el objeto de datos en memoria para mantener fija la referencia de currentItem
        if (!currentItem.presentations) {
            currentItem.presentations = [];
        }
        currentItem.presentations.push(newPresentation);

        // Resetear la referencia de la presentación borrador
        tempPresentationRef.current = {
            name: "",
            barcode: "",
            uomId: "",
            uomRatio: 1,
            packagingLevelId: "",
            active: true,
        };

        // Cambiar la key del ValidationGroup remonta los inputs de forma 100% limpia y prístina sin alterar la referencia de currentItem ni resetear el scroll del <Form>
        setGroupKey(k => k + 1);
    };

    const removePresentationFromCurrentItem = (tempId: string) => {
        if (currentItem.presentations) {
            currentItem.presentations = currentItem.presentations.filter((p: any) => p.tempId !== tempId);
            setGroupKey(k => k + 1);
        }
    };

    return (
        <div>
            <ValidationGroup key={groupKey} ref={validationGroupRef}>
                <div className="grid grid-cols-5 gap-4">
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
                                <PatternRule pattern={/^[0-9]+$/} message="El código de barras solo puede contener números" />
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
                            <Button
                                text="Añadir"
                                icon="add"
                                type="default"
                                stylingMode="outlined"
                                onClick={addPresentationToCurrentItem}
                                className="flex-shrink-0"
                            />
                        </div>
                    </div>
                </div>
            </ValidationGroup>

            {(currentItem.presentations || []).length > 0 ? (
                <div className="mt-4 p-2 bg-main/5 rounded-dx">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-main/10 text-left text-dx-primary opacity-60">
                                <th className="p-1">Nombre</th>
                                <th className="p-1">Barras</th>
                                <th className="p-1">UoM</th>
                                <th className="p-1">Nivel Empaque</th>
                                <th className="p-1">Ratio</th>
                                <th className="p-1 text-end">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItem.presentations.map((p: any) => (
                                <tr key={p.tempId} className="border-b border-main/5 last:border-0 hover:bg-main/5 transition-colors">
                                    <td className="p-1">{p.name}</td>
                                    <td className="p-1">{p.barcode}</td>
                                    <td className="p-1">{uoms.find((u: any) => u.id === p.uomId)?.name}</td>
                                    <td className="p-1">{packagingLevels.find((pl: any) => pl.id === p.packagingLevelId)?.name}</td>
                                    <td className="p-1">{p.uomRatio}</td>
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
            ) : (
                <div className="mt-4 p-4 bg-main/5 rounded-dx">
                    <p className="text-sm opacity-60">No se han añadido presentaciones</p>
                </div>
            )}
        </div>
    );
};

export default PresentationsManagement;
