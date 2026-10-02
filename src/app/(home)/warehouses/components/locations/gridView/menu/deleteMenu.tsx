'use client';

import { useGridMapContext } from "@/contexts/GridMapContext";

const DeleteMenu = () => {
    const { deleteFilters, setDeleteFilters } = useGridMapContext();

    const toggleFilter = (key: string) => {
        setDeleteFilters(prev => {
            const newValue = !prev[key];
            if (key === 'Grupo') {
                return { ...prev, Grupo: newValue, Unidad: newValue };
            }
            return { ...prev, [key]: newValue };
        });
    };

    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm opacity-80 pl-1">Herramienta de Borrado</p>
            <div className="flex flex-col gap-3 p-3 bg-primary-900/40 border border-variant/50 rounded-dx">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="text-xs text-main/70">
                            Arrastra en la grilla para remover los elementos.
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-main/20">
                    {Object.keys(deleteFilters).filter(key => key !== 'Unidad').map((key) => {
                        const isActive = deleteFilters[key];
                        return (
                            <button
                                key={key}
                                onClick={() => toggleFilter(key)}
                                className={`p-1 text-xs uppercase rounded border transition-colors ${isActive
                                    ? 'bg-variant/50 border-variant/80 text-main'
                                    : 'bg-main/5 border-main/10 text-main/10 hover:bg-variant/10'
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

export default DeleteMenu;