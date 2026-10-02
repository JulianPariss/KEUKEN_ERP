import SectionHeader from "../../components/section/sectionHeader";
import CitiesClient from "./citiesClient";

const CitiesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Ciudades" />
            <CitiesClient />
        </div>
    );
};

export default CitiesPage;
