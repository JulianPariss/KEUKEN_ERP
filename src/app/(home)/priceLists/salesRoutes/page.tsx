import SalesRoutesClient from ".";
import SectionHeader from "../../components/section/sectionHeader";

const SalesRoutesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Rutas de Venta" />
            <SalesRoutesClient />
        </div>
    )
}

export default SalesRoutesPage;