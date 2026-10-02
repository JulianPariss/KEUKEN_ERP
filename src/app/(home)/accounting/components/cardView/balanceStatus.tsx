'use client'

const BalanceStatus = ({ totalBalance }: { totalBalance: number }) => {
    const isOptimal = totalBalance === 0;

    return (
        <div className={`flex items-center gap-2 p-1 rounded-dx border w-full
            ${isOptimal
                ? 'bg-emerald-500/50 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/50 border-red-500/30 text-red-400'
            }`}
        >
            <div className={`size-6 rounded-full flex items-center justify-center shrink-0
                ${isOptimal ? 'bg-emerald-400 text-emerald-700' : 'bg-red-400 text-red-700'}`}>
                <i className={`${isOptimal ? 'dx-icon-check' : 'dx-icon-warning'} text-xl`}></i>
            </div>
            <div className={`flex items-center gap-1 ${isOptimal ? 'text-emerald-200' : 'text-red-200'}`}>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                        {isOptimal ? 'Estado Óptimo: ' : 'Revisión Necesaria: '}
                    </span>
                </div>
                <span className="text-xs opacity-70 font-medium">
                    {isOptimal
                        ? 'El saldo consolidado está perfectamente balanceado.'
                        : `Se detectó un desajuste de ${totalBalance.toLocaleString('es-AR')} en el saldo consolidado.`}
                </span>
            </div>
        </div>
    );
};


export default BalanceStatus;