import SectionHeader from "../components/section/sectionHeader";
import RoutesClient from "./routes/routesClient";
const RoutesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Rutas de Reparto" />
            <RoutesClient />
        </div>
    );
};

export default RoutesPage;
