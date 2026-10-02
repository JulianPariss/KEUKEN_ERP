import { useGridMap } from "@/app/lib/hooks/useGridMap";
import { useGridMapContext } from "@/contexts/GridMapContext";

const UnitItem = ({ unitPath }: { unitPath: string }) => {
    const {
        zonesByLevel,
        currentLevel,
        selectedElementId,
        selectedElementIds,
        setActiveAction
    } = useGridMapContext();

    const { selectElement } = useGridMap();

    const zones = zonesByLevel[currentLevel] || [];
    const unitZone = zones.find(z => z.type === 'Unidad' && z.path === unitPath);
    const isUnitPlaced = !!unitZone;
    const isUnitSelected = unitZone && (selectedElementId === unitZone.id || selectedElementIds.includes(unitZone.id));

    return (
        <div
            onClick={() => {
                if (isUnitPlaced) {
                    selectElement(unitZone.id);
                    setActiveAction('select');
                }
            }}
            className={`flex justify-between items-center p-1.5 rounded border transition-all cursor-pointer ${isUnitSelected ? 'bg-emerald-500/20 border-emerald-500' : 'bg-main/5 border-main/20 hover:bg-main/15'}`}
        >
            <div className="flex items-center gap-2 overflow-hidden">
                <i className={`dx-icon-product text-sm ${isUnitPlaced ? 'text-emerald-500 dark:text-emerald-400' : 'text-main/30'}`}></i>
                <span className={`text-xs font-mono truncate ${isUnitPlaced ? 'text-main/90 font-medium' : 'text-main/40'}`}>{unitPath.split('.').pop()}</span>
            </div>
        </div>
    );
};


export default UnitItem;