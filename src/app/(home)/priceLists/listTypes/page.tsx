import ListTypesClient from ".";
import SectionHeader from "../../components/section/sectionHeader";

const ListTypesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Tipos de Listas" />
            <ListTypesClient />
        </div>
    );
};

export default ListTypesPage;
