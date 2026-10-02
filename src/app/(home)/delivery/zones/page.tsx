import SectionHeader from "../../components/section/sectionHeader";
import ZonesClient from "./zonesClient";

const ZonesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Zonas" />
            <ZonesClient />
        </div>
    );
};

export default ZonesPage;
