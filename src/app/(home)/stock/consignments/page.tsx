import ConsignmentsClient from "./";
import SectionHeader from "../../components/section/sectionHeader";

const ConsignmentsPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Consignaciones" />
            <div className="flex-1 flex flex-col min-h-0">
                <ConsignmentsClient />
            </div>
        </div>
    );
};

export default ConsignmentsPage;
