import { IFSaleOrderDetail } from "@repo/api-contracts/erp";
import { formatPrice } from "@/app/lib/utils/prittier";

interface HeaderFieldProps {
    label: string;
    value: React.ReactNode;
    valueClassName?: string;
}

const HeaderField = ({ label, value, valueClassName = "text-main font-semibold" }: HeaderFieldProps) => (
    <div className="flex flex-col gap-y-0.5">
        <span className="text-main/60 font-medium text-xs">{label}</span>
        <span className={valueClassName}>{value}</span>
    </div>
);

interface SaleOrderDetailHeaderProps {
    order: IFSaleOrderDetail;
}

export const SaleOrderDetailHeader = ({ order }: SaleOrderDetailHeaderProps) => {
    const stateMap: Record<string, string> = {
        draft: 'Borrador',
        sale: 'Venta',
    };

    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 mb-1.5 bg-primary-500 border border-main/10 rounded-dx text-sm">
            <HeaderField label="Nombre del Pedido" value={order.name} />
            <HeaderField label="Cliente" value={`${order.customerName} (${order.customerCode})`} />
            <HeaderField label="Canal de Venta" value={order.salesChannelName || '-'} />
            <HeaderField label="Plataforma" value={order.platformName || '-'} />
            <HeaderField
                label="Fecha de Orden"
                value={order.dateOrder ? new Date(order.dateOrder).toLocaleDateString() : '-'}
            />
            <HeaderField
                label="Estado del Pedido"
                value={stateMap[order.state] || order.state}
                valueClassName={`inline-flex self-start px-2 py-0.5 rounded text-xs font-semibold ${order.state === 'sale'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'
                    }`}
            />
            <HeaderField label="Estado de Facturación" value={order.invoiceStatus || '-'} />
            <HeaderField label="Sucursal" value={order.branchName || '-'} />
            <HeaderField label="Usuario" value={order.userName || '-'} />
            <HeaderField label="Prioridad de Picking" value={order.pickingPriority || '0'} />
            <HeaderField label="Total Bruto" value={formatPrice(order.amountGross)} />
            <HeaderField
                label="Monto Total"
                value={formatPrice(order.amountTotal)}
                valueClassName="text-focus-300 font-bold"
            />
        </div>
    );
};
