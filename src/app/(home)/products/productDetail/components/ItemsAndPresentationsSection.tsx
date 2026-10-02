'use client';

import { useCallback } from 'react';
import { Accordion } from "devextreme-react/accordion";
import { IFProductFullItem } from "@repo/api-contracts/erp";
import ItemDetailContent from "./ItemDetailContent";

type IFProductFullItemItem = IFProductFullItem['items'][number];

interface IItemsAndPresentationsSectionProps {
    items: IFProductFullItemItem[];
    uoms: any[];
    packagingLevels: any[];
}

export default function ItemsAndPresentationsSection({ items, uoms, packagingLevels }: IItemsAndPresentationsSectionProps) {
    const getUomName = useCallback((id: string) => {
        return uoms.find(u => u.id === id)?.name || id;
    }, [uoms]);

    const renderItemTitle = useCallback((item: any) => {
        return (
            <div className="flex justify-between items-center w-full pr-8">
                <span className="font-semibold text-main">{item.itemName}</span>
                <span className="bg-focus-300/10 text-focus-300 px-2 py-0.5 rounded text-xs font-semibold">{item.sku}</span>
            </div>
        );
    }, []);

    const renderItemContent = useCallback((item: any) => {
        return (
            <ItemDetailContent
                item={item}
                uoms={uoms}
                packagingLevels={packagingLevels}
                getUomName={getUomName}
            />
        );
    }, [getUomName, packagingLevels, uoms]);

    return (
        <div className="relative overflow-hidden bg-primary-500/95 rounded-dx border border-main/10 shadow-md p-4 flex flex-col gap-3 w-full h-full min-h-0">
            <div className="flex flex-col gap-1 shrink-0">
                <h3 className="text-lg font-bold text-main">
                    Ítems ({items.length})
                </h3>
                <p className="text-xs text-main/60 font-medium">Resumen de los ítems y presentaciones configurados en el producto.</p>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-focus-100 to-focus-500/5 mb-1 shrink-0" />

            <div className="w-full flex-1 min-h-0 overflow-y-auto pr-0.5 rounded-dx">
                <Accordion
                    dataSource={items}
                    collapsible={true}
                    multiple={false}
                    itemTitleRender={renderItemTitle}
                    itemRender={renderItemContent}
                    className="custom-accordion custom-accordion-preview"
                />
            </div>
        </div>
    );
}
