'use client'

import { productsService } from "@/app/services/product_services/products.service";
import { saleBillingModesService } from "@/app/services/product_services/saleBillingModes.service";
import { itemMediaService } from "@/app/services/product_services/itemMedia.service";
import { mapProductFullCreateError } from "@/app/lib/utils/apiError.helper";
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
import dynamic from "next/dynamic";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductSection from "./productSection";
import { ICachedItemMedia } from "./itemMediaUploadSection";

/** Steps pesados: se cargan solo al llegar a ellos (evita congelar la apertura en step Producto) */
const ItemsSection = dynamic(() => import("./itemCreation"), { ssr: false });
const PreviewSection = dynamic(() => import("./previewSection"), { ssr: false });

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
    /** Monta el Form del step solo después de pintar el shell del Popup (evita freeze al abrir) */
    const [contentReady, setContentReady] = useState(false);

    const [currentStep, setCurrentStep] = useState(0);

    const [isAddingItem, setIsAddingItem] = useState(true);

    const formRef = useRef<any>(null);
    const productFormRef = useRef<any>(null);
    const popupRef = useRef<any>(null);

    const { token } = useAuth();

    const [saleBillingModes, setSaleBillingModes] = useState<IFSaleBillingMode[]>([]);
    const [classifications, setClassifications] = useState<IFProductClassification[]>([]);
    const memoizedClassifications = useMemo(() => classifications, [classifications]);

    const [createdResult, setCreatedResult] = useState<{
        id: string;
        name: string;
        itemsCount: number;
        presentationsCount: number;
        totalImages: number;
    } | null>(null);

    const [productData, setProductData] = useState(createEmptyProduct(currentCompany?.id ?? "", currentCompany?.currencyId ?? null));
    /** Misma referencia que alimenta Form.formData (mutación DX sin setState en escritura) */
    const productDataRef = useRef(productData);
    productDataRef.current = productData;

    const [itemsData, setItemsData] = useState<any[]>([]);
    const [currentItem, setCurrentItem] = useState(createEmptyItem(currentCompany?.id ?? "", currentCompany?.currencyId ?? null));

    // Catálogos del step Producto en paralelo (un solo ciclo de setState batchable)
    useEffect(() => {
        if (!isOpen || !token) return;
        let cancelled = false;
        const companyId = currentCompany?.id;

        Promise.all([
            saleBillingModesService.getAll(token),
            companyId ? productsService.getClassifications(companyId, token) : Promise.resolve([] as IFProductClassification[]),
        ])
            .then(([modes, classificationList]) => {
                if (cancelled) return;
                setSaleBillingModes(modes);
                setClassifications(classificationList);
            })
            .catch((err) => {
                console.error("Error loading product creation catalogs:", err);
            });

        // Precargar chunk del step Ítems mientras el usuario completa el producto
        void import("./itemCreation");

        return () => {
            cancelled = true;
        };
    }, [isOpen, token, currentCompany?.id]);

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
        setContentReady(false);
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

    const buildInitialProductData = useCallback(() => {
        if (initialData) {
            return {
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
            };
        }
        return createEmptyProduct(currentCompany?.id ?? '', currentCompany?.currencyId ?? null);
    }, [initialData, currentCompany?.id, currentCompany?.currencyId]);

    /** Dxdocs: enlazar la misma ref de formData + reset(editorsData) al abrir */
    const syncProductFormInstance = useCallback((nextData: any) => {
        const form = productFormRef.current?.instance?.();
        if (!form || !nextData) return;
        form.option("formData", nextData);
        if (typeof form.reset === "function") {
            form.reset({ ...nextData });
        }
        form.updateDimensions?.();
    }, []);

    useEffect(() => {
        if (isOpen) {
            const nextProduct = buildInitialProductData();
            productDataRef.current = nextProduct;
            setCurrentStep(0);
            setIsAddingItem(true);
            setShowCancelConfirm(false);
            setContentReady(false);
            setItemsData([]);
            setCurrentItem(createEmptyItem(currentCompany?.id ?? "", currentCompany?.currencyId ?? null));
            setCreatedResult(null);
            setLoadingProgress(0);
            setLoadingStatusText("");
            setProductData(nextProduct);
        } else {
            setContentReady(false);
        }
    }, [isOpen, currentCompany?.id, currentCompany?.currencyId, buildInitialProductData]);

    // Al cambiar de step: updateDimensions (no repaint completo del Popup en cada paso)
    useEffect(() => {
        if (!isOpen || !contentReady) return;
        const timer = setTimeout(() => {
            productFormRef.current?.instance?.()?.updateDimensions?.();
            formRef.current?.instance?.()?.updateDimensions?.();
            popupRef.current?.instance?.()?.repaint?.();
        }, 40);
        return () => clearTimeout(timer);
    }, [currentStep, isOpen, contentReady]);

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
        notify(`Complete o corrija: ${messages.slice(0, 4).join(" · ")}${messages.length > 4 ? "…" : ""}`, "warning", 5000);
    };

    const handleNext = () => {
        if (currentStep === 0) {
            const validationResult = productFormRef.current?.instance().validate();
            if (validationResult?.isValid) {
                setCurrentStep(1);
            } else {
                notifyBrokenRules(
                    validationResult,
                    "Complete los campos obligatorios del producto (nombre, clasificación, prefijo, categoría, marca y modo de venta)"
                );
                const firstBroken = validationResult?.brokenRules?.[0];
                firstBroken?.validator?.focus?.();
            }
        } else if (currentStep === 1) {
            if (itemsData.length === 0) {
                notify("Antes de continuar, confirme al menos un ítem con el botón «Confirmar item y sus presentaciones»", "warning", 4000);
                return;
            }
            if (isAddingItem && (currentItem.itemName || currentItem.sku)) {
                notify("Hay un ítem sin confirmar. Úselo con «Confirmar item…» o deséchelo con el ícono de papelera", "warning", 4500);
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
            // BE no auto-promueve is_primary: garantizar ≥1 primary por packaging_level en el wire
            const presentationsForWire = (raw: any[]) => {
                const list = (raw || []).map((presentation: any) => ({
                    name: presentation.name,
                    barcode: presentation.barcode,
                    uomId: presentation.uomId,
                    uomRatio: presentation.uomRatio,
                    packagingLevelId: presentation.packagingLevelId,
                    packagingLevelCode:
                        presentation.packagingLevelCode ||
                        packagingLevels.find((pl) => pl.id === presentation.packagingLevelId)?.code,
                    active: presentation.active !== undefined ? presentation.active : true,
                    isPrimary: !!presentation.isPrimary,
                    magnitude: presentation.magnitude !== undefined ? presentation.magnitude : undefined,
                    magnitudeUomId: presentation.magnitudeUomId || undefined,
                    magnitudeCategoryId: presentation.magnitudeCategoryId || undefined,
                    fragilityClassId: presentation.fragilityClassId || undefined,
                }));
                const levelIds = [...new Set(list.map((p) => p.packagingLevelId).filter(Boolean))];
                for (const levelId of levelIds) {
                    const ofLevel = list.filter((p) => p.packagingLevelId === levelId);
                    if (!ofLevel.some((p) => p.isPrimary) && ofLevel[0]) {
                        ofLevel[0].isPrimary = true;
                    }
                }
                return list;
            };

            const formatedData: IFProductFull = {
                product: {
                    name: productData.name,
                    classification: productData.classification,
                    skuPrefix: productData.prefix,
                    uomId: productData.uomId,
                    categoryId: productData.categoryId,
                    brandId: productData.brandId,
                    // No omitir: omit → NULL en sync y el DEFAULT DB 'BUY' no aplica
                    procurementType: productData.procurementType || "BUY",
                    saleBillingModeCode: productData.saleBillingModeCode || undefined,
                    defaultSecUomId: productData.defaultSecUomId || undefined,
                    taxIds: productData.taxIds || [],
                    // null/omit → BE resuelve moneda base de la compañía
                    currencyId: productData.currencyId || null,
                    active: true,
                    defaultLogisticsProfileId: productData.defaultLogisticsProfileId || null,
                    defaultTemperatureClassId: productData.defaultTemperatureClassId || null,
                    defaultHazardClassId: productData.defaultHazardClassId || null,
                    defaultSegregationGroupId: productData.defaultSegregationGroupId || null,
                    handlingNotes: (productData.handlingNotes || "").trim() || null,
                },
                items: itemsData.map((item) => {
                    const isDual = !!(item.uomRatio || item.isDualUom);
                    return {
                        sku: (item.sku || "").trim(),
                        // vacío/null = hereda nombre producto en lectura BE
                        itemName: (item.itemName || "").trim() || (null as unknown as string),
                        // Enviar siempre: omitir ≠ average (schema default standard)
                        costMethod: item.costMethod || "average",
                        isDualUom: isDual,
                        secUomId: isDual
                            ? (item.secUomId || productData.defaultSecUomId || undefined)
                            : undefined,
                        uomRatio: isDual ? (item.uomRatio || undefined) : undefined,
                        attributes: item.attributes || {},
                        weight: item.weight ?? 0,
                        volume: item.volume ?? 0,
                        palletUnits: item.palletUnits ?? 0,
                        palletUomId: item.palletUomId,
                        minDaysToExpiryReception: item.minDaysToExpiryReception ?? 0,
                        minDaysToExpiryOrder: item.minDaysToExpiryOrder ?? 0,
                        active: item.active !== undefined ? item.active : true,
                        isInventoryItem: item.isInventoryItem,
                        requiresExpiry: item.requiresExpiry,
                        isSerializable: item.isSerializable,
                        isConsignmentItem: item.isConsignmentItem,
                        currencyId: item.currencyId || null,
                        costInfo: item.costInfo || undefined,
                        logisticsProfileId: item.logisticsProfileId || undefined,
                        temperatureClassId: item.temperatureClassId || undefined,
                        hazardClassId: item.hazardClassId || undefined,
                        segregationGroupId: item.segregationGroupId || undefined,
                        recipeData: item.recipeData || undefined,
                        compositionData: item.compositionData || undefined,
                        // BE usa el campo priority; no infiere por posición del array
                        suppliers: (item.suppliers || [])
                            .map((s: any, idx: number) => {
                                const supplierId =
                                    typeof s === "string" ? s : s.supplier_id || s.id || s.supplierId;
                                const supplierSku =
                                    typeof s === "string"
                                        ? ""
                                        : (s.supplier_sku || s.supplierSku || "").trim();
                                return {
                                    supplier_id: supplierId,
                                    supplier_sku: supplierSku,
                                    priority: idx + 1,
                                    active: s.active !== undefined ? s.active : true,
                                };
                            })
                            .filter((s: any) => !!s.supplier_id && !!s.supplier_sku),
                        // [] = sin platforms; omitir en wire = auto-assign compañía → enviamos []
                        platformIds: Array.isArray(item.platformIds) ? item.platformIds : [],
                        presentations: presentationsForWire(item.presentations),
                    };
                }),
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

            const presentationsCount = itemsData.reduce(
                (acc, item) => acc + (Array.isArray(item.presentations) ? item.presentations.length : 0),
                0
            );
            setCreatedResult({
                id: createdProduct.id,
                name: productData.name || createdProduct.name,
                itemsCount: itemsData.length,
                presentationsCount,
                totalImages: uploadedImagesCount,
            });

            notify("Producto creado exitosamente", "success", 3000);
            onSuccess();
            setCurrentStep(3);
        } catch (error: any) {
            console.error("Error saving items:", error);
            notify(mapProductFullCreateError(error), "error", 5000);
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
            width={1180}
            height="90vh"
            maxWidth="96vw"
            enableBodyScroll={false}
            maxHeight="94vh"
            className="custom-popup"
            onShown={(e) => {
                // Geometría del shell (Dxdocs: Popup.repaint recalcula tamaño/posición)
                e.component.repaint();
                const content = e.component.content();
                if (content) {
                    content.style.overflow = "hidden";
                    content.style.position = "relative";
                }
                // Primero shell; Form en el siguiente frame (evita freeze)
                requestAnimationFrame(() => {
                    startTransition(() => {
                        setContentReady(true);
                    });
                    requestAnimationFrame(() => {
                        syncProductFormInstance(productDataRef.current);
                        e.component.repaint();
                    });
                });
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
                <div className="absolute inset-0 z-50 pointer-events-auto select-none flex flex-col items-center justify-center p-6 bg-primary-0/75 backdrop-blur-[2px]">
                    <div className="w-full max-w-md p-4 rounded-dx bg-primary-0/40 border border-focus-100/40 shadow-sm">
                        <div className="mb-3 border-b border-main/10 pb-2.5 flex items-baseline justify-between gap-3">
                            <h3 className="text-base font-bold text-dx-primary leading-tight">
                                Guardando producto
                            </h3>
                            <p className="text-[11px] opacity-50 shrink-0 tabular-nums text-focus-300 font-semibold">
                                {progressText}
                            </p>
                        </div>

                        <div className="flex items-start gap-3 mb-4">
                            <div
                                className="mt-0.5 w-8 h-8 shrink-0 rounded-full border-2 border-focus-300/25 border-t-focus-300 animate-spin"
                                aria-hidden
                            />
                            <div className="min-w-0 flex-1">
                                <p
                                    className="text-xs text-main/70 leading-snug min-h-[2.5rem]"
                                    title={loadingStatusText}
                                >
                                    {loadingStatusText || "Procesando información..."}
                                </p>
                            </div>
                        </div>

                        <div className="w-full h-2 mb-3 bg-main/10 rounded-dx overflow-hidden border border-main/10">
                            <div
                                className="h-full rounded-dx bg-focus-300 transition-[width] duration-300 ease-out"
                                style={{ width: `${displayProgress}%` }}
                            />
                        </div>

                        <p className="text-[11px] text-main/50 leading-snug">
                            No cierre esta ventana mientras se procesan los datos.
                        </p>
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
                {!contentReady && currentStep < 3 ? (
                    <div className="flex flex-col gap-4 p-2 animate-pulse" aria-busy="true">
                        <div className="h-8 w-1/3 rounded-dx bg-main/10" />
                        <div className="h-40 rounded-dx bg-main/5 border border-main/10" />
                        <div className="h-40 rounded-dx bg-main/5 border border-main/10" />
                    </div>
                ) : null}

                {/* Step 0: Product — único step montado al abrir */}
                {contentReady && currentStep === 0 ? (
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
                ) : null}

                {/* Step 1: Items — no montar hasta llegar aquí (antes congelaba la UI al abrir) */}
                {contentReady && currentStep === 1 ? (
                    <>
                        {!isAddingItem ? (
                            <Button
                                width="100%"
                                text={itemsData.length > 0 ? "Añadir otro ítem y sus presentaciones" : "Añadir nuevo ítem y sus presentaciones"}
                                icon="add"
                                type="normal"
                                stylingMode="outlined"
                                className="!border-dashed !border-focus-300/40 !text-focus-300 font-semibold !rounded-dx hover:!bg-focus-300/10 !transition-all mb-4 py-2"
                                onClick={() => setIsAddingItem(true)}
                            />
                        ) : null}

                        <ItemsSection
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
                    </>
                ) : null}

                {/* Step 2: Preview */}
                {contentReady && currentStep === 2 ? (
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
                ) : null}

                {/* Step 3: Resultado */}
                {currentStep === 3 && (() => {
                    const name = createdResult?.name || productData.name || "—";
                    const itemsCount = createdResult?.itemsCount ?? itemsData.length;
                    const presentationsCount = createdResult?.presentationsCount ?? 0;
                    const itemsLabel = itemsCount === 1 ? "ítem" : "ítems";
                    const presentationsLabel = presentationsCount === 1 ? "presentación" : "presentaciones";
                    return (
                        <div className="flex flex-col items-center justify-center min-h-[420px] py-10 px-6 text-center">
                            <div className="text-focus-300 mb-6" aria-hidden>
                                <CheckOutlinedIcon className="w-20 h-20 sm:w-24 sm:h-24" />
                            </div>

                            <p className="text-base sm:text-lg text-main leading-snug max-w-xl mb-8">
                                Producto{" "}
                                <span className="font-semibold text-dx-primary">{name}</span>
                                {" "}con{" "}
                                <span className="font-semibold tabular-nums">{itemsCount}</span>
                                {" "}{itemsLabel} y{" "}
                                <span className="font-semibold tabular-nums">{presentationsCount}</span>
                                {" "}{presentationsLabel} creados con éxito.
                            </p>

                            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-center gap-2 w-full max-w-md">
                                <Button
                                    text="Volver al listado"
                                    stylingMode="text"
                                    className="!rounded-dx !bg-main/10 w-full sm:w-auto"
                                    onClick={onClose}
                                />
                                <Button
                                    text="Ver producto"
                                    type="default"
                                    stylingMode="contained"
                                    className="!bg-focus-300 shadow-lg shadow-black/20 !text-variant !rounded-dx w-full sm:w-auto"
                                    onClick={() => {
                                        if (createdResult?.id) {
                                            window.open(`/products/productDetail?id=${createdResult.id}`, "_blank");
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    );
                })()}

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
