import SectionHeader from "../../components/section/sectionHeader";
import PeriodsClient from "./periodsClient";

const PeriodsPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Periodos Contables" />
            <PeriodsClient />
        </div>
    );
};

export default PeriodsPage;
