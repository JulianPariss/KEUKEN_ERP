'use client';

import React from 'react';
import { AddOutlinedIcon } from '@repo/icons';

export type TProductColumnId = 'products' | 'items' | 'presentations';

export interface IProductColumnState {
    products: boolean;
    items: boolean;
    presentations: boolean;
}

export interface IColumnOption {
    id: TProductColumnId;
    label: string;
    number: number;
}

export const PRODUCT_COLUMNS: IColumnOption[] = [
    { id: 'products', label: 'Productos', number: 1 },
    { id: 'items', label: 'Items', number: 2 },
    { id: 'presentations', label: 'Presentaciones', number: 3 },
];

export interface ColumnToggleTabsProps {
    activeColumns: IProductColumnState;
    onChange: (nextState: IProductColumnState) => void;
    onOpenCreation?: () => void;
    /** Precarga el chunk del modal al hover/focus (mejora percepción al abrir) */
    onPreloadCreation?: () => void;
    className?: string;
}

/**
 * Componente de pestañas de alternancia para las columnas de productos (Miller Columns).
 * Mantiene la estética visual de GenericTabs.
 * Regla de negocio: Siempre debe haber al menos 1 opción activa. Si el usuario
 * hace clic en la última opción activa restante, se seleccionan todas automáticamente.
 */
export const ColumnToggleTabs: React.FC<ColumnToggleTabsProps> = ({
    activeColumns,
    onChange,
    onOpenCreation,
    onPreloadCreation,
    className = '',
}) => {
    const activeCount = Object.values(activeColumns).filter(Boolean).length;

    const handleToggle = (id: TProductColumnId) => {
        const isCurrentlyActive = !!activeColumns[id];

        if (isCurrentlyActive) {
            // Si es la última opción activa restante, se activan todas
            if (activeCount === 1) {
                onChange({
                    products: true,
                    items: true,
                    presentations: true,
                });
            } else {
                // Deshabilitar la opción seleccionada
                onChange({
                    ...activeColumns,
                    [id]: false,
                });
            }
        } else {
            // Habilitar la opción seleccionada
            onChange({
                ...activeColumns,
                [id]: true,
            });
        }
    };

    return (
        <div
            className={`flex items-center justify-between bg-primary-500/60 p-1 pb-1.5 rounded-dx border-b border-focus-500/40 w-full gap-x-1.5 mb-1.5 ${className}`}
        >
            <div className="flex items-center gap-x-1.5 flex-wrap">
                {PRODUCT_COLUMNS.map((col) => {
                    const isActive = !!activeColumns[col.id];
                    return (
                        <button
                            key={col.id}
                            type="button"
                            onClick={() => handleToggle(col.id)}
                            title={
                                isActive && activeCount === 1
                                    ? 'Última columna activa: al hacer clic se activarán todas las columnas'
                                    : isActive
                                        ? `Haga clic para ocultar columna ${col.label}`
                                        : `Haga clic para mostrar columna ${col.label}`
                            }
                            className={`
                                px-4 py-1 text-sm rounded-dx transition-all duration-200 cursor-pointer flex items-center gap-2 select-none
                                ${
                                    isActive
                                        ? 'bg-focus-300 !text-variant shadow-sm font-medium'
                                        : 'hover:bg-main/15 bg-main/10 text-main/70'
                                }
                            `}
                        >
                            <span
                                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                    isActive
                                        ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                                        : 'bg-main/30'
                                }`}
                            />
                            <span>{col.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-2 pr-2">
                {onOpenCreation && (
                    <button
                        type="button"
                        onClick={onOpenCreation}
                        onMouseEnter={onPreloadCreation}
                        onFocus={onPreloadCreation}
                        title="Crear un producto completo (Producto, Ítems y Presentaciones)"
                        className="text-xs px-2.5 py-1 rounded-dx bg-focus-300 hover:bg-focus-200 !text-variant font-medium transition-all shadow-xs hover:shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                        <AddOutlinedIcon className="w-3.5 h-3.5" />
                        <span>Creación completa</span>
                    </button>
                )}
                {activeCount < 3 && (
                    <button
                        type="button"
                        onClick={() =>
                            onChange({
                                products: true,
                                items: true,
                                presentations: true,
                            })
                        }
                        className="text-xs px-2 py-0.5 rounded-dx bg-main/10 hover:bg-main/20 text-main/80 transition-colors cursor-pointer"
                    >
                        Mostrar todas
                    </button>
                )}
            </div>
        </div>
    );
};

export default ColumnToggleTabs;
