"use client";

import { IFUOM } from "@repo/api-contracts/erp";
import { IFPackagingLevel } from "@repo/api-contracts/erp";
import { CheckBox, NumberBox, TextBox } from "devextreme-react";
import { Button, SelectBox } from '@repo/devextreme';
import { Tooltip } from "devextreme-react/tooltip";
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { AsyncRule, CustomRule, RequiredRule } from "devextreme-react/validator";
import notify from "devextreme/ui/notify";
import React, { useEffect, useRef, useState } from "react";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";
import { useAuth } from "@/contexts/AuthContext";
import { itemsService } from "@/app/services/product_services/items.service";
import { currenciesService } from "@/app/services/payments_services/currencies.service";
import { providerService } from "@/app/services/location_services/provider.service";
import { commercialPlatformsService } from "@/app/services/partners/commercialPlatforms.service";
import { IFCurrency, IFProvider, IFCommercialPlatform } from "@repo/api-contracts/erp";

import { generateUUID } from "@/lib/utils/id.helper";
import { createEmptyItem } from "./creation";
import ItemsCreatedList from "./itemsCreatedList";
import PresentationsManagement from "./presentationsManagement";
import ItemSuppliersManagement from "./itemSuppliersManagement";
import ItemMediaUploadSection, { ICachedItemMedia } from "./itemMediaUploadSection";

interface CheckboxContainerProps {
    children: React.ReactNode;
    description: string;
    showTooltip?: boolean;
    className?: string;
}

const CheckboxContainer = ({ children, description, showTooltip = false, className = "" }: CheckboxContainerProps) => {
    const id = React.useId();
    const targetId = `tooltip-${id.replace(/:/g, "")}`;

    return (
        <div className={`flex flex-col gap-1 p-3 rounded-dx border border-main/5 hover:border-main/10 transition-colors ${className}`}>
            <div className="flex justify-between items-center w-full">
                <div className="flex-grow">
                    {children}
                </div>
                {showTooltip && (
                    <>
                        <i
                            id={targetId}
                            className="dx-icon dx-icon-info text-main/60 hover:text-main cursor-pointer text-sm ml-2"
                        />
                        <Tooltip
                            target={`#${targetId}`}
                            showEvent="mouseenter"
                            hideEvent="mouseleave"
                            hideOnOutsideClick={false}
                        >
                            <div className="text-xs leading-normal">
                                {description}
                            </div>
                        </Tooltip>
                    </>
                )}
            </div>
            {!showTooltip && (
                <p className="text-[11px] text-main/50 pl-6 leading-normal">
                    {description}
                </p>
            )}
        </div>
    );
};

interface IItemsSectionProps {
    uoms: IFUOM[];
    formRef: React.RefObject<any>;
    itemsData: any[];
    setItemsData: React.Dispatch<React.SetStateAction<any[]>>;
    currentItem: any;
    setCurrentItem: React.Dispatch<React.SetStateAction<any>>;
    currentCompany: string;
    canCreatePresentation?: boolean;
    isAddingItem: boolean;
    setIsAddingItem: React.Dispatch<React.SetStateAction<boolean>>;
    productData: any;
    saleBillingModes: any[];
    packagingLevels: IFPackagingLevel[];
}

const costMethods = [
    { id: 'standard', name: 'Estándar' },
    { id: 'fifo', name: 'FIFO' },
    { id: 'average', name: 'Promedio' }
];

interface StatefulCheckBoxProps {
    label: string;
    value: boolean;
    onChange?: (value: boolean) => void;
    readOnly?: boolean;
    disabled?: boolean;
}

const StatefulCheckBox = ({ label, value: defaultValue, onChange, readOnly, disabled }: StatefulCheckBoxProps) => {
    const [value, setValue] = useState(defaultValue);

    React.useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    return (
        <CheckBox
            text={label}
            value={value}
            readOnly={readOnly}
            disabled={disabled}
            onValueChanged={(e) => {
                const newVal = !!e.value;
                setValue(newVal);
                onChange?.(newVal);
            }}
        />
    );
};

const ItemsSection = (props: IItemsSectionProps) => {
    const {
        uoms,
        formRef,
        itemsData,
        setItemsData,
        currentItem,
        setCurrentItem,
        currentCompany,
        canCreatePresentation,
        setIsAddingItem,
        isAddingItem,
        productData,
        saleBillingModes,
        packagingLevels
    } = props;

    const { token } = useAuth();
    const [currencies, setCurrencies] = useState<IFCurrency[]>([]);
    const [suppliers, setSuppliers] = useState<IFProvider[]>([]);
    const [platforms, setPlatforms] = useState<IFCommercialPlatform[]>([]);
    /** Remount del Form al cargar un ítem para edición / limpiar borrador */
    const [itemFormKey, setItemFormKey] = useState(0);
    const [editingTempId, setEditingTempId] = useState<string | null>(null);
    const editSnapshotRef = useRef<any>(null);
    const editIndexRef = useRef<number>(-1);

    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        Promise.all([
            currenciesService.getAll(token),
            providerService.getAll(token, currentCompany),
            commercialPlatformsService.getAll({ companyId: currentCompany, limit: 500, offset: 0 }, token),
        ])
            .then(([currRes, provRes, platRes]) => {
                if (cancelled) return;
                setCurrencies(currRes?.items || []);
                setSuppliers(provRes?.items || []);
                setPlatforms(platRes?.items || []);
            })
            .catch(console.error);
        return () => {
            cancelled = true;
        };
    }, [token, currentCompany]);

    const hasItems = itemsData.length > 0;
    const isEditing = !!editingTempId;

    const cloneItemForForm = (item: any) => ({
        ...item,
        suppliers: (item.suppliers || []).map((s: any) => ({ ...s })),
        presentations: (item.presentations || []).map((p: any) => ({ ...p })),
        platformIds: [...(item.platformIds || [])],
        media: [...(item.media || [])],
    });

    const selectedMode = saleBillingModes?.find((m: any) => m.code === productData.saleBillingModeCode);
    const requiresSecondaryUom = selectedMode ? (selectedMode.requiresSecondaryUom || selectedMode.isDualUom) : false;
    const isService = productData?.classification === 'SERVICIO';

    // If it's a service, force isInventoryItem to false in the current item
    useEffect(() => {
        if (isService && currentItem.isInventoryItem) {
            currentItem.isInventoryItem = false;
        }
    }, [isService, currentItem.isInventoryItem]);

    const notifyBrokenRules = (result: any, fallback: string) => {
        const messages = [...new Set(
            (result?.brokenRules || [])
                .map((r: any) => r?.message)
                .filter((m: unknown): m is string => typeof m === "string" && m.trim().length > 0)
        )];
        if (messages.length === 0) {
            notify(fallback, "warning", 3500);
            return;
        }
        if (messages.length === 1) {
            notify(messages[0], "warning", 3500);
            return;
        }
        notify(`Revise el ítem: ${messages.slice(0, 4).join(" · ")}${messages.length > 4 ? "…" : ""}`, "warning", 5000);
    };

    const addItem = () => {
        const result = formRef.current?.instance().validate();
        if (!result?.isValid) {
            notifyBrokenRules(
                result,
                "Complete los campos obligatorios del ítem (SKU, método de costo y UoM de pallet, entre otros)"
            );
            const firstBroken = result?.brokenRules?.[0];
            firstBroken?.validator?.focus?.();
            return;
        }

        // Validar que ningún proveedor tenga supplierSku vacío
        if (Array.isArray(currentItem.suppliers) && currentItem.suppliers.length > 0) {
            const invalidSupplier = currentItem.suppliers.find((s: any) => !(s.supplierSku || s.supplier_sku || "").trim());
            if (invalidSupplier) {
                notify("Todos los proveedores vinculados deben tener un Código de Proveedor (SKU)", "error", 3500);
                return;
            }
        }

        // Cada nivel de empaque con presentaciones debe tener exactamente una principal
        const presentations = currentItem.presentations || [];
        if (presentations.length > 0) {
            const levelIds = [...new Set(presentations.map((p: any) => p.packagingLevelId).filter(Boolean))];
            for (const levelId of levelIds) {
                const levelPresentations = presentations.filter((p: any) => p.packagingLevelId === levelId);
                const primaryCount = levelPresentations.filter((p: any) => p.isPrimary).length;
                const levelName = packagingLevels.find((pl) => pl.id === levelId)?.name || "desconocido";
                if (primaryCount === 0) {
                    notify(
                        `El nivel de empaque «${levelName}» necesita al menos una presentación marcada como principal`,
                        "error",
                        4500
                    );
                    return;
                }
                if (primaryCount > 1) {
                    // Autocorregir: dejar solo la primera como principal
                    let kept = false;
                    levelPresentations.forEach((p: any) => {
                        if (p.isPrimary && !kept) {
                            kept = true;
                        } else {
                            p.isPrimary = false;
                        }
                    });
                }
            }
        }

        const saved = {
            ...currentItem,
            active: currentItem.active !== undefined ? currentItem.active : true,
            isDualUom: requiresSecondaryUom,
            tempId: editingTempId || generateUUID(),
            presentations: [...(currentItem.presentations || [])],
            media: [...(currentItem.media || [])],
            suppliers: [...(currentItem.suppliers || [])],
            platformIds: [...(currentItem.platformIds || [])],
        };

        if (editingTempId) {
            const insertAt = editIndexRef.current;
            setItemsData((prev) => {
                const next = [...prev];
                if (insertAt >= 0 && insertAt <= next.length) {
                    next.splice(insertAt, 0, saved);
                } else {
                    next.push(saved);
                }
                return next;
            });
            editSnapshotRef.current = null;
            editIndexRef.current = -1;
            setEditingTempId(null);
        } else {
            setItemsData((prev) => [...prev, saved]);
        }

        setCurrentItem(createEmptyItem(currentCompany));
        setItemFormKey((k) => k + 1);
        setIsAddingItem(false);
    };

    const removeItem = (tempId: string) => {
        setItemsData((prev) => prev.filter((i) => i.tempId !== tempId));
    };

    const startEditItem = (tempId: string) => {
        if (isAddingItem) {
            const dirty =
                !!(currentItem.sku || "").trim() ||
                !!(currentItem.itemName || "").trim() ||
                (currentItem.presentations || []).length > 0 ||
                (currentItem.suppliers || []).length > 0 ||
                (currentItem.media || []).length > 0 ||
                isEditing;
            if (dirty) {
                notify(
                    isEditing
                        ? "Guarde o descarte el ítem en edición antes de editar otro"
                        : "Confirme o descarte el ítem en borrador antes de editar uno confirmado",
                    "warning",
                    4500
                );
                return;
            }
        }

        const index = itemsData.findIndex((i) => i.tempId === tempId);
        const item = index >= 0 ? itemsData[index] : null;
        if (!item) return;

        editSnapshotRef.current = cloneItemForForm(item);
        editIndexRef.current = index;
        setItemsData((prev) => prev.filter((i) => i.tempId !== tempId));
        setEditingTempId(tempId);
        setCurrentItem(cloneItemForForm(item));
        setItemFormKey((k) => k + 1);
        setIsAddingItem(true);
    };

    /** Descarta el borrador; si era edición, restaura el ítem confirmado original */
    const clearAll = () => {
        if (editingTempId && editSnapshotRef.current) {
            const snapshot = editSnapshotRef.current;
            const insertAt = editIndexRef.current;
            setItemsData((prev) => {
                const next = [...prev];
                if (insertAt >= 0 && insertAt <= next.length) {
                    next.splice(insertAt, 0, snapshot);
                } else {
                    next.push(snapshot);
                }
                return next;
            });
            editSnapshotRef.current = null;
            editIndexRef.current = -1;
            setEditingTempId(null);
        }
        setCurrentItem(createEmptyItem(currentCompany));
        setItemFormKey((k) => k + 1);
        setIsAddingItem(false);
    };

    return (
        <div>
            {isAddingItem &&
                <div className="p-4 bg-primary-0/40 rounded-dx border-1 border-focus-100/30 relative">
                    <div className="flex justify-between items-center mb-4 pr-8">
                        <h3 className="text-lg">{isEditing ? "Editar ítem" : "Añadir Items"}</h3>
                        {(hasItems || isEditing) &&
                            <Button
                                icon="trash"
                                type="danger"
                                stylingMode="text"
                                hint={isEditing ? "Descartar cambios" : "Descartar borrador"}
                                className="!absolute top-4 right-4"
                                onClick={clearAll}
                            />
                        }
                    </div>
                    <Form
                        key={itemFormKey}
                        ref={formRef}
                        formData={currentItem}
                        labelLocation="top"
                        scrollingEnabled={false}
                        colCount={4}
                    >
                        {/* Group Item for all item inputs to isolate them from the presentations block */}
                        <GroupItem colSpan={4} colCount={4} cssClass="!p-0">
                            <SimpleItem
                                dataField="itemName"
                                label={{ text: "Nombre de Item" }}
                                editorType="dxTextBox"
                                editorOptions={{
                                    placeholder: productData?.name || "Nombre del Producto por defecto",
                                    valueChangeEvent: "blur",
                                    stylingMode: 'filled',
                                    maxLength: FIELD_LIMITS.stringLong,
                                }}
                            >
                                <CustomRule
                                    message="Este nombre ya existe en la lista"
                                    reevaluate={true}
                                    validationCallback={(e) => {
                                        const val = typeof e.value === 'string' ? e.value.trim().toLowerCase() : '';
                                        if (!val) return true;
                                        return !itemsData.some(i => i.itemName.trim().toLowerCase() === val);
                                    }}
                                />
                            </SimpleItem>

                            <SimpleItem
                                dataField="sku"
                                label={{ text: "SKU" }}
                                editorType="dxTextBox"
                                editorOptions={{
                                    placeholder: "Identificador único",
                                    valueChangeEvent: "blur",
                                    stylingMode: 'filled',
                                    maxLength: FIELD_LIMITS.stringShort,
                                }}
                            >
                                <RequiredRule message="El SKU es obligatorio" />
                                <CustomRule
                                    message="Este SKU ya existe en la lista"
                                    reevaluate={true}
                                    validationCallback={(e) => {
                                        const val = typeof e.value === 'string' ? e.value.trim().toLowerCase() : '';
                                        return !itemsData.some(i => i.sku.trim().toLowerCase() === val);
                                    }}
                                />
                                <AsyncRule
                                    message="Este SKU ya está registrado en el catálogo"
                                    validationCallback={async (e) => {
                                        const val = typeof e.value === 'string' ? e.value.trim() : '';
                                        if (!val || !token) return true;
                                        try {
                                            const res = await itemsService.checkSkuAvailability({
                                                sku: val,
                                                companyId: currentCompany
                                            }, token);
                                            return res.available;
                                        } catch {
                                            return true;
                                        }
                                    }}
                                />
                            </SimpleItem>

                            <SimpleItem
                                dataField="companyId"
                                label={{ text: "Compañía" }}
                                editorType="dxSelectBox"
                                visible={false}
                                editorOptions={{
                                    dataSource: [currentCompany],
                                    valueExpr: "id",
                                    displayExpr: "name",
                                    readOnly: true,
                                    stylingMode: 'filled',
                                }}
                                validationRules={[{ type: 'required', message: "La compañía es obligatoria" }]}
                            />

                            <SimpleItem
                                dataField="costMethod"
                                label={{ text: "Método de Costo" }}
                                editorType="dxSelectBox"
                                editorOptions={{
                                    dataSource: costMethods,
                                    valueExpr: "id",
                                    displayExpr: "name",
                                    stylingMode: 'filled',
                                    dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } }
                                }}
                                validationRules={[{ type: 'required', message: "El método de costo es obligatorio" }]}
                            />

                            <SimpleItem
                                dataField="weight"
                                label={{ text: "Peso" }}
                                editorType="dxNumberBox"
                                editorOptions={{
                                    min: 0,
                                    max: FIELD_LIMITS.decimalMax,
                                    valueChangeEvent: "blur",
                                    stylingMode: 'filled',
                                }}
                                validationRules={[{ type: 'range', max: FIELD_LIMITS.decimalMax, message: FIELD_LIMITS.decimalMaxMessage }]}
                            />
                            <SimpleItem
                                dataField="volume"
                                label={{ text: "Volumen" }}
                                editorType="dxNumberBox"
                                editorOptions={{
                                    min: 0,
                                    max: FIELD_LIMITS.decimalMax,
                                    valueChangeEvent: "blur",
                                    stylingMode: 'filled',
                                }}
                                validationRules={[{ type: 'range', max: FIELD_LIMITS.decimalMax, message: FIELD_LIMITS.decimalMaxMessage }]}
                            />
                            <SimpleItem
                                dataField="palletUnits"
                                label={{ text: "Unidades por Pallet" }}
                                editorType="dxNumberBox"
                                editorOptions={{
                                    min: 0,
                                    max: FIELD_LIMITS.smallIntMax,
                                    valueChangeEvent: "blur",
                                    stylingMode: 'filled',
                                }}
                                validationRules={[{ type: 'range', min: 0, max: FIELD_LIMITS.smallIntMax, message: FIELD_LIMITS.smallIntMaxMessage }]}
                            />
                            <SimpleItem
                                dataField="palletUomId"
                                label={{ text: "U. Medida Pallet" }}
                                editorType="dxSelectBox"
                                editorOptions={{
                                    dataSource: uoms,
                                    valueExpr: "id",
                                    displayExpr: "name",
                                    searchEnabled: true,
                                    stylingMode: 'filled',
                                    dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } }
                                }}
                                validationRules={[{ type: 'required', message: "La UoM de Pallet es obligatoria" }]}
                            />

                            <SimpleItem
                                dataField="uomRatio"
                                label={{ text: "Ratio de Unidad" }}
                                editorType="dxNumberBox"
                                visible={requiresSecondaryUom}
                                editorOptions={{
                                    min: 0,
                                    max: FIELD_LIMITS.decimalMax,
                                    valueChangeEvent: "blur",
                                    stylingMode: 'filled',
                                    placeholder: "Ej: 4.15"
                                }}
                                validationRules={[{ type: 'range', max: FIELD_LIMITS.decimalMax, message: FIELD_LIMITS.decimalMaxMessage }]}
                            >
                                {requiresSecondaryUom && <RequiredRule message="El ratio de unidad es obligatorio" />}
                            </SimpleItem>

                            <SimpleItem
                                dataField="currencyId"
                                label={{ text: "Moneda de Venta" }}
                                editorType="dxSelectBox"
                                editorOptions={{
                                    dataSource: currencies,
                                    valueExpr: "id",
                                    displayExpr: "name",
                                    searchEnabled: true,
                                    showClearButton: true,
                                    stylingMode: 'filled',
                                    placeholder: "Moneda de la compañía (si no elige)",
                                    hint: "Sin selección, se usa la moneda base de la compañía",
                                    dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } }
                                }}
                            />

                        </GroupItem>

                        <GroupItem colSpan={4} colCount={1} cssClass="!p-0 mt-3">
                            <SimpleItem colSpan={4} label={{ visible: false }} cssClass="!p-0">
                                {/* Contenedor aislado: evita que dxForm intercepte clics del bloque de proveedores */}
                                <div className="relative z-10" onMouseDown={(e) => e.stopPropagation()}>
                                    <ItemSuppliersManagement
                                        currentItem={currentItem}
                                        suppliers={suppliers}
                                        itemsData={itemsData}
                                        token={token}
                                        currentCompany={currentCompany}
                                    />
                                </div>
                            </SimpleItem>

                            <SimpleItem
                                dataField="platformIds"
                                label={{ text: "Plataformas Comerciales" }}
                                editorType="dxTagBox"
                                editorOptions={{
                                    dataSource: platforms,
                                    valueExpr: "id",
                                    displayExpr: "name",
                                    searchEnabled: true,
                                    showClearButton: true,
                                    stylingMode: 'filled',
                                    placeholder: "Seleccione plataformas...",
                                    width: "100%",
                                    dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } }
                                }}
                            />
                        </GroupItem>

                        <GroupItem colSpan={4} colCount={4} cssClass="!p-0 mt-4">
                            <SimpleItem colSpan={4} label={{ visible: false }} cssClass="!p-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-2">
                                    <CheckboxContainer
                                        description="Permite el registro de dos unidades de medida diferentes para el mismo artículo."
                                        showTooltip={true}
                                    >
                                        <StatefulCheckBox
                                            label="U.Medida Doble"
                                            value={requiresSecondaryUom}
                                            readOnly
                                            disabled
                                        />
                                    </CheckboxContainer>

                                    <CheckboxContainer
                                        description="Determina si el artículo se almacena en inventario y realiza movimientos de stock."
                                        showTooltip={true}
                                    >
                                        <StatefulCheckBox
                                            label="Controla Stock"
                                            value={currentItem.isInventoryItem}
                                            onChange={(val) => {
                                                currentItem.isInventoryItem = val;
                                            }}
                                        />
                                    </CheckboxContainer>

                                    <CheckboxContainer
                                        description="Exige el registro de fecha de caducidad para este lote de artículos."
                                        showTooltip={true}
                                    >
                                        <StatefulCheckBox
                                            label="Requiere Vencimiento"
                                            value={currentItem.requiresExpiry}
                                            onChange={(val) => {
                                                currentItem.requiresExpiry = val;
                                            }}
                                        />
                                    </CheckboxContainer>

                                    <CheckboxContainer
                                        description="Permite realizar el seguimiento individual de cada unidad mediante un número de serie único."
                                        showTooltip={true}
                                    >
                                        <StatefulCheckBox
                                            label="Es Serializable"
                                            value={currentItem.isSerializable}
                                            onChange={(val) => {
                                                currentItem.isSerializable = val;
                                            }}
                                        />
                                    </CheckboxContainer>

                                    <CheckboxContainer
                                        description="Habilita la recepción y entrega de mercadería bajo la modalidad de consignación."
                                        showTooltip={true}
                                    >
                                        <StatefulCheckBox
                                            label="Admite Consignación"
                                            value={currentItem.isConsignmentItem}
                                            onChange={(val) => {
                                                currentItem.isConsignmentItem = val;
                                            }}
                                        />
                                    </CheckboxContainer>

                                    <CheckboxContainer
                                        description="Define si el artículo se encuentra activo en el sistema para operaciones comerciales."
                                        showTooltip={true}
                                    >
                                        <StatefulCheckBox
                                            label="Activo"
                                            value={currentItem.active}
                                            onChange={(val) => {
                                                currentItem.active = val;
                                            }}
                                        />
                                    </CheckboxContainer>
                                </div>
                            </SimpleItem>
                        </GroupItem>

                        {/* Presentations Group is now guaranteed to occupy its own row underneath */}
                        <GroupItem
                            caption="Presentaciones"
                            colSpan={4}
                            colCount={4}
                            cssClass="!bg-primary-300 px-4 rounded-dx shadow-inner shadow-black/25 mt-4"
                        >
                            <SimpleItem colSpan={4} cssClass="!p-0" label={{ visible: false }}>
                                <PresentationsManagement
                                    currentItem={currentItem}
                                    setCurrentItem={setCurrentItem}
                                    uoms={uoms}
                                    itemsData={itemsData}
                                    packagingLevels={packagingLevels}
                                />
                            </SimpleItem>
                        </GroupItem>

                        {/* Imágenes del Ítem */}
                        <GroupItem
                            caption="Imágenes del Ítem"
                            colSpan={4}
                            colCount={4}
                            cssClass="!bg-primary-300 px-4 rounded-dx shadow-inner shadow-black/25 mt-4"
                        >
                            <SimpleItem colSpan={4} cssClass="!p-0" label={{ visible: false }}>
                                <ItemMediaUploadSection
                                    media={currentItem.media || []}
                                    onChange={(newMedia) => {
                                        // Mutación in-place: no reemplazar currentItem (rompe Form / proveedores)
                                        currentItem.media = newMedia;
                                    }}
                                />
                            </SimpleItem>
                        </GroupItem>
                    </Form>
                    <div className="flex justify-end mt-4">
                        <Button
                            type="default"
                            stylingMode="contained"
                            text={isEditing ? "Guardar cambios del ítem" : "Confirmar item y sus presentaciones"}
                            onClick={addItem}
                            className="!bg-focus-300 shadow-lg shadow-black/20 !text-variant"
                        />
                    </div>
                </div>
            }

            <h2 className="text-lg my-4">Items confirmados <span>({itemsData.length})</span></h2>
            {hasItems ?
                <ItemsCreatedList
                    itemsData={itemsData}
                    uoms={uoms}
                    costMethods={costMethods}
                    removeItem={removeItem}
                    onEditItem={startEditItem}
                    canCreatePresentation={canCreatePresentation}
                    setItemsData={setItemsData}
                    setIsAddingItem={setIsAddingItem}
                    packagingLevels={packagingLevels}
                    productData={productData}
                    currencies={currencies}
                    suppliers={suppliers}
                    platforms={platforms}
                />
                :
                <div className="mt-2 p-4 bg-main/5 rounded-dx">
                    <p className="text-sm  opacity-60">No se han añadido items</p>
                </div>
            }
        </div>
    );
};

export default ItemsSection;
