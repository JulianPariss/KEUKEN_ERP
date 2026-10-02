'use client';

import { useGridMapContext } from "@/contexts/GridMapContext";

const CloneMenu = () => {
    const { cloneFilters, setCloneFilters } = useGridMapContext();

    const toggleFilter = (key: string) => {
        setCloneFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm opacity-80 pl-1">Herramienta de Clonado</p>
            <div className="flex flex-col gap-3 p-3 bg-variant/40 border border-variant/50 rounded-dx">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="text-xs text-main/70">
                            Arrastra en la grilla para capturar y duplicar elementos.
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-main/20">
                    {['Area'].map((key) => {
                        const isActive = cloneFilters[key];
                        return (
                            <button
                                key={key}
                                onClick={() => toggleFilter(key)}
                                className={`p-1 text-xs uppercase rounded border transition-colors ${isActive
                                    ? 'bg-variant/50 border-variant/80 text-main'
                                    : 'bg-main/5 border-main/10 text-main/20 hover:bg-variant/10'
                                    }`}
                            >
                                {key}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CloneMenu;
