'use client'

import { productsService } from "@/app/services/product_services/products.service";
import { saleBillingModesService } from "@/app/services/product_services/saleBillingModes.service";
import { IFBrand } from "@repo/api-contracts/erp";
import { IFCategory } from "@repo/api-contracts/erp";
import { IFProduct, IFProductFull, IFProductClassification, TFProcurementType } from "@repo/api-contracts/erp";
import { IFSaleBillingMode } from "@repo/api-contracts/erp";
import { IFUOM } from "@repo/api-contracts/erp";
import { IFPackagingLevel } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import Stepper from "devextreme-react/stepper";

import { Button } from '@repo/devextreme';
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { Popover } from "devextreme-react/popover";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ItemsSection from "./itemCreation";
import PreviewSection from "./previewSection";
import ProductSection from "./productSection";

import { IFTax } from "@repo/api-contracts/erp";

interface ItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHidden?: () => void;
    onSuccess: () => void;
    products: IFProduct[];
    uoms: IFUOM[];
    categories: IFCategory[];
    brands: IFBrand[];
    taxes: IFTax[];
    initialData?: any;
    canCreatePresentation?: boolean;
    packagingLevels: IFPackagingLevel[];
}

const steps = [
    { label: "Producto" },
    { label: "Ítems" },
    { label: "Vista Previa" }
];

export const createEmptyItem = (companyId: string = "", currencyId: string | null = null) => ({
    sku: "",
    companyId,
    itemName: "",
    costMethod: "average",
    weight: 0,
    volume: 0,
    palletUnits: 0,
    palletUomId: null as string | null,
    minDaysToExpiryReception: 0,
    minDaysToExpiryOrder: 0,
    uomRatio: undefined as number | undefined,
    active: true,
    isInventoryItem: true,
    requiresExpiry: false,
    isSerializable: false,
    isConsignmentItem: false,
    currencyId,
    suppliers: [] as string[],
    platformIds: [] as string[],
    presentations: [] as any[],
});

export const createEmptyProduct = (companyId: string = "", currencyId: string | null = null) => ({
    id: undefined as string | undefined,
    name: "",
    classification: "",
    prefix: "",
    uomId: "",
    categoryId: "",
    brandId: "",
    companyId,
    active: true,
    procurementType: "BUY" as TFProcurementType,
    saleBillingModeCode: "",
    defaultSecUomId: "",
    taxIds: [] as string[],
    currencyId,
    defaultLogisticsProfileId: null,
    defaultTemperatureClassId: null,
    defaultHazardClassId: null,
    defaultSegregationGroupId: null,
    handlingNotes: "",
});

const Creation = ({ isOpen, onClose, onHidden, onSuccess, products, uoms, categories, brands, taxes, initialData, canCreatePresentation = true, packagingLevels }: ItemsModalProps) => {
    const { currentCompany } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const [currentStep, setCurrentStep] = useState(0);

    const [isAddingItem, setIsAddingItem] = useState(true);

    const formRef = useRef<any>(null);
    const productFormRef = useRef<any>(null);
    const popupRef = useRef<any>(null);

    const { token } = useAuth();

    const [saleBillingModes, setSaleBillingModes] = useState<IFSaleBillingMode[]>([]);
    const [classifications, setClassifications] = useState<IFProductClassification[]>([]);
    const memoizedClassifications = useMemo(() => classifications, [classifications]);

    useEffect(() => {
        const fetchClassifications = async () => {
            if (isOpen && token && currentCompany?.id) {
                try {
                    const response = await productsService.getClassifications(currentCompany.id, token);
                    setClassifications(response);
                } catch (err) {
                    console.error("Error loading classifications:", err);
                }
            }
        };
        fetchClassifications();
    }, [isOpen, token, currentCompany?.id]);

    const [productData, setProductData] = useState(createEmptyProduct(currentCompany?.id ?? "", currentCompany?.currencyId ?? null));

    const [itemsData, setItemsData] = useState<any[]>([]);
    const [currentItem, setCurrentItem] = useState(createEmptyItem(currentCompany?.id ?? "", currentCompany?.currencyId ?? null));

    useEffect(() => {
        const fetchModes = async () => {
            if (isOpen && token) {
                try {
                    const response = await saleBillingModesService.getAll(token);
                    setSaleBillingModes(response);
                } catch (err) {
                    console.error("Error loading sale billing modes:", err);
                }
            }
        };
        fetchModes();
    }, [isOpen, token]);

    const handleHidden = useCallback(() => {
        setCurrentStep(0);
        setIsAddingItem(true);
        setShowCancelConfirm(false);
        setItemsData([]);
        setCurrentItem(createEmptyItem(currentCompany?.id ?? "", currentCompany?.currencyId ?? null));
        setProductData(createEmptyProduct(currentCompany?.id ?? "", currentCompany?.currencyId ?? null));
        if (onHidden) {
            onHidden();
        }
    }, [onHidden, currentCompany?.id]);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setIsAddingItem(true);
            setShowCancelConfirm(false);
            setItemsData([]);
            setCurrentItem(createEmptyItem(currentCompany?.id ?? "", currentCompany?.currencyId ?? null));

            if (initialData) {
                setProductData({
                    id: initialData.id,
                    name: initialData.name || "",
                    classification: initialData.classification || "",
                    prefix: initialData.skuPrefix || initialData.prefix || "",
                    uomId: initialData.uomId || "",
                    categoryId: initialData.categoryId || "",
                    brandId: initialData.brandId || "",
                    companyId: initialData.companyId || (currentCompany?.id ?? ''),
                    active: initialData.active ?? true,
                    procurementType: initialData.procurementType || "BUY",
                    saleBillingModeCode: initialData.saleBillingModeCode || "",
                    defaultSecUomId: initialData.defaultSecUomId || "",
                    taxIds: initialData.taxIds || [],
                    currencyId: initialData.currencyId || currentCompany?.currencyId || null,
                    defaultLogisticsProfileId: initialData.defaultLogisticsProfileId || null,
                    defaultTemperatureClassId: initialData.defaultTemperatureClassId || null,
                    defaultHazardClassId: initialData.defaultHazardClassId || null,
                    defaultSegregationGroupId: initialData.defaultSegregationGroupId || null,
                    handlingNotes: initialData.handlingNotes || "",
                });
            } else {
                setProductData(createEmptyProduct(currentCompany?.id ?? '', currentCompany?.currencyId ?? null));
            }

            setTimeout(() => {
                formRef.current?.instance()?.reset();
                productFormRef.current?.instance()?.reset();
            }, 0);
        }
    }, [isOpen, currentCompany?.id, initialData]);

    useEffect(() => {
        if (isOpen && popupRef.current) {
            const timer = setTimeout(() => {
                popupRef.current?.instance().repaint();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [currentStep, isOpen, isAddingItem, itemsData.length]);

    const handleNext = () => {
        if (currentStep === 0) {
            const productFormValid = productFormRef.current?.instance().validate().isValid;
            if (productFormValid) {
                setCurrentStep(1);
            } else {
                notify("Por favor, complete correctamente la información del producto y su modo de venta", "warning", 3000);
            }
        } else if (currentStep === 1) {
            if (itemsData.length === 0) {
                notify("Debe añadir al menos un ítem antes de continuar", "warning", 3000);
                return;
            }
            if (isAddingItem && (currentItem.itemName || currentItem.sku)) {
                notify("Tiene un ítem en edición. Añádalo a la lista o limpie el formulario antes de continuar", "warning", 3000);
                return;
            }
            setCurrentStep(2);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = useCallback(async () => {
        setLoading(true);
        try {
            const formatedData: IFProductFull = {
                product: {
                    name: productData.name,
                    classification: productData.classification,
                    skuPrefix: productData.prefix,
                    uomId: productData.uomId,
                    categoryId: productData.categoryId,
                    brandId: productData.brandId,
                    procurementType: productData.procurementType || undefined,
                    saleBillingModeCode: productData.saleBillingModeCode || undefined,
                    defaultSecUomId: productData.defaultSecUomId || undefined,
                    taxIds: productData.taxIds || [],
                    currencyId: productData.currencyId || null,
                    defaultLogisticsProfileId: productData.defaultLogisticsProfileId || null,
                    defaultTemperatureClassId: productData.defaultTemperatureClassId || null,
                    defaultHazardClassId: productData.defaultHazardClassId || null,
                    defaultSegregationGroupId: productData.defaultSegregationGroupId || null,
                    handlingNotes: productData.handlingNotes || "",
                },
                items: itemsData.map((item) => ({
                    sku: item.sku,
                    itemName: item.itemName,
                    costMethod: item.costMethod,
                    isDualUom: !!item.uomRatio,
                    uomRatio: item.uomRatio || undefined,
                    attributes: {},
                    weight: item.weight,
                    volume: item.volume,
                    palletUnits: item.palletUnits,
                    palletUomId: item.palletUomId,
                    minDaysToExpiryReception: item.minDaysToExpiryReception,
                    minDaysToExpiryOrder: item.minDaysToExpiryOrder,
                    active: item.active !== undefined ? item.active : true,
                    isInventoryItem: item.isInventoryItem,
                    requiresExpiry: item.requiresExpiry,
                    isSerializable: item.isSerializable,
                    isConsignmentItem: item.isConsignmentItem,
                    currencyId: item.currencyId,
                    suppliers: item.suppliers,
                    platformIds: item.platformIds,
                    presentations: item.presentations.map((presentation: any) => ({
                        name: presentation.name,
                        barcode: presentation.barcode,
                        uomId: presentation.uomId,
                        uomRatio: presentation.uomRatio,
                        packagingLevelId: presentation.packagingLevelId,
                        packagingLevelCode: presentation.packagingLevelCode || packagingLevels.find(pl => pl.id === presentation.packagingLevelId)?.code,
                        active: presentation.active !== undefined ? presentation.active : true,
                        isPrimary: presentation.isPrimary ?? false,
                    }))
                }))
            }
            await productsService.createFull(formatedData, token, currentCompany?.id);
            notify("Producto creado exitosamente", "success", 3000);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving items:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al intentar guardar";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [itemsData, productData, onClose, onSuccess, token, currentCompany?.id, packagingLevels]);


    return (
        <Popup
            ref={popupRef}
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={false}
            showCloseButton={true}
            showTitle={true}
            title={"Crear un Producto completo"}
            width={950}
            height={680}
            maxWidth="95%"
            enableBodyScroll={false}
            maxHeight="95%"
            className="custom-popup"
            onShown={(e) => {
                e.component.repaint();
                const content = e.component.content();
                if (content) {
                    content.style.overflow = "hidden";
                }
            }}
            onContentReady={(e) => {
                const content = e.component.content();
                if (content) {
                    content.style.overflow = "hidden";
                }
            }}
        >
            <Position at="center" my="center" />

            {/* Toolbar Buttons */}
            <ToolbarItem toolbar="bottom" location="after">
                <Button
                    id="btn-cancel-product-creation"
                    text="Cancelar"
                    onClick={() => {
                        const hasData = !!productData.name || itemsData.length > 0;
                        if (hasData) {
                            setShowCancelConfirm(true);
                        } else {
                            onClose();
                        }
                    }}
                    disabled={loading}
                    type="normal"
                    stylingMode="text"
                />
            </ToolbarItem>

            {currentStep > 0 && (
                <ToolbarItem toolbar="bottom" location="after">
                    <Button
                        text="Atrás"
                        icon="arrowleft"
                        onClick={handleBack}
                        disabled={loading}
                        type="normal"
                        stylingMode="outlined"
                    />
                </ToolbarItem>
            )}

            {currentStep < 2 ? (
                <ToolbarItem toolbar="bottom" location="after">
                    <Button
                        text="Siguiente"
                        type="default"
                        stylingMode="contained"
                        onClick={handleNext}
                        disabled={loading}
                    />
                </ToolbarItem>
            ) : (
                <ToolbarItem toolbar="bottom" location="after">
                    <Button
                        text="Confirmar"
                        type="default"
                        stylingMode="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                    />
                </ToolbarItem>
            )}

            {/* Stepper Header */}
            <div className="sticky top-[0px] py-3 z-20 bg-primary-0/95 backdrop-blur-md border-b border-main/10 mb-6 pb-3">
                <Stepper
                    items={steps}
                    selectedIndex={currentStep}
                    focusStateEnabled={false}
                    className="pointer-events-none max-w-xl mx-auto"
                />
            </div>

            <div className="pb-4 pr-3 overflow-y-auto" style={{ height: "calc(100% - 90px)" }}>
                {/* Step 1: Product */}
                <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                    <ProductSection
                        productData={productData}
                        setProductData={setProductData}
                        formRef={productFormRef}
                        categories={categories}
                        brands={brands}
                        uoms={uoms}
                        currentCompany={currentCompany?.id ?? ""}
                        classifications={memoizedClassifications}
                        products={products}
                        saleBillingModes={saleBillingModes}
                        taxes={taxes}
                    />
                </div>

                {/* Step 2: Items */}
                <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                    {!isAddingItem &&
                        <Button
                            width="100%"
                            text={itemsData.length > 0 ? "Añadir otro ítem y sus presentaciones" : "Añadir nuevo ítem y sus presentaciones"}
                            icon="add"
                            type="normal"
                            stylingMode="outlined"
                            className="!border-dashed !border-focus-300/40 !text-focus-300 font-semibold !rounded-dx hover:!bg-focus-300/10 !transition-all mb-4 py-2"
                            onClick={() => setIsAddingItem(true)}
                        />
                    }

                    <ItemsSection
                        key={isOpen ? "open" : "closed"}
                        uoms={uoms}
                        formRef={formRef}
                        itemsData={itemsData}
                        setItemsData={setItemsData}
                        currentItem={currentItem}
                        setCurrentItem={setCurrentItem}
                        currentCompany={currentCompany?.id ?? ""}
                        canCreatePresentation={canCreatePresentation}
                        setIsAddingItem={setIsAddingItem}
                        isAddingItem={isAddingItem}
                        productData={productData}
                        saleBillingModes={saleBillingModes}
                        packagingLevels={packagingLevels}
                    />
                </div>

                {/* Step 3: Preview */}
                {currentStep === 2 && (
                    <PreviewSection
                        productData={productData}
                        itemsData={itemsData}
                        uoms={uoms}
                        categories={categories}
                        brands={brands}
                        classifications={memoizedClassifications}
                        saleBillingModes={saleBillingModes}
                        packagingLevels={packagingLevels}
                    />
                )}

            </div>

            {/* Confirmation Popover for Cancel Button */}
            <Popover
                target="#btn-cancel-product-creation"
                visible={showCancelConfirm}
                onHiding={() => setShowCancelConfirm(false)}
                showTitle={false}
                width={290}
                position="top"
            >
                <div className="p-1 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                        <i className="dx-icon-warning text-base" />
                        <span className="font-bold text-xs text-main">¿Cancelar la creación?</span>
                    </div>
                    <p className="text-[11px] text-main/70 leading-relaxed">
                        Se descartarán todos los datos del producto e ítems configurados.
                    </p>
                    <div className="flex justify-end gap-2 mt-1">
                        <Button
                            text="Continuar editando"
                            stylingMode="text"
                            className="!text-main/70 text-xs"
                            onClick={() => setShowCancelConfirm(false)}
                        />
                        <Button
                            text="Sí, cancelar"
                            type="danger"
                            stylingMode="contained"
                            className="!bg-rose-500 !text-white text-xs !rounded-dx"
                            onClick={() => {
                                setShowCancelConfirm(false);
                                onClose();
                            }}
                        />
                    </div>
                </div>
            </Popover>
        </Popup>

    )
}

export default Creation;
