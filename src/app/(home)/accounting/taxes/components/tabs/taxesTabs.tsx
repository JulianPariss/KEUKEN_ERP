'use client';

import { GenericTabs, type ITabItem } from '@repo/custom-components';
import TaxesClient from '../../taxesClient';
import TaxSchemesList from '../lists/taxSchemesList';
import TaxAuthoritySchemesList from '../lists/taxAuthoritySchemesList';
import IdentitySchemesList from '../lists/identitySchemesList';

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
