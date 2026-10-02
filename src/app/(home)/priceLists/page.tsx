import SectionHeader from "../components/section/sectionHeader";
import PriceListsClient from ".";

export default function PriceListsPage() {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Listas de Precios" />
            <PriceListsClient />
        </div>
    );
}
