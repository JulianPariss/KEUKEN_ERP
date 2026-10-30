import ModuleAccessLayout from '@/components/ModuleAccessLayout';
import type { ReactNode } from 'react';

export default function LocalizationLayout({ children }: { children: ReactNode }) {
    return <ModuleAccessLayout module="logistics">{children}</ModuleAccessLayout>;
}
