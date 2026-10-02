import SectionHeader from "../../components/section/sectionHeader";
import UoMCategoriesClient from "./uomCategoriesClient";

const UoMCategoriesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Categorías de UoM" />
            <UoMCategoriesClient />
        </div>
    );
};

export default UoMCategoriesPage;
