'use client';

import { Suspense } from "react";
import SectionHeader from "../../components/section/sectionHeader";
import PriceListDetailClient from ".";

function PriceListDetailPageContent() {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Gestionar Listas de Precios" />
            <PriceListDetailClient />
        </div>
    );
}

export default function PriceListDetailPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
                <p className="text-main/60 text-sm animate-pulse">Cargando...</p>
            </div>
        }>
            <PriceListDetailPageContent />
        </Suspense>
    );
}
