import SectionHeader from "../components/section/sectionHeader";
import SalesClient from "./salesClient";

const SalesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Ventas" />
            <SalesClient />
        </div>
    );
};

export default SalesPage;