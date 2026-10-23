'use client';

import PERMISSIONS_CONSTANTS from "@/app/lib/constants/permissions.constants";
import { canDo } from "@/app/lib/utils/permission.helper";
import { stockService } from "@repo/erp-services/stock.service";
import { IFStockByLocation, IFStockByLocationItem } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { LoadIndicator } from "devextreme-react";
import { Button } from '@repo/devextreme';
import notify from "devextreme/ui/notify";
import { useEffect, useMemo, useState } from "react";
import ReserveStockItem from "../actions/reserveStock";

interface IListCardProps {
    locationId: string;
    setStock: (stock: IFStockByLocation | null) => void;
    setLoading: (loading: boolean) => void;
    stock: IFStockByLocation | null;
    loading: boolean;
}

const StockListCard = ({ locationId, setStock, setLoading, stock, loading }: IListCardProps) => {
    const [isReserveVisible, setIsReserveVisible] = useState(false);
    const [selectedLine, setSelectedLine] = useState<IFStockByLocationItem | null>(null);

    const { token, currentCompany, permissions } = useAuth();

    const fetchStock = async () => {
        setLoading(true);
        try {
            const data = await stockService.getStockByLocation(locationId, token, currentCompany?.id);
            setStock(data);
        } catch (error: any) {
            console.error("Error fetching stock:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al cargar el stock";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    };

    const canModify = useMemo(() => {
        return permissions ? canDo('view', PERMISSIONS_CONSTANTS.viewStock, permissions) : false;
    }, [permissions])

    useEffect(() => {
        fetchStock();
    }, [locationId]);

    const handleReserve = (line: IFStockByLocationItem) => {
        setSelectedLine(line);
        setIsReserveVisible(true);
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-12">
                <LoadIndicator width={32} height={32} visible={true} />
            </div>
        );
    }

    if (!stock || stock.lines.length === 0) {
        return (
            <div className="flex flex-col w-full items-center justify-center p-12 text-center bg-primary-500/40 rounded-dx border-2 border-dashed border-primary-950/40">
                <div className="size-12 bg-primary-500/40 rounded-full flex items-center justify-center mb-4 border border-primary-500/10">
                    <i
                        style={{ fontSize: '1.5rem' }}
                        className="dx-icon-product !text-main/40" />
                </div>
                <h4 className="!text-main/40 mb-1">Sin stock</h4>
                <p className="text-xs  !text-main/30 ">
                    No hay productos registrados en esta ubicación
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {stock.lines.map((line, index) => (
                <div
                    key={`${line.itemId}-${line.batchId}-${index}`}
                    className="bg-primary-500 border border-primary-500/10 rounded-dx p-4 flex flex-col gap-3 hover:border-primary-500/30 transition-all duration-300"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-focus-500/10 rounded-dx flex items-center justify-center border border-focus-500/20">
                                <i className="dx-icon-packagebox text-xl text-focus-100"></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs  !text-main/50 italic">{line.itemSku}</span>
                                <h4 className="text-sm  font-bold">{line.productName}</h4>
                                <span className="text-xs  !text-focus-100 font-bold mt-0.5">{line.itemName}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex flex-col items-end">
                                <span className="text-xl">{line.available}</span>
                                <span className="text-xs  mt-1">{line.uomName} Disponibles</span>
                            </div>
                            {canModify &&
                                < Button
                                    icon="bookmark"
                                    stylingMode="text"
                                    hint="Reservar Stock"
                                    className="!text-focus-100 hover:!bg-focus-500/10 !rounded-full shrink-0"
                                    onClick={() => handleReserve(line)}
                                />}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-main/10">
                        <div className="flex flex-col px-2">
                            <span className="text-sm  mb-0.5">Total</span>
                            <span className="text-xs  font-bold">{line.quantity}</span>
                        </div>
                        <div className="flex flex-col px-2 border-x border-main/10">
                            <span className="text-sm  mb-0.5">Reservado</span>
                            <span className="text-xs  font-bold text-focus-400">{line.reservedQuantity}</span>
                        </div>
                        <div className="flex flex-col px-2">
                            <span className="text-sm  mb-0.5">Lote</span>
                            <span className="text-xs  font-bold truncate">{line.batchName || 'S/L'}</span>
                        </div>
                    </div>
                    {line.batchExpirationDate && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-main/5 rounded-dx">
                            <i className="dx-icon-event text-xs "></i>
                            <span className="text-xs ">Vence: {new Date(line.batchExpirationDate).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            ))}

            <ReserveStockItem
                visible={isReserveVisible}
                onHiding={() => setIsReserveVisible(false)}
                locationId={locationId}
                line={selectedLine}
                onSuccess={fetchStock}
            />
        </div>
    );
};

export default StockListCard;
