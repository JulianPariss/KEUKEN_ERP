'use client';

import { MAP_STRUCTURES } from "@/app/lib/constants/gridMap.constants";
import { useGridMapContext } from "@/contexts/GridMapContext";

interface GridSelectorProps {
    title: string;
    state: { up: boolean; down: boolean; left: boolean; right: boolean };
    onToggleSide: (side: 'up' | 'down' | 'left' | 'right') => void;
    onToggleAll: () => void;
    colorClass: string;
    centerIcon: string;
    icons: { up: string; down: string; left: string; right: string };
    rotates?: { up?: string; down?: string; left?: string; right?: string };
}

const GridSelector = ({
    title,
    state,
    onToggleSide,
    onToggleAll,
    colorClass,
    centerIcon,
    icons,
    rotates = {}
}: GridSelectorProps) => {
    const allActive = state.up && state.down && state.left && state.right;

    const gridLayout = [
        { id: 'empty-1' },
        { id: 'up', type: 'side', side: 'up' as const },
        { id: 'empty-2' },
        { id: 'left', type: 'side', side: 'left' as const },
        { id: 'center', type: 'center' },
        { id: 'right', type: 'side', side: 'right' as const },
        { id: 'empty-3' },
        { id: 'down', type: 'side', side: 'down' as const },
        { id: 'empty-4' },
    ];

    return (
        <div className="p-3 bg-primary-900/40 rounded-dx border border-main/5 flex flex-col gap-2 relative">
            <p className="text-xs text-main/30 text-center mb-2">{title}</p>
            <div className="grid grid-cols-3 grid-rows-3 gap-1 mx-auto w-fit">
                {gridLayout.map((item) => {
                    if (!item.type) return <div key={item.id} />;

                    if (item.type === 'center') {
                        return (
                            <button
                                key={item.id}
                                onClick={onToggleAll}
                                className={`w-8 h-8 rounded flex items-center justify-center transition-all ${allActive ? `${colorClass} text-main` : 'bg-main/5 text-main/20 hover:bg-main/10'}`}
                            >
                                <i className={`dx-icon-${centerIcon} text-xs `}></i>
                            </button>
                        );
                    }

                    const side = item.side!;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onToggleSide(side)}
                            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${state[side] ? `${colorClass} text-main` : 'bg-main/5 text-main/20 hover:bg-main/10'}`}
                        >
                            <i className={`dx-icon-${icons[side]} ${rotates[side] || ''}`}></i>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const CreateMenu = () => {
    const { structureType, setStructureType, activeDirections, setActiveDirections, activeWalls, setActiveWalls } = useGridMapContext();
    return (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-2 gap-2 bg-primary-900/50 p-1 rounded-dx border border-main/5">
                {Object.values(MAP_STRUCTURES).map((config) => {
                    if (config.id === 'Grupo' || config.id === 'Unidad') return null;
                    return (
                        <button
                            key={config.id}
                            onClick={() => setStructureType(config.id)}
                            className={`py-2 px-3 rounded-dx text-xs transition-all flex flex-col items-center gap-1 group ${structureType === config.id ? 'bg-focus-500 text-variant shadow-lg' : 'text-main/40 hover:bg-main/5'}`}
                        >
                            <i className={`dx-icon-${config.icon} text-lg ${structureType === config.id ? 'text-variant' : 'text-main/40'} mb-0.5 group-hover:scale-110 transition-transform`}></i>
                            {config.label}
                        </button>
                    )
                })}
            </div>
            {structureType === 'Direcciones' && (
                <GridSelector
                    title="Configuración de Flujo"
                    state={activeDirections}
                    onToggleSide={(side) => setActiveDirections(p => ({ ...p, [side]: !p[side] }))}
                    onToggleAll={() => {
                        const allActive = activeDirections.up && activeDirections.down && activeDirections.left && activeDirections.right;
                        setActiveDirections({ up: !allActive, down: !allActive, left: !allActive, right: !allActive });
                    }}
                    colorClass="bg-amber-500"
                    centerIcon="map"
                    icons={{ up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' }}
                />
            )}
            {structureType === 'Muro' && (
                <GridSelector
                    title="Caras del Muro"
                    state={activeWalls}
                    onToggleSide={(side) => setActiveWalls({ up: side === 'up', down: side === 'down', left: side === 'left', right: side === 'right' })}
                    onToggleAll={() => {
                        const allActive = activeWalls.up && activeWalls.down && activeWalls.left && activeWalls.right;
                        setActiveWalls({ up: !allActive, down: !allActive, left: !allActive, right: !allActive });
                    }}
                    colorClass="bg-primary-500"
                    centerIcon="square"
                    icons={{ up: 'dragvertical', down: 'dragvertical', left: 'dragvertical', right: 'dragvertical' }}
                    rotates={{ up: 'rotate-90', down: 'rotate-90' }}
                />
            )}
        </div>
    );
};

export default CreateMenu;