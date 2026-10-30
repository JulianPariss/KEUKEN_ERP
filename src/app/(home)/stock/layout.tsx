import ModuleAccessLayout from '@/components/ModuleAccessLayout';
import type { ReactNode } from 'react';

export default function StockLayout({ children }: { children: ReactNode }) {
    return <ModuleAccessLayout module="procurement">{children}</ModuleAccessLayout>;
}
