import SectionHeader from '../../components/section/sectionHeader';
import PricePoliciesClient from './index';

const PricePoliciesPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Políticas de Precios" />
            <PricePoliciesClient />
        </div>
    )
}

export default PricePoliciesPage;