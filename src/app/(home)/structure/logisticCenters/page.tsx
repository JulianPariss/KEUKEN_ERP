import SectionHeader from "../../components/section/sectionHeader";
import LogisticCentersClient from "./logisticCentersClient";

const LogisticCentersPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Centros Logísticos" />
            <LogisticCentersClient />
        </div>
    );
};

export default LogisticCentersPage;
