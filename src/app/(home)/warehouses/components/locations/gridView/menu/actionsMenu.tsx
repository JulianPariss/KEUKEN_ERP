'use client';

import { GridAction } from "@/types/gridMap.types";
import { useGridMapContext } from "@/contexts/GridMapContext";
import CloneMenu from './cloneMenu';
import CreateMenu from './createMenu';
import DeleteMenu from './deleteMenu';
import EditMenu from './editMenu';
import SelectMenu from './selectMenu';

const ACTIONS: { id: GridAction; label: string; icon: string; color: string }[] = [
    { id: 'select', label: 'Seleccionar', icon: 'rename', color: 'bg-focus-500' },
    { id: 'create', label: 'Añadir', icon: 'add', color: 'bg-emerald-500' },
    { id: 'clone', label: 'Duplicar', icon: 'copy', color: 'bg-blue-500' },
    { id: 'delete', label: 'Borrar/Eliminar', icon: 'clearformat', color: 'bg-red-500' },
];

export const ActionsMenu = ({ clearZones, onRotate }: { clearZones: (id?: string) => void, onRotate: (direction?: 'cw' | 'ccw') => void }) => {
    const { activeAction, setActiveAction } = useGridMapContext();

    return (
        <div className="flex flex-col gap-4 pt-2 border-t border-main/5">
            <div className="flex flex-col gap-2">
                <p className="opacity-70 text-md pl-1">Acción Principal</p>
                <div className="grid grid-cols-3 gap-1.5 bg-primary-900/50 p-1.5 rounded-dx border border-main/5">
                    {ACTIONS.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => setActiveAction(action.id)}
                            title={action.label}
                            className={`h-10 rounded-dx flex items-center justify-center transition-all duration-300 relative group ${activeAction === action.id ? `${action.color} text-main shadow-lg` : 'text-main/30 hover:bg-main/5'}`}
                        >
                            <i className={`dx-icon-${action.icon} text-lg  ${activeAction === action.id ? 'text-variant ' : ''} group-hover:scale-110 transition-transform`}></i>
                            {activeAction === action.id && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-main rounded-full"></span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="min-h-[140px]">
                {(activeAction === 'select' || activeAction === 'move' || activeAction === 'internal_structure' || activeAction === 'blueprint') && <SelectMenu clearZones={clearZones} onRotate={onRotate} />}
                {activeAction === 'create' && <CreateMenu />}
                {activeAction === 'edit' && <EditMenu />}
                {activeAction === 'delete' && <DeleteMenu />}
                {activeAction === 'clone' && <CloneMenu />}
            </div>
        </div>
    );
};
