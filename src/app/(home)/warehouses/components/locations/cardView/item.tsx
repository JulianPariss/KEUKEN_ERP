import { IFLocation, TFLocationState } from "@repo/api-contracts/erp";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const STATE_CONFIG: Record<TFLocationState, { label: string; color: string; icon: string }> = {
    available: { label: 'Disponible', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: 'dx-icon-checkmarkcircle' },
    full: { label: 'Lleno', color: 'bg-focus-500/20 text-focus-100 border-focus-500/30', icon: 'dx-icon-box' },
    blocked: { label: 'Bloqueado', color: 'bg-red-500/20 text-red-100 border-red-500/30', icon: 'dx-icon-lock' },
    maintenance: { label: 'Mantenimiento', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: 'dx-icon-preferences' },
};

const LocationItem = ({ item, onClick }: { item: IFLocation, onClick?: () => void }) => {
    const { usage, name, active, state } = item;
    const isStorage = usage === 'internal';
    const currentState = STATE_CONFIG[state] || STATE_CONFIG.available;

    const searchParams = useSearchParams();

    const params = new URLSearchParams(searchParams.toString());
    params.set('path', item.path);
    const href = `/warehouses?${params.toString()}`;

    return (
        <Link href={href} className="h-full block">
            <div className="h-full select-none w-full flex-shrink-0 cursor-pointer group" onClick={onClick}>
                <div className={`
                h-full w-full rounded-dx py-2 px-3 flex flex-col justify-between 
                transition-all duration-300 border
                ${isStorage
                        ? 'bg-primary-500 border-primary-950 shadow-sm hover:shadow-focus-500/20 hover:border-focus-500/30'
                        : 'bg-primary-500/50 border-primary-500/10 hover:bg-primary-900/60 hover:border-primary-500/20'
                    }
            `}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`
                            size-11 rounded-dx flex justify-center items-center shrink-0 
                            transition-transform duration-300 group-hover:scale-110
                            ${isStorage
                                    ? 'bg-focus-500/20 border border-focus-500/30 shadow-xs'
                                    : 'bg-primary-500/50 border border-primary-500/80'
                                }
                        `}>
                                <i className={`${isStorage ? 'dx-icon-box' : 'dx-icon-inactivefolder'} text-2xl`}></i>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`
                                    text-xs  !text-main/50   
                                    ${isStorage ? 'text-focus-100/70' : 'text-main/20'}
                                `}>
                                        {isStorage ? 'Almacén' : 'Ubicación'}
                                    </span>
                                </div>
                                <h3 className={`
                                text-md  font-bold leading-tight truncate mt-1
                                ${isStorage ? 'text-main' : 'text-main/80 group-hover:text-main'}
                            `}>
                                    {name}
                                </h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                title={currentState.label}
                                className={` p-1 text-xs  rounded-full border flex items-center justify-center
                            ${currentState.color}
                        `}>
                                <i className={`${currentState.icon} text-xs `}></i>
                            </span>
                            <div className="flex items-center gap-x-2">
                                <div
                                    title={active ? 'Activo' : 'Inactivo'}
                                    className={`${active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                        } size-2.5 rounded-full transition-all duration-300 group-hover:scale-125 hover:opacity-80`}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default LocationItem;