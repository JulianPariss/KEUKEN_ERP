import SectionHeader from "../../components/section/sectionHeader";
import PaymentTermsClient from "./paymentTermsClient";

const PaymentTermsPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Términos de Pago" />
            <PaymentTermsClient />
        </div>
    );
};

export default PaymentTermsPage;
