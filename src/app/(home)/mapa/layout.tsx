import ModuleAccessLayout from '@/components/ModuleAccessLayout';
import type { ReactNode } from 'react';

export default function MapaLayout({ children }: { children: ReactNode }) {
    return <ModuleAccessLayout module="maps">{children}</ModuleAccessLayout>;
}
