'use client';

import { GenericTabs, type ITabItem } from '@repo/custom-components';
import ArticleStockSearch from './articleStockSearch';
import StockByAllList from './lists/stockByAllList';
import StockByLotsList from './lists/stockByLotsList';
import StockByLocationList from './lists/stockByLocationList';
import StockSumResume from './lists/stockSumResume';

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
