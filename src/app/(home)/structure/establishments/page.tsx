import SectionHeader from "../../components/section/sectionHeader";
import EstablishmentsClient from "./establishmentsClient";

const EstablishmentsPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Establecimientos" />
            <EstablishmentsClient />
        </div>
    );
};

export default EstablishmentsPage;
