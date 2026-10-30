import ModuleAccessLayout from '@/components/ModuleAccessLayout';
import type { ReactNode } from 'react';

export default function DeliveryLayout({ children }: { children: ReactNode }) {
    return <ModuleAccessLayout module="logistics">{children}</ModuleAccessLayout>;
}
