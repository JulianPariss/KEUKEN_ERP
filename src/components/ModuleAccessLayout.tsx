'use client';

import { AccessGate, type TFProductModuleCode } from '@repo/access';
import type { ReactNode } from 'react';

interface ModuleAccessLayoutProps {
    module: TFProductModuleCode;
    children: ReactNode;
}

/**
 * Layout wrapper que protege un segmento de rutas con AccessGate por módulo de licencia.
 * Usar en layout.tsx de cada dominio (warehouses, priceLists, etc.).
 */
export default function ModuleAccessLayout({ module, children }: ModuleAccessLayoutProps) {
    return <AccessGate module={module}>{children}</AccessGate>;
}
