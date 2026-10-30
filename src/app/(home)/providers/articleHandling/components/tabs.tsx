'use client';

import { GenericTabs, type ITabItem } from '@repo/custom-components';
import TemperatureLevelsClient from './temperatureLevelsList';
import SegregationGroupsClient from './segregationGroupsList';
import HazardLevelsClient from './hazardLevelsList';
import FragilityLevelsClient from './fragilityLevelsList';
import LogisticProfilesClient from './logisticProfilesList';
import OperativeProfilesClient from './operativeProfilesList';

export const ConfigurationsTabs = () => {
    const tabs: ITabItem[] = [
        {
            id: 'logisticProfiles',
            label: 'Perfiles Logísticos',
            content: <LogisticProfilesClient />
        },
        {
            id: 'temperatureLevels',
            label: 'Niveles de Temperatura',
            content: <TemperatureLevelsClient />
        },
        {
            id: 'segregationGroups',
            label: 'Grupos de Segregación',
            content: <SegregationGroupsClient />
        },
        {
            id: 'hazardLevels',
            label: 'Nivel de Peligro',
            content: <HazardLevelsClient />
        },
        {
            id: 'fragilityLevels',
            label: 'Niveles de Fragilidad',
            content: <FragilityLevelsClient />
        },
        {
            id: 'operativeProfiles',
            label: 'Perfiles Operativos',
            content: <OperativeProfilesClient />
        },
    ];

    return (
        <GenericTabs
            tabs={tabs}
            defaultTabId="logisticProfiles"
        />
    );
};

export default ConfigurationsTabs;
