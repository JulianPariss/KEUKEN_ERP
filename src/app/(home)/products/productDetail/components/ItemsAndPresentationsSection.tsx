'use client';

import { useCallback, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Accordion } from "devextreme-react/accordion";
import { IFProductFullItem, IFItemMedia } from "@repo/api-contracts/erp";
import { PhotographIcon } from "@repo/icons";
import ItemDetailContent from "./ItemDetailContent";

type IFProductFullItemItem = IFProductFullItem['items'][number];

interface IItemsAndPresentationsSectionProps {
    items: IFProductFullItemItem[];
    uoms: any[];
    packagingLevels: any[];
}

interface ItemTitleProps {
    item: IFProductFullItemItem;
    media?: IFItemMedia[];
}

function ItemTitle({ item, media }: ItemTitleProps) {
    const mediaList = media ?? item.media ?? [];
    const mediaCount = mediaList.length;
    const mainImage = mediaList[0]?.variants?.find((v: any) => v.sizeCode === 'thumb')?.url || mediaList[0]?.url;

    return (
        <div className="flex justify-between items-center w-full pr-8">
            <div className="flex items-center gap-2.5 min-w-0">
                {mainImage && (
                    <img
                        src={mainImage}
                        alt=""
                        className="w-5 h-5 object-cover rounded border border-main/10 shrink-0"
                    />
                )}
                <span className="font-semibold text-main truncate">{item.itemName}</span>
                {mediaCount > 0 && (
                    <span className="text-[10px] bg-focus-500/15 text-focus-300 px-2 py-0.5 rounded-full font-semibold shrink-0 flex items-center gap-1 border border-focus-500/20">
                        <PhotographIcon size={12} className="w-3 h-3" />
                        <span>{mediaCount} {mediaCount === 1 ? 'imagen' : 'imágenes'}</span>
                    </span>
                )}
            </div>
            <span className="bg-focus-300/10 text-focus-300 px-2 py-0.5 rounded text-xs font-semibold shrink-0">{item.sku}</span>
        </div>
    );
}

export default function ItemsAndPresentationsSection({ items, uoms, packagingLevels }: IItemsAndPresentationsSectionProps) {
    const [localItems, setLocalItems] = useState<IFProductFullItemItem[]>(items);
    const [mediaMap, setMediaMap] = useState<Record<string, IFItemMedia[]>>({});
    const [selectedItemKeys, setSelectedItemKeys] = useState<(string | number)[]>(() => {
        return items.length > 0 && items[0]?.id ? [items[0].id] : [];
    });

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollPosRef = useRef<number>(0);
    const localItemsRef = useRef(localItems);
    localItemsRef.current = localItems;

    const restoreScroll = useCallback(() => {
        if (scrollContainerRef.current && scrollPosRef.current > 0) {
            scrollContainerRef.current.scrollTop = scrollPosRef.current;
        }
    }, []);

    useLayoutEffect(() => {
        restoreScroll();
    });

    useEffect(() => {
        setLocalItems(items);
        setMediaMap({});
        if (items.length > 0) {
            setSelectedItemKeys(prev => {
                const stillExists = prev.filter(k => items.some(it => it.id === k));
                return stillExists.length > 0 ? stillExists : [items[0].id];
            });
        } else {
            setSelectedItemKeys([]);
        }
        scrollPosRef.current = 0;
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    }, [items]);

    const handleSelectionChanged = useCallback((e: any) => {
        if (e.component) {
            const currentKeys = e.component.option('selectedItemKeys');
            if (Array.isArray(currentKeys)) {
                setSelectedItemKeys(currentKeys);
            }
        }
    }, []);

    const getUomName = useCallback((id: string) => {
        return uoms.find(u => u.id === id)?.name || id;
    }, [uoms]);

    const handleMediaChange = useCallback((itemId: string, updatedMedia: IFItemMedia[]) => {
        // 1. Guardar la posición exacta del scroll
        if (scrollContainerRef.current) {
            scrollPosRef.current = scrollContainerRef.current.scrollTop;
        }

        // 2. Actualizar el item en memoria para no romper la referencia de la lista de items
        const target = localItemsRef.current.find(it => it.id === itemId);
        if (target) {
            target.media = updatedMedia;
        }

        // 3. Actualizar el mapa reactivo de media para reflejar el contador y miniatura en el título
        setMediaMap(prev => ({
            ...prev,
            [itemId]: updatedMedia
        }));

        // 4. Asegurar que el scroll no sufra desplazamiento
        requestAnimationFrame(() => {
            if (scrollContainerRef.current && scrollPosRef.current > 0) {
                scrollContainerRef.current.scrollTop = scrollPosRef.current;
            }
        });
    }, []);

    const renderItemTitle = useCallback((item: any) => {
        return <ItemTitle item={item} media={mediaMap[item.id]} />;
    }, [mediaMap]);

    const renderItemContent = useCallback((item: any) => {
        return (
            <ItemDetailContent
                key={item.id}
                item={item}
                uoms={uoms}
                packagingLevels={packagingLevels}
                getUomName={getUomName}
                onMediaChange={(updatedMedia) => handleMediaChange(item.id, updatedMedia)}
            />
        );
    }, [getUomName, handleMediaChange, packagingLevels, uoms]);

    return (
        <div className="relative overflow-hidden bg-primary-500/95 rounded-dx border border-main/10 shadow-md p-4 flex flex-col gap-3 w-full h-full min-h-0">
            <div className="flex flex-col gap-1 shrink-0">
                <h3 className="text-lg font-bold text-main">
                    Ítems ({localItems.length})
                </h3>
                <p className="text-xs text-main/60 font-medium">Resumen de los ítems, presentaciones y multimedia configurados en el producto.</p>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-focus-100 to-focus-500/5 mb-1 shrink-0" />

            <div
                ref={scrollContainerRef}
                onScroll={(e) => {
                    scrollPosRef.current = e.currentTarget.scrollTop;
                }}
                className="w-full flex-1 min-h-0 overflow-y-auto pr-0.5 rounded-dx"
            >
                <Accordion
                    dataSource={localItems}
                    keyExpr="id"
                    selectedItemKeys={selectedItemKeys}
                    onSelectedItemKeysChange={setSelectedItemKeys}
                    onSelectionChanged={handleSelectionChanged}
                    onContentReady={restoreScroll}
                    collapsible={true}
                    multiple={false}
                    focusStateEnabled={false}
                    itemTitleRender={renderItemTitle}
                    itemRender={renderItemContent}
                    className="custom-accordion custom-accordion-preview"
                />
            </div>
        </div>
    );
}
