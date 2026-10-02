import React from 'react';

interface ICollapsibleSectionProps {
    id: string;
    title: string;
    icon: string;
    expanded: boolean;
    onToggle: (id: string) => void;
    children: React.ReactNode;
    badge?: string | number;
}

export const CollapsibleSection = ({ id, title, icon, expanded, onToggle, children, badge }: ICollapsibleSectionProps) => (
    <div className="flex flex-col gap-3 bg-primary-950/60 rounded-dx border border-main/5 overflow-hidden transition-all duration-300">
        <button
            onClick={() => onToggle(id)}
            className="flex items-center justify-between p-4 hover:bg-main/5 transition-colors group"
        >
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-dx flex items-center justify-center transition-all ${expanded ? 'bg-focus-500 shadow-lg shadow-black/20' : 'bg-main/5 text-main/40'}`}>
                    <i className={`dx-icon-${icon} text-md text-variant`}></i>
                </div>
                <div className="flex flex-col items-start gap-1">
                    <span className={`text-sm transition-colors ${expanded ? 'text-main' : 'text-main/40'}`}>
                        {title}
                    </span>
                    {badge !== undefined && (
                        <span className="text-xs text-focus-400 font-bold opacity-60">
                            {badge} {typeof badge === 'number' && badge === 1 ? 'elemento' : 'elementos'}
                        </span>
                    )}
                </div>
            </div>
            <i className={`dx-icon-chevronnext text-xs transition-transform duration-300 ${expanded ? 'rotate-90 text-main/60' : 'text-main/20'}`}></i>
        </button>

        {expanded && (
            <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300 flex flex-col gap-4">
                {children}
            </div>
        )}
    </div>
);
