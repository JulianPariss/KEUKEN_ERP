'use client';

import PERMISSIONS_CONSTANTS from "@/app/lib/constants/permissions.constants";
import { useDelayedLoading } from "@/app/lib/hooks/useDelayedLoading";
import { useInfiniteScroll } from "@/app/lib/hooks/useInfiniteScroll";
import { canDo } from "@/app/lib/utils/permission.helper";
import { locationService } from "@/app/services/warehouse/locations.service";
import { IFLocation } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { useLocations } from "@/contexts/LocationsContext";
import { LoadIndicator, ScrollView } from "devextreme-react";
import { ScrollViewRef } from "devextreme-react/cjs/scroll-view";
import { useCallback, useEffect, useMemo, useRef } from "react";
import LocationsAdjustInventory from "../actions/inventory";
import { renderLocationActions } from "../../../lib/utils";
import InventoryListCard from "./inventoryListCard";
import LocationItem from "./item";
import StockListCard from "./stockListCard";


interface IListCardProps {
    onSelectStorage: (storage: IFLocation) => void;
    onGoBack?: () => void;
    hasParent: boolean;
    levelName: string;
    onCreateNew?: () => void;
    currentParentId: string | null;
    warehouseId: string;
}

const LocationsListCard = (props: IListCardProps) => {

    const {
        onSelectStorage,
        onGoBack,
        hasParent,
        levelName,
        currentParentId,
        warehouseId,
    } = props;
    const scrollRef = useRef<ScrollViewRef>(null);

    const { token, permissions } = useAuth();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.instance().scrollTo(0);
        }
    }, [currentParentId]);

    const { refreshVersion, selectedLocation, activeInventory, stock, setStock, loadingStock, setLoadingStock } = useLocations();

    const isStorage = useMemo(() =>
        selectedLocation?.usage === 'internal',
        [selectedLocation]);

    const infiniteScrollParams = useMemo(() => ({
        currentParentId,
        isInternalOnly: isStorage,
        refreshVersion
    }), [currentParentId, isStorage, refreshVersion]);

    const fetchDataCallback = useCallback(async (pageNum: number, p: any) => {
        if (p.isInternalOnly) return { data: [], total: 0 };
        const response = await locationService.getAll({
            offset: (pageNum - 1) * 10,
            limit: 10,
            warehouseId,
            parent: p.currentParentId ?? warehouseId
        }, token);
        return {
            data: response.items,
            total: response.metadata.totalItems
        };
    }, [warehouseId]);

    const { items, isLoading, hasMore, totalItems, refresh } = useInfiniteScroll<IFLocation>(scrollRef, {
        fetchData: fetchDataCallback,
        params: infiniteScrollParams,
        initialPage: 1,
        pageSize: 10,
        threshold: 10,
    });

    const showLoader = useDelayedLoading(isLoading, 500);

    const actionsObj = useMemo(() => renderLocationActions({
        warehouseId,
        parentPath: levelName,
        parentId: selectedLocation?.id || '',
        onSuccess: refresh
    }), [warehouseId, levelName, selectedLocation, refresh]);

    const canViewInventory = useMemo(() => {
        return permissions ? canDo('view', PERMISSIONS_CONSTANTS.viewInventory, permissions) : false;
    }, [permissions])

    const canViewStock = useMemo(() => {
        return permissions ? canDo('view', PERMISSIONS_CONSTANTS.viewStock, permissions) : false;
    }, [permissions])

    return (
        <div className="h-full w-full flex flex-col min-h-0">
            <div className="flex-1 min-h-0">
                <ScrollView
                    ref={scrollRef}
                    direction="vertical"
                    showScrollbar="onHover"
                    useNative={false}
                    scrollByContent={true}
                    bounceEnabled={false}
                    width="auto"
                    height='100%'
                    className="pb-5"
                >
                    <div className="flex flex-col flex-nowrap gap-y-2">
                        {hasParent && (
                            <div
                                onClick={onGoBack}
                                className="h-full select-none w-full flex-shrink-0 cursor-pointer group"
                            >
                                <div className="h-full w-full bg-primary-900 border border-primary-500/30 rounded-dx p-4 flex items-center gap-3 hover:bg-primary-500/20 transition-all duration-300">
                                    <div className="size-8 flex items-center justify-center bg-focus-500/10 text-focus-100 rounded-dx group-hover:scale-110 transition-transform">
                                        <i className="dx-icon-back text-xl"></i>
                                    </div>
                                    <span className="text-sm  font-bold opacity-70">Volver al nivel anterior</span>
                                </div>
                            </div>
                        )}
                        {items.length > 0 ? (
                            <>
                                {items.map((item) => (
                                    <LocationItem
                                        key={item.id}
                                        item={item}
                                        onClick={() => onSelectStorage(item)}
                                    />
                                ))}
                                {showLoader && (
                                    <div className="w-full flex items-center justify-center py-4 animate-loader-in">
                                        <LoadIndicator width={24} height={24} visible={true} />
                                    </div>
                                )}
                            </>
                        ) : (
                            !isLoading ? (
                                isStorage && canViewStock ? (
                                    (canViewInventory && activeInventory) ? (
                                        <InventoryListCard locationId={selectedLocation!.id} activeInventory={activeInventory} />
                                    ) : (
                                        <StockListCard
                                            locationId={selectedLocation!.id}
                                            stock={stock}
                                            loading={loadingStock}
                                            setStock={setStock}
                                            setLoading={setLoadingStock}
                                        />
                                    )
                                ) : (
                                    <div className="flex flex-col w-full h-full items-center justify-center p-12 text-center bg-primary-900/40 rounded-dx border border-dashed border-primary-500/20 animate-in fade-in duration-700">
                                        <div className="size-12 bg-primary-500/40 rounded-full flex items-center justify-center mb-4 border border-primary-500/10">
                                            <i
                                                className="dx-icon-inactivefolder !text-main/40"
                                                style={{ fontSize: '1.5rem' }}
                                            />
                                        </div>
                                        <h4 className="!text-main/40 mb-1">
                                            Nivel vacío
                                        </h4>
                                        <p className="text-xs  !text-main/30">
                                            Todavía no se han cargado objetos en este nivel
                                        </p>
                                    </div>
                                )
                            ) : (
                                showLoader ? (
                                    <div className="flex flex-col w-full h-full items-center justify-center p-12 text-center bg-primary-900/40 rounded-dx border border-dashed border-primary-500/20 animate-loader-in">
                                        <LoadIndicator
                                            width={40}
                                            height={40}
                                            visible={true}
                                        />
                                        <span className="mt-4 text-sm text-main opacity-30 uppercase font-black tracking-[0.2em]">
                                            Cargando Nivel...
                                        </span>
                                    </div>
                                ) : null
                            )
                        )}

                        {!hasMore && items.length > 0 && (
                            <div className="w-full text-center pt-2 flex flex-col gap-1">
                                <span className="text-xs  text-main opacity-50">Fin del Nivel</span>
                                <span className="text-xs text-main opacity-30 tracking-widest">
                                    {items.length} / {totalItems} Elementos
                                </span>
                            </div>
                        )}

                    </div>
                </ScrollView>
            </div>

            {isStorage ? (
                <div className="w-full shrink-0 pt-2 flex items-center gap-2">
                    <div className="w-full">
                        <LocationsAdjustInventory
                            locationId={selectedLocation!.id}
                            locationName={selectedLocation!.name}
                            onSuccess={refresh}
                            isInventory={true}
                        />
                    </div>
                </div>
            ) : (
                <div className="w-full shrink-0 pt-2 flex items-center gap-2">
                    <div className="w-full">
                        {actionsObj.SimpleCreation}
                    </div>
                    <div className="w-auto">
                        {actionsObj.MassiveCreation}
                    </div>
                    <div className="w-auto">
                        {actionsObj.CreateArea}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationsListCard;
