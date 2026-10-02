'use client';

import { IGroupBlueprint, IMapStructureTranslation, IZone } from "@/types/gridMap.types";
import { useGridMapContext } from "@/contexts/GridMapContext";
import React, { useMemo } from "react";
import { CollapsibleSection } from "../collapsibleSection";
import ManualTreeItem from "./manualTreeItem";
import TreeItem from "./treeItem";

interface ITreeViewProps {
    blueprintCatalog: IMapStructureTranslation | null;
    collapsedGroups: Record<string, boolean>;
    setCollapsedGroups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    clearZones: (id?: string) => void;
    setPendingStructure: React.Dispatch<React.SetStateAction<IMapStructureTranslation | null>>;
    setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
}

const buildTree = (blueprints: IGroupBlueprint[], parentPath: string) => {
    const root: any = { children: {} };
    blueprints.forEach(bp => {
        const parts = bp.path.split('.');
        let current = root;
        parts.forEach((part, index) => {
            if (!current.children[part]) {
                const currentFullPath = parts.slice(0, index + 1).join('.');
                current.children[part] = {
                    name: part,
                    fullPath: `${parentPath}.${currentFullPath}`,
                    children: {},
                    blueprint: index === parts.length - 1 ? bp : null,
                    allBlueprints: []
                };
            } else if (index === parts.length - 1) {
                current.children[part].blueprint = bp;
            }
            current.children[part].allBlueprints.push(bp);
            current = current.children[part];
        });
    });
    return root.children;
};

const TreeView = (props: ITreeViewProps) => {
    const { blueprintCatalog, collapsedGroups, setCollapsedGroups, clearZones, setPendingStructure, setCurrentLevel } = props
    const { zonesByLevel, currentLevel } = useGridMapContext();

    const [mainSections, setMainSections] = React.useState<Record<string, boolean>>({
        erp: true,
        manual: false
    });

    const toggleMainSection = (id: string) => {
        setMainSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const zones = zonesByLevel[currentLevel] || [];
    const allZones = Object.values(zonesByLevel).flat() as IZone[];

    const tree = useMemo(() => {
        if (!blueprintCatalog) return null;

        const groups: Record<string, IGroupBlueprint[]> = {
            "Sin colocar": []
        };

        blueprintCatalog.blueprints.forEach(bp => {
            let foundLevel: number | null = null;
            for (const [lvlStr, lvlZones] of Object.entries(zonesByLevel)) {
                const placed = (lvlZones as IZone[]).some(z => z.type === 'Grupo' && z.path === bp.path);
                if (placed) {
                    foundLevel = Number(lvlStr);
                    break;
                }
            }

            if (foundLevel !== null) {
                const key = `Nivel ${foundLevel}`;
                if (!groups[key]) groups[key] = [];
                groups[key].push(bp);
            } else {
                groups["Sin colocar"].push(bp);
            }
        });

        const result: Record<string, any> = {};
        const keys = Object.keys(groups).sort((a, b) => {
            if (a === "Sin colocar") return 1;
            if (b === "Sin colocar") return -1;
            return a.localeCompare(b, undefined, { numeric: true });
        });

        keys.forEach(key => {
            if (groups[key].length > 0) {
                result[key] = {
                    name: key,
                    fullPath: key,
                    children: buildTree(groups[key], key),
                    blueprint: null,
                    allBlueprints: groups[key]
                };
            }
        });

        return result;
    }, [blueprintCatalog, zonesByLevel]);

    const manualZones = allZones.filter(z => !z.path && !z.parentId);

    if (!blueprintCatalog || !tree) {
        return <p className="text-sm text-main/10 italic text-center py-4">No hay estructuras cargadas</p>;
    }

    return (
        <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">

            <CollapsibleSection
                id="erp"
                title="Jerarquía"
                icon="folder"
                expanded={mainSections['erp']}
                onToggle={toggleMainSection}
                badge={blueprintCatalog?.blueprints.length}
            >
                <div className="flex flex-col gap-2">
                    {Object.values(tree).map((node: any) => (
                        <TreeItem
                            key={node.fullPath}
                            node={node}
                            zones={zones}
                            allZones={allZones}
                            zonesByLevel={zonesByLevel}
                            currentLevel={currentLevel}
                            collapsedGroups={collapsedGroups}
                            setCollapsedGroups={setCollapsedGroups}
                            clearZones={clearZones}
                            setPendingStructure={setPendingStructure}
                            setCurrentLevel={setCurrentLevel}
                            blueprintCatalog={blueprintCatalog}
                        />
                    ))}
                </div>
            </CollapsibleSection>

            <CollapsibleSection
                id="manual"
                title="Añadidas en Mapa"
                icon="edit"
                expanded={mainSections['manual']}
                onToggle={toggleMainSection}
                badge={manualZones.length}
            >
                <div className="flex flex-col gap-2">
                    {manualZones.length === 0 ? (
                        <p className="text-sm text-main/20 italic px-2 py-4 text-center bg-main/2 rounded-dx border border-dashed border-main/5">Sin elementos manuales</p>
                    ) : (
                        manualZones.map(zone => (
                            <ManualTreeItem
                                key={zone.id}
                                zone={zone}
                                allZones={zones.filter(z => !z.path)}
                                collapsedGroups={collapsedGroups}
                                setCollapsedGroups={setCollapsedGroups}
                                clearZones={clearZones}
                            />
                        ))
                    )}
                </div>
            </CollapsibleSection>
        </div>
    );
};

export default TreeView;
