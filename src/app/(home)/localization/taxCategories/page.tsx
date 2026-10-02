import SectionHeader from "../../components/section/sectionHeader";
import TaxCategoriesClient from "./taxCategoriesClient";

const TaxCategoriesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Categorías de Impuesto" />
            <TaxCategoriesClient />
        </div>
    );
};

export default TaxCategoriesPage;
