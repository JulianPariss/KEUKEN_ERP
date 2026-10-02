import SectionHeader from "../../components/section/sectionHeader";
import MetadataClient from ".";

const MetadataPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Catálogo de Metadatos" />
            <MetadataClient />
        </div>
    );
};

export default MetadataPage;
