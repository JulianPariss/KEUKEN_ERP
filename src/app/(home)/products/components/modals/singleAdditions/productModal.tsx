"use client";

import { productsService } from "@/app/services/product_services/products.service";
import { saleBillingModesService } from "@/app/services/product_services/saleBillingModes.service";
import { IFBrand } from "@repo/api-contracts/erp";
import { IFCategory } from "@repo/api-contracts/erp";
import { IFUOM } from "@repo/api-contracts/erp";
import { IFTax } from "@repo/api-contracts/erp";
import { IFSaleBillingMode } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';
import { IFProductClassification, TFProcurementType, IFCurrency, IFLogisticProfile, IFTemperatureClass, IFHazardClass, IFSegregationGroup } from "@repo/api-contracts/erp";
import Form, { EmptyItem, GroupItem, SimpleItem } from "devextreme-react/form";
import { CheckBox } from "devextreme-react";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { currenciesService } from "@/app/services/payments_services/currencies.service";
import { logisticProfileService } from "@/app/services/product_services/logisticProfile.service";
import { temperatureService } from "@/app/services/product_services/temperature.service";
import { hazardService } from "@/app/services/product_services/hazard.service";
import { segregationGroupsService } from "@/app/services/product_services/segregationGroups.service";
import notify from "devextreme/ui/notify";
import TagBox from "devextreme-react/tag-box";
import { PROCUREMENT_TYPES_OPTIONS } from "@/app/lib/constants/product.constants";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MetadataFieldsClient from "@/components/metadata/MetadataFieldsClient";
import { metadataService } from "@/app/services/metadata.service";
import { ApiError } from "@/app/lib/utils/apiError.helper";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    uoms: IFUOM[];
    categories: IFCategory[];
    brands: IFBrand[];
    taxes: IFTax[];
    initialData?: any;
}

const emptyProductData = {
    name: "",
    classification: "",
    prefix: "",
    uomId: null,
    categoryId: null,
    brandId: null,
    companyId: null,
    active: true,
    taxIds: [] as string[],
    procurementType: "BUY" as TFProcurementType | null | undefined,
    saleBillingModeCode: "",
    defaultSecUomId: null,
    currencyId: null as string | null,
    defaultLogisticsProfileId: null,
    defaultTemperatureClassId: null,
    defaultHazardClassId: null,
    defaultSegregationGroupId: null,
    handlingNotes: "",
};

const defaultDescription = "El modo de venta determina cómo se comercializa y factura el producto. Permite establecer si la facturación es por unidades, por peso o bajo una modalidad dual (gestionando peso e inventario de manera independiente).";

const ProductModal = ({ isOpen, onClose, onSuccess, onHidden, uoms, categories, brands, taxes, initialData }: ProductModalProps) => {
    const { currentCompany, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);

    const [formData, setFormData] = useState({
        ...emptyProductData,
        companyId: currentCompany?.id ?? '',
        currencyId: currentCompany?.currencyId ?? null,
    });

    const [classifications, setClassifications] = useState<IFProductClassification[]>([]);
    const memoizedClassifications = useMemo(() => classifications, [classifications]);

    const [metadataState, setMetadataState] = useState<{
        loading: boolean;
        attributes?: any[];
        groups?: any[];
        values?: any;
        error?: string;
    }>({
        loading: false,
    });

    const [saleBillingModes, setSaleBillingModes] = useState<IFSaleBillingMode[]>([]);
    const [currencies, setCurrencies] = useState<IFCurrency[]>([]);
    const [logisticsProfiles, setLogisticsProfiles] = useState<IFLogisticProfile[]>([]);
    const [temperatureClasses, setTemperatureClasses] = useState<IFTemperatureClass[]>([]);
    const [hazardClasses, setHazardClasses] = useState<IFHazardClass[]>([]);
    const [segregationGroups, setSegregationGroups] = useState<IFSegregationGroup[]>([]);
    
    // Check if initial data has any handling value
    const hasHandlingData = !!initialData?.defaultLogisticsProfileId || !!initialData?.defaultTemperatureClassId || !!initialData?.defaultHazardClassId || !!initialData?.defaultSegregationGroupId || !!initialData?.handlingNotes;

    useEffect(() => {
        if (!isOpen || !token) {
            setMetadataState({ loading: false });
            return;
        }

        const fetchFormData = async () => {
            if (currentCompany?.id) {
                productsService.getClassifications(currentCompany.id, token)
                    .then(response => setClassifications(response))
                    .catch((err: any) => {
                        console.error("Error loading classifications:", err);
                        if (err instanceof ApiError) {
                            notify(err.message, "error", 3000);
                        } else {
                            notify(err?.message || "Error al cargar clasificaciones", "error", 3000);
                        }
                    });
            }

            saleBillingModesService.getAll(token)
                .then(response => setSaleBillingModes(response))
                .catch((err: any) => {
                    console.error("Error loading sale billing modes:", err);
                    if (err instanceof ApiError) {
                        notify(err.message, "error", 3000);
                    } else {
                        notify(err?.message || "Error al cargar modos de venta", "error", 3000);
                    }
                });

            currenciesService.getAll(token).then(res => setCurrencies(res.items)).catch(console.error);
            logisticProfileService.getAll(currentCompany?.id ?? '', token).then(setLogisticsProfiles).catch(console.error);
            temperatureService.getAll(currentCompany?.id ?? '', token).then(setTemperatureClasses).catch(console.error);
            hazardService.getAll(currentCompany?.id ?? '', token).then(setHazardClasses).catch(console.error);
            segregationGroupsService.getAll(currentCompany?.id ?? '', token).then(setSegregationGroups).catch(console.error);

            if (initialData?.id) {
                setMetadataState(prev => ({ ...prev, loading: true }));
                try {
                    const [attributes, groups, values] = await Promise.all([
                        metadataService.getAttributes("common.product", token, true),
                        metadataService.getGroups("common.product", token),
                        metadataService.getValues("common.product", initialData.id, token)
                    ]);
                    setMetadataState({ loading: false, attributes, groups, values });
                } catch (err: any) {
                    console.error("Error al cargar metadatos de producto:", err);
                    const errorMessage = err instanceof ApiError ? err.message : (err?.message || "No se pudieron cargar los metadatos de este producto.");
                    setMetadataState({
                        loading: false,
                        error: errorMessage
                    });
                    notify(errorMessage, "error", 3000);
                }
            } else {
                setMetadataState({ loading: false });
            }
        };

        fetchFormData();
    }, [isOpen, initialData?.id, token, currentCompany?.id]);

    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const uomEditorRef = useRef<any>(null);
    const secUomEditorRef = useRef<any>(null);
    const initialPrimaryUomsRef = useRef<any[]>(uoms);
    const initialSecUomsRef = useRef<any[]>([]);
    const initialSecUomDisabledRef = useRef<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    name: initialData.name || "",
                    classification: initialData.classification || "",
                    prefix: initialData.prefix || initialData.skuPrefix || "",
                    uomId: initialData.uomId || null,
                    categoryId: initialData.categoryId || null,
                    brandId: initialData.brandId || null,
                    companyId: initialData.companyId ?? currentCompany?.id ?? null,
                    active: initialData.active ?? true,
                    taxIds: initialData.taxIds || [],
                    procurementType: initialData.procurementType || "BUY",
                    saleBillingModeCode: initialData.saleBillingModeCode || (initialData.saleBillingModeId ? saleBillingModes.find(m => m.id === initialData.saleBillingModeId)?.code : "") || "",
                    defaultSecUomId: initialData.defaultSecUomId || null,
                    currencyId: initialData.currencyId || currentCompany?.currencyId || null,
                    defaultLogisticsProfileId: initialData.defaultLogisticsProfileId || null,
                    defaultTemperatureClassId: initialData.defaultTemperatureClassId || null,
                    defaultHazardClassId: initialData.defaultHazardClassId || null,
                    defaultSegregationGroupId: initialData.defaultSegregationGroupId || null,
                    handlingNotes: initialData.handlingNotes || "",
                }
                : {
                    ...emptyProductData,
                    companyId: currentCompany?.id ?? null,
                    currencyId: currentCompany?.currencyId ?? null,
                };

            if (saleBillingModes && saleBillingModes.length > 0) {
                const mode = saleBillingModes.find(m => m.code === nextData.saleBillingModeCode);
                initialPrimaryUomsRef.current = mode?.billingUomCategoryId
                    ? uoms.filter(u => u.categoryId === mode.billingUomCategoryId)
                    : uoms;

                initialSecUomsRef.current = (mode?.requiresSecondaryUom && mode?.secondaryUomCategoryId)
                    ? uoms.filter(u => u.categoryId === mode.secondaryUomCategoryId)
                    : [];
                initialSecUomDisabledRef.current = !mode?.requiresSecondaryUom;
            } else {
                initialPrimaryUomsRef.current = uoms;
                initialSecUomsRef.current = [];
                initialSecUomDisabledRef.current = true;
            }

            setFormData(nextData);

            setTimeout(() => {
                const formInstance = formRef.current?.instance();
                if (formInstance) {
                    formInstance.option("formData", nextData);
                    if (typeof formInstance.reset === 'function') {
                        formInstance.reset();
                    }
                    formInstance.option("formData", nextData);
                }
            }, 0);
        }
    }, [isOpen, currentCompany, initialData, saleBillingModes, uoms]);

    const handleHidden = useCallback(() => {
        setFormData({
            ...emptyProductData,
            companyId: currentCompany?.id ?? '',
            currencyId: currentCompany?.currencyId ?? null,
        });
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden, currentCompany]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        if (!currentCompany?.id) {
            notify("No hay una empresa activa seleccionada", "error", 3000);
            return;
        }

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            const payload = {
                ...currentFormData,
                taxIds: currentFormData.taxIds || []
            };

            if (initialData?.id) {
                await productsService.update(payload, initialData.id, token);
                notify("Producto actualizado exitosamente", "success", 3000);
            } else {
                await productsService.create(currentCompany.id, payload, token);
                notify("Producto creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving product:", error);
            if (error instanceof ApiError) {
                notify(error.message, "error", 3000);
                if (error.status === 422) {
                    console.log("Detalles de validación:", error.rawDetails);
                }
            } else {
                notify(error?.message || "Ocurrió un error inesperado", "error", 3000);
            }
        } finally {
            setLoading(false);
        }
    }, [formData, initialData, onClose, onSuccess, token, currentCompany]);

    const formContent = useMemo(() => (
        <>
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
            colCount={2}
        >
            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="name"
                    label={{ text: "Nombre del Producto" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ingrese el nombre",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                    }}
                    validationRules={[{ type: 'required', message: "El nombre es obligatorio" }]}
                />
            </GroupItem>

            <SimpleItem
                dataField="classification"
                label={{ text: "Clasificación" }}
                editorType="dxSelectBox"
                editorOptions={{
                    dataSource: memoizedClassifications,
                    valueExpr: "code",
                    displayExpr: "name",
                    stylingMode: 'filled',
                    dropDownOptions: {
                        wrapperAttr: {
                            class: "popup-menu-container"
                        }
                    }
                }}
                validationRules={[{ type: 'required', message: "La clasificación es obligatoria" }]}
            />

            <SimpleItem
                dataField="prefix"
                label={{ text: "Prefijo SKU" }}
                editorType="dxTextBox"
                editorOptions={{
                    placeholder: "Ej: ABC",
                    valueChangeEvent: "blur",
                    stylingMode: 'filled',
                }}
                validationRules={[{ type: 'required', message: "El prefijo es obligatorio" }]}
            />

            <SimpleItem
                dataField="categoryId"
                label={{ text: "Categoría" }}
                editorType="dxSelectBox"
                editorOptions={{
                    dataSource: categories,
                    valueExpr: "id",
                    displayExpr: "name",
                    searchEnabled: true,
                    stylingMode: 'filled',
                    dropDownOptions: {
                        wrapperAttr: {
                            class: "popup-menu-container"
                        }
                    }
                }}
                validationRules={[{ type: 'required', message: "La categoría es obligatoria" }]}
            />

            <SimpleItem
                dataField="brandId"
                label={{ text: "Marca" }}
                editorType="dxSelectBox"
                editorOptions={{
                    dataSource: brands,
                    valueExpr: "id",
                    displayExpr: "name",
                    searchEnabled: true,
                    stylingMode: 'filled',
                    dropDownOptions: {
                        wrapperAttr: {
                            class: "popup-menu-container"
                        }
                    }
                }}
                validationRules={[{ type: 'required', message: "La marca es obligatoria" }]}
            />

            <SimpleItem
                dataField="procurementType"
                label={{ text: "Abastecimiento" }}
                editorType="dxSelectBox"
                editorOptions={{
                    dataSource: PROCUREMENT_TYPES_OPTIONS,
                    valueExpr: "id",
                    displayExpr: "name",
                    stylingMode: 'filled',
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
                    stylingMode: 'filled',
                    elementAttr: {
                        class: "!opacity-70"
                    },
                }}
                validationRules={[{ type: 'required', message: "La compañía es obligatoria" }]}
            />

            <SimpleItem
                dataField="active"
                label={{ text: "Estado" }}
                editorType="dxCheckBox"
                editorOptions={{
                    text: "Activo",
                    stylingMode: 'filled',
                }}
            />

            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="taxIds"
                    colSpan={2}
                    label={{ text: "Impuesto Asociado" }}
                    editorType="dxTagBox"
                    editorOptions={{
                        dataSource: taxes,
                        valueExpr: "id",
                        displayExpr: "name",
                        searchEnabled: true,
                        showClearButton: true,
                        stylingMode: 'filled',
                        placeholder: "Seleccione impuestos...",
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                />
            </GroupItem>

            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="currencyId"
                    colSpan={2}
                    label={{ text: "Moneda de Venta" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: currencies,
                        valueExpr: "id",
                        displayExpr: "name",
                        searchEnabled: true,
                        showClearButton: true,
                        stylingMode: 'filled',
                        placeholder: "Seleccione moneda...",
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                />
            </GroupItem>

            <GroupItem
                colSpan={2}
                colCount={2}
                cssClass="!p-5 !rounded-dx !bg-primary-0/40 !border !border-focus-100/40 !shadow-sm !mt-4"
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
                        onValueChanged: (e: any) => {
                            if (e.event) {
                                formRef.current?.instance().updateData("uomId", null);
                                formRef.current?.instance().updateData("defaultSecUomId", null);

                                const selectedMode = saleBillingModes?.find(m => m.code === e.value);

                                if (uomEditorRef.current) {
                                    const filteredPrimary = selectedMode?.billingUomCategoryId
                                        ? uoms.filter(u => u.categoryId === selectedMode.billingUomCategoryId)
                                        : uoms;
                                    uomEditorRef.current.option("dataSource", filteredPrimary);
                                }

                                if (secUomEditorRef.current) {
                                    const requiresSec = selectedMode?.requiresSecondaryUom || false;
                                    const filteredSec = (requiresSec && selectedMode?.secondaryUomCategoryId)
                                        ? uoms.filter(u => u.categoryId === selectedMode.secondaryUomCategoryId)
                                        : [];
                                    secUomEditorRef.current.option("dataSource", filteredSec);
                                    secUomEditorRef.current.option("disabled", !requiresSec);
                                }

                                const desc = selectedMode?.description || defaultDescription;
                                if (descriptionRef.current) {
                                    descriptionRef.current.textContent = desc;
                                }
                            }
                        },
                        searchEnabled: true,
                        stylingMode: "filled",
                        placeholder: "Seleccione modo de venta...",
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                    validationRules={[{ type: 'required', message: "El modo de venta es obligatorio" }]}
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
                    validationRules={[{ type: 'required', message: "La unidad de medida es obligatoria" }]}
                />

                <SimpleItem
                    name="defaultSecUomId"
                    dataField="defaultSecUomId"
                    label={{ text: "Unidad de medida Secundaria" }}
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
                            {defaultDescription}
                        </p>
                    </div>
                </SimpleItem>
            </GroupItem>
        </Form>

        <details
            className="group border border-main/10 rounded-dx bg-primary-0/40 shadow-sm mt-4 transition-all duration-300"
            open={hasHandlingData}
            onToggle={(e: any) => {
                if (!e.target.open) {
                    const handlingForm = formRef.current?.instance();
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
                    formData={formData}
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
        </>
    ), [formData, memoizedClassifications, categories, brands, currentCompany, taxes, saleBillingModes, uoms, currencies, logisticsProfiles, temperatureClasses, hazardClasses, segregationGroups, hasHandlingData]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Producto" : "Nuevo Producto"}
            width={550}
            height="auto"
            maxHeight="88vh"
            className="custom-popup"
            deferRendering={false}
            onShown={(e) => {
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-5">
                {formContent}

                {/* Metadatos Dinámicos (solo en edición) */}
                {initialData?.id && (
                    <div className="mt-6 border-t border-main/10 pt-4">
                        <MetadataFieldsClient
                            entityType="common.product"
                            entityId={initialData.id}
                            title="Metadatos del Producto"
                            mode="tabs"
                            canEdit={true}
                            loading={metadataState.loading}
                            error={metadataState.error}
                            attributes={metadataState.attributes}
                            groups={metadataState.groups}
                            initialFetchedValues={metadataState.values}
                        />
                    </div>
                )}
            </div>

            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text="Cancelar"
                    onClick={onClose}
                    disabled={loading}
                    stylingMode="text"
                />
            </ToolbarItem>
            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text="Guardar"
                    type="default"
                    stylingMode="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                />
            </ToolbarItem>
            {false && <TagBox />}
        </Popup>
    );
};

export default ProductModal;
