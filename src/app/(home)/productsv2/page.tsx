'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '../components/section/sectionHeader';
import ColumnToggleTabs, {
    type IProductColumnState,
    type TProductColumnId,
} from '../products/components/columnToggleTabs';

// Clientes dinámicos cargados una sola vez a nivel de módulo
const ProductsClient = dynamic(
    () => import('../products/components/tabs/productsList'),
    { ssr: false }
);
const ItemsClient = dynamic(
    () => import('../products/components/tabs/itemList'),
    { ssr: false }
);
const PresentationsClient = dynamic(
    () => import('../products/components/tabs/presentationsList'),
    { ssr: false }
);

const ProductsPageV2 = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeColumns, setActiveColumns] = useState<IProductColumnState>({
        products: true,
        items: true,
        presentations: true,
    });

    // Estado para deshabilitar eventos de puntero en los DataGrids durante el arrastre de los splitters
    const [isDragging, setIsDragging] = useState(false);

    // Fila seleccionada en Productos e Items para reflejar en el subtítulo del encabezado
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    // Filtros cruzados por tabla (independientes tras edición manual)
    const [itemsProductFilter, setItemsProductFilter] = useState<string | null>(null);
    const [presentationsProductFilter, setPresentationsProductFilter] = useState<string | null>(null);
    const [itemSkuFilter, setItemSkuFilter] = useState<string | null>(null);

    // Triggers numéricos para ordenar la limpieza de selección en los hijos
    const [productClearTrigger, setProductClearTrigger] = useState(0);
    const [itemClearTrigger, setItemClearTrigger] = useState(0);

    // Triggers para invocar y responder a la creación completa de productos
    const [openCreationTrigger, setOpenCreationTrigger] = useState(0);
    const [creationSuccessTrigger, setCreationSuccessTrigger] = useState(0);

    // Refs para decidir cascada sin recrear callbacks en cada selección
    const selectedProductRef = useRef<any | null>(null);
    const selectedItemRef = useRef<any | null>(null);
    selectedProductRef.current = selectedProduct;
    selectedItemRef.current = selectedItem;

    // Proporciones flex de cada columna para redimensionamiento fluido
    const [colFractions, setColFractions] = useState<{
        products: number;
        items: number;
        presentations: number;
    }>({
        products: 1,
        items: 1,
        presentations: 1,
    });

    const colFractionsRef = useRef(colFractions);
    colFractionsRef.current = colFractions;

    const activeCount = useMemo(
        () => Object.values(activeColumns).filter(Boolean).length,
        [activeColumns]
    );

    // Notificar a los DataGrids visibles que recalculen su ancho interno sin disparar refetchs
    useEffect(() => {
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 60);
        return () => clearTimeout(timer);
    }, [activeColumns]);

    const handleCloseColumn = useCallback((id: TProductColumnId) => {
        setActiveColumns((prev) => {
            const currentActive = Object.values(prev).filter(Boolean).length;
            if (currentActive === 1) {
                return {
                    products: true,
                    items: true,
                    presentations: true,
                };
            }
            return {
                ...prev,
                [id]: false,
            };
        });
    }, []);

    // Selección / deselección en la tabla de Productos
    const handleProductSelectionChange = useCallback((product: any | null) => {
        setSelectedProduct(product);

        if (product?.name) {
            // Nueva selección de Producto: limpia selección de Items y su filtro downstream
            setItemClearTrigger((prev) => prev + 1);
            setSelectedItem(null);
            setItemSkuFilter(null);
            setItemsProductFilter(product.name);
            setPresentationsProductFilter(product.name);
        } else {
            // Deselección: solo limpia los filtros de Producto aplicados por la selección
            setItemsProductFilter(null);
            setPresentationsProductFilter(null);
        }
    }, []);

    // Selección / deselección en la tabla de Items
    const handleItemSelectionChange = useCallback((item: any | null) => {
        setSelectedItem(item);
        if (item?.sku) {
            setItemSkuFilter(item.sku);
        } else {
            setItemSkuFilter(null);
        }
    }, []);

    // Edición manual del filtro Producto en Items (solo filterRow, no headerFilter)
    // Si el valor venía de una selección de Producto: limpia esa selección y el filtro gemelo en Presentaciones
    const handleItemsProductFilterChange = useCallback((val: string | null) => {
        if (selectedProductRef.current) {
            setProductClearTrigger((prev) => prev + 1);
            setSelectedProduct(null);
            setPresentationsProductFilter(null);
        }
        setItemsProductFilter(val);
    }, []);

    // Edición manual del filtro Producto en Presentaciones
    // Si venía de selección de Producto: limpia esa selección y el filtro gemelo en Items
    const handlePresentationsProductFilterChange = useCallback((val: string | null) => {
        if (selectedProductRef.current) {
            setProductClearTrigger((prev) => prev + 1);
            setSelectedProduct(null);
            setItemsProductFilter(null);
        }
        setPresentationsProductFilter(val);
    }, []);

    // Edición manual del filtro Item SKU en Presentaciones
    // Si venía de selección de Item: limpia esa selección; el valor editado permanece en Presentaciones
    const handleManualItemSkuFilterChange = useCallback((val: string | null) => {
        if (selectedItemRef.current) {
            setItemClearTrigger((prev) => prev + 1);
            setSelectedItem(null);
        }
        setItemSkuFilter(val);
    }, []);

    const handleOpenCreation = useCallback(() => {
        setOpenCreationTrigger((prev) => prev + 1);
    }, []);

    const handlePreloadCreation = useCallback(() => {
        if (typeof window !== "undefined") {
            void import("../products/components/modals/fullAdditions/creation");
        }
    }, []);

    const handleCreationSuccess = useCallback(() => {
        setCreationSuccessTrigger((prev) => prev + 1);
    }, []);

    // Manejador de redimensionamiento de alto rendimiento mediante CSS Variables y requestAnimationFrame
    // Evita re-renderizar todo el árbol de React en cada píxel de movimiento
    const handlePointerDown = (
        e: React.PointerEvent,
        handleId: 'handle-1' | 'handle-2'
    ) => {
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;

        setIsDragging(true);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const containerRect = container.getBoundingClientRect();
        const startX = e.clientX;
        const initialFractions = { ...colFractionsRef.current };

        const leftCol: TProductColumnId = handleId === 'handle-1' ? 'products' : 'items';
        const rightCol: TProductColumnId =
            handleId === 'handle-1'
                ? (activeColumns.items ? 'items' : 'presentations')
                : 'presentations';

        const pairSum = initialFractions[leftCol] + initialFractions[rightCol];
        let pendingLeft = initialFractions[leftCol];
        let pendingRight = initialFractions[rightCol];
        let rafId: number | null = null;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaFraction = (deltaX / containerRect.width) * pairSum;

            const minFraction = 0.25;
            let newLeft = initialFractions[leftCol] + deltaFraction;
            let newRight = initialFractions[rightCol] - deltaFraction;

            if (newLeft < minFraction) {
                newLeft = minFraction;
                newRight = pairSum - minFraction;
            } else if (newRight < minFraction) {
                newRight = minFraction;
                newLeft = pairSum - minFraction;
            }

            pendingLeft = newLeft;
            pendingRight = newRight;

            // Actualización directa del CSS en el siguiente fotograma del navegador sin re-renderizar React
            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    rafId = null;
                    if (container) {
                        container.style.setProperty(`--col-${leftCol}`, String(pendingLeft));
                        container.style.setProperty(`--col-${rightCol}`, String(pendingRight));
                    }
                });
            }
        };

        const onPointerUp = () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);

            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            setIsDragging(false);

            // Sincronizar el estado final una sola vez al soltar el ratón
            setColFractions((prev) => ({
                ...prev,
                [leftCol]: pendingLeft,
                [rightCol]: pendingRight,
            }));

            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 60);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    const handleResetFractions = useCallback(() => {
        const container = containerRef.current;
        if (container) {
            container.style.setProperty('--col-products', '1');
            container.style.setProperty('--col-items', '1');
            container.style.setProperty('--col-presentations', '1');
        }
        setColFractions({ products: 1, items: 1, presentations: 1 });
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 50);
    }, []);

    // Determinar qué divisores deben ser visibles
    const showSplitter1 =
        activeColumns.products &&
        (activeColumns.items || activeColumns.presentations);

    const showSplitter2 =
        activeColumns.items && activeColumns.presentations;

    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Artículos (Columnas Miller)" />

            {/* Pestañas de alternancia para las columnas de la vista Miller */}
            <ColumnToggleTabs
                activeColumns={activeColumns}
                onChange={setActiveColumns}
                onOpenCreation={handleOpenCreation}
                onPreloadCreation={handlePreloadCreation}
            />

            {/*
              Contenedor de Columnas Miller persistentes en React.
              Garantiza que ProductsClient, ItemsClient y PresentationsClient permanezcan
              montados en el DOM en todo momento (con display: none cuando están ocultos).
              Esto elimina de raíz cualquier refetch no deseado al alternar columnas o
              al seleccionar filas, cumpliendo con la regla de cargar únicamente en el
              load inicial y cuando se navegan/modifican las páginas del DataGrid.
            */}
            <div
                ref={containerRef}
                style={{
                    '--col-products': colFractions.products,
                    '--col-items': colFractions.items,
                    '--col-presentations': colFractions.presentations,
                } as React.CSSProperties}
                className="flex-1 flex flex-row min-h-0 w-full overflow-hidden select-none relative"
            >
                {/* Overlay transparente global durante el arrastre para retener el foco y evitar eventos innecesarios */}
                {isDragging && (
                    <div
                        className="fixed inset-0 z-50 cursor-col-resize select-none"
                        style={{ pointerEvents: 'auto' }}
                    />
                )}

                {/* Columna 1: Productos (Mandatorio: 1º lugar) */}
                <div
                    key="miller-col-products"
                    style={{
                        display: activeColumns.products ? 'flex' : 'none',
                        flex: `var(--col-products, ${colFractions.products}) 1 0%`,
                        minWidth: activeColumns.products ? '260px' : '0px',
                    }}
                    className={`h-full flex-col min-w-0 bg-primary-500/10 rounded-dx border border-focus-500/25 overflow-hidden shadow-xs ${isDragging ? 'pointer-events-none' : ''}`}
                >
                    <div className="flex items-center justify-between px-3 py-1.5 bg-primary-500/60 border-b border-focus-500/30 select-none shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-sm bg-primary-900/60 text-variant font-bold shrink-0">
                                Col 1
                            </span>
                            <span className="text-sm font-semibold text-main shrink-0">
                                Productos
                            </span>
                            {selectedProduct?.name ? (
                                <span
                                    className="text-xs text-focus-300 font-medium truncate max-w-[280px]"
                                    title={selectedProduct.name}
                                >
                                    • {selectedProduct.name}
                                </span>
                            ) : (
                                <span className="text-xs text-main/50 hidden md:inline truncate">
                                    • Catálogo base
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCloseColumn('products')}
                            title={
                                activeCount === 1
                                    ? 'Al cerrar la última columna activa se seleccionarán todas'
                                    : 'Ocultar columna Productos'
                            }
                            className="text-xs w-5 h-5 flex items-center justify-center rounded-sm transition-colors hover:bg-main/20 cursor-pointer text-main/70 hover:text-main shrink-0"
                        >
                            ✕
                        </button>
                    </div>

                    {/* El DataGrid maneja el scroll X de columnas; toolbar/pager quedan visibles */}
                    <div className="flex-1 min-h-0 w-full overflow-hidden p-1">
                        <ProductsClient
                            selectionMode="single"
                            onSelectionChange={handleProductSelectionChange}
                            clearSelectionTrigger={productClearTrigger}
                            openCreationTrigger={openCreationTrigger}
                            onCreationSuccess={handleCreationSuccess}
                        />
                    </div>
                </div>

                {/* Divisor 1 (entre Col 1 y la siguiente columna visible) */}
                {showSplitter1 && (
                    <div
                        onPointerDown={(e) => handlePointerDown(e, 'handle-1')}
                        onDoubleClick={handleResetFractions}
                        title="Arrastra para redimensionar o doble clic para igualar columnas"
                        className="w-1.5 hover:w-2 mx-0.5 bg-focus-500/20 hover:bg-focus-500/60 active:bg-focus-500 cursor-col-resize relative flex items-center justify-center select-none group z-10 shrink-0 rounded-full transition-all"
                    >
                        <div className="w-0.5 h-6 rounded-full bg-main/40 group-hover:bg-main/80 transition-colors" />
                    </div>
                )}

                {/* Columna 2: Items (Mandatorio: 2º lugar) */}
                <div
                    key="miller-col-items"
                    style={{
                        display: activeColumns.items ? 'flex' : 'none',
                        flex: `var(--col-items, ${colFractions.items}) 1 0%`,
                        minWidth: activeColumns.items ? '260px' : '0px',
                    }}
                    className={`h-full flex-col min-w-0 bg-primary-500/10 rounded-dx border border-focus-500/25 overflow-hidden shadow-xs ${isDragging ? 'pointer-events-none' : ''}`}
                >
                    <div className="flex items-center justify-between px-3 py-1.5 bg-primary-500/60 border-b border-focus-500/30 select-none shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-sm bg-primary-900/60 text-variant font-bold shrink-0">
                                Col 2
                            </span>
                            <span className="text-sm font-semibold text-main shrink-0">
                                Items
                            </span>
                            {selectedItem ? (
                                <span
                                    className="text-xs text-focus-300 font-medium truncate max-w-[320px]"
                                    title={`${selectedItem.itemName || selectedItem.name || ''} ${selectedItem.sku ? `(${selectedItem.sku})` : ''}`}
                                >
                                    • {selectedItem.itemName || selectedItem.name || 'Sin nombre'}
                                    {selectedItem.sku ? ` (${selectedItem.sku})` : ''}
                                </span>
                            ) : (
                                <span className="text-xs text-main/50 hidden md:inline truncate">
                                    • Variantes y existencias
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCloseColumn('items')}
                            title={
                                activeCount === 1
                                    ? 'Al cerrar la última columna activa se seleccionarán todas'
                                    : 'Ocultar columna Items'
                            }
                            className="text-xs w-5 h-5 flex items-center justify-center rounded-sm transition-colors hover:bg-main/20 cursor-pointer text-main/70 hover:text-main shrink-0"
                        >
                            ✕
                        </button>
                    </div>

                    {/* El DataGrid maneja el scroll X de columnas; toolbar/pager quedan visibles */}
                    <div className="flex-1 min-h-0 w-full overflow-hidden p-1">
                        <ItemsClient
                            selectionMode="single"
                            onSelectionChange={handleItemSelectionChange}
                            clearSelectionTrigger={itemClearTrigger}
                            productFilter={itemsProductFilter}
                            onProductFilterChange={handleItemsProductFilterChange}
                            refreshTrigger={creationSuccessTrigger}
                        />
                    </div>
                </div>

                {/* Divisor 2 (entre Col 2 y Col 3) */}
                {showSplitter2 && (
                    <div
                        onPointerDown={(e) => handlePointerDown(e, 'handle-2')}
                        onDoubleClick={handleResetFractions}
                        title="Arrastra para redimensionar o doble clic para igualar columnas"
                        className="w-1.5 hover:w-2 mx-0.5 bg-focus-500/20 hover:bg-focus-500/60 active:bg-focus-500 cursor-col-resize relative flex items-center justify-center select-none group z-10 shrink-0 rounded-full transition-all"
                    >
                        <div className="w-0.5 h-6 rounded-full bg-main/40 group-hover:bg-main/80 transition-colors" />
                    </div>
                )}

                {/* Columna 3: Presentaciones (Mandatorio: 3º lugar) */}
                <div
                    key="miller-col-presentations"
                    style={{
                        display: activeColumns.presentations ? 'flex' : 'none',
                        flex: `var(--col-presentations, ${colFractions.presentations}) 1 0%`,
                        minWidth: activeColumns.presentations ? '260px' : '0px',
                    }}
                    className={`h-full flex-col min-w-0 bg-primary-500/10 rounded-dx border border-focus-500/25 overflow-hidden shadow-xs ${isDragging ? 'pointer-events-none' : ''}`}
                >
                    <div className="flex items-center justify-between px-3 py-1.5 bg-primary-500/60 border-b border-focus-500/30 select-none shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-sm bg-primary-900/60 text-variant font-bold shrink-0">
                                Col 3
                            </span>
                            <span className="text-sm font-semibold text-main shrink-0">
                                Presentaciones
                            </span>
                            <span className="text-xs text-main/50 hidden md:inline truncate">
                                • Empaque y distribución
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCloseColumn('presentations')}
                            title={
                                activeCount === 1
                                    ? 'Al cerrar la última columna activa se seleccionarán todas'
                                    : 'Ocultar columna Presentaciones'
                            }
                            className="text-xs w-5 h-5 flex items-center justify-center rounded-sm transition-colors hover:bg-main/20 cursor-pointer text-main/70 hover:text-main shrink-0"
                        >
                            ✕
                        </button>
                    </div>

                    {/* El DataGrid maneja el scroll X de columnas; toolbar/pager quedan visibles */}
                    <div className="flex-1 min-h-0 w-full overflow-hidden p-1">
                        <PresentationsClient
                            productFilter={presentationsProductFilter}
                            itemSkuFilter={itemSkuFilter}
                            onProductFilterChange={handlePresentationsProductFilterChange}
                            onItemSkuFilterChange={handleManualItemSkuFilterChange}
                            refreshTrigger={creationSuccessTrigger}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPageV2;
