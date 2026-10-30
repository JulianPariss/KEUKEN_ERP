import ModuleAccessLayout from '@/components/ModuleAccessLayout';
import type { ReactNode } from 'react';

export default function PriceListsLayout({ children }: { children: ReactNode }) {
    return <ModuleAccessLayout module="commercial">{children}</ModuleAccessLayout>;
}
