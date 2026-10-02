'use client';

import SectionHeader from "../components/section/sectionHeader";
import StockTabs from "./components/stockTabs";

const Stock = () => {

    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Stock" />
            <StockTabs />
        </div>
    );
};

export default Stock;