'use client'

import { GridMapProvider } from "@/contexts/GridMapContext";
import { LocationsProvider } from "@/contexts/LocationsContext";
import LocationsClient from "./locationsClient";

const LocationsSection = ({ warehouseId }: { warehouseId: string }) => {
    return (
        <div key={`locations-scope-${warehouseId}`} className="flex flex-col flex-1 min-h-0 h-full">
            <LocationsProvider>
                <GridMapProvider>
                    <LocationsClient warehouseId={warehouseId} />
                </GridMapProvider>
            </LocationsProvider>
        </div>
    );
};

export default LocationsSection;
