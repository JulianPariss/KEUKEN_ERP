import SectionHeader from "../../components/section/sectionHeader";
import SalesChannelsClient from "./salesChannelsClient";

const SalesChannelsPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Canales de Venta" />
            <SalesChannelsClient />
        </div>
    );
};

export default SalesChannelsPage;
