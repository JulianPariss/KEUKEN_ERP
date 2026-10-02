import { useGridMap } from "@/app/lib/hooks/useGridMap";
import { IMapStructureTranslation, IZone } from "@/types/gridMap.types";
import { useGridMapContext } from "@/contexts/GridMapContext";
import UnitItem from "./unitItem";

interface ITreeItemProps {
    node: any;
    zones: IZone[];
    allZones: IZone[];
    collapsedGroups: Record<string, boolean>;
    setCollapsedGroups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    clearZones: (id?: string) => void;
    setPendingStructure: React.Dispatch<React.SetStateAction<IMapStructureTranslation | null>>;
    setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
    blueprintCatalog: IMapStructureTranslation;
    zonesByLevel: Record<number, IZone[]>;
    currentLevel: number;

}

const TreeItem = (props: ITreeItemProps) => {
    const {
        node,
        zones,
        collapsedGroups,
        setCollapsedGroups,
        clearZones,
        setPendingStructure,
        setCurrentLevel,
        blueprintCatalog,
        allZones,
        zonesByLevel,
        currentLevel
    } = props;

    const { selectedElementId, selectedElementIds, setActiveAction } = useGridMapContext();
    const { selectElement } = useGridMap();

    const isCollapsed = collapsedGroups[node.fullPath] ?? true;
    const hasChildren = Object.keys(node.children).length > 0;
    const isBlueprint = !!node.blueprint;

    const groupZone = isBlueprint ? allZones.find(z => z.type === 'Grupo' && z.path === node.blueprint.path) : null;
    const isPlaced = !!groupZone;
    const isSelected = !!groupZone && (selectedElementId === groupZone.id || selectedElementIds.includes(groupZone.id));

    const placedPaths = new Set(allZones.filter(z => z.type === 'Grupo').map(z => z.path));
    const pendingBlueprints = node.allBlueprints.filter((bp: any) => !placedPaths.has(bp.path));
    const pendingCount = pendingBlueprints.length;

    const handleExpand = () => {
        if (isCollapsed) {
            setCollapsedGroups((prev: any) => {
                const newCollapsed: Record<string, boolean> = {};
                Object.keys(prev).forEach(key => { newCollapsed[key] = true; });
                const parts = node.fullPath.split('.');
                let currentPath = '';
                parts.forEach((part: string) => {
                    currentPath = currentPath ? `${currentPath}.${part}` : part;
                    newCollapsed[currentPath] = false;
                });
                return newCollapsed;
            });
        } else {
            setCollapsedGroups((prev: any) => ({ ...prev, [node.fullPath]: true }));
        }
    };

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleExpand();
    };

    return (
        <div className="flex flex-col gap-1">
            <div
                className={`flex justify-between items-center p-2 rounded-dx border transition-all cursor-pointer 
                    ${isSelected ? 'bg-focus-500/20 border-focus-500/50 shadow-[0_0_15px_rgba(var(--focus-500-rgb), 0.2)]' :
                        isBlueprint ? (isPlaced ? 'bg-primary-900/60 border-main/10' : 'bg-main/5 border-dashed border-main/10 opacity-60') :
                            'bg-main/2 border-transparent hover:bg-main/5'}`}
                onClick={() => {
                    if (isBlueprint && isPlaced && groupZone) {
                        selectElement(groupZone.id);
                        setActiveAction('select');
                    } else if (hasChildren) {
                        handleExpand();
                    }
                }}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {(hasChildren || (isBlueprint && node.blueprint.units.length > 0)) && (
                        <button onClick={toggle} className="text-sm text-main/40 hover:text-main">
                            <i className={isCollapsed ? "dx-icon-chevronright" : "dx-icon-chevrondown"}></i>
                        </button>
                    )}
                    <i className={`${isBlueprint ? 'dx-icon-fields' : 'dx-icon-folder'} text-[12px] ${isPlaced ? 'text-focus-300' : 'text-main/20'}`}></i>
                    <div className="flex flex-col">
                        <span className={`text-xs font-medium ${isPlaced ? 'text-main' : 'text-main/40'}`}>
                            {isBlueprint ? 'Grupo' : node.name === 'Sin colocar' ? 'Estado' : 'Nivel'}
                        </span>
                        <span className="text-xs text-focus-100/70 max-w-[140px]">{node.name}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {pendingCount > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setPendingStructure({
                                    ...blueprintCatalog,
                                    totalGroups: pendingCount,
                                    blueprints: pendingBlueprints,
                                    isBatch: true
                                });
                                setActiveAction('blueprint');
                            }}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-dx bg-green-500/50 border-1 border-green-500/90 text-xs text-variant"
                        >
                            <i className="dx-icon-add"></i>
                            Ubicar ({pendingCount})
                        </button>
                    )}

                    {isBlueprint && isPlaced && zonesByLevel[currentLevel]?.some(z => z.id === groupZone!.id) && (
                        <button
                            onClick={(e) => { e.stopPropagation(); clearZones(groupZone!.id); }}
                            className="p-1 bg-red-500/30 hover:bg-red-500/40 text-red-500 rounded-dx flex justify-center items-center"
                        >
                            <i className="dx-icon-trash text-xs"></i>
                        </button>
                    )}
                </div>
            </div>

            {!isCollapsed && (
                <div className="flex flex-col gap-1 ml-3 border-l border-main/5 pl-2">
                    {Object.values(node.children).map((child: any) => (
                        <TreeItem
                            zonesByLevel={zonesByLevel}
                            currentLevel={currentLevel}
                            allZones={allZones}
                            key={child.fullPath}
                            node={child}
                            zones={zones}
                            collapsedGroups={collapsedGroups}
                            setCollapsedGroups={setCollapsedGroups}
                            clearZones={clearZones}
                            setPendingStructure={setPendingStructure}
                            setCurrentLevel={setCurrentLevel}
                            blueprintCatalog={blueprintCatalog}
                        />
                    ))}
                    {isBlueprint && node.blueprint.units.map((unit: any) => (
                        <UnitItem key={unit.path} unitPath={unit.path} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TreeItem;