import SectionHeader from "../../components/section/sectionHeader";
import PaymentMethodsClient from "./paymentMethodsClient";

const PaymentMethodsPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Métodos de Pago" />
            <PaymentMethodsClient />
        </div>
    );
};

export default PaymentMethodsPage;
