import SectionHeader from "../components/section/sectionHeader";
import SystemClient from "./index";

const SystemPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Claves de Configuración" />
            <SystemClient />
        </div>
    );
};

export default SystemPage;
