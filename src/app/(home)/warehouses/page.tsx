'use client'

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SectionHeader from "../components/section/sectionHeader";
import LocationsSection from "./components/locations";
import WarehousesSection from "./components/warehouses";

const WarehousesPageContent = () => {
    const searchParams = useSearchParams();
    const warehouseId = searchParams.get('warehouseId') || '';

    return (
        <div className="flex flex-col w-full h-full">

            <WarehousesSection selectedWarehouseId={warehouseId} />
            <div className="flex-1 min-h-0 h-full">
                {warehouseId ?
                    <LocationsSection warehouseId={warehouseId} />
                    :
                    <div className="h-full w-full py-2">
                        <div className="w-full h-full bg-primary-900/40 rounded-dx text-gray-500 flex items-center justify-center flex-col gap-y-5">
                            <i style={{ fontSize: "30px" }} className="dx-icon-taskhelpneeded !text-main/40"></i>
                            <p className="text-lg !text-main/40">Seleccione un depósito</p>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

const WarehousesPage = () => {
    return (
        <Suspense fallback={null}>
            <WarehousesPageContent />
        </Suspense>
    );
};

export default WarehousesPage;