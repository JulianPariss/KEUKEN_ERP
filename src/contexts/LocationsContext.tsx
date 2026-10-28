'use client';

import PERMISSIONS_CONSTANTS from "@repo/access";
import { canDo } from "@repo/access";
import { inventoryService } from '@repo/erp-services/warehouse/inventory.service';
import { stockService } from '@repo/erp-services/stock.service';
import { IFInventory } from "@repo/api-contracts/erp";
import { IFStockByLocation } from "@repo/api-contracts/erp";
import notify from 'devextreme/ui/notify';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { IFLocation } from "@repo/api-contracts/erp";

interface LocationsContextType {
    refreshVersion: number;
    triggerRefresh: () => void;
    selectedLocation: IFLocation | null;
    setSelectedLocation: (location: IFLocation | null) => void;
    activeInventory: IFInventory | null;
    setActiveInventory: (inventory: IFInventory | null) => void;
    stock: IFStockByLocation | null;
    setStock: (stock: IFStockByLocation | null) => void;
    loadingStock: boolean;
    setLoadingStock: (loading: boolean) => void;
    fetchStock: () => void;
}

const LocationsContext = createContext<LocationsContextType | undefined>(undefined);

export const LocationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [refreshVersion, setRefreshVersion] = useState(0);
    const [selectedLocation, setSelectedLocation] = useState<IFLocation | null>(null);
    const [activeInventory, setActiveInventory] = useState<IFInventory | null>(null);
    const [stock, setStock] = useState<IFStockByLocation | null>(null);

    const [loadingStock, setLoadingStock] = useState(true);

    const { token, currentCompany, permissions } = useAuth();

    const triggerRefresh = useCallback(() => {
        setRefreshVersion(prev => prev + 1);
    }, []);

    const canViewInventory = useMemo(() => {
        return permissions ? canDo('view', PERMISSIONS_CONSTANTS.viewInventory, permissions) || false : false;
    }, [permissions])

    const fetchStock = async () => {
        if (!selectedLocation?.id) return;

        setLoadingStock(true);
        try {
            const data = await stockService.getStockByLocation(selectedLocation?.id, token, currentCompany?.id);
            setStock(data);
        } catch (error: any) {
            console.error("Error fetching stock:", error);
            const errorMessage = error instanceof Error && error.message 
                ? error.message 
                : "Error al cargar el stock";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoadingStock(false);
        }
    };

    useEffect(() => {
        const fetchInventory = async () => {

            if (selectedLocation?.id && selectedLocation.usage === 'internal' && canViewInventory) {
                try {
                    const data = await inventoryService.getByLocation(selectedLocation.id, token);
                    setActiveInventory(data);
                } catch (error) {
                    console.error("Error fetching inventory in context:", error);
                    setActiveInventory(null);
                }
            } else {
                setActiveInventory(null);
            }
        };

        fetchInventory();
    }, [selectedLocation?.id, selectedLocation?.usage, refreshVersion, canViewInventory]);

    const value = useMemo(() => ({
        refreshVersion,
        triggerRefresh,
        selectedLocation,
        setSelectedLocation,
        activeInventory,
        setActiveInventory,
        stock,
        setStock,
        loadingStock,
        setLoadingStock,
        fetchStock
    }), [refreshVersion, triggerRefresh, selectedLocation, activeInventory, stock, loadingStock]);

    return (
        <LocationsContext.Provider value={value}>
            {children}
        </LocationsContext.Provider>
    );
};

export const useLocations = () => {
    const context = useContext(LocationsContext);
    if (context === undefined) {
        throw new Error('useLocations must be used within a LocationsProvider');
    }
    return context;
};
