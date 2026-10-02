'use client';

interface KPIProps {
    label: string;
    value: number | string;
    unit: string;
    progress?: {
        used: number;
        available: number;
        total: number;
        unit: string;
        usedLabel?: string;
        availableLabel?: string;
    };
    className?: string;
}

const KPI = ({
    label,
    value,
    unit,
    progress,
    className = ""
}: KPIProps) => {
    const usedPercentage = progress
        ? Math.min(100, (progress.used / (progress.total || 1)) * 100)
        : 0;

    return (
        <div className={`p-4 bg-primary-500 rounded-dx border border-primary-500/20 relative overflow-hidden group/cap ${className}`}>
            <p className="text-sm  !text-main/60 mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <p className="text-2xl !text-focus-500">{value}</p>
                <span className="text-sm  !text-main/30">{unit}</span>
            </div>

            {progress && (
                <div className="mt-3 pt-3 border-t border-main/5 flex flex-col gap-1.5 animate-in slide-in-from-top-1 duration-500">
                    <div className="flex justify-between items-center text-sm  font-bold ">
                        <span className="text-focus-100">
                            {progress.usedLabel || 'Ocupado'}: {progress.used.toFixed(2)}{progress.unit}
                        </span>
                        <span>
                            {progress.availableLabel || 'Libre'}: {progress.available.toFixed(2)}{progress.unit}
                        </span>
                    </div>
                    <div className="h-1 w-full bg-main/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-focus-500 transition-all duration-1000"
                            style={{ width: `${usedPercentage}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default KPI;
