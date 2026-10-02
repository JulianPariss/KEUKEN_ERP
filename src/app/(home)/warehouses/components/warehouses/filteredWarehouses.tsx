"use client";

import { IWarehouse } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import FirstWarehouseBanner from "./firstWarehouseBanner";
import WarehouseCarousel from "./warehouseCarousel";

interface FilteredWarehousesProps {
    warehouses: IWarehouse[];
    selectedWarehouseId?: string;
    fetchWarehouses: () => Promise<void>;
    isRefreshing?: boolean;
}

const FilteredWarehouses = ({ warehouses, selectedWarehouseId, fetchWarehouses, isRefreshing }: FilteredWarehousesProps) => {
    const { currentCompany } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("warehouseId")) {
            router.push("/warehouses");
        }
    }, [currentCompany?.id, router]);

    if (warehouses.length === 0) {
        return <FirstWarehouseBanner fetchWarehouses={fetchWarehouses} />;
    }

    return <WarehouseCarousel warehouses={warehouses} selectedWarehouseId={selectedWarehouseId} fetchWarehouses={fetchWarehouses} disabled={isRefreshing} />;
};

export default FilteredWarehouses;
