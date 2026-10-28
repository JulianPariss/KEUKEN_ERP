"use client";

import PERMISSIONS_CONSTANTS from "@repo/access";
import { canDo } from "@repo/access";
import { useAuth } from "@/contexts/AuthContext";
import { DropDownButton } from "devextreme-react/drop-down-button";
import Link from "next/link";
import { useMemo, useState } from "react";
import { IWarehouse } from "@repo/api-contracts/erp";
import WarehouseDeletion from "./actions/deletion";
import WarehouseEdition from "./actions/edition";

const WarehouseCard = (item: IWarehouse & { isSelected?: boolean, fetchWarehouses: () => Promise<void> }) => {
    const { fetchWarehouses } = item;
    const [isEditionVisible, setEditionVisible] = useState(false);
    const [isDeletionVisible, setDeletionVisible] = useState(false);

    const { permissions } = useAuth();

    const handleEdit = () => {
        setEditionVisible(true);
    };

    const handleDelete = () => {
        setDeletionVisible(true);
    };

    const handleClone = () => {
        console.log("Acción: Clonar depósito", item.title);
    };


    const ActionIcon = (isSelected: boolean) => (
        <i className={`dx-icon-mediumiconslayout !text-lg !leading-none flex items-center justify-center h-full w-full ${isSelected ? '!text-variant' : '!text-main'}`} />
    );

    const canModify = useMemo(() => {
        return permissions ? canDo('modify', PERMISSIONS_CONSTANTS.modifyWarehouses, permissions) : false;
    }, [permissions]);

    const actionItems = [
        ...(canModify ? [{ id: 'edit', text: 'Editar', icon: 'edit', onClick: handleEdit }] : []),
        ...(canModify ? [{ id: 'delete', text: 'Eliminar', icon: 'trash', onClick: handleDelete }] : []),
        ...(canModify ? [{ id: 'clone', text: 'Clonar', icon: 'copy', onClick: handleClone }] : [])
    ];


    return (
        <div className="h-15 select-none w-[280px] flex-shrink-0 relative group">
            <Link href={`/warehouses?warehouseId=${item.id}`} className="h-full block">
                <div className={`h-full w-full rounded-dx shadow-sm border p-3 flex items-center hover:shadow-md transition-shadow duration-300 ${item.isSelected ? 'bg-focus-500 border-focus-300' : 'bg-primary-500 border-primary-950 hover:border-primary-900/50'
                    }`}>
                    <div className="flex items-center gap-4 w-full h-full">
                        <div className={`size-10 min-w-[2.5rem] p-2 rounded-dx flex justify-center items-center border ${item.isSelected ? 'border-variant/30' : 'bg-focus-500/20 text-focus-100 border-focus-500/30'
                            }`}>
                            <i className={`dx-icon-${item.icon ?? 'home'} text-xl ${item.isSelected ? '!text-variant' : '!text-main'}`}></i>
                        </div>

                        <div className="flex flex-col items-start flex-1 min-w-0 h-full justify-center">
                            <div className="flex justify-between items-center w-full">
                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-base font-bold leading-none truncate pr-8 ${item.isSelected ? '!text-variant' : '!text-main'}`}>{item.title}</h3>
                                    {item.location && (
                                        <p className="text-sm opacity-50 uppercase font-black tracking-widest mt-1 mb-2">
                                            {item.location}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Menú de Acciones (Esquina Superior Derecha) */}
            <div
                className="absolute top-1 right-1 z-10"
                onClick={(e) => {
                    e.preventDefault();
                }}
            >
                <DropDownButton
                    component={() => ActionIcon(!!item.isSelected)}
                    showArrowIcon={false}
                    stylingMode="text"
                    hoverStateEnabled={false}
                    focusStateEnabled={false}
                    useSelectMode={false}
                    visible={canModify}
                    dropDownOptions={{
                        width: 140,
                        wrapperAttr: {
                            class: "popup-menu-container"
                        }
                    }}
                    items={actionItems}
                    onItemClick={(e) => e.itemData?.onClick?.()}
                />
            </div>

            <WarehouseEdition
                visible={isEditionVisible}
                onHiding={() => setEditionVisible(false)}
                warehouse={item}
                onSuccess={fetchWarehouses}
            />

            <WarehouseDeletion
                visible={isDeletionVisible}
                onHiding={() => setDeletionVisible(false)}
                warehouse={item}
                onSuccess={fetchWarehouses}
            />
        </div>
    );
};

export default WarehouseCard;