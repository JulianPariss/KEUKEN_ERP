import ModuleAccessLayout from '@/components/ModuleAccessLayout';
import type { ReactNode } from 'react';

export default function AccountingPeriodsLayout({ children }: { children: ReactNode }) {
    return <ModuleAccessLayout module="accounting">{children}</ModuleAccessLayout>;
}
