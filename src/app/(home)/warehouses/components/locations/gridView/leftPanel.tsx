'use client';

import { IMapStructureTranslation } from "@/types/gridMap.types";
import { useGridMapContext } from '@/contexts/GridMapContext';
import React from 'react';
import LocationsMassiveCreation from '../actions/massiveCreation';
import StructureList from './components/treeView';

interface ILeftPanelProps {
    clearZones: (id?: string) => void;
    blueprintCatalog: IMapStructureTranslation | null;
    collapsedGroups: Record<string, boolean>;
    setCollapsedGroups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    setPendingStructure: React.Dispatch<React.SetStateAction<IMapStructureTranslation | null>>;
    fetchLocations: () => Promise<void>;
}

const LeftPanel = (props: ILeftPanelProps) => {
    const {
        clearZones,
        blueprintCatalog,
        collapsedGroups,
        setCollapsedGroups,
        setPendingStructure,
        fetchLocations,
    } = props;
    const { zonesByLevel, currentLevel, setCurrentLevel, warehouseId } = useGridMapContext();
    const zones = zonesByLevel[currentLevel] || [];

    return (
        <div className="w-[320px] h-full bg-primary-900/90 rounded-l-dx shadow-lg shadow-black/20 border-r z-2 border-main/5 flex flex-col p-2 overflow-y-auto" onPointerDown={e => e.stopPropagation()}>
            <div className="mb-4 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <p className="text-sm text-main/30 font-medium">Estructuras</p>
                    </div>
                    {zones.length > 0 && (
                        <button onClick={() => clearZones()} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            <div className='flex flex-col gap-2'>
                <LocationsMassiveCreation warehouseId={warehouseId || ""} parentPath={""} onSuccess={() => fetchLocations()} />
                <div className="flex flex-col gap-2">
                    <StructureList
                        blueprintCatalog={blueprintCatalog}
                        collapsedGroups={collapsedGroups}
                        setCollapsedGroups={setCollapsedGroups}
                        clearZones={clearZones}
                        setPendingStructure={setPendingStructure}
                        setCurrentLevel={setCurrentLevel}
                    />
                </div>
            </div>
        </div>
    );
};

export default LeftPanel;
