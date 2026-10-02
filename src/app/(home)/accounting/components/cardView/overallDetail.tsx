import { IFAccountNode } from "@repo/api-contracts/erp";
import BalanceStatus from "./balanceStatus";
import KPI from "./kpi";

const OverallDetail = ({ rootAccounts }: { rootAccounts: IFAccountNode[] }) => {
    const totalBalance = rootAccounts.reduce((sum, acc) => sum + ((acc as any).balance || 0), 0);

    return (
        <div className="w-full h-full flex flex-col bg-primary-900 border border-primary-500/30 rounded-dx overflow-hidden shadow-2xl">

            <div className="flex justify-between items-center border-b border-primary-500/20 shadow-black/25 bg-primary-900/20 p-4 gap-1">
                <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-medium">Resumen General</h3>
                    <p className="text-sm text-main/50 font-medium">Consolidado de cuentas</p>
                </div>
            </div>

            <div className='flex-1 min-h-0 flex flex-col p-5 gap-6 bg-primary-950/50 overflow-hidden custom-scrollbar'>
                <BalanceStatus totalBalance={totalBalance} />
                <div className="grid grid-cols-3 gap-4">
                    {rootAccounts.map(acc => (
                        <KPI
                            key={acc.id}
                            label={acc.name}
                            value={((acc as any).balance || 0)}
                        />
                    ))}
                </div>

                <div className="pt-2 border-t border-main/5 gap-3">
                    <KPI
                        label="Saldo Final (Consolidado)"
                        value={totalBalance}
                        className="!bg-focus-500/10 border-focus-500/30 w-1/4"
                    />
                </div>

                <div className="mt-auto p-4 bg-primary-500/5 border border-primary-500/10 rounded-dx flex items-center gap-4 group cursor-help">
                    <p className="text-xs text-main/40 leading-relaxed">
                        Para ver detalles específicos, débitos y créditos mensuales, selecciona una cuenta del panel lateral.
                    </p>
                </div>
            </div>
            <div className="h-1.5 w-full bg-gradient-to-r from-focus-500 to-primary-0 opacity-60"></div>
        </div>
    );

}

export default OverallDetail;