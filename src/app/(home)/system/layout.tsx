import ModuleAccessLayout from '@/components/ModuleAccessLayout';
import type { ReactNode } from 'react';

export default function SystemLayout({ children }: { children: ReactNode }) {
    return <ModuleAccessLayout module="core">{children}</ModuleAccessLayout>;
}
