'use client';

import { GenericTabs, type ITabItem } from '@repo/custom-components';
import dynamic from 'next/dynamic';

const ArticleStockSearch = dynamic(() => import('./articleStockSearch'));
const StockByAllList = dynamic(() => import('./lists/stockByAllList'));
const StockByLotsList = dynamic(() => import('./lists/stockByLotsList'));
const StockByLocationList = dynamic(() => import('./lists/stockByLocationList'));
const StockSumResume = dynamic(() => import('./lists/stockSumResume'));

export const StockTabs = () => {
    const tabs: ITabItem[] = [
        {
            id: 'listByAll',
            label: 'Todos los Artículos',
            content: <StockByAllList />
        },
        {
            id: 'stockSummary',
            label: 'Resumen de Stock',
            content: <StockSumResume />
        },
        {
            id: 'listByLot',
            label: 'Artículos por Lote',
            content: <StockByLotsList />
        },
        {
            id: 'listByLocation',
            label: 'Artículos por Ubicación',
            content: <StockByLocationList />
        },
        {
            id: 'articleSearcher',
            label: 'Buscador de Artículos',
            content: <ArticleStockSearch />
        },
    ];

    return (
        <GenericTabs
            tabs={tabs}
            defaultTabId="listByAll"
        />
    );
};

export default StockTabs;
