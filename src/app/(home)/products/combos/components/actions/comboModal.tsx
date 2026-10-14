"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Button, SelectBox } from "@repo/devextreme";
import { TextBox } from "devextreme-react/text-box";
import NumberBox from "devextreme-react/number-box";
import TagBox from "devextreme-react/tag-box";
import { Validator, RequiredRule, CustomRule, RangeRule } from "devextreme-react/validator";
import notify from "devextreme/ui/notify";
import { useAuth } from "@/contexts/AuthContext";
import { combosService } from "@/app/services/combos.service";
import { uomsService } from "@/app/services/product_services/uoms.service";
import { categoriesService } from "@/app/services/product_services/categories.service";
import { brandsService } from "@/app/services/product_services/brand.service";
import { saleBillingModesService } from "@/app/services/product_services/saleBillingModes.service";
import {
    IFCombo,
    TFComboType,
    TFProcurementType,
    IFComboComponent,
    IFSaleBillingMode,
    IFUOM,
    IFCompositionData
} from "@repo/api-contracts/erp";
import {
    PROCUREMENT_TYPES_OPTIONS,
    COMBO_TYPE_OPTIONS,
    DEFAULT_COMBO_DESCRIPTIONS,
    DEFAULT_SALE_BILLING_DESCRIPTION
} from "@/app/lib/constants/combos.constants";

interface ComboModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    initialData?: IFCombo | null;
}

const emptyComboFormData = {
    name: "",
    skuPrefix: "PACK-",
    procurementType: "BUY" as TFProcurementType,
    uomId: "",
    defaultSecUomId: null as string | null,
    saleBillingModeCode: "",
    categoryId: null as string | null,
    brandId: null as string | null,
    active: true
};

export default function ComboModal({
    isOpen,
    onClose,
    onSuccess,
    onHidden,
    initialData
}: ComboModalProps) {
    const { token, currentCompany } = useAuth();
    const isEditing = Boolean(initialData?.id);
    const [submitting, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);

    // Cabecera del producto
    const [formData, setFormData] = useState(emptyComboFormData);

    // Composición
    const [comboType, setComboType] = useState<TFComboType>("FIXED");
    const [fixedComponents, setFixedComponents] = useState<IFComboComponent[]>([]);
    const [dynamicLabel, setDynamicLabel] = useState("");
    const [dynamicMinQty, setDynamicMinQty] = useState<number>(1);
    const [dynamicMaxQty, setDynamicMaxQty] = useState<number>(1);
    const [allowedItemIds, setAllowedItemIds] = useState<string[]>([]);

    // Catálogos auxiliares
    const [rawUoms, setRawUoms] = useState<IFUOM[]>([]);
    const [categories, setCategories] = useState<Array<{ id: string; label: string }>>([]);
    const [brands, setBrands] = useState<Array<{ id: string; label: string }>>([]);
    const [saleBillingModes, setSaleBillingModes] = useState<IFSaleBillingMode[]>([]);
    const [itemOptions, setItemOptions] = useState<Array<{ id: string; label: string }>>([]);

    const uomEditorRef = useRef<any>(null);
    const secUomEditorRef = useRef<any>(null);
    const saleBillingModeEditorRef = useRef<any>(null);
    const initialPrimaryUomsRef = useRef<IFUOM[]>([]);
    const initialSecUomsRef = useRef<IFUOM[]>([]);
    const initialSecUomDisabledRef = useRef<boolean>(true);

    // Cargar catálogos
    useEffect(() => {
        if (!isOpen || !token) return;

        const loadCatalogs = async () => {
            try {
                const companyId = currentCompany?.id || "";
                const [uomRes, catRes, brandRes, sbmRes, itemsRes] = await Promise.allSettled([
                    uomsService.getAll({ limit: 500, offset: 0 }, token),
                    categoriesService.getAll(companyId, { limit: 100, offset: 0 }, token),
                    brandsService.getAll(companyId, { limit: 100, offset: 0 }, token),
                    saleBillingModesService.getAll(token, companyId),
                    combosService.getItemOptions(companyId, { limit: 200 }, token)
                ]);

                let loadedUoms: IFUOM[] = [];
                let loadedSbms: IFSaleBillingMode[] = [];

                if (uomRes.status === "fulfilled" && uomRes.value?.items) {
                    loadedUoms = uomRes.value.items;
                    setRawUoms(loadedUoms);
                }
                if (catRes.status === "fulfilled") {
                    setCategories(catRes.value.items.map(c => ({ id: c.id, label: c.name })));
                }
                if (brandRes.status === "fulfilled") {
                    setBrands(brandRes.value.items.map(b => ({ id: b.id, label: b.name })));
                }
                if (sbmRes.status === "fulfilled" && sbmRes.value) {
                    loadedSbms = sbmRes.value;
                    setSaleBillingModes(loadedSbms);
                }
                if (itemsRes.status === "fulfilled" && itemsRes.value?.items) {
                    const list = itemsRes.value.items.map(i => ({
                        id: i.id,
                        label: i.label || i.code || i.id
                    }));

                    // Preservar elementos en caso de edición si no figuraran en los primeros 200
                    const existingIds = new Set(list.map(i => i.id));
                    if (initialData?.compositionData?.fixedComponents) {
                        for (const fc of initialData.compositionData.fixedComponents) {
                            if (fc.itemId && !existingIds.has(fc.itemId)) {
                                list.push({ id: fc.itemId, label: `Artículo (${fc.itemId.slice(0, 8)})` });
                                existingIds.add(fc.itemId);
                            }
                        }
                    }
                    if (initialData?.compositionData?.dynamicSelection?.allowedItemIds) {
                        for (const id of initialData.compositionData.dynamicSelection.allowedItemIds) {
                            if (id && !existingIds.has(id)) {
                                list.push({ id, label: `Artículo (${id.slice(0, 8)})` });
                                existingIds.add(id);
                            }
                        }
                    }

                    setItemOptions(list);
                }

                // Resolver el código de modo de venta para precargar
                let activeModeCode = initialData?.saleBillingModeCode;
                if (!activeModeCode && initialData?.saleBillingModeId) {
                    const matched = loadedSbms.find(m => m.id === initialData.saleBillingModeId);
                    if (matched) activeModeCode = matched.code;
                }
                if (!activeModeCode) {
                    activeModeCode = emptyComboFormData.saleBillingModeCode;
                }

                if (saleBillingModeEditorRef.current) {
                    saleBillingModeEditorRef.current.option("dataSource", loadedSbms);
                    if (activeModeCode) {
                        saleBillingModeEditorRef.current.option("value", activeModeCode);
                    }
                }

                // Filtrar UoMs coherentes al cargar catálogo
                const mode = loadedSbms.find(m => m.code === activeModeCode);
                initialPrimaryUomsRef.current = mode?.billingUomCategoryId
                    ? loadedUoms.filter(u => u.categoryId === mode.billingUomCategoryId)
                    : loadedUoms;

                initialSecUomsRef.current = (mode?.requiresSecondaryUom && mode?.secondaryUomCategoryId)
                    ? loadedUoms.filter(u => u.categoryId === mode.secondaryUomCategoryId)
                    : [];
                initialSecUomDisabledRef.current = !mode?.requiresSecondaryUom;

                if (uomEditorRef.current) {
                    uomEditorRef.current.option("dataSource", initialPrimaryUomsRef.current);
                }
                if (secUomEditorRef.current) {
                    secUomEditorRef.current.option("dataSource", initialSecUomsRef.current);
                    secUomEditorRef.current.option("disabled", initialSecUomDisabledRef.current);
                }
            } catch (err) {
                console.error("Error al cargar catálogos para comboModal:", err);
            }
        };

        loadCatalogs();
    }, [isOpen, token, currentCompany?.id, initialData]);

    // Regla 9: Inicializar formData únicamente en useEffect con reseteo explícito de DevExtreme Form
    useEffect(() => {
        if (!isOpen) return;

        // Resolver modo de venta desde code o id
        let resolvedModeCode = initialData?.saleBillingModeCode;
        if (!resolvedModeCode && initialData?.saleBillingModeId && saleBillingModes.length > 0) {
            const matched = saleBillingModes.find(m => m.id === initialData.saleBillingModeId);
            if (matched) resolvedModeCode = matched.code;
        }

        let nextData = emptyComboFormData;
        if (initialData) {
            nextData = {
                name: initialData.name || "",
                skuPrefix: initialData.skuPrefix || "",
                procurementType: initialData.procurementType || "BUY",
                uomId: initialData.uomId || "",
                defaultSecUomId: initialData.defaultSecUomId || null,
                saleBillingModeCode: resolvedModeCode || initialData.saleBillingModeCode || "",
                categoryId: initialData.categoryId || null,
                brandId: initialData.brandId || null,
                active: initialData.active ?? true
            };
            setFormData(nextData);

            const compData = initialData.compositionData;
            if (compData) {
                setComboType(compData.comboType || "FIXED");
                setFixedComponents(
                    Array.isArray(compData.fixedComponents) && compData.fixedComponents.length > 0
                        ? compData.fixedComponents.map(c => ({ itemId: c.itemId, quantity: c.quantity }))
                        : []
                );
                if (compData.dynamicSelection) {
                    setDynamicLabel(compData.dynamicSelection.label || "");
                    setDynamicMinQty(compData.dynamicSelection.minQty ?? 1);
                    setDynamicMaxQty(compData.dynamicSelection.maxQty ?? 1);
                    setAllowedItemIds(compData.dynamicSelection.allowedItemIds || []);
                } else {
                    setDynamicLabel("");
                    setDynamicMinQty(1);
                    setDynamicMaxQty(1);
                    setAllowedItemIds([]);
                }
            } else {
                setComboType("FIXED");
                setFixedComponents([]);
                setDynamicLabel("");
                setDynamicMinQty(1);
                setDynamicMaxQty(1);
                setAllowedItemIds([]);
            }
        } else {
            // Formulario nuevo
            setFormData(emptyComboFormData);
            setComboType("FIXED");
            setFixedComponents([{ itemId: "", quantity: 1 }]);
            setDynamicLabel("");
            setDynamicMinQty(1);
            setDynamicMaxQty(1);
            setAllowedItemIds([]);
        }

        const activeModeToUse = resolvedModeCode || nextData.saleBillingModeCode;
        if (saleBillingModes && saleBillingModes.length > 0) {
            const mode = saleBillingModes.find(m => m.code === activeModeToUse);
            initialPrimaryUomsRef.current = mode?.billingUomCategoryId
                ? rawUoms.filter(u => u.categoryId === mode.billingUomCategoryId)
                : rawUoms;

            initialSecUomsRef.current = (mode?.requiresSecondaryUom && mode?.secondaryUomCategoryId)
                ? rawUoms.filter(u => u.categoryId === mode.secondaryUomCategoryId)
                : [];
            initialSecUomDisabledRef.current = !mode?.requiresSecondaryUom;

            if (saleBillingModeEditorRef.current) {
                saleBillingModeEditorRef.current.option("dataSource", saleBillingModes);
                if (activeModeToUse) {
                    saleBillingModeEditorRef.current.option("value", activeModeToUse);
                }
            }
            if (uomEditorRef.current) {
                uomEditorRef.current.option("dataSource", initialPrimaryUomsRef.current);
            }
            if (secUomEditorRef.current) {
                secUomEditorRef.current.option("dataSource", initialSecUomsRef.current);
                secUomEditorRef.current.option("disabled", initialSecUomDisabledRef.current);
            }
        }

        // Actualizar descripción de modo de venta nativamente en DOM
        const mode = saleBillingModes.find(m => m.code === activeModeToUse);
        if (descriptionRef.current) {
            descriptionRef.current.textContent = mode?.description || DEFAULT_SALE_BILLING_DESCRIPTION;
        }

        // Reseteo profundo de la instancia de DevExtreme Form
        setTimeout(() => {
            const formInstance = formRef.current?.instance();
            if (formInstance) {
                formInstance.option("formData", nextData);
                if (typeof formInstance.reset === "function") {
                    formInstance.reset();
                }
                formInstance.option("formData", nextData);
                if (activeModeToUse) {
                    formInstance.updateData("saleBillingModeCode", activeModeToUse);
                    if (saleBillingModeEditorRef.current) {
                        saleBillingModeEditorRef.current.option("value", activeModeToUse);
                    }
                }
            }
        }, 0);
    }, [isOpen, initialData, saleBillingModes, rawUoms]);

    // Regla 5: Limpieza estricta en onHidden
    const handleHidden = useCallback(() => {
        setFormData(emptyComboFormData);
        setComboType("FIXED");
        setFixedComponents([]);
        setDynamicLabel("");
        setDynamicMinQty(1);
        setDynamicMaxQty(1);
        setAllowedItemIds([]);
        setItemOptions([]);
        initialPrimaryUomsRef.current = [];
        initialSecUomsRef.current = [];
        initialSecUomDisabledRef.current = true;
        saleBillingModeEditorRef.current = null;
        uomEditorRef.current = null;
        secUomEditorRef.current = null;
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    // Gestión de filas de componentes fijos
    const handleAddFixedComponent = useCallback(() => {
        setFixedComponents(prev => [...prev, { itemId: "", quantity: 1 }]);
    }, []);

    const handleRemoveFixedComponent = useCallback((index: number) => {
        setFixedComponents(prev => prev.filter((_, idx) => idx !== index));
    }, []);

    const handleUpdateFixedComponent = useCallback((index: number, field: "itemId" | "quantity", value: any) => {
        setFixedComponents(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    }, []);

    // Callbacks memoizados para controles
    const handleDynamicLabelChange = useCallback((e: any) => {
        setDynamicLabel(e.value || "");
    }, []);

    const handleDynamicMinQtyChange = useCallback((e: any) => {
        setDynamicMinQty(Number(e.value));
    }, []);

    const handleDynamicMaxQtyChange = useCallback((e: any) => {
        setDynamicMaxQty(Number(e.value));
    }, []);

    const handleAllowedItemsChange = useCallback((e: any) => {
        setAllowedItemIds(e.value || []);
    }, []);

    // Comprobación reactiva para bloquear el botón de guardado hasta que se cumplan las reglas de composición
    const isSubmitDisabled = useMemo(() => {
        if (submitting) return true;
        if (comboType === "FIXED") {
            if (fixedComponents.length === 0) return true;
            const hasInvalid = fixedComponents.some(c => !c.itemId || !c.quantity || c.quantity <= 0);
            if (hasInvalid) return true;
            const ids = fixedComponents.map(c => c.itemId);
            if (new Set(ids).size !== ids.length) return true;
        } else {
            // DYNAMIC
            if (!dynamicLabel.trim()) return true;
            if (dynamicMinQty < 0 || dynamicMaxQty < dynamicMinQty) return true;
            if (!allowedItemIds || allowedItemIds.length === 0) return true;
            const hasInvalidOptional = fixedComponents.some(c => c.itemId && (!c.quantity || c.quantity <= 0));
            if (hasInvalidOptional) return true;
        }
        return false;
    }, [submitting, comboType, fixedComponents, dynamicLabel, dynamicMinQty, dynamicMaxQty, allowedItemIds]);

    // Validación y guardado
    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        if (!currentCompany?.id) return;

        const currentFormData = formInstance?.option("formData") || formData;
        const selectedMode = saleBillingModes.find(m => m.code === currentFormData.saleBillingModeCode);
        const validFixed = fixedComponents.filter(c => Boolean(c.itemId) && c.quantity > 0);

        const compositionData: IFCompositionData = {
            comboType,
            fixedComponents: comboType === "FIXED" || validFixed.length > 0
                ? validFixed.map(c => ({ itemId: c.itemId, quantity: Number(c.quantity) }))
                : undefined,
            dynamicSelection: comboType === "DYNAMIC" ? {
                label: dynamicLabel.trim(),
                minQty: Math.max(0, Math.floor(Number(dynamicMinQty))),
                maxQty: Math.max(Number(dynamicMinQty), Math.floor(Number(dynamicMaxQty))),
                allowedItemIds
            } : undefined
        };

        setLoading(true);
        try {
            if (isEditing && initialData?.id) {
                await combosService.updateCombo(
                    initialData.id,
                    initialData.itemId,
                    {
                        product: {
                            name: currentFormData.name.trim(),
                            uomId: currentFormData.uomId,
                            defaultSecUomId: selectedMode?.requiresSecondaryUom ? currentFormData.defaultSecUomId : null,
                            saleBillingModeCode: selectedMode?.code,
                            saleBillingModeId: selectedMode?.id,
                            procurementType: currentFormData.procurementType || "BUY",
                            categoryId: currentFormData.categoryId,
                            brandId: currentFormData.brandId,
                            active: currentFormData.active
                        },
                        item: {
                            compositionData
                        }
                    },
                    token,
                    currentCompany.id
                );
                notify("Combo actualizado correctamente", "success", 3000);
            } else {
                await combosService.createCombo(
                    currentCompany.id,
                    {
                        product: {
                            name: currentFormData.name.trim(),
                            classification: "COMBO",
                            skuPrefix: currentFormData.skuPrefix.trim().toUpperCase(),
                            procurementType: currentFormData.procurementType || "BUY",
                            uomId: currentFormData.uomId,
                            defaultSecUomId: selectedMode?.requiresSecondaryUom ? currentFormData.defaultSecUomId : null,
                            saleBillingModeCode: selectedMode?.code,
                            saleBillingModeId: selectedMode?.id,
                            companyId: currentCompany.id,
                            categoryId: currentFormData.categoryId,
                            brandId: currentFormData.brandId,
                            active: currentFormData.active
                        },
                        item: {
                            sku: `${currentFormData.skuPrefix.trim().toUpperCase()}001`,
                            itemName: currentFormData.name.trim(),
                            companyId: currentCompany.id,
                            compositionData
                        }
                    },
                    token
                );
                notify("Combo creado exitosamente", "success", 3000);
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error al guardar combo:", error);
            const message = error?.message || `Ocurrió un error al intentar ${isEditing ? "actualizar" : "crear"} el combo`;
            notify(message, "error", 4000);
        } finally {
            setLoading(false);
        }
    }, [
        currentCompany,
        formData,
        comboType,
        fixedComponents,
        dynamicLabel,
        dynamicMinQty,
        dynamicMaxQty,
        allowedItemIds,
        isEditing,
        initialData,
        token,
        onSuccess,
        onClose,
        saleBillingModes
    ]);

    // Regla 8: Memoización estricta del árbol JSX del <Form> para evitar re-renderizados y saltos de scroll
    const formContent = useMemo(() => (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
            colCount={2}
        >
            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="name"
                    label={{ text: "Nombre del Producto Combo" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: Pack Desayuno Gourmet",
                        valueChangeEvent: "blur",
                        stylingMode: "filled"
                    }}
                    validationRules={[{ type: "required", message: "El nombre es obligatorio" }]}
                />
            </GroupItem>

            <SimpleItem
                dataField="skuPrefix"
                label={{ text: "Prefijo SKU" }}
                editorType="dxTextBox"
                editorOptions={{
                    placeholder: "Ej: PACK-",
                    valueChangeEvent: "blur",
                    disabled: isEditing,
                    stylingMode: "filled"
                }}
                validationRules={[{ type: "required", message: "El prefijo SKU es obligatorio" }]}
            />

            <SimpleItem
                dataField="categoryId"
                label={{ text: "Categoría" }}
                editorType="dxSelectBox"
                editorOptions={{
                    dataSource: categories,
                    valueExpr: "id",
                    displayExpr: "label",
                    searchEnabled: true,
                    showClearButton: true,
                    stylingMode: "filled",
                    placeholder: "Seleccione categoría...",
                    dropDownOptions: {
                        wrapperAttr: {
                            class: "popup-menu-container"
                        }
                    }
                }}
            />

            <SimpleItem
                dataField="brandId"
                label={{ text: "Marca" }}
                editorType="dxSelectBox"
                editorOptions={{
                    dataSource: brands,
                    valueExpr: "id",
                    displayExpr: "label",
                    searchEnabled: true,
                    showClearButton: true,
                    stylingMode: "filled",
                    placeholder: "Seleccione marca...",
                    dropDownOptions: {
                        wrapperAttr: {
                            class: "popup-menu-container"
                        }
                    }
                }}
            />

            <SimpleItem
                dataField="procurementType"
                label={{ text: "Aprovisionamiento" }}
                editorType="dxSelectBox"
                editorOptions={{
                    dataSource: PROCUREMENT_TYPES_OPTIONS,
                    valueExpr: "id",
                    displayExpr: "name",
                    stylingMode: "filled",
                    dropDownOptions: {
                        wrapperAttr: {
                            class: "popup-menu-container"
                        }
                    }
                }}
            />

            <GroupItem colSpan={2}>
                <SimpleItem
                    colSpan={2}
                    dataField="active"
                    label={{ text: "Estado" }}
                    editorType="dxCheckBox"
                    editorOptions={{
                        text: "Activo",
                        stylingMode: "filled"
                    }}
                />
            </GroupItem>

            {/* MODO DE OPERACIÓN: EXACTO A PRODUCTMODAL */}
            <GroupItem
                colSpan={2}
                colCount={2}
                cssClass="!p-5 !rounded-dx !bg-primary-0/40 !border !border-focus-100/40 !shadow-sm !mt-2 w-full"
            >
                <SimpleItem
                    colSpan={2}
                    cssClass="!p-0"
                    label={{ visible: false }}
                >
                    <div className="mb-6 border-b border-main/10 pb-4">
                        <h3 className="text-lg font-bold text-dx-primary mb-1">Modo de Operación</h3>
                        <p className="text-xs opacity-60">Configuración de facturación y unidades de medida.</p>
                    </div>
                </SimpleItem>

                <SimpleItem
                    colSpan={2}
                    dataField="saleBillingModeCode"
                    label={{ text: "Modo de Venta" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        onInitialized: (e: any) => { saleBillingModeEditorRef.current = e.component; },
                        dataSource: saleBillingModes,
                        valueExpr: "code",
                        displayExpr: "name",
                        searchEnabled: true,
                        showClearButton: true,
                        stylingMode: "filled",
                        placeholder: "Seleccione modo de venta...",
                        onValueChanged: (e: any) => {
                            if (e.event) {
                                formRef.current?.instance().updateData("uomId", null);
                                formRef.current?.instance().updateData("defaultSecUomId", null);

                                const selectedMode = saleBillingModes?.find(m => m.code === e.value);

                                if (uomEditorRef.current) {
                                    const filteredPrimary = selectedMode?.billingUomCategoryId
                                        ? rawUoms.filter(u => u.categoryId === selectedMode.billingUomCategoryId)
                                        : rawUoms;
                                    uomEditorRef.current.option("dataSource", filteredPrimary);
                                }

                                if (secUomEditorRef.current) {
                                    const requiresSec = selectedMode?.requiresSecondaryUom || false;
                                    const filteredSec = (requiresSec && selectedMode?.secondaryUomCategoryId)
                                        ? rawUoms.filter(u => u.categoryId === selectedMode.secondaryUomCategoryId)
                                        : [];
                                    secUomEditorRef.current.option("dataSource", filteredSec);
                                    secUomEditorRef.current.option("disabled", !requiresSec);
                                }

                                const desc = selectedMode?.description || DEFAULT_SALE_BILLING_DESCRIPTION;
                                if (descriptionRef.current) {
                                    descriptionRef.current.textContent = desc;
                                }
                            }
                        },
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                    validationRules={[{ type: "required", message: "El modo de venta es obligatorio" }]}
                />

                <SimpleItem
                    name="uomId"
                    dataField="uomId"
                    label={{ text: "Unidad de Medida" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        onInitialized: (e: any) => { uomEditorRef.current = e.component; },
                        dataSource: initialPrimaryUomsRef.current,
                        valueExpr: "id",
                        displayExpr: "name",
                        searchEnabled: true,
                        stylingMode: "filled",
                        placeholder: "Seleccione unidad de medida...",
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                    validationRules={[
                        { type: "required", message: "La unidad de medida es obligatoria" },
                        {
                            type: "custom",
                            message: "La unidad de medida no pertenece a la categoría permitida por el modo de venta",
                            validationCallback: (e: any) => {
                                const modeCode = formRef.current?.instance().option("formData")?.saleBillingModeCode;
                                const mode = saleBillingModes.find(m => m.code === modeCode);
                                if (!mode?.billingUomCategoryId || !e.value) return true;
                                const uom = rawUoms.find(u => u.id === e.value);
                                return !uom || uom.categoryId === mode.billingUomCategoryId;
                            }
                        }
                    ]}
                />

                <SimpleItem
                    name="defaultSecUomId"
                    dataField="defaultSecUomId"
                    label={{ text: "Unidad de Medida Secundaria" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        onInitialized: (e: any) => { secUomEditorRef.current = e.component; },
                        dataSource: initialSecUomsRef.current,
                        disabled: initialSecUomDisabledRef.current,
                        valueExpr: "id",
                        displayExpr: "name",
                        searchEnabled: true,
                        stylingMode: "filled",
                        placeholder: "Seleccione UoM secundaria por defecto...",
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                    validationRules={[
                        {
                            type: "custom",
                            message: "La unidad de medida secundaria es requerida por el modo de venta",
                            validationCallback: (e: any) => {
                                const modeCode = formRef.current?.instance().option("formData")?.saleBillingModeCode;
                                const mode = saleBillingModes.find(m => m.code === modeCode);
                                if (!mode?.requiresSecondaryUom) return true;
                                if (!e.value) return false;
                                if (!mode.secondaryUomCategoryId) return true;
                                const uom = rawUoms.find(u => u.id === e.value);
                                return !uom || uom.categoryId === mode.secondaryUomCategoryId;
                            }
                        }
                    ]}
                />

                <SimpleItem
                    colSpan={2}
                    label={{ visible: false }}
                >
                    <div className="mt-4 p-3 rounded-dx bg-main/5 border border-main/10">
                        <p className="text-xs font-semibold text-dx-primary mb-1">Descripción del modo seleccionado:</p>
                        <p
                            ref={descriptionRef}
                            className="text-xs text-main/70 leading-relaxed transition-all duration-300"
                        >
                            {DEFAULT_SALE_BILLING_DESCRIPTION}
                        </p>
                    </div>
                </SimpleItem>
            </GroupItem>
        </Form>
    ), [formData, isEditing, categories, brands, saleBillingModes, rawUoms]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? `Editar Combo: ${initialData.name}` : "Nuevo Combo (Pack / Kit)"}
            width={640}
            height="auto"
            maxHeight="88vh"
            className="custom-popup"
            deferRendering={false}
            onShown={(e) => {
                // Regla 4: Repaint en onShown para recalcular dimensiones de Popup y cabecera
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-5 flex flex-col gap-y-4">
                {/* Formulario memoizado (Regla 8) */}
                {formContent}

                {/* SECCIÓN CARD DE ESTRUCTURA Y COMPOSICIÓN DEL KIT */}
                <div className="!p-5 !rounded-dx !bg-primary-0/40 !border !border-focus-100/40 !shadow-sm !mt-2 flex flex-col gap-y-4">
                    <div className="border-b border-main/10 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                            <h3 className="text-lg font-bold text-dx-primary mb-1">Estructura del Kit</h3>
                            <p className="text-xs opacity-60">Configuración de componentes y reglas del combo.</p>
                        </div>
                        <div className="w-56">
                            <SelectBox
                                dataSource={COMBO_TYPE_OPTIONS}
                                value={comboType}
                                valueExpr="value"
                                displayExpr="label"
                                onValueChanged={e => setComboType(e.value)}
                                stylingMode="filled"
                                dropDownOptions={{
                                    wrapperAttr: { class: "popup-menu-container" }
                                }}
                            />
                        </div>
                    </div>

                    {/* Descripción del modo de kit */}
                    <div className="p-3 rounded-dx bg-main/5 border border-main/10">
                        <p className="text-xs font-semibold text-dx-primary mb-1">
                            {comboType === "FIXED" ? "Modo Kit Fijo:" : "Modo Kit Dinámico:"}
                        </p>
                        <p className="text-xs text-main/70 leading-relaxed">
                            {DEFAULT_COMBO_DESCRIPTIONS[comboType]}
                        </p>
                    </div>

                    {/* COMPONENTES FIJOS */}
                    <div className="flex flex-col gap-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-dx-primary uppercase tracking-wider block">
                                    {comboType === "FIXED" ? "Componentes Fijos del Pack" : "Componentes Fijos Obligatorios"}
                                </span>
                                <span className="text-[11px] opacity-60">
                                    {comboType === "FIXED"
                                        ? "Artículos que componen el paquete completo"
                                        : "Artículos que siempre se entregan además de la selección"}
                                </span>
                            </div>
                            <Button
                                text="Añadir Artículo"
                                icon="plus"
                                stylingMode="outlined"
                                type="default"
                                onClick={handleAddFixedComponent}
                            />
                        </div>

                        {fixedComponents.length === 0 ? (
                            <div className="text-xs text-main/60 py-4 text-center italic bg-main/5 rounded-dx border border-dashed border-main/15">
                                {comboType === "FIXED"
                                    ? "No hay componentes fijos. Haga clic en 'Añadir Artículo' para agregar elementos al kit."
                                    : "Sin componentes fijos adicionales."}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {fixedComponents.map((comp, idx) => (
                                    <div
                                        key={`fixed-${idx}`}
                                        className="flex items-center gap-2 bg-main/5 p-2 rounded-dx border border-main/10"
                                    >
                                        <span className="text-xs text-main/60 w-6 text-center font-mono">
                                            #{idx + 1}
                                        </span>
                                        <div className="flex-1">
                                            <SelectBox
                                                dataSource={itemOptions}
                                                value={comp.itemId}
                                                valueExpr="id"
                                                displayExpr="label"
                                                searchEnabled={true}
                                                searchExpr="label"
                                                placeholder="Seleccione o busque un artículo..."
                                                noDataText="No hay artículos disponibles"
                                                onValueChanged={e => handleUpdateFixedComponent(idx, "itemId", e.value)}
                                                stylingMode="filled"
                                                dropDownOptions={{
                                                    wrapperAttr: { class: "popup-menu-container" }
                                                }}
                                            >
                                                <Validator>
                                                    <RequiredRule message="El artículo es obligatorio" />
                                                    <CustomRule
                                                        message="No puede repetir el mismo artículo"
                                                        validationCallback={(e) => {
                                                            if (!e.value) return true;
                                                            return fixedComponents.filter(c => c.itemId === e.value).length <= 1;
                                                        }}
                                                    />
                                                </Validator>
                                            </SelectBox>
                                        </div>
                                        <div className="w-28">
                                            <NumberBox
                                                value={comp.quantity}
                                                min={1}
                                                step={1}
                                                showSpinButtons={true}
                                                valueChangeEvent="blur"
                                                onValueChanged={e => handleUpdateFixedComponent(idx, "quantity", e.value)}
                                                stylingMode="filled"
                                            >
                                                <Validator>
                                                    <RequiredRule message="Requerido" />
                                                    <RangeRule min={1} message="Debe ser mayor a 0" />
                                                </Validator>
                                            </NumberBox>
                                        </div>
                                        <Button
                                            icon="trash"
                                            stylingMode="text"
                                            type="danger"
                                            hint="Quitar componente"
                                            onClick={() => handleRemoveFixedComponent(idx)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* REGLA DINÁMICA (Si comboType === DYNAMIC) */}
                    {comboType === "DYNAMIC" && (
                        <div className="mt-3 pt-4 border-t border-main/10 flex flex-col gap-y-3">
                            <div>
                                <span className="text-xs font-bold text-dx-primary uppercase tracking-wider block">
                                    Regla de Selección Dinámica
                                </span>
                                <span className="text-[11px] opacity-60">
                                    Define la instrucción y el rango de selección permitido para el cliente.
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="md:col-span-2 flex flex-col gap-1">
                                    <label className="text-xs text-main/70 font-medium">
                                        Instrucción al Cliente <span className="text-error">*</span>
                                    </label>
                                    <TextBox
                                        value={dynamicLabel}
                                        valueChangeEvent="blur"
                                        onValueChanged={handleDynamicLabelChange}
                                        placeholder="Ej. 'Elegí 2 snacks favoritos'"
                                        stylingMode="filled"
                                    >
                                        <Validator>
                                            <RequiredRule message="La instrucción es obligatoria" />
                                        </Validator>
                                    </TextBox>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-main/70 font-medium">
                                        Cantidad Mínima Requerida
                                    </label>
                                    <NumberBox
                                        value={dynamicMinQty}
                                        min={0}
                                        step={1}
                                        showSpinButtons={true}
                                        valueChangeEvent="blur"
                                        onValueChanged={handleDynamicMinQtyChange}
                                        stylingMode="filled"
                                    >
                                        <Validator>
                                            <RequiredRule message="Requerido" />
                                            <RangeRule min={0} message="Mínimo 0" />
                                        </Validator>
                                    </NumberBox>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-main/70 font-medium">
                                        Cantidad Máxima Permitida
                                    </label>
                                    <NumberBox
                                        value={dynamicMaxQty}
                                        min={dynamicMinQty}
                                        step={1}
                                        showSpinButtons={true}
                                        valueChangeEvent="blur"
                                        onValueChanged={handleDynamicMaxQtyChange}
                                        stylingMode="filled"
                                    >
                                        <Validator>
                                            <RequiredRule message="Requerido" />
                                            <CustomRule
                                                message="Debe ser mayor o igual a la cantidad mínima"
                                                validationCallback={(e) => Number(e.value) >= dynamicMinQty}
                                            />
                                        </Validator>
                                    </NumberBox>
                                </div>

                                <div className="md:col-span-2 flex flex-col gap-1">
                                    <label className="text-xs text-main/70 font-medium">
                                        Artículos Elegibles (Opciones Permitidas) <span className="text-error">*</span>
                                    </label>
                                    <TagBox
                                        dataSource={itemOptions}
                                        value={allowedItemIds}
                                        valueExpr="id"
                                        displayExpr="label"
                                        searchEnabled={true}
                                        searchExpr="label"
                                        placeholder="Seleccione los artículos elegibles..."
                                        noDataText="No hay artículos disponibles"
                                        onValueChanged={handleAllowedItemsChange}
                                        showSelectionControls={true}
                                        applyValueMode="useButtons"
                                        stylingMode="filled"
                                        dropDownOptions={{
                                            wrapperAttr: { class: "popup-menu-container" }
                                        }}
                                    >
                                        <Validator>
                                            <CustomRule
                                                message="Debe seleccionar al menos un artículo"
                                                validationCallback={(e) => Array.isArray(e.value) && e.value.length > 0}
                                            />
                                        </Validator>
                                    </TagBox>
                                </div>
                            </div>
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
                    onClick={onClose}
                    disabled={submitting}
                    stylingMode="text"
                />
            </ToolbarItem>
            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text={isEditing ? "Guardar Cambios" : "Guardar Combo"}
                    type="default"
                    stylingMode="contained"
                    disabled={isSubmitDisabled}
                    onClick={handleSubmit}
                />
            </ToolbarItem>
        </Popup>
    );
}
