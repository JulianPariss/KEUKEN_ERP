import SectionHeader from "../components/section/sectionHeader";
import AudiencesClient from "./index";

const AudiencesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Clústeres" />
            <div className="flex-1 flex flex-col min-h-0">
                <AudiencesClient />
            </div>
        </div>
    );
};

export default AudiencesPage;
