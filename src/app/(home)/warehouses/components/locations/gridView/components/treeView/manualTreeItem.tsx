import { useGridMap } from "@/app/lib/hooks/useGridMap";
import { IZone } from "@/types/gridMap.types";
import { useGridMapContext } from "@/contexts/GridMapContext";


interface IManualTreeItemProps {
    zone: IZone;
    allZones: IZone[];
    collapsedGroups: Record<string, boolean>;
    setCollapsedGroups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    clearZones: (id: string) => void;
}

const ManualTreeItem = (props: IManualTreeItemProps) => {
    const {
        zone,
        allZones,
        collapsedGroups,
        setCollapsedGroups,
        clearZones
    } = props;

    const { selectedElementId, selectedElementIds, setActiveAction } = useGridMapContext();
    const { selectElement } = useGridMap();

    const isCollapsed = collapsedGroups[zone.id] ?? true;
    const children = allZones.filter(z => z.parentId === zone.id);
    const hasChildren = children.length > 0;
    const isSelected = selectedElementId === zone.id || selectedElementIds.includes(zone.id);

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCollapsedGroups((prev) => ({ ...prev, [zone.id]: !isCollapsed }));
    };

    return (
        <div className="flex flex-col gap-1">
            <div
                onClick={() => { selectElement(zone.id); setActiveAction('select'); }}
                className={`flex justify-between items-center p-2 rounded-dx border transition-all cursor-pointer 
                    ${isSelected ? 'bg-focus-500/10 border-focus-500/50' : 'bg-primary-900/40 border-primary-900/40 hover:bg-primary-900/20'}`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {hasChildren && (
                        <button onClick={toggle} className="text-sm text-main/40 hover:text-main">
                            <i className={isCollapsed ? "dx-icon-chevronright" : "dx-icon-chevrondown"}></i>
                        </button>
                    )}
                    <i className={`${zone.type === 'Grupo' ? 'dx-icon-fields text-focus-300' :
                        zone.type === 'Area' ? 'dx-icon-square text-purple-400' :
                            'dx-icon-product text-emerald-400'
                        } text-[12px]`}></i>
                    <div className="flex flex-col">
                        <span className="text-xs text-primary-300 font-black uppercase tracking-widest">{zone.type}</span>
                        <span className="text-sm text-focus-200 font-bold font-mono truncate max-w-[140px]">{zone.name || zone.id.slice(0, 8)}</span>
                    </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); clearZones(zone.id); }} className="p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-500 rounded transition-colors">
                    <i className="dx-icon-trash text-[10px]"></i>
                </button>
            </div>

            {!isCollapsed && hasChildren && (
                <div className="flex flex-col gap-1 ml-3 border-l border-main/5 pl-2">
                    {children.map(child => (
                        <ManualTreeItem
                            key={child.id}
                            zone={child}
                            allZones={allZones}
                            collapsedGroups={collapsedGroups}
                            setCollapsedGroups={setCollapsedGroups}
                            clearZones={clearZones}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManualTreeItem;