'use client'

import { productsService } from "@/app/services/product_services/products.service";
import { saleBillingModesService } from "@/app/services/product_services/saleBillingModes.service";
import { itemMediaService } from "@/app/services/product_services/itemMedia.service";
import { IFBrand } from "@repo/api-contracts/erp";
import { IFCategory } from "@repo/api-contracts/erp";
import { IFProduct, IFProductFull, IFProductClassification, TFProcurementType } from "@repo/api-contracts/erp";
import { IFSaleBillingMode } from "@repo/api-contracts/erp";
import { IFUOM } from "@repo/api-contracts/erp";
import { IFPackagingLevel } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import Stepper from "devextreme-react/stepper";

import { Button } from '@repo/devextreme';
import { CheckOutlinedIcon } from "@repo/icons";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { Popover } from "devextreme-react/popover";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ItemsSection from "./itemCreation";
import PreviewSection from "./previewSection";
import ProductSection from "./productSection";
import { ICachedItemMedia } from "./itemMediaUploadSection";

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
    { label: "Vista Previa" },
    { label: "Resultado" }
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
    suppliers: [] as any[],
    platformIds: [] as string[],
    presentations: [] as any[],
    media: [] as ICachedItemMedia[],
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
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStatusText, setLoadingStatusText] = useState("");
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

    const [createdResult, setCreatedResult] = useState<{
        id: string;
        name: string;
        itemsCount: number;
        totalImages: number;
    } | null>(null);

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
        // Revocar URLs de objetos cacheados
        itemsData.forEach(item => {
            item.media?.forEach((m: ICachedItemMedia) => {
                if (m.previewUrl) URL.revokeObjectURL(m.previewUrl);
            });
        });
        if (currentItem.media) {
            currentItem.media.forEach((m: ICachedItemMedia) => {
                if (m.previewUrl) URL.revokeObjectURL(m.previewUrl);
            });
        }

        setCurrentStep(0);
        setIsAddingItem(true);
        setShowCancelConfirm(false);
        setItemsData([]);
        setCurrentItem(createEmptyItem(currentCompany?.id ?? "", currentCompany?.currencyId ?? null));
        setProductData(createEmptyProduct(currentCompany?.id ?? "", currentCompany?.currencyId ?? null));
        setCreatedResult(null);
        setLoadingProgress(0);
        setLoadingStatusText("");
        if (onHidden) {
            onHidden();
        }
    }, [onHidden, currentCompany?.id, itemsData, currentItem]);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setIsAddingItem(true);
            setShowCancelConfirm(false);
            setItemsData([]);
            setCurrentItem(createEmptyItem(currentCompany?.id ?? "", currentCompany?.currencyId ?? null));
            setCreatedResult(null);
            setLoadingProgress(0);
            setLoadingStatusText("");

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
        setLoadingProgress(0);
        setLoadingStatusText("Iniciando creación del producto...");
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
                    secUomId: item.secUomId || productData.defaultSecUomId || undefined,
                    uomRatio: item.uomRatio || undefined,
                    attributes: item.attributes || {},
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
                    costInfo: item.costInfo || undefined,
                    logisticsProfileId: item.logisticsProfileId || undefined,
                    temperatureClassId: item.temperatureClassId || undefined,
                    hazardClassId: item.hazardClassId || undefined,
                    segregationGroupId: item.segregationGroupId || undefined,
                    recipeData: item.recipeData || undefined,
                    compositionData: item.compositionData || undefined,
                    suppliers: (item.suppliers || []).map((s: any, idx: number) => {
                        if (typeof s === 'string') {
                            return {
                                supplier_id: s,
                                priority: idx + 1,
                                active: true
                            };
                        }
                        return {
                            supplier_id: s.supplier_id || s.id || s.supplierId,
                            supplier_sku: s.supplier_sku || s.supplierSku || undefined,
                            priority: s.priority !== undefined ? Number(s.priority) : (idx + 1),
                            active: s.active !== undefined ? s.active : true
                        };
                    }).filter((s: any) => !!s.supplier_id),
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
                        magnitude: presentation.magnitude !== undefined ? presentation.magnitude : undefined,
                        magnitudeUomId: presentation.magnitudeUomId || undefined,
                        magnitudeCategoryId: presentation.magnitudeCategoryId || undefined,
                        fragilityClassId: presentation.fragilityClassId || undefined,
                    }))
                }))
            };

            setLoadingStatusText("Registrando producto e ítems en el servidor...");
            const createdProduct = await productsService.createFull(formatedData, token, currentCompany?.id);

            // Creación del producto completada: asigna exactamente 5%
            let currentProgress = 5;
            setLoadingProgress(currentProgress);
            setLoadingStatusText("Producto e ítems registrados (5%). Procesando multimedia...");

            // Subir imágenes cacheadas para cada ítem creado (el 95% restante)
            let uploadedImagesCount = 0;
            const totalItems = itemsData.length;
            const itemWeight = totalItems > 0 ? (95 / totalItems) : 95;

            if (totalItems > 0 && createdProduct?.id) {
                try {
                    const fullProduct = await productsService.getFullById(createdProduct.id, token, currentCompany?.id);
                    const serverItems = fullProduct?.items || [];

                    for (let itemIdx = 0; itemIdx < totalItems; itemIdx++) {
                        const clientItem = itemsData[itemIdx];
                        const mediaList = Array.isArray(clientItem.media) ? clientItem.media : [];
                        const mediaCount = mediaList.length;

                        if (mediaCount === 0) {
                            // Este ítem no tiene imágenes: completa su porcentaje asignado directamente
                            currentProgress += itemWeight;
                            setLoadingProgress(Math.min(100, currentProgress));
                            setLoadingStatusText(`Ítem ${itemIdx + 1} de ${totalItems} (${clientItem.sku || clientItem.itemName || 'Sin SKU'}): completado`);
                            continue;
                        }

                        // El ítem tiene imágenes: cada imagen suma su porcentaje proporcional al peso del ítem
                        const imageStep = itemWeight / mediaCount;
                        const matchedServerItem = serverItems.find(
                            (si: any) => si.sku?.trim().toLowerCase() === clientItem.sku?.trim().toLowerCase()
                        );

                        if (matchedServerItem?.id) {
                            for (let imgIdx = 0; imgIdx < mediaCount; imgIdx++) {
                                const m = mediaList[imgIdx];
                                setLoadingStatusText(
                                    `Ítem ${itemIdx + 1}/${totalItems} (${clientItem.sku}): subiendo imagen ${imgIdx + 1} de ${mediaCount}...`
                                );
                                try {
                                    await itemMediaService.uploadItemMedia(
                                        matchedServerItem.id,
                                        {
                                            file: m.file,
                                            kindCode: m.kindCode || (imgIdx === 0 ? "main" : undefined),
                                            altText: m.altText || undefined,
                                            sortOrder: imgIdx,
                                        },
                                        token,
                                        currentCompany?.id
                                    );
                                    uploadedImagesCount++;
                                } catch (uploadError) {
                                    console.error(`Error al subir imagen ${imgIdx + 1} para el ítem ${clientItem.sku}:`, uploadError);
                                } finally {
                                    currentProgress += imageStep;
                                    setLoadingProgress(Math.min(100, currentProgress));
                                }
                            }
                        } else {
                            console.warn(`No se encontró en el servidor el ítem con SKU ${clientItem.sku}`);
                            currentProgress += itemWeight;
                            setLoadingProgress(Math.min(100, currentProgress));
                        }
                    }
                } catch (mediaError) {
                    console.error("Error al procesar la subida de imágenes:", mediaError);
                    notify("El producto se creó, pero ocurrió un problema al cargar algunas imágenes", "warning", 4000);
                }
            } else {
                currentProgress = 100;
                setLoadingProgress(100);
            }

            setLoadingProgress(100);
            setLoadingStatusText("¡Creación finalizada con éxito!");

            // Breve pausa para que se aprecie la barra al 100% antes de avanzar a Resultado
            await new Promise((resolve) => setTimeout(resolve, 350));

            setCreatedResult({
                id: createdProduct.id,
                name: productData.name || createdProduct.name,
                itemsCount: itemsData.length,
                totalImages: uploadedImagesCount,
            });

            notify("Producto creado exitosamente", "success", 3000);
            onSuccess();
            setCurrentStep(3);
        } catch (error: any) {
            console.error("Error saving items:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al intentar guardar";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [itemsData, productData, onSuccess, token, currentCompany?.id, packagingLevels]);

    const displayProgress = Math.min(100, Math.max(0, loadingProgress));
    const progressText = displayProgress >= 100
        ? "100%"
        : `${Number(displayProgress.toFixed(2))}%`;

    return (
        <Popup
            ref={popupRef}
            visible={isOpen}
            onHiding={(e: any) => {
                if (loading) {
                    if (e) e.cancel = true;
                    return;
                }
                onClose();
            }}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={false}
            showCloseButton={!loading}
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
                    content.style.position = "relative";
                }
            }}
            onContentReady={(e) => {
                const content = e.component.content();
                if (content) {
                    content.style.overflow = "hidden";
                    content.style.position = "relative";
                }
            }}
        >
            <Position at="center" my="center" />

            {/* Overlay Bloqueador con Spinner y Barra de Progreso */}
            {loading && (
                <div
                    className="absolute inset-0 z-50 bg-primary-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
                    style={{ pointerEvents: "all" }}
                >
                    <div className="bg-primary-900/95 border border-main/15 rounded-xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center backdrop-blur-lg relative overflow-hidden">
                        {/* Destello decorativo ambiental */}
                        <div className="absolute -top-12 -left-12 w-32 h-32 bg-focus-300/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-focus-300/10 rounded-full blur-2xl pointer-events-none" />

                        {/* Spinner animado concéntrico en el centro */}
                        <div className="relative mb-6 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border-4 border-focus-300/20 border-t-focus-300 animate-spin" />
                            <div className="absolute w-8 h-8 rounded-full bg-focus-300/15 animate-pulse flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-focus-300 shadow-sm shadow-focus-300/50" />
                            </div>
                        </div>

                        {/* Título de estado */}
                        <h3 className="text-lg font-bold text-main tracking-tight mb-1">
                            Guardando producto
                        </h3>

                        {/* Descripción dinámica del paso actual */}
                        <p className="text-xs text-main/70 min-h-[1.25rem] mb-5 truncate max-w-full px-2" title={loadingStatusText}>
                            {loadingStatusText || "Procesando información..."}
                        </p>

                        {/* Barra de progreso */}
                        <div className="w-full mb-3">
                            <div className="flex items-center justify-between text-xs font-semibold mb-2 px-0.5">
                                <span className="text-main/60 font-medium">Progreso general</span>
                                <span className="text-focus-300 font-bold tabular-nums text-sm">
                                    {progressText}
                                </span>
                            </div>

                            {/* Pista de la barra */}
                            <div className="w-full h-3.5 bg-main/10 rounded-full p-0.5 border border-main/15 shadow-inner overflow-hidden relative">
                                {/* Relleno dinámico */}
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-focus-300 via-focus-300 to-focus-100 transition-all duration-300 ease-out relative shadow-sm"
                                    style={{ width: `${displayProgress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 rounded-full opacity-60 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <span className="text-[11px] text-main/50">
                            Por favor, no cierre esta ventana mientras se procesan los datos.
                        </span>
                    </div>
                </div>
            )}

            {/* Toolbar Buttons (Ocultos en el paso de Resultado o mientras carga) */}
            {currentStep < 3 && !loading && (
                <>
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
                                text={loading ? "Guardando..." : "Confirmar"}
                                type="default"
                                stylingMode="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                            />
                        </ToolbarItem>
                    )}
                </>
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

                {/* Step 4: Resultado */}
                {currentStep === 3 && (
                    <div className="flex flex-col items-center justify-center min-h-[420px] py-10 px-4 text-center max-w-lg mx-auto">
                        <div className="w-16 h-16 rounded-full bg-success/15 text-success border border-success/30 flex items-center justify-center mb-5 shadow-lg shadow-success/10">
                            <CheckOutlinedIcon className="w-8 h-8" />
                        </div>

                        <h3 className="text-xl font-bold text-main mb-2 tracking-tight">
                            Éxito al crear el producto &ldquo;{createdResult?.name || productData.name}&rdquo;
                        </h3>

                        <p className="text-sm text-main/60 mb-6 max-w-md">
                            El producto y sus ítems han sido registrados correctamente en el sistema{createdResult && createdResult.totalImages > 0 ? ` junto con ${createdResult.totalImages} ${createdResult.totalImages === 1 ? 'imagen asociada' : 'imágenes asociadas'}` : ''}.
                        </p>

                        <div className="w-full bg-primary-0/40 border border-focus-300/20 rounded-dx p-4 mb-8 flex items-center justify-around text-xs shadow-sm">
                            <div className="flex flex-col">
                                <span className="text-main/50 font-medium">Ítems creados</span>
                                <span className="text-base font-bold text-main mt-0.5">{createdResult?.itemsCount ?? itemsData.length}</span>
                            </div>
                            <div className="h-8 w-px bg-main/10" />
                            <div className="flex flex-col">
                                <span className="text-main/50 font-medium">Imágenes procesadas</span>
                                <span className="text-base font-bold text-main mt-0.5">{createdResult?.totalImages ?? 0}</span>
                            </div>
                            <div className="h-8 w-px bg-main/10" />
                            <div className="flex flex-col">
                                <span className="text-main/50 font-medium">Estado</span>
                                <span className="text-xs font-semibold text-success bg-success/15 px-2 py-0.5 rounded mt-0.5">Activo</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                            <Button
                                text="Ver producto"
                                type="default"
                                stylingMode="contained"
                                className="!bg-focus-300 !text-variant hover:!bg-focus-400 font-semibold !rounded-dx w-full sm:w-auto px-6 py-2.5 shadow-md flex items-center justify-center gap-2"
                                onClick={() => {
                                    if (createdResult?.id) {
                                        window.open(`/products/productDetail?id=${createdResult.id}`, '_blank');
                                    }
                                }}
                            />

                            <Button
                                text="Volver al listado"
                                type="normal"
                                stylingMode="outlined"
                                className="!border-main/20 text-main hover:!bg-main/5 font-medium !rounded-dx w-full sm:w-auto px-6 py-2.5"
                                onClick={onClose}
                            />
                        </div>
                    </div>
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
                            className="!bg-error !text-white text-xs !rounded-dx"
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
