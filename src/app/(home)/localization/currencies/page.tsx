import SectionHeader from "../../components/section/sectionHeader";
import CurrenciesClient from "./currenciesClient";

const CurrenciesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Monedas" />
            <CurrenciesClient />
        </div>
    );
};

export default CurrenciesPage;
