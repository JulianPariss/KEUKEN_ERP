'use client';

interface KPIProps {
    label: string;
    value: number | string;
    className?: string;
}

const KPI = ({
    label,
    value,
    className = ""
}: KPIProps) => {

    return (
        <div className={`p-2 bg-primary-500 rounded-dx border border-primary-500/20 relative overflow-hidden group/cap ${className}`}>
            <p className="text-[10px] opacity-40 tracking-wider mb-0.5">{label}</p>
            <div className="flex items-baseline gap-1">
                <p className="text-lg font-semibold !text-focus-100 after:content-['$'] after:ml-0.5">{value.toLocaleString('es-AR')}</p>
            </div>
        </div>
    );
};

export default KPI;
