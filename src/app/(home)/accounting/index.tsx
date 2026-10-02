'use client'

import { AccountingProvider } from "@/contexts/AccountingContext";
import AccountingClient from "./accountingClient";

const AccountingSection = () => {
    return (
        <div key={`accounting-scope`} className="flex flex-col flex-1 min-h-0 h-full">
            <AccountingProvider>
                <AccountingClient />
            </AccountingProvider>
        </div>
    );
};

export default AccountingSection;
