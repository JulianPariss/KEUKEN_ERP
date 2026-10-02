'use client';

import { Suspense } from "react";
import SectionHeader from "../../components/section/sectionHeader";
import SaleOrderDetailClient from ".";

function SaleOrderDetailPageContent() {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Detalle del Pedido de Venta" />
            <SaleOrderDetailClient />
        </div>
    );
}

export default function SaleOrderDetailPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
                <p className="text-main/60 text-sm animate-pulse">Cargando...</p>
            </div>
        }>
            <SaleOrderDetailPageContent />
        </Suspense>
    );
}
