import ModuleAccessLayout from "@/components/ModuleAccessLayout";
import SectionHeader from "../components/section/sectionHeader";
import AccountingSection from ".";

const AccountingPage = () => {
    return (
        <ModuleAccessLayout module="accounting">
            <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
                <SectionHeader title="Contabilidad" />
                <AccountingSection />
            </div>
        </ModuleAccessLayout>
    );
};

export default AccountingPage;