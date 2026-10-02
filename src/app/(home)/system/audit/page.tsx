import SectionHeader from "../../components/section/sectionHeader";
import SystemAuditClient from "./index";

const SystemAuditPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Auditoría del Sistema" />
            <SystemAuditClient />
        </div>
    );
};

export default SystemAuditPage;
