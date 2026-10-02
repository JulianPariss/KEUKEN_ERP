import SectionHeader from "../../components/section/sectionHeader";
import CashRegistersClient from "./cashRegistersClient";

const CashRegistersPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Cajas Registradoras" />
            <CashRegistersClient />
        </div>
    );
};

export default CashRegistersPage;
