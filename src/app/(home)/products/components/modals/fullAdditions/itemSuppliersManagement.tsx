'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { SelectBox, Button } from '@repo/devextreme';
import { TextBox } from 'devextreme-react';
import { ValidationGroup } from 'devextreme-react/validation-group';
import Validator, { RequiredRule } from 'devextreme-react/validator';
import notify from 'devextreme/ui/notify';
import { FIELD_LIMITS } from '@/app/lib/constants/common.constants';
import { itemsService } from '@/app/services/product_services/items.service';
import { IFProvider } from '@repo/api-contracts/erp';

interface IItemSuppliersManagementProps {
    currentItem: any;
    suppliers: IFProvider[];
    itemsData: any[];
    token: string | null;
    currentCompany: string;
}

/**
 * Gestión de proveedores vinculados a un ítem.
 * solve-modal-wrong-re-rendering + Dxdocs:
 * 1. Mutación in-place de `currentItem.suppliers` (misma ref del ítem / Form padre).
 * 2. Preferir ValidationGroup.reset(); remount con key solo al cambiar de ítem.
 * 3. tempSupplierRef evita setState en cada tecla.
 * 4. Prioridad implícita por orden de creación.
 */
export const ItemSuppliersManagement: React.FC<IItemSuppliersManagementProps> = ({
    currentItem,
    suppliers,
    itemsData,
    token,
    currentCompany,
}) => {
    const validationGroupRef = useRef<any>(null);
    const supplierSelectRef = useRef<any>(null);
    const supplierSkuBoxRef = useRef<any>(null);
    /** Remount solo al cambiar de ítem lógico (fallback Dxdocs §7) */
    const [groupKey, setGroupKey] = useState(0);
    const [renderTrigger, setRenderTrigger] = useState(0);
    const boundItemRef = useRef(currentItem);

    const tempSupplierRef = useRef({
        supplierId: '',
        supplierSku: '',
        active: true,
    });

    const [supplierSkuError, setSupplierSkuError] = useState<string | null>(null);
    /** Solo el submit «Vincular» deshabilita el botón; el check de blur no debe tragarse el click */
    const [isLinking, setIsLinking] = useState(false);

    const resetDraftEditors = () => {
        tempSupplierRef.current = {
            supplierId: '',
            supplierSku: '',
            active: true,
        };
        setSupplierSkuError(null);
        const vg = validationGroupRef.current?.instance?.();
        if (vg && typeof vg.reset === 'function') {
            vg.reset();
            setRenderTrigger((t) => t + 1);
            return;
        }
        setGroupKey((k) => k + 1);
        setRenderTrigger((t) => t + 1);
    };

    // Reiniciar borrador solo al cambiar de ítem lógico (no en shallow-copies por media/etc.).
    useEffect(() => {
        if (boundItemRef.current === currentItem) return;

        const prev = boundItemRef.current;
        const sameSuppliersArray = prev?.suppliers === currentItem?.suppliers;
        const sameIdentity =
            (prev?.sku || '') === (currentItem?.sku || '') &&
            (prev?.itemName || '') === (currentItem?.itemName || '');

        boundItemRef.current = currentItem;

        if (sameSuppliersArray && sameIdentity) {
            setRenderTrigger((t) => t + 1);
            return;
        }

        // Cambio de ítem: remount prístino del borrador
        tempSupplierRef.current = {
            supplierId: '',
            supplierSku: '',
            active: true,
        };
        setSupplierSkuError(null);
        setGroupKey((k) => k + 1);
        setRenderTrigger((t) => t + 1);
    }, [currentItem]);

    const currentSuppliers: any[] = useMemo(() => {
        return Array.isArray(currentItem?.suppliers) ? [...currentItem.suppliers] : [];
        // eslint-disable-next-line react-hooks/exhaustive-deps -- renderTrigger fuerza refresco tras mutación in-place
    }, [currentItem, renderTrigger]);

    const availableSuppliers = useMemo(() => {
        const addedIds = new Set(
            currentSuppliers
                .map((s: any) => String(s.supplierId || s.supplier_id || s.id || s.supplier?.id || ''))
                .filter(Boolean)
        );
        return (suppliers || []).filter((s) => s?.id && !addedIds.has(String(s.id)));
    }, [suppliers, currentSuppliers]);

    /** Commit del texto del TextBox → value (DX a veces demora el valueChangeEvent hasta el blur). */
    const syncDraftFromEditors = () => {
        const select = supplierSelectRef.current;
        if (select && typeof select.option === 'function') {
            const v = select.option('value');
            tempSupplierRef.current.supplierId = v || '';
        }
        const box = supplierSkuBoxRef.current;
        if (box && typeof box.option === 'function') {
            const text = box.option('text');
            const value = box.option('value');
            const raw = (typeof text === 'string' && text.length > 0 ? text : value) || '';
            const trimmed = String(raw).trim();
            tempSupplierRef.current.supplierSku = trimmed;
            if (box.option('value') !== trimmed) {
                box.option('value', trimmed);
            }
        }
    };

    const handleSupplierSkuBlur = async () => {
        syncDraftFromEditors();
        const trimmedSku = (tempSupplierRef.current.supplierSku || '').trim();
        const suppId = tempSupplierRef.current.supplierId;
        if (!trimmedSku || !suppId) {
            setSupplierSkuError(null);
            return;
        }

        const duplicateInOtherItems = itemsData.some((item: any) =>
            (item.suppliers || []).some(
                (s: any) =>
                    (s.supplierId || s.supplier_id) === suppId &&
                    (s.supplierSku || s.supplier_sku || '').trim().toLowerCase() === trimmedSku.toLowerCase()
            )
        );
        if (duplicateInOtherItems) {
            setSupplierSkuError('Ese código de proveedor ya está en uso en otro ítem de la lista');
            return;
        }

        if (!token) return;
        try {
            const res = await itemsService.checkSupplierSkuAvailability(
                { supplierId: suppId, supplierSku: trimmedSku },
                token,
                currentCompany
            );
            if (!res.available) {
                setSupplierSkuError('Ese código de proveedor ya está asignado a otro ítem');
            } else {
                setSupplierSkuError(null);
            }
        } catch {
            setSupplierSkuError(null);
        }
    };

    const handleAddSupplier = async () => {
        // 1) Forzar commit del SKU tipado (evita 1er click con validate vacío / ref stale)
        syncDraftFromEditors();

        const valResult = validationGroupRef.current?.instance().validate();
        if (!valResult?.isValid) {
            const messages = [...new Set(
                (valResult?.brokenRules || [])
                    .map((r: any) => r?.message)
                    .filter((m: unknown): m is string => typeof m === 'string' && m.trim().length > 0)
            )];
            notify(
                messages[0] || 'Complete proveedor y código SKU antes de vincular',
                'warning',
                3000
            );
            return;
        }

        const suppId = tempSupplierRef.current.supplierId;
        const trimmedSku = (tempSupplierRef.current.supplierSku || '').trim();

        if (!suppId) {
            notify('Seleccione un proveedor', 'warning', 2500);
            return;
        }
        if (!trimmedSku) {
            setSupplierSkuError('El código de proveedor es obligatorio');
            return;
        }

        const duplicateInOtherItems = itemsData.some((item: any) =>
            (item.suppliers || []).some(
                (s: any) =>
                    (s.supplierId || s.supplier_id) === suppId &&
                    (s.supplierSku || s.supplier_sku || '').trim().toLowerCase() === trimmedSku.toLowerCase()
            )
        );
        if (duplicateInOtherItems) {
            setSupplierSkuError('Ese código de proveedor ya está en uso en otro ítem de la lista');
            return;
        }

        setIsLinking(true);
        try {
            if (token) {
                try {
                    const res = await itemsService.checkSupplierSkuAvailability(
                        { supplierId: suppId, supplierSku: trimmedSku },
                        token,
                        currentCompany
                    );
                    if (!res.available) {
                        setSupplierSkuError('Ese código de proveedor ya está asignado a otro ítem');
                        return;
                    }
                    setSupplierSkuError(null);
                } catch {
                    // Error de red: permitir continuar
                }
            }

            if (!Array.isArray(currentItem.suppliers)) {
                currentItem.suppliers = [];
            }

            // Prioridad = orden de creación (1-based); no se edita en UI
            const newSupplier = {
                supplierId: suppId,
                supplierSku: trimmedSku,
                priority: currentItem.suppliers.length + 1,
                active: true,
            };

            currentItem.suppliers.push(newSupplier);
            resetDraftEditors();
        } finally {
            setIsLinking(false);
        }
    };

    const handleRemoveSupplier = (suppId: string) => {
        if (!Array.isArray(currentItem.suppliers)) return;

        currentItem.suppliers = currentItem.suppliers.filter(
            (s: any) => String(s.supplierId || s.supplier_id || s.id || '') !== String(suppId)
        );
        // Reasignar prioridad según el nuevo orden de la lista
        currentItem.suppliers.forEach((s: any, idx: number) => {
            s.priority = idx + 1;
        });

        if (String(tempSupplierRef.current.supplierId) === String(suppId)) {
            resetDraftEditors();
            return;
        }
        setRenderTrigger((t) => t + 1);
    };

    // Evita que el Form padre de DevExtreme capture mousedown/click y “trague” la interacción
    const stopFormCapture = (e: React.SyntheticEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            className="p-3 bg-primary-0/30 rounded-dx border border-main/10 flex flex-col gap-3 relative z-10"
            onMouseDown={stopFormCapture}
            onClick={stopFormCapture}
            onPointerDown={stopFormCapture}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-main">Proveedores del Ítem</span>
                    <span className="text-xs text-main/50">(Código de proveedor obligatorio)</span>
                </div>
                <span className="text-xs text-main/60">{currentSuppliers.length} vinculado(s)</span>
            </div>

            <ValidationGroup key={groupKey} ref={validationGroupRef}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-primary-0/20 p-2.5 rounded-lg border border-main/5">
                    <div className="md:col-span-5 flex flex-col gap-1">
                        <label className="text-xs text-main/70">Proveedor</label>
                        <SelectBox
                            dataSource={availableSuppliers}
                            valueExpr="id"
                            displayExpr="name"
                            defaultValue={tempSupplierRef.current.supplierId || null}
                            onInitialized={(e) => {
                                supplierSelectRef.current = e.component;
                            }}
                            onValueChanged={(e) => {
                                tempSupplierRef.current.supplierId = e.value || '';
                                if (supplierSkuError) setSupplierSkuError(null);
                            }}
                            searchEnabled={true}
                            placeholder="Elegir proveedor..."
                            stylingMode="filled"
                            dropDownOptions={{
                                wrapperAttr: { class: 'popup-menu-container' },
                                // Anclar al body para que el click en opciones no se pierda dentro del Popup/Form
                                container: typeof document !== 'undefined' ? document.body : undefined,
                            }}
                        >
                            <Validator>
                                <RequiredRule message="Seleccione un proveedor" />
                            </Validator>
                        </SelectBox>
                    </div>

                    <div className="md:col-span-5 flex flex-col gap-1">
                        <label className="text-xs text-main/70">
                            Cód. Proveedor (SKU) <span className="text-error">*</span>
                        </label>
                        <TextBox
                            defaultValue={tempSupplierRef.current.supplierSku}
                            valueChangeEvent="input"
                            onInitialized={(e) => {
                                supplierSkuBoxRef.current = e.component;
                            }}
                            onValueChanged={(e) => {
                                tempSupplierRef.current.supplierSku = e.value || '';
                                if (supplierSkuError) setSupplierSkuError(null);
                            }}
                            onFocusOut={handleSupplierSkuBlur}
                            placeholder="Ej: PROV-ART-101"
                            stylingMode="filled"
                            maxLength={FIELD_LIMITS.stringShort}
                        >
                            <Validator>
                                <RequiredRule message="El código de proveedor es obligatorio" />
                            </Validator>
                        </TextBox>
                    </div>

                    <div className="md:col-span-2 flex items-center justify-end">
                        <Button
                            text={isLinking ? 'Verificando...' : 'Vincular'}
                            icon="add"
                            type="default"
                            stylingMode="contained"
                            // Evita que el mousedown robe el foco y dispare blur+re-render antes del click
                            onMouseDown={(e: any) => {
                                e.event?.preventDefault?.();
                                e.preventDefault?.();
                            }}
                            onClick={handleAddSupplier}
                            disabled={isLinking}
                            className="w-full"
                        />
                    </div>
                </div>
            </ValidationGroup>

            {supplierSkuError && (
                <div className="text-xs text-error font-medium px-1 flex items-center gap-1">
                    <i className="dx-icon dx-icon-warning" /> {supplierSkuError}
                </div>
            )}

            {currentSuppliers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                    {currentSuppliers.map((s: any, idx: number) => {
                        const sId = s.supplierId || s.supplier_id || s.id;
                        const prov = suppliers.find((p: any) => p.id === sId);
                        const provName = prov?.name || s.name || sId;
                        const sSku = s.supplierSku || s.supplier_sku;
                        return (
                            <div
                                key={sId || idx}
                                className="flex items-center gap-2 bg-main/5 hover:bg-main/10 border border-main/15 px-2.5 py-1.5 rounded-lg text-xs text-main transition-colors"
                            >
                                <span className="text-[10px] text-main/50 font-mono w-4 shrink-0">{idx + 1}.</span>
                                <span className="font-semibold">{provName}</span>
                                <span className="bg-focus-500/20 text-focus-300 font-mono px-1.5 py-0.5 rounded text-[11px] border border-focus-500/30">
                                    {sSku}
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleRemoveSupplier(sId);
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="text-error/70 hover:text-error ml-1 p-0.5 cursor-pointer"
                                    title="Quitar proveedor"
                                >
                                    <i className="dx-icon dx-icon-trash text-xs" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ItemSuppliersManagement;
