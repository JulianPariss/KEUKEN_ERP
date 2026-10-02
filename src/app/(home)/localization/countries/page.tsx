import SectionHeader from "../../components/section/sectionHeader";
import CountriesClient from "./countriesClient";

const CountriesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Países" />
            <CountriesClient />
        </div>
    );
};

export default CountriesPage;
