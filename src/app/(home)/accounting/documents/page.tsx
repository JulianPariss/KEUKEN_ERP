import SectionHeader from "../../components/section/sectionHeader";
import DocumentsClient from "./documentsClient";

const DocumentsPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Documentos" />
            <DocumentsClient />
        </div>
    );
};

export default DocumentsPage;
