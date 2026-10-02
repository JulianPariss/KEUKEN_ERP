import SectionHeader from "../../components/section/sectionHeader";
import BranchesClient from "./branchesClient";

const BranchesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Sucursales" />
            <BranchesClient />
        </div>
    );
};

export default BranchesPage;
