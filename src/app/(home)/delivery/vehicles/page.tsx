import SectionHeader from "../../components/section/sectionHeader";
import VehiclesClient from "./vehiclesClient";

const VehiclesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Vehículos de Reparto" />
            <VehiclesClient />
        </div>
    );
};

export default VehiclesPage;
