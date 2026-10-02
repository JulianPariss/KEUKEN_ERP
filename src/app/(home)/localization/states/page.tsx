import SectionHeader from "../../components/section/sectionHeader";
import StatesClient from "./statesClient";

const StatesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Provincias" />
            <StatesClient />
        </div>
    );
};

export default StatesPage;
