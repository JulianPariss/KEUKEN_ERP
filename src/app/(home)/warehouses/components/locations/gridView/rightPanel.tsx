'use client';

import { BASE_LEVEL } from "@/app/lib/constants/gridMap.constants";
import { NumberBox } from "devextreme-react";
import React from 'react';
import { ActionsMenu } from "./menu/actionsMenu";

import { CollapsibleSection } from './components/collapsibleSection';

interface IRightPanelProps {
    cols: number;
    rows: number;
    maxLevel: number;
    setMaxLevel: (val: number) => void;
    handleResizeCols: (val: number) => void;
    handleResizeRows: (val: number) => void;
    cameraZoom: number;
    setCameraZoom: (val: number) => void;
    clearZones: (id?: string) => void;
    handleRotate: (direction?: 'cw' | 'ccw') => void;
}

const RightPanel = (props: IRightPanelProps) => {
    const {
        cols,
        rows,
        maxLevel,
        setMaxLevel,
        handleResizeCols,
        handleResizeRows,
        clearZones,
        handleRotate
    } = props;

    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
        dims: true,
        view: true,
        tools: true
    });

    const toggleSection = (id: string) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="w-[320px] h-full bg-primary-900/90 backdrop-blur-xl border-l border-main/5 p-2 flex flex-col gap-4 overflow-y-auto custom-scrollbar shadow-lg shadow-black/30 rounded-r-dx" onPointerDown={e => e.stopPropagation()}>
            <div className="flex flex-col gap-3">
                <CollapsibleSection
                    id="dims"
                    title="Dimensiones"
                    icon="fields"
                    expanded={expandedSections['dims']}
                    onToggle={toggleSection}
                >
                    <NumberBox
                        label="Columnas"
                        labelMode="outside"
                        stylingMode="filled"
                        value={cols}
                        min={1} max={500}
                        showSpinButtons={true}
                        onValueChange={(val) => handleResizeCols(val || 1)}
                    />
                    <NumberBox
                        label="Filas"
                        labelMode="outside"
                        stylingMode="filled"
                        value={rows}
                        min={1} max={500}
                        showSpinButtons={true}
                        onValueChange={(val) => handleResizeRows(val || 1)}
                    />
                    <NumberBox
                        label="Niveles Máximos (n)"
                        labelMode="outside"
                        stylingMode="filled"
                        value={maxLevel}
                        min={BASE_LEVEL} max={10}
                        showSpinButtons={true}
                        onValueChange={(val) => setMaxLevel(val || BASE_LEVEL)}
                    />
                </CollapsibleSection>

                <CollapsibleSection
                    id="tools"
                    title="Herramientas"
                    icon="preferences"
                    expanded={expandedSections['tools']}
                    onToggle={toggleSection}
                >
                    <ActionsMenu clearZones={clearZones} onRotate={handleRotate} />
                </CollapsibleSection>
            </div>
        </div>
    );
};

export default RightPanel;
