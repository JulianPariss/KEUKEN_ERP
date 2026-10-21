

import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { CustomRule, RequiredRule } from "devextreme-react/validator";
import TagBox from "devextreme-react/tag-box";
import React, { useEffect, useRef } from "react";
import { PROCUREMENT_TYPES_OPTIONS } from "@/app/lib/constants/product.constants";
import { currenciesService } from "@/app/services/payments_services/currencies.service";
import { logisticProfileService } from "@/app/services/product_services/logisticProfile.service";
import { temperatureService } from "@/app/services/product_services/temperature.service";
import { hazardService } from "@/app/services/product_services/hazard.service";
import { segregationGroupsService } from "@/app/services/product_services/segregationGroups.service";
import { IFCurrency, IFLogisticProfile, IFTemperatureClass, IFHazardClass, IFSegregationGroup } from "@repo/api-contracts/erp";
import { CheckBox } from "devextreme-react";
import { useAuth } from "@/contexts/AuthContext";

interface IProductSection {
    productData: any;
    setProductData: React.Dispatch<React.SetStateAction<any>>;
    formRef: React.RefObject<any>;
    categories: any[];
    brands: any[];
    uoms: any[];
    currentCompany: string;
    classifications: any[];
    products: any[];
    saleBillingModes: any[];
    taxes: any[];
}

const ProductSection = (props: IProductSection) => {
    const {
        productData,
        setProductData,
        formRef,
        categories,
        brands,
        uoms,
        currentCompany,
        classifications,
        products,
        saleBillingModes,
        taxes
    } = props;

    const { token } = useAuth();

    const HANDLING_FIELDS = [
        "defaultLogisticsProfileId",
        "defaultTemperatureClassId",
        "defaultHazardClassId",
        "defaultSegregationGroupId",
        "handlingNotes",
    ] as const;

    const computeHasHandlingData = () => !!(
        productData.defaultLogisticsProfileId ||
        productData.defaultTemperatureClassId ||
        productData.defaultHazardClassId ||
        productData.defaultSegregationGroupId ||
        (productData.handlingNotes && String(productData.handlingNotes).trim())
    );

    const initialHandlingVisible = computeHasHandlingData();
    const handlingEnabledRef = useRef(initialHandlingVisible);
    const handlingCatalogsLoadedRef = useRef(false);
    const handlingHintRef = useRef<HTMLParagraphElement>(null);
    const handlingHeaderRef = useRef<HTMLDivElement>(null);
    /** itemOption remonta el GroupItem: hay que reaplicar value al CheckBox tras el refresh */
    const handlingCheckBoxRef = useRef<any>(null);
    const logisticsProfilesRef = useRef<IFLogisticProfile[]>([]);
    const temperatureClassesRef = useRef<IFTemperatureClass[]>([]);
    const hazardClassesRef = useRef<IFHazardClass[]>([]);
    const segregationGroupsRef = useRef<IFSegregationGroup[]>([]);
    /** Catálogo options fresco para CustomRule (evita closure stale del Form) */
    const productsRef = useRef(products);
    productsRef.current = products;

    const clearHandlingFields = () => {
        productData.defaultLogisticsProfileId = null;
        productData.defaultTemperatureClassId = null;
        productData.defaultHazardClassId = null;
        productData.defaultSegregationGroupId = null;
        productData.handlingNotes = "";
        const form = formRef.current?.instance();
        if (form) {
            form.updateData("defaultLogisticsProfileId", null);
            form.updateData("defaultTemperatureClassId", null);
            form.updateData("defaultHazardClassId", null);
            form.updateData("defaultSegregationGroupId", null);
            form.updateData("handlingNotes", "");
        }
    };

    const loadHandlingCatalogs = () => {
        if (!token || !currentCompany || handlingCatalogsLoadedRef.current) return;
        Promise.all([
            logisticProfileService.getAll(currentCompany, token),
            temperatureService.getAll(currentCompany, token),
            hazardService.getAll(currentCompany, token),
            segregationGroupsService.getAll(currentCompany, token),
        ])
            .then(([logistics, temps, hazards, segregations]) => {
                handlingCatalogsLoadedRef.current = true;
                logisticsProfilesRef.current = logistics;
                temperatureClassesRef.current = temps;
                hazardClassesRef.current = hazards;
                segregationGroupsRef.current = segregations;
                // Dxdocs: getEditor().option — sin setState (no remonta el Form)
                const form = formRef.current?.instance();
                form?.getEditor("defaultLogisticsProfileId")?.option("dataSource", logistics);
                form?.getEditor("defaultTemperatureClassId")?.option("dataSource", temps);
                form?.getEditor("defaultHazardClassId")?.option("dataSource", hazards);
                form?.getEditor("defaultSegregationGroupId")?.option("dataSource", segregations);
            })
            .catch(console.error);
    };

    const syncHandlingCheckBox = (enabled: boolean) => {
        const cb = handlingCheckBoxRef.current;
        if (!cb || typeof cb.option !== "function") return;
        if (cb.option("value") !== enabled) {
            cb.option("value", enabled);
        }
    };

    /**
     * Toggle de sección opcional vía itemOption (puntual) + DOM nativo.
     * Evita setState de React que re-crearía editorOptions y refrescaría todo el Form.
     * Nota Dxdocs: itemOption refresca el grupo y re-inicializa editores/custom content
     * → el CheckBox «Activar» vuelve a defaultValue; hay que re-sincronizar value.
     */
    const applyHandlingVisibility = (enabled: boolean, options?: { clear?: boolean }) => {
        handlingEnabledRef.current = enabled;
        const form = formRef.current?.instance();
        if (form) {
            HANDLING_FIELDS.forEach((field) => {
                form.itemOption(field, "visible", enabled);
            });
            form.updateDimensions?.();
        }
        if (handlingHintRef.current) {
            handlingHintRef.current.textContent = enabled
                ? "Perfil logístico, temperatura, peligro y notas."
                : "Opcional — actívelo si el producto requiere datos de manejo.";
        }
        if (handlingHeaderRef.current) {
            handlingHeaderRef.current.classList.toggle("mb-3", enabled);
            handlingHeaderRef.current.classList.toggle("mb-0", !enabled);
        }
        // Tras el refresh del GroupItem (síncrono o en el siguiente frame)
        syncHandlingCheckBox(enabled);
        requestAnimationFrame(() => syncHandlingCheckBox(enabled));
        if (!enabled && options?.clear) {
            clearHandlingFields();
        }
        if (enabled) {
            loadHandlingCatalogs();
        }
    };

    // Al resetear productData (apertura del modal), sincronizar visibilidad sin setState de UI
    useEffect(() => {
        const enabled = computeHasHandlingData();
        handlingCatalogsLoadedRef.current = false;
        requestAnimationFrame(() => {
            applyHandlingVisibility(enabled, { clear: false });
            if (enabled) loadHandlingCatalogs();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al cambiar la ref de productData
    }, [productData]);

    const descriptionRef = useRef<HTMLParagraphElement>(null);

    const defaultDescription = "El modo de venta determina cómo se comercializa y factura el producto. Permite establecer si la facturación es por unidades, por peso o bajo una modalidad dual (gestionando peso e inventario de manera independiente).";

    const findPredefinedUomId = (mode: any) => {
        if (!mode || !mode.secondaryUomCategoryName) return "";
        const matchingUoms = uoms.filter(u => u.categoryName === mode.secondaryUomCategoryName);
        if (matchingUoms.length === 0) return "";
        const baseUom = matchingUoms.find(u => u.factor === 1);
        return baseUom ? baseUom.id : matchingUoms[0].id;
    };

    const findPredefinedBillingUomId = (mode: any) => {
        if (!mode || !mode.billingUomCategoryName) return "";
        const matchingUoms = uoms.filter(u => u.categoryName === mode.billingUomCategoryName);
        if (matchingUoms.length === 0) return "";
        const baseUom = matchingUoms.find(u => u.factor === 1);
        return baseUom ? baseUom.id : matchingUoms[0].id;
    };

    // Recalculate initial values on render (when parent resets/updates productData reference)
    const initialMode = saleBillingModes?.find(m => m.code === (productData.saleBillingModeCode || ""));
    const initialShowSec = initialMode ? (initialMode.requiresSecondaryUom || initialMode.isDualUom) : false;
    const initialDescription = initialMode?.description || defaultDescription;

    // Filter initial UoMs based on the selected mode's secondary UoM category name
    const initialAllowedCategory = initialMode?.secondaryUomCategoryName;
    const initialFilteredUoms = initialAllowedCategory
        ? uoms.filter(u => u.categoryName === initialAllowedCategory)
        : uoms;

    // Filter initial primary UoMs based on the selected mode's billing UoM category name
    const initialAllowedPrimaryCategory = initialMode?.billingUomCategoryName;
    const initialFilteredPrimaryUoms = initialAllowedPrimaryCategory
        ? uoms.filter(u => u.categoryName === initialAllowedPrimaryCategory)
        : uoms;

    // Set initial predefined value if empty and active
    if (initialMode && !productData.uomId) {
        productData.uomId = findPredefinedBillingUomId(initialMode);
    }
    if (initialShowSec && !productData.defaultSecUomId) {
        productData.defaultSecUomId = findPredefinedUomId(initialMode);
    }

    // Sync description text on parent-driven updates/resets
    useEffect(() => {
        if (descriptionRef.current) {
            descriptionRef.current.textContent = initialDescription;
        }
    }, [initialDescription]);

    return (
        <div className="flex flex-col gap-4">
            <Form
                ref={formRef}
                formData={productData}
                colCount={1}
                labelLocation="top"
                scrollingEnabled={false}
            >
                {/* Card 1: Información del Producto — grid 3 cols, más compacto */}
                <GroupItem
                    colSpan={1}
                    colCount={3}
                    cssClass="!p-4 !rounded-dx !bg-primary-0/40 !border !border-focus-100/40 !shadow-sm !mb-4 [&_.dx-field-item]:!pb-2 [&_.dx-field-item-label]:!pb-0.5"
                >
                    <SimpleItem
                        colSpan={3}
                        cssClass="!p-0 !pb-0"
                        label={{ visible: false }}
                    >
                        <div className="mb-3 border-b border-main/10 pb-2.5 flex items-baseline justify-between gap-3">
                            <h3 className="text-base font-bold text-dx-primary leading-tight">
                                Información del Producto
                            </h3>
                            <p className="text-[11px] opacity-50 shrink-0 hidden sm:block">
                                Datos generales del producto
                            </p>
                        </div>
                    </SimpleItem>

                    <SimpleItem
                        dataField="name"
                        colSpan={3}
                        label={{ text: "Nombre" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            placeholder: "Nombre del producto",
                            stylingMode: "filled",
                            valueChangeEvent: "blur",
                        }}
                    >
                        <RequiredRule message="El nombre es obligatorio" />
                        {/* Dxdocs: CustomRule + validationCallback en el Validator del Form */}
                        <CustomRule
                            message="Este producto ya existe"
                            reevaluate={true}
                            ignoreEmptyValue={true}
                            validationCallback={(e: any) => {
                                const val = String(e.value ?? "").trim().toLowerCase();
                                if (!val) return true;
                                return !(productsRef.current || []).some((p) => {
                                    const label = String(p?.label ?? p?.name ?? "").trim().toLowerCase();
                                    return !!label && label === val && p?.id !== productData.id;
                                });
                            }}
                        />
                    </SimpleItem>

                    <SimpleItem
                        dataField="classification"
                        label={{ text: "Clasificación" }}
                        editorType="dxSelectBox"
                        editorOptions={{
                            dataSource: classifications,
                            valueExpr: "code",
                            displayExpr: "name",
                            stylingMode: "filled",
                            dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } },
                        }}
                    >
                        <RequiredRule message="La clasificación es obligatoria" />
                    </SimpleItem>

                    <SimpleItem
                        dataField="prefix"
                        label={{ text: "Prefijo SKU" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            placeholder: "Ej: ABC",
                            stylingMode: "filled",
                            valueChangeEvent: "blur",
                        }}
                    >
                        <RequiredRule message="El prefijo es obligatorio" />
                        <CustomRule
                            message="Este prefijo ya está en uso (el servidor distingue mayúsculas/minúsculas)"
                            reevaluate={true}
                            validationCallback={(e: any) => {
                                // UX local case-insensitive; BE UNIQUE (company_id, sku_prefix) es case-sensitive
                                const val = typeof e.value === 'string' ? e.value.trim().toLowerCase() : '';
                                if (!val) return true;
                                return !products?.some(p => (p.code || "").trim().toLowerCase() === val && p.id !== productData.id);
                            }}
                        />
                    </SimpleItem>

                    <SimpleItem
                        dataField="categoryId"
                        label={{ text: "Categoría" }}
                        editorType="dxSelectBox"
                        editorOptions={{
                            dataSource: categories,
                            valueExpr: "id",
                            displayExpr: "name",
                            searchEnabled: true,
                            stylingMode: "filled",
                            dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } },
                        }}
                    >
                        <RequiredRule message="La categoría es obligatoria" />
                    </SimpleItem>

                    <SimpleItem
                        dataField="brandId"
                        label={{ text: "Marca" }}
                        editorType="dxSelectBox"
                        editorOptions={{
                            dataSource: brands,
                            valueExpr: "id",
                            displayExpr: "name",
                            searchEnabled: true,
                            stylingMode: "filled",
                            dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } },
                        }}
                    >
                        <RequiredRule message="La marca es obligatoria" />
                    </SimpleItem>

                    <SimpleItem
                        dataField="procurementType"
                        label={{ text: "Abastecimiento" }}
                        editorType="dxSelectBox"
                        editorOptions={{
                            dataSource: PROCUREMENT_TYPES_OPTIONS,
                            valueExpr: "id",
                            displayExpr: "name",
                            stylingMode: "filled",
                            dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } },
                        }}
                    />

                    <SimpleItem
                        dataField="currencyId"
                        label={{ text: "Moneda" }}
                        editorType="dxSelectBox"
                        editorOptions={{
                            dataSource: [],
                            valueExpr: "id",
                            displayExpr: "name",
                            searchEnabled: true,
                            showClearButton: true,
                            stylingMode: "filled",
                            placeholder: "Moneda de la compañía (si no elige)",
                            hint: "Sin selección, el servidor usa la moneda base de la compañía",
                            dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } },
                            onInitialized: (e: any) => {
                                if (!token) return;
                                currenciesService.getAll(token)
                                    .then((res) => {
                                        e.component?.option("dataSource", res.items as IFCurrency[]);
                                    })
                                    .catch(console.error);
                            },
                        }}
                    />

                    <SimpleItem
                        dataField="taxIds"
                        colSpan={3}
                        label={{ text: "Impuestos" }}
                        editorType="dxTagBox"
                        editorOptions={{
                            dataSource: taxes,
                            valueExpr: "id",
                            displayExpr: "name",
                            searchEnabled: true,
                            showClearButton: true,
                            stylingMode: "filled",
                            placeholder: "Seleccione impuestos...",
                            dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } },
                        }}
                    />

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
                            stylingMode: "filled",
                            elementAttr: {
                                class: "!bg-main/5 !rounded-dx !opacity-70"
                            },
                        }}
                    >
                        <RequiredRule message="La compañía es obligatoria" />
                    </SimpleItem>
                </GroupItem>

                {/* Card 2: Modo de Operación */}
                <GroupItem
                    colSpan={1}
                    colCount={2}
                    cssClass="!p-4 !rounded-dx !bg-primary-0/40 !border !border-focus-100/40 !shadow-sm !mb-4 [&_.dx-field-item]:!pb-2 [&_.dx-field-item-label]:!pb-0.5"
                >
                    <SimpleItem
                        colSpan={2}
                        cssClass="!p-0 !pb-0"
                        label={{ visible: false }}
                    >
                        <div className="mb-3 border-b border-main/10 pb-2.5 flex items-baseline justify-between gap-3">
                            <h3 className="text-base font-bold text-dx-primary leading-tight">Modo de Operación</h3>
                            <p className="text-[11px] opacity-50 shrink-0 hidden sm:block">Facturación y unidades</p>
                        </div>
                    </SimpleItem>

                    <SimpleItem
                        colSpan={2}
                        dataField="saleBillingModeCode"
                        label={{ text: "Modo de Venta" }}
                        editorType="dxSelectBox"
                        editorOptions={{
                            dataSource: saleBillingModes,
                            valueExpr: "code",
                            displayExpr: "name",
                            value: productData.saleBillingModeCode || "",
                            onValueChanged: (e: any) => {
                                // Direct mutation keeps formData reference stable, avoiding full repaint and scroll resets
                                productData.saleBillingModeCode = e.value;
                                const newMode = saleBillingModes?.find(m => m.code === e.value);
                                const requiresSec = newMode ? (newMode.requiresSecondaryUom || newMode.isDualUom) : false;

                                if (newMode) {
                                    productData.uomId = findPredefinedBillingUomId(newMode);
                                } else {
                                    productData.uomId = "";
                                }

                                if (requiresSec) {
                                    productData.defaultSecUomId = findPredefinedUomId(newMode);
                                } else {
                                    productData.defaultSecUomId = "";
                                }

                                // Natively update the uomId editor datasource, value, and disabled state!
                                const primaryUomEditor = formRef.current?.instance().getEditor("uomId");
                                if (primaryUomEditor) {
                                    const allowedPrimaryCategory = newMode?.billingUomCategoryName;
                                    const filteredPrimary = allowedPrimaryCategory
                                        ? uoms.filter((u: any) => u.categoryName === allowedPrimaryCategory)
                                        : uoms;
                                    primaryUomEditor.option("dataSource", filteredPrimary);
                                    primaryUomEditor.option("value", productData.uomId);
                                }

                                // Natively update the defaultSecUomId editor datasource, value, and disabled state!
                                const secUomEditor = formRef.current?.instance().getEditor("defaultSecUomId");
                                if (secUomEditor) {
                                    const allowedCategory = newMode?.secondaryUomCategoryName;
                                    const filtered = allowedCategory
                                        ? uoms.filter((u: any) => u.categoryName === allowedCategory)
                                        : uoms;
                                    secUomEditor.option("dataSource", filtered);
                                    secUomEditor.option("value", productData.defaultSecUomId);
                                }

                                // Update explanation text natively (extremely fast, zero re-renders!)
                                const desc = newMode?.description || defaultDescription;
                                if (descriptionRef.current) {
                                    descriptionRef.current.textContent = desc;
                                }
                            },
                            searchEnabled: true,
                            stylingMode: "filled",
                            placeholder: "Seleccione modo de venta..."
                        }}
                    >
                        <RequiredRule message="El modo de venta es obligatorio" />
                    </SimpleItem>

                    <SimpleItem
                        name="uomId"
                        dataField="uomId"
                        label={{ text: "Unidad de Medida" }}
                        editorType="dxSelectBox"
                        editorOptions={{
                            dataSource: initialFilteredPrimaryUoms,
                            valueExpr: "id",
                            displayExpr: "name",
                            searchEnabled: true,
                            stylingMode: "filled",
                            placeholder: "Seleccione unidad de medida...",
                            disabled: true // Always disabled because the value is fixed to the predefined category base UoM
                        }}
                    >
                        <RequiredRule message="La unidad de medida es obligatoria" />
                    </SimpleItem>

                    <SimpleItem
                        name="defaultSecUomId"
                        dataField="defaultSecUomId"
                        label={{ text: "Unidad de medida Secundaria" }}
                        editorType="dxSelectBox"
                        editorOptions={{
                            dataSource: initialFilteredUoms,
                            valueExpr: "id",
                            displayExpr: "name",
                            searchEnabled: true,
                            stylingMode: "filled",
                            placeholder: "Seleccione UoM secundaria por defecto...",
                            disabled: true // Always disabled because the value is fixed to the predefined category base UoM
                        }}
                    />

                    {/* Paragraph describing the selected billing mode */}
                    <SimpleItem
                        colSpan={2}
                        label={{ visible: false }}
                    >
                        <div className="mt-2 p-2.5 rounded-dx bg-main/5 border border-main/10">
                            <p className="text-[11px] font-semibold text-dx-primary mb-0.5">Modo seleccionado</p>
                            <p
                                ref={descriptionRef}
                                className="text-[11px] text-main/70 leading-snug transition-all duration-300"
                            >
                                {initialDescription}
                            </p>
                        </div>
                    </SimpleItem>
                </GroupItem>

                {/* Card 3: Manejo de Artículos (opcional) */}
                <GroupItem
                    colSpan={1}
                    colCount={2}
                    cssClass="!p-4 !rounded-dx !bg-primary-0/40 !border !border-focus-100/40 !shadow-sm [&_.dx-field-item]:!pb-2 [&_.dx-field-item-label]:!pb-0.5"
                >
                    <SimpleItem
                        colSpan={2}
                        cssClass="!p-0 !pb-0"
                        label={{ visible: false }}
                    >
                        <div
                            ref={handlingHeaderRef}
                            className={`${initialHandlingVisible ? "mb-3" : "mb-0"} border-b border-main/10 pb-2.5 flex items-center justify-between gap-4`}
                        >
                            <div className="min-w-0">
                                <h3 className="text-base font-bold text-dx-primary leading-tight">Manejo de Artículos</h3>
                                <p ref={handlingHintRef} className="text-[11px] opacity-50 mt-0.5">
                                    {initialHandlingVisible
                                        ? "Perfil logístico, temperatura, peligro y notas."
                                        : "Opcional — actívelo si el producto requiere datos de manejo."}
                                </p>
                            </div>
                            <div
                                className="shrink-0 pt-1"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <CheckBox
                                    text="Activar"
                                    defaultValue={initialHandlingVisible}
                                    onInitialized={(e) => {
                                        handlingCheckBoxRef.current = e.component;
                                        // Remount por itemOption: restaurar estado lógico
                                        e.component?.option("value", handlingEnabledRef.current);
                                    }}
                                    onDisposing={() => {
                                        handlingCheckBoxRef.current = null;
                                    }}
                                    onValueChanged={(e) => {
                                        // Ignorar sync programático (option("value")) tras itemOption
                                        if (!e.event) return;
                                        applyHandlingVisibility(!!e.value, { clear: !e.value });
                                    }}
                                />
                            </div>
                        </div>
                    </SimpleItem>

                    <SimpleItem
                        dataField="defaultLogisticsProfileId"
                        label={{ text: "Perfil Logístico" }}
                        editorType="dxSelectBox"
                        visible={initialHandlingVisible}
                        editorOptions={{
                            dataSource: logisticsProfilesRef.current,
                            valueExpr: "id",
                            displayExpr: "name",
                            searchEnabled: true,
                            showClearButton: true,
                            stylingMode: 'filled',
                            placeholder: "Seleccione...",
                            dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } }
                        }}
                    />

                    <SimpleItem
                        dataField="defaultTemperatureClassId"
                        label={{ text: "Clase de Temperatura" }}
                        editorType="dxSelectBox"
                        visible={initialHandlingVisible}
                        editorOptions={{
                            dataSource: temperatureClassesRef.current,
                            valueExpr: "id",
                            displayExpr: "name",
                            searchEnabled: true,
                            showClearButton: true,
                            stylingMode: 'filled',
                            placeholder: "Seleccione...",
                            dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } }
                        }}
                    />

                    <SimpleItem
                        dataField="defaultHazardClassId"
                        label={{ text: "Clase de Peligro" }}
                        editorType="dxSelectBox"
                        visible={initialHandlingVisible}
                        editorOptions={{
                            dataSource: hazardClassesRef.current,
                            valueExpr: "id",
                            displayExpr: "name",
                            searchEnabled: true,
                            showClearButton: true,
                            stylingMode: 'filled',
                            placeholder: "Seleccione...",
                            dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } }
                        }}
                    />

                    <SimpleItem
                        dataField="defaultSegregationGroupId"
                        label={{ text: "Grupo de Segregación" }}
                        editorType="dxSelectBox"
                        visible={initialHandlingVisible}
                        editorOptions={{
                            dataSource: segregationGroupsRef.current,
                            valueExpr: "id",
                            displayExpr: "name",
                            searchEnabled: true,
                            showClearButton: true,
                            stylingMode: 'filled',
                            placeholder: "Seleccione...",
                            dropDownOptions: { wrapperAttr: { class: "popup-menu-container" } }
                        }}
                    />

                    <SimpleItem
                        colSpan={2}
                        dataField="handlingNotes"
                        label={{ text: "Notas de Manipulación" }}
                        editorType="dxTextArea"
                        visible={initialHandlingVisible}
                        editorOptions={{
                            height: 90,
                            placeholder: "Instrucciones especiales de manejo...",
                            stylingMode: 'filled'
                        }}
                    />
                </GroupItem>
            </Form>
        </div>
    );
};

export default React.memo(ProductSection);
