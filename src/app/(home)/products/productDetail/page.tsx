'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { productsService } from '@/app/services/product_services/products.service';
import SectionHeader from "../../components/section/sectionHeader";
import ProductDetailClient from "./components/ProductDetailClient";
import { IFProductFullItem } from "@repo/api-contracts/erp";
import notify from 'devextreme/ui/notify';

function ProductDetailPageContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') || '';
    const { token } = useAuth();
    const [product, setProduct] = useState<IFProductFullItem | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token || !id) {
            setProduct(null);
            setLoading(false);
            return;
        }

        let active = true;
        setLoading(true);

        productsService.getFullById(id, token)
            .then((data) => {
                if (active) {
                    setProduct(data);
                    setLoading(false);
                }
            })
            .catch((err: any) => {
                console.error("Error fetching product details:", err);
                const errorMessage = err instanceof Error && err.message ? err.message : "Error al cargar los detalles del producto";
                notify(errorMessage, "error", 3000);
                if (active) {
                    setProduct(null);
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [id, token]);

    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title={`Detalle de Producto: ${product?.name || (loading ? 'Cargando...' : '')}`}>
                <p className="text-xs !text-main/70">
                    Busca un producto para visualizar sus detalles, ítems y presentaciones asociadas.
                </p>
            </SectionHeader>
            <div className="flex-1 flex flex-col min-h-0 pr-1">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-main/60 text-sm animate-pulse">Cargando detalles del producto...</p>
                    </div>
                ) : (
                    <ProductDetailClient product={product} />
                )}
            </div>
        </div>
    );
}

export default function ProductDetailPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
                <p className="text-main/60 text-sm animate-pulse">Cargando...</p>
            </div>
        }>
            <ProductDetailPageContent />
        </Suspense>
    );
}
