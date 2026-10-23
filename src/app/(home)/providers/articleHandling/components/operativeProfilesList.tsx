'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import notify from "devextreme/ui/notify";
import { operativeProfileService } from "@repo/erp-services/product_services/operativeProfile.service";
import { IFOperativeProfile } from "@repo/api-contracts/erp";
const OperativeProfilesList = () => {
    const { currentCompany, token } = useAuth();
    const [profiles, setProfiles] = useState<IFOperativeProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfiles = async () => {
            if (!currentCompany?.id || !token) return;
            setLoading(true);
            try {
                const data = await operativeProfileService.getAll(currentCompany.id, token);
                setProfiles(data);
            } catch (error: any) {
                console.error('Error loading operative profiles:', error);
                const errorMessage = error instanceof Error && error.message 
                    ? error.message 
                    : 'Error al cargar los perfiles operativos';
                notify(errorMessage, 'error', 3000);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, [currentCompany?.id, token]);

    const AttributeRow = ({ label, value, isLast = false, isBadge = false }: { label: string, value: string | boolean, isLast?: boolean, isBadge?: boolean }) => (
        <div className={`flex justify-between items-center text-xs ${!isLast ? 'border-b border-primary-500/40 pb-0.5' : ''}`}>
            <span className="font-medium text-main/70">{label}:</span>
            {isBadge ? (
                <span className="text-main/90 bg-primary-500/60 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">{value}</span>
            ) : (
                <span className="font-medium">
                    {typeof value === 'boolean' ? (
                        <i className={`dx-icon-${value ? 'check text-focus-300' : 'close text-main/40'} text-sm`}></i>
                    ) : value}
                </span>
            )}
        </div>
    );
    return (
        <div className="flex flex-col w-full h-full bg-dx-primary/10 rounded-dx font-sans overflow-y-auto relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {profiles.map(profile => (
                    <div
                        key={profile.id}
                        className="flex flex-col bg-primary-900 rounded-dx p-3 shadow-sm border border-primary-500/60 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-1.5">
                            <h3 className="text-base font-semibold text-main leading-tight mr-2">{profile.name}</h3>
                            <span className={`px-2 py-0.5 text-[10px] rounded-dx flex-shrink-0 ${profile.active ? 'bg-focus-300/20 text-focus-300' : 'bg-red-500/10 text-red-500'}`}>
                                {profile.active ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <div className="text-xs text-main/50 mb-3 font-mono break-all">
                            {profile.code}
                        </div>

                        <div className="flex flex-col gap-1.5 mt-auto">
                            <AttributeRow label="Método de Control" value={profile.controlMethod} isBadge={true} />
                            <AttributeRow label="Requiere Control" value={profile.requiresControlStep} />
                            <AttributeRow label="EAN en Control" value={profile.requiresEanAtControl} />
                            <AttributeRow label="Requiere Empaque" value={profile.requiresPackagingStep} />
                            <AttributeRow label="EAN en Empaque" value={profile.requiresEanAtPack} />
                            <AttributeRow label="Sort Staging" value={profile.allowsSortStaging} isLast={true} />
                        </div>
                    </div>
                ))}

                {!loading && profiles.length === 0 && (
                    <div className="col-span-full flex justify-center items-center p-8 text-main/60 bg-variant rounded-dx shadow-sm border border-dx-primary/20">
                        <i className="dx-icon-info text-2xl mr-2"></i> No se encontraron perfiles operativos.
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperativeProfilesList;
