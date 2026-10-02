'use client';

import PERMISSIONS_CONSTANTS from "@/app/lib/constants/permissions.constants";
import { canDo } from "@/app/lib/utils/permission.helper";
import { IFLocation } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { useLocations } from "@/contexts/LocationsContext";
import { useMemo } from "react";
import LocationsList from "./locationsList";
import StockList from "./stockList";

interface LocationsListProps {
    warehouseId: string;
    currentParentId: string | null;
    onSelectStorage: (location: IFLocation | null) => void;
    onGoBack: () => void;
}

const LocationsListGrid = ({ warehouseId, currentParentId, onSelectStorage }: LocationsListProps) => {
    const { selectedLocation } = useLocations();

    const isStorage = useMemo(() =>
        selectedLocation?.usage === 'internal',
        [selectedLocation]);

    const { permissions } = useAuth();

    const canViewStock = useMemo(() => {
        return permissions ? canDo('view', PERMISSIONS_CONSTANTS.viewStock, permissions) : false;
    }, [permissions])

    return (
        <div className="flex flex-col w-full min-w-full h-full rounded-dx font-sans overflow-hidden">
            <div className="w-full h-full flex flex-col">
                <div className="w-full flex-1 min-h-0">
                    {isStorage && canViewStock ? (
                        <StockList />
                    ) : (
                        <LocationsList
                            warehouseId={warehouseId}
                            currentParentId={currentParentId}
                            onSelectLocation={(loc) => onSelectStorage(loc)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationsListGrid;
