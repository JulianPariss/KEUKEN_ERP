import ModuleAccessLayout from '@/components/ModuleAccessLayout';
import type { ReactNode } from 'react';

export default function StructureLayout({ children }: { children: ReactNode }) {
    return <ModuleAccessLayout module="core">{children}</ModuleAccessLayout>;
}
