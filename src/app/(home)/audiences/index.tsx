'use client';

import { GenericTabs, type ITabItem } from '@repo/custom-components';
import CustomerMembersList from './components/tabs/customerMembersList';
import ItemMembersList from './components/tabs/itemMembersList';

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
