import SectionHeader from "../components/section/sectionHeader";
import ProvidersClient from "./components/providersClient";

const ProvidersPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Proveedores" />
            <ProvidersClient />
        </div>
    );
};

export default ProvidersPage;
