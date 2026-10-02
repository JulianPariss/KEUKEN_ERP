"use client";

import WarehouseCreation from "./actions/creation";

interface FirstWarehouseBannerProps {
    fetchWarehouses: () => Promise<void>;
}

const FirstWarehouseBanner = ({ fetchWarehouses }: FirstWarehouseBannerProps) => {
    return (
        <div className="flex gap-x-1">
            <WarehouseCreation onSuccess={fetchWarehouses} />
            <div className="flex justify-between items-center bg-primary-900/40 rounded-dx px-6 w-fit gap-x-4 shadow-[var(--shadow-inner-lg)]">
                <h3 className="text-lg !text-main/30 italic">
                    Aún no tienes almacenes, crea uno para comenzar
                </h3>
            </div>
        </div>
    );
};

export default FirstWarehouseBanner;
