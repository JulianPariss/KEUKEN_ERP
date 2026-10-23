import SectionHeader from "../../components/section/sectionHeader";
import CategoriesClient from "@repo/product-ui/categories/categoriesClient";

const CategoriesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Categorías" />
            <CategoriesClient />
        </div>
    );
};

export default CategoriesPage;
