import SectionHeader from "../../components/section/sectionHeader";
import SerialNumbersClient from "./index";

const SerialNumbersPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Números de Serie" />
            <SerialNumbersClient />
        </div>
    );
};

export default SerialNumbersPage;
