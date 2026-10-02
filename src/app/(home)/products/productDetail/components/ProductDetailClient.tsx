'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SelectBox } from '@repo/devextreme';
import CustomStore from 'devextreme/data/custom_store';
import { useAuth } from '@/contexts/AuthContext';
import { productsService } from '@/app/services/product_services/products.service';
import { uomsService } from '@/app/services/product_services/uoms.service';
import { packagingLevelService } from '@/app/services/product_services/packagingLevel.service';
import { brandsService } from '@/app/services/product_services/brand.service';
import { IFProductFullItem } from "@repo/api-contracts/erp";
import ProductInfoSection from './ProductInfoSection';
import ItemsAndPresentationsSection from './ItemsAndPresentationsSection';
import GenericEmpty from '@/components/GenericEmpty';
import notify from 'devextreme/ui/notify';

interface IProductDetailClientProps {
    product: IFProductFullItem | null;
}

const ProductDetailClient = ({ product }: IProductDetailClientProps) => {
    const { token, currentCompany } = useAuth();
    const router = useRouter();

    const [selectedValue, setSelectedValue] = useState<string | null>(product?.id || null);
    const [uoms, setUoms] = useState<any[]>([]);
    const [packagingLevels, setPackagingLevels] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);

    useEffect(() => {
        setSelectedValue(product?.id || null);
    }, [product]);

    useEffect(() => {
        if (!token || !currentCompany?.id) return;
        const loadMetadata = async () => {
            try {
                const [uomsRes, plRes, brandsRes] = await Promise.all([
                    uomsService.getAll({ offset: 0, limit: 550 }, token),
                    packagingLevelService.getAll(token),
                    brandsService.getAll(currentCompany.id, { offset: 0, limit: 500 }, token)
                ]);
                setUoms(uomsRes.items);
                setPackagingLevels(plRes);
                setBrands(brandsRes.items);
            } catch (err: any) {
                console.error("Error loading metadata for details:", err);
                const errorMessage = err instanceof Error && err.message ? err.message : "Error al cargar metadatos de productos";
                notify(errorMessage, "error", 3000);
            }
        };
        loadMetadata();
    }, [token, currentCompany?.id]);

    const productRef = useRef(product);
    productRef.current = product;

    const productDataSource = useMemo(() => {
        return new CustomStore({
            key: 'id',
            load: async (loadOptions) => {
                if (!currentCompany?.id) return [];
                try {
                    const response = await productsService.getOptions(currentCompany.id, {
                        limit: 30,
                        offset: 0,
                        q: loadOptions.searchValue || "",
                        active: true
                    }, token);
                    return response.items;
                } catch (error: any) {
                    console.error('Error loading search products options:', error);
                    const errorMessage = error instanceof Error && error.message ? error.message : 'Error al cargar opciones de productos';
                    notify(errorMessage, 'error', 3000);
                    return [];
                }
            },
            byKey: async (key) => {
                const currentProduct = productRef.current;
                if (currentProduct && currentProduct.id === key) {
                    return { id: currentProduct.id, label: currentProduct.name, code: currentProduct.prefix };
                }
                if (!currentCompany?.id) return { id: key, label: "Producto" };
                try {
                    const response = await productsService.getOptions(currentCompany.id, {
                        limit: 100,
                        offset: 0,
                    }, token);
                    const found = response.items.find(item => item.id === key);
                    return found || { id: key, label: "Producto seleccionado" };
                } catch {
                    return { id: key, label: "Producto" };
                }
            }
        });
    }, [token, currentCompany]);

    return (
        <div className="flex flex-col gap-2 w-full h-full min-h-0 relative font-sans">
            {/* Buscador de productos */}
            <div className="w-full shrink-0">
                <SelectBox
                    dataSource={productDataSource}
                    valueExpr="id"
                    displayExpr="label"
                    searchEnabled={true}
                    searchMode="contains"
                    searchExpr={["label", "code"]}
                    value={selectedValue}
                    onValueChanged={(e) => {
                        setSelectedValue(e.value);
                        if (e.value) {
                            router.push(`/products/productDetail?id=${e.value}`);
                        } else {
                            router.push('/products/productDetail');
                        }
                    }}
                    placeholder="Buscar por nombre o prefijo..."
                    showClearButton={true}
                    stylingMode="filled"
                    elementAttr={{ class: "rounded-dx" }}
                />
            </div>

            {/* Detalles del producto */}
            {product ? (
                <div className="flex-1 flex flex-col lg:flex-row gap-2 min-h-0 w-full">
                    <div className="w-full lg:w-[35%] shrink-0">
                        <ProductInfoSection product={product} brands={brands} />
                    </div>
                    <div className="flex-1 min-h-0">
                        <ItemsAndPresentationsSection
                            items={product.items}
                            uoms={uoms}
                            packagingLevels={packagingLevels}
                        />
                    </div>
                </div>
            ) : (
                <GenericEmpty
                    title="Ningún producto seleccionado"
                    description="Utiliza el buscador de arriba para cargar la ficha técnica completa del producto."
                />
            )}
        </div>
    );
};

export default ProductDetailClient;
