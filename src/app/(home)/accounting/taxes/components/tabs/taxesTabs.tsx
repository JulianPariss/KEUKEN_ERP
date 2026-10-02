'use client';

import { GenericTabs, type ITabItem } from '@repo/custom-components';
import dynamic from 'next/dynamic';

const TaxesClient = dynamic(() => import('../../taxesClient'));
const TaxSchemesList = dynamic(() => import('../lists/taxSchemesList'));
const TaxAuthoritySchemesList = dynamic(() => import('../lists/taxAuthoritySchemesList'));
const IdentitySchemesList = dynamic(() => import('../lists/identitySchemesList'));

export const TaxesTabs = () => {
    const tabs: ITabItem[] = [
        {
            id: 'taxesList',
            label: 'Impuestos',
            content: <TaxesClient />
        },
        {
            id: 'taxSchemes',
            label: 'Categorías de Impuestos',
            content: <TaxSchemesList />
        },
        {
            id: 'taxAuthoritySchemes',
            label: 'Esquemas de Autoridad',
            content: <TaxAuthoritySchemesList />
        },
        {
            id: 'identitySchemes',
            label: 'Esquemas de Identificación',
            content: <IdentitySchemesList />
        }
    ];

    return (
        <GenericTabs
            tabs={tabs}
            defaultTabId="taxesList"
        />
    );
};

export default TaxesTabs;
