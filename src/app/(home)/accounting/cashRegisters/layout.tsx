import ModuleAccessLayout from '@/components/ModuleAccessLayout';
import type { ReactNode } from 'react';

export default function CashRegistersLayout({ children }: { children: ReactNode }) {
    return <ModuleAccessLayout module="treasury">{children}</ModuleAccessLayout>;
}
