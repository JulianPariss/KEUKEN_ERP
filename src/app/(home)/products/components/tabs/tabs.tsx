'use client';

import { GenericTabs, type ITabItem } from '@repo/custom-components';
import dynamic from 'next/dynamic';

const ItemsClient = dynamic(() => import('./itemList'));
const PresentationsClient = dynamic(() => import('./presentationsList'));
const ProductsClient = dynamic(() => import('./productsList'));

export const ProductTabs = () => {
    const tabs: ITabItem[] = [
        {
            id: 'productList',
            label: 'Productos',
            content: <ProductsClient />
        },
        {
            id: 'productItems',
            label: 'Items',
            content: <ItemsClient />
        },
        {
            id: 'productPresentations',
            label: 'Presentaciones',
            content: <PresentationsClient />
        }
    ];

    return (
        <GenericTabs
            tabs={tabs}
            defaultTabId="productList"
        />
    );
};

export default ProductTabs;
