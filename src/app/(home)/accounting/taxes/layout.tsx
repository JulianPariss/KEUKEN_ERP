import ModuleAccessLayout from '@/components/ModuleAccessLayout';
import type { ReactNode } from 'react';

export default function TaxesLayout({ children }: { children: ReactNode }) {
    return <ModuleAccessLayout module="billing">{children}</ModuleAccessLayout>;
}
