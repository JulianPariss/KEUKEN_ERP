

import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { CustomRule, RequiredRule } from "devextreme-react/validator";
import TagBox from "devextreme-react/tag-box";
import React, { useEffect, useRef, useState } from "react";
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
    const [currencies, setCurrencies] = useState<IFCurrency[]>([]);
    const [logisticsProfiles, setLogisticsProfiles] = useState<IFLogisticProfile[]>([]);
    const [temperatureClasses, setTemperatureClasses] = useState<IFTemperatureClass[]>([]);
    const [hazardClasses, setHazardClasses] = useState<IFHazardClass[]>([]);
    const [segregationGroups, setSegregationGroups] = useState<IFSegregationGroup[]>([]);

    const hasHandlingData = !!productData?.defaultLogisticsProfileId || !!productData?.defaultTemperatureClassId || !!productData?.defaultHazardClassId || !!productData?.defaultSegregationGroupId || !!productData?.handlingNotes;

    useEffect(() => {
        if (!token) return;
        currenciesService.getAll(token).then(res => setCurrencies(res.items)).catch(console.error);
        logisticProfileService.getAll(currentCompany, token).then(setLogisticsProfiles).catch(console.error);
        temperatureService.getAll(currentCompany, token).then(setTemperatureClasses).catch(console.error);
        hazardService.getAll(currentCompany, token).then(setHazardClasses).catch(console.error);
        segregationGroupsService.getAll(currentCompany, token).then(setSegregationGroups).catch(console.error);
    }, [token, currentCompany]);

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
        <div className="flex flex-col gap-6">
            <Form
                ref={formRef}
                formData={productData}
                colCount={2}
                scrollingEnabled={false}
            >
                {/* Card 1: Información del Producto */}
                <GroupItem
                    colSpan={2}
                    colCount={2}
                    cssClass="!p-5 !rounded-dx !bg-primary-0/40 !border !border-focus-100/40 !shadow-sm !mb-6"
                >
                    <SimpleItem
                        colSpan={2}
                        cssClass="!p-0"
                        label={{ visible: false }}
                    >
                        <div className="mb-6 border-b border-main/10 pb-4">
                            <h3 className="text-lg font-bold text-dx-primary mb-1">Información del Producto</h3>
                            <p className="text-xs opacity-60">Datos generales del nuevo producto terminado.</p>
                        </div>
                    </SimpleItem>

                    <SimpleItem
                        dataField="name"
                        colSpan={2}
                        label={{ text: "Nombre del Producto" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            placeholder: "Ingrese el nombre del producto",
                            stylingMode: "filled"
                        }}
                    >
                        <RequiredRule message="El nombre es obligatorio" />
                        <CustomRule
                            message="Este producto ya existe"
                            reevaluate={true}
                            validationCallback={(e: any) => {
                                const val = e.value.trim().toLowerCase();
                                return !products?.some(p => p.label.trim().toLowerCase() === val && p.id !== productData.id);
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
                            stylingMode: "filled"
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
                            stylingMode: "filled"
                        }}
                    >
                        <RequiredRule message="El prefijo es obligatorio" />
                        <CustomRule
                            message="Este prefijo ya está en uso"
                            reevaluate={true}
                            validationCallback={(e: any) => {
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
                            stylingMode: "filled"
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
                            stylingMode: "filled"
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
                            dropDownOptions: {
                                wrapperAttr: {
                                    class: "popup-menu-container"
                                }
                            }
                        }}
                    />

                    <SimpleItem
                        dataField="taxIds"
                        label={{ text: "Impuesto Asociado" }}
                        editorType="dxTagBox"
                        editorOptions={{
                            dataSource: taxes,
                            valueExpr: "id",
                            displayExpr: "name",
                            searchEnabled: true,
                            showClearButton: true,
                            stylingMode: "filled",
                            placeholder: "Seleccione impuestos...",
                            dropDownOptions: {
                                wrapperAttr: {
                                    class: "popup-menu-container"
                                }
                            }
                        }}
                    />

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
                            stylingMode: "filled",
                            placeholder: "Seleccione moneda...",
                            dropDownOptions: {
                                wrapperAttr: {
                                    class: "popup-menu-container"
                                }
                            }
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
                    colSpan={2}
                    colCount={2}
                    cssClass="!p-5 !rounded-dx !bg-primary-0/40 !border !border-focus-100/40 !shadow-sm"
                >
                    <SimpleItem
                        colSpan={2}
                        cssClass="!p-0"
                        label={{ visible: false }}
                    >
                        <div className="mb-6 border-b border-main/10 pb-4">
                            <h3 className="text-lg font-bold text-dx-primary mb-1">Modo de Operación</h3>
                            <p className="text-xs opacity-60">Configuración de facturación y unidades duales.</p>
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
                        <div className="mt-4 p-3 rounded-dx bg-main/5 border border-main/10">
                            <p className="text-xs font-semibold text-dx-primary mb-1">Descripción del modo seleccionado:</p>
                            <p
                                ref={descriptionRef}
                                className="text-xs text-main/70 leading-relaxed transition-all duration-300"
                            >
                                {initialDescription}
                            </p>
                        </div>
                    </SimpleItem>
                              </GroupItem>
            </Form>

            {/* Manejo de Artículos - Collapsible Section */}
            <details
                className="group border border-main/10 rounded-dx bg-primary-0/40 shadow-sm mt-2 transition-all duration-300"
                open={hasHandlingData}
                onToggle={(e: any) => {
                    if (!e.target.open) {
                        const handlingForm = formRef.current?.instance(); // Re-use main formRef to clear data if needed
                        if (handlingForm) {
                            handlingForm.updateData("defaultLogisticsProfileId", null);
                            handlingForm.updateData("defaultTemperatureClassId", null);
                            handlingForm.updateData("defaultHazardClassId", null);
                            handlingForm.updateData("defaultSegregationGroupId", null);
                            handlingForm.updateData("handlingNotes", "");
                        }
                    }
                }}
            >
                <summary className="p-5 cursor-pointer list-none flex justify-between items-center focus:outline-none rounded-dx">
                    <div>
                        <h3 className="text-lg font-bold text-dx-primary mb-1 group-open:text-focus-300 transition-colors">Manejo de Artículos</h3>
                        <p className="text-xs opacity-60">Configuración por defecto</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-xs font-semibold text-main/60 bg-main/5 px-3 py-1 rounded-full group-open:hidden">
                            Usando valores por defecto
                        </div>
                        <div className="text-xs font-semibold text-focus-300 bg-focus-300/10 px-3 py-1 rounded-full hidden group-open:block">
                            Definiendo valores manualmente
                        </div>
                        <i className="dx-icon-chevronright group-open:rotate-90 transition-transform duration-300 text-main/50" />
                    </div>
                </summary>

                <div className="px-5 pb-5 border-t border-main/5 pt-5">
                    <Form
                        formData={productData}
                        colCount={2}
                        scrollingEnabled={false}
                    >
                        <SimpleItem
                            dataField="defaultLogisticsProfileId"
                            label={{ text: "Perfil Logístico" }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                dataSource: logisticsProfiles,
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
                            editorOptions={{
                                dataSource: temperatureClasses,
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
                            editorOptions={{
                                dataSource: hazardClasses,
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
                            editorOptions={{
                                dataSource: segregationGroups,
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
                            editorOptions={{
                                height: 90,
                                placeholder: "Instrucciones especiales de manejo...",
                                stylingMode: 'filled'
                            }}
                        />
                    </Form>
                </div>
            </details>
            {false && <TagBox />}
        </div>
    );
};

export default React.memo(ProductSection);
