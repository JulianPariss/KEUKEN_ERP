'use client';

import React, { ReactNode } from 'react';

export interface IGenericEmptyProps {
    icon?: string;
    title?: string;
    description?: string;
    action?: ReactNode;
    className?: string;
    children?: ReactNode;
}

export const GenericEmpty: React.FC<IGenericEmptyProps> = ({
    icon = 'dx-icon-info',
    title = 'No hay datos seleccionados',
    description,
    action,
    className = '',
    children,
}) => {
    return (
        <div className={`w-full flex-1 flex flex-col items-center justify-center gap-4 bg-primary-950/20 rounded-dx border border-dashed border-main/10 p-8 font-sans ${className}`}>
            <div className="p-4 rounded-full bg-main/5 flex items-center justify-center border border-main/10 text-main/60">
                <i style={{ fontSize: '1.25rem' }} className={`${icon} !text-main/60`} />
            </div>
            <div className="flex flex-col items-center text-center px-4">
                <p className="!text-main/80 text-xl font-bold">{title}</p>
                {description && (
                    <p className="!text-main/60 text-xs mt-1 max-w-sm">{description}</p>
                )}
            </div>
            {action && <div className="mt-2">{action}</div>}
            {children}
        </div>
    );
};

export default GenericEmpty;
