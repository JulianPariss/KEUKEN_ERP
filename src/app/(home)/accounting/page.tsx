import SectionHeader from "../components/section/sectionHeader";
import AccountingSection from ".";

const AccountingPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Contabilidad" />
            <AccountingSection />
        </div>
    );
};

export default AccountingPage;