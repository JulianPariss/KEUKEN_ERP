'use client';

import { priceListsService } from '@/app/services/priceLists/priceLists.service';
import { productsService } from '@/app/services/product_services/products.service';
import { itemsService } from '@/app/services/product_services/items.service';
import { IFPriceListItemCreate } from "@repo/api-contracts/erp";
import { IFOptionItem } from "@repo/api-contracts/erp";
import { useAuth } from '@/contexts/AuthContext';
import { Button, SelectBox } from '@repo/devextreme';
import { NumberBox } from 'devextreme-react/number-box';
import { Popup } from 'devextreme-react/popup';
import notify from 'devextreme/ui/notify';
import { useEffect, useState } from 'react';

interface AddNewRuleProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    pricelistId: string;
    initialData?: {
        productId: string;
        priceTarget: number;
    };
}

export default function AddNewRule({ isOpen, onClose, onSuccess, pricelistId, initialData }: AddNewRuleProps) {
    const { token, currentCompany } = useAuth();

    const [productId, setProductId] = useState('');
    const [itemId, setItemId] = useState('');
    const [type, setType] = useState('regular');
    const [minQuantity, setMinQuantity] = useState<number>(1);
    const [breakpointPackagingLevelCode, setBreakpointPackagingLevelCode] = useState('UNIDAD');
    const [base, setBase] = useState('fixed');
    const [priceTarget, setPriceTarget] = useState<number>(0);
    const [marginOverCost, setMarginOverCost] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    const [products, setProducts] = useState<IFOptionItem[]>([]);
    const [items, setItems] = useState<IFOptionItem[]>([]);
    const [packagingLevels, setPackagingLevels] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            setProductId(initialData?.productId || '');
            setItemId('');
            setType('regular');
            setMinQuantity(1);
            setBreakpointPackagingLevelCode('UNIDAD');
            setBase('fixed');
            setPriceTarget(initialData?.priceTarget || 0);
            setMarginOverCost(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!isOpen || !token || !currentCompany?.id) return;
            try {
                const res = await productsService.getOptions(currentCompany.id, { limit: 200, active: true }, token);
                setProducts(res.items);
            } catch (err) {
                console.error("Error loading products:", err);
            }
        };
        fetchProducts();

        const fetchPackagingLevels = async () => {
            if (!isOpen || !token) return;
            try {
                const res = await productsService.getPackagingLevels(token);
                setPackagingLevels(res);
            } catch (err) {
                console.error("Error loading packaging levels:", err);
            }
        };
        fetchPackagingLevels();
    }, [isOpen, token, currentCompany]);

    useEffect(() => {
        const fetchItems = async () => {
            if (!isOpen || !token || !currentCompany?.id || !productId) {
                setItems([]);
                return;
            }
            try {
                const res = await itemsService.getOptions(currentCompany.id, { limit: 200, active: true, productId }, token);
                const fetchedItems = res.items || [];
                if (!initialData) {
                    const defaultOption: IFOptionItem = { id: '', label: 'Utilizar Producto' };
                    setItems([defaultOption, ...fetchedItems]);
                } else {
                    setItems(fetchedItems);
                }
            } catch (err) {
                console.error("Error loading items:", err);
            }
        };
        fetchItems();
    }, [isOpen, token, currentCompany, productId, initialData]);

    const handleCreate = async () => {
        if (!pricelistId || !productId || !type || !base) {
            notify('Por favor complete los campos obligatorios', 'warning', 3000);
            return;
        }

        if (!token) {
            notify('Error de autenticación', 'error', 3000);
            return;
        }

        setLoading(true);
        try {
            const data: IFPriceListItemCreate = {
                pricelistId,
                productId,
                itemId: itemId ? itemId : null,
                type,
                minQuantity,
                breakpointPackagingLevelCode,
                base,
                priceTarget,
                ...(base === 'cost' ? { marginOverCost: Number(marginOverCost) || 0 } : {}),
            };

            await priceListsService.addRule(data, token);
            notify('Regla de precio añadida correctamente', 'success', 3000);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error adding rule:', error);
            notify(error.message || 'Error al crear la regla', 'error', 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Popup
            visible={isOpen}
            onHiding={() => {
                if (!loading) {
                    onClose();
                }
            }}
            dragEnabled={false}
            hideOnOutsideClick={!loading}
            showCloseButton={!loading}
            showTitle={true}
            title="Añadir Nueva Regla"
            width={600}
            height="auto"
            className="rounded-dx"
        >
            <div className="flex flex-col gap-4 p-2">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-main/80">Producto *</label>
                    <SelectBox
                        items={products}
                        valueExpr="id"
                        displayExpr="label"
                        value={productId}
                        onValueChanged={(e) => {
                            setProductId(e.value);
                            setItemId('');
                        }}
                        placeholder="Seleccione un producto..."
                        searchEnabled={true}
                        readOnly={!!initialData?.productId}
                        stylingMode="filled"
                        dropDownOptions={{ wrapperAttr: { class: "popup-menu-container" } }}
                        width="100%"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-main/80">Item (Opcional)</label>
                    <SelectBox
                        items={items}
                        valueExpr="id"
                        displayExpr="label"
                        value={itemId}
                        onValueChanged={(e) => setItemId(e.value)}
                        placeholder="Seleccione un item..."
                        searchEnabled={true}
                        stylingMode="filled"
                        dropDownOptions={{ wrapperAttr: { class: "popup-menu-container" } }}
                        width="100%"
                        disabled={!productId}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-main/80">Tipo *</label>
                        <SelectBox
                            items={[
                                { id: 'regular', name: 'Regular' },
                            ]}
                            valueExpr="id"
                            displayExpr="name"
                            readOnly
                            value={type}
                            onValueChanged={(e) => setType(e.value)}
                            stylingMode="filled"
                            dropDownOptions={{ wrapperAttr: { class: "popup-menu-container" } }}
                            width="100%"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-main/80">Cantidad Mínima *</label>
                        <NumberBox
                            value={minQuantity}
                            onValueChanged={(e) => setMinQuantity(e.value)}
                            min={1}
                            showSpinButtons={true}
                            stylingMode="filled"
                            width="100%"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-main/80">Nivel de Empaque *</label>
                        <SelectBox
                            items={packagingLevels}
                            valueExpr="code"
                            displayExpr="name"
                            value={breakpointPackagingLevelCode}
                            onValueChanged={(e) => setBreakpointPackagingLevelCode(e.value)}
                            placeholder="Seleccione un nivel..."
                            searchEnabled={true}
                            stylingMode="filled"
                            dropDownOptions={{ wrapperAttr: { class: "popup-menu-container" } }}
                            width="100%"
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-sm font-medium text-main/80">Base *</label>
                            <SelectBox
                                items={[
                                    { id: 'fixed', name: 'Fijo (Fixed)' },
                                    { id: 'cost', name: 'Costo' },
                                ]}
                                valueExpr="id"
                                displayExpr="name"
                                value={base}
                                onValueChanged={(e) => setBase(e.value)}
                                stylingMode="filled"
                                dropDownOptions={{ wrapperAttr: { class: "popup-menu-container" } }}
                                width="100%"
                            />
                        </div>
                        {base === 'cost' && (
                            <div className="flex-1 flex flex-col gap-2">
                                <label className="text-sm font-medium text-main/80">Margen (%) *</label>
                                <NumberBox
                                    value={marginOverCost}
                                    onValueChanged={(e) => setMarginOverCost(e.value)}
                                    min={0}
                                    format="#,##0.00"
                                    showSpinButtons={true}
                                    stylingMode="filled"
                                    width="100%"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-main/80">Precio Objetivo *</label>
                        <NumberBox
                            value={priceTarget}
                            onValueChanged={(e) => setPriceTarget(e.value)}
                            min={0}
                            format="#,##0.00"
                            stylingMode="filled"
                            width="100%"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-main/10">
                    <Button
                        text="Cancelar"
                        stylingMode="text"
                        onClick={onClose}
                        disabled={loading}
                    />
                    <Button
                        text={loading ? "Guardando..." : "Crear Regla"}
                        type="default"
                        stylingMode="contained"
                        onClick={handleCreate}
                        disabled={loading}
                    />
                </div>
            </div>
        </Popup>
    );
}
