import SectionHeader from "../../components/section/sectionHeader";
import TaxesTabs from "./components/tabs/taxesTabs";

const TaxesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Impuestos" />
            <div className="flex-1 flex flex-col min-h-0">
                <TaxesTabs />
            </div>
        </div>
    );
};

export default TaxesPage;
