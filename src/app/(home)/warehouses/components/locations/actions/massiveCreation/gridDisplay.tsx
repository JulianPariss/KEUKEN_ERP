"use client";

import React, { useMemo } from 'react';

interface GridDisplayProps {
    structure: number[];
    titles?: string[];
}

const Cell = () => {
    return (
        <div
            className={`
                size-6 rounded-[4px] border transition-all duration-300
                border-main/10 bg-main/5
            `}
        />
    );
};

const GridDisplay: React.FC<GridDisplayProps> = ({ structure, titles }) => {
    const hasData = structure && structure.length > 0 && structure.some(s => s > 0);
    const totalElements = useMemo(() => {
        let total = 0;
        let runningProduct = 1;
        for (const count of structure) {
            const currentCount = count || 0;
            if (currentCount === 0) break;
            runningProduct *= currentCount;
            total += runningProduct;
        }
        return total;
    }, [structure]);


    if (!hasData) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-12 bg-primary-950/20 rounded-dx border border-dashed border-main/5 select-none opacity-50">
                <p className="text-sm  italic text-center max-w-[200px]">
                    Configura las cantidades en el formulario para visualizar la jerarquía
                </p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col gap-6 p-4 overflow-y-auto">
            {structure.map((count, levelIdx) => {
                const effectiveCount = count || 0;
                if (effectiveCount <= 0) return null;

                const isLast = levelIdx === structure.length - 1;
                const title = titles?.[levelIdx] || `Nivel ${levelIdx}`;

                return (
                    <div key={levelIdx} className="flex flex-col gap-3">
                        <div className='flex flex-col gap-3'>
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs  text-main`}>
                                        {title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs  bg-focus-100/10 px-2 py-0.5 rounded-dx border border-focus-500/20 text-focus-300!">
                                        {structure.slice(0, levelIdx + 1).reduce((acc, c) => acc * (c || 0), 1)} Ubic.

                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 p-4 rounded-dx border border-main/10">
                                {Array.from({ length: Math.min(effectiveCount, 150) }).map((_, i) => (
                                    <Cell
                                        key={i}
                                    />
                                ))}
                                {effectiveCount > 150 && (
                                    <div className="flex items-center justify-center px-3 text-sm italic">
                                        + {effectiveCount - 150} más...
                                    </div>
                                )}
                            </div>
                        </div>


                        {isLast && (
                            <div className="flex flex-row justify-between items-center gap-2 pt-6 border-t border-variant/35 mt-4">
                                <span className="text-md">Ubicaciones totales a crear</span>
                                <div className="px-5 py-0.5 rounded-dx bg-focus-500 border border-focus-100 flex items-center justify-center">
                                    <span className="text-xs  !text-variant">
                                        {totalElements.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default GridDisplay;
