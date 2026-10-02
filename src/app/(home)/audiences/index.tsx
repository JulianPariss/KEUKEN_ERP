'use client';

import { GenericTabs, type ITabItem } from '@repo/custom-components';
import dynamic from 'next/dynamic';

const CustomerMembersList = dynamic(() => import('./components/tabs/customerMembersList'), { ssr: false });
const ItemMembersList = dynamic(() => import('./components/tabs/itemMembersList'), { ssr: false });

export const AudiencesClient = () => {
    const tabs: ITabItem[] = [
        {
            id: 'customerClusters',
            label: 'Clústeres de Clientes',
            content: <CustomerMembersList />
        },
        {
            id: 'itemClusters',
            label: 'Clústeres de Ítems',
            content: <ItemMembersList />
        }
    ];

    return (
        <GenericTabs
            tabs={tabs}
            defaultTabId="customerClusters"
        />
    );
};

export default AudiencesClient;
