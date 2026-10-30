import ModuleAccessLayout from '@/components/ModuleAccessLayout';
import type { ReactNode } from 'react';

export default function WarehousesLayout({ children }: { children: ReactNode }) {
    return <ModuleAccessLayout module="wms">{children}</ModuleAccessLayout>;
}
