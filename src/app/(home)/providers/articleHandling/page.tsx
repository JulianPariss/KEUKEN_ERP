import React from 'react';
import SectionHeader from "../../components/section/sectionHeader";
import ConfigurationsTabs from "./components/tabs";

const ProductConfigurationsPage = () => {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Configuraciones de Artículos" />
            <div className="flex-1 flex flex-col min-h-0">
                <ConfigurationsTabs />
            </div>
        </div>
    );
};

export default ProductConfigurationsPage;
