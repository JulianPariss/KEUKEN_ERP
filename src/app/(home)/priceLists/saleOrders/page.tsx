import SectionHeader from "../../components/section/sectionHeader";
import SaleOrdersClient from "./index";

export default function SaleOrdersPage() {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Pedidos de Venta" />
            <div className="flex-1 flex flex-col min-h-0">
                <SaleOrdersClient />
            </div>
        </div>
    );
}
