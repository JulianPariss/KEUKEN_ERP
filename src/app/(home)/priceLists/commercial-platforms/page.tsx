import SectionHeader from "../../components/section/sectionHeader";
import CommercialPlatformsClient from "./index";

const CommercialPlatformsPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Plataformas Comerciales" />
            <div className="flex-1 flex flex-col min-h-0">
                <CommercialPlatformsClient />
            </div>
        </div>
    );
};

export default CommercialPlatformsPage;
