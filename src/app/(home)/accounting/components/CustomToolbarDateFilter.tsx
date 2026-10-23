'use client';

import { SelectBox } from '@repo/devextreme';
import { useEffect, useRef, useState, createContext, useContext } from 'react';
import dayjs from 'dayjs';
import { periodsService } from '@repo/erp-services/accountant/periods.service';
import { useAuth } from '@/contexts/AuthContext';
import { IFPeriod } from "@repo/api-contracts/erp";

export interface PeriodFilterContextType {
    selectedPeriodId: string | null;
    setSelectedPeriodId: (id: string | null) => void;
    setDateRange: (range: [Date | null, Date | null]) => void;
}

export const PeriodFilterContext = createContext<PeriodFilterContextType | null>(null);

interface CustomToolbarDateFilterProps {
    onRangeChange?: (range: [Date | null, Date | null]) => void;
    selectedPeriod?: string | null;
    onPeriodChange?: (periodId: string | null) => void;
}

let cachedPeriods: Record<string, IFPeriod[] | undefined> = {};
let periodsPromise: Record<string, Promise<IFPeriod[]> | undefined> = {};

const CustomToolbarDateFilter = ({ onRangeChange, selectedPeriod: externalSelectedPeriod, onPeriodChange }: CustomToolbarDateFilterProps) => {
    const { token, currentCompany } = useAuth();
    const [periods, setPeriods] = useState<IFPeriod[]>([]);
    
    // Soporte para estado controlado por contexto, por props o interno
    const context = useContext(PeriodFilterContext);
    const [internalSelectedPeriod, setInternalSelectedPeriod] = useState<string | null>(null);

    const activePeriod = context ? context.selectedPeriodId : (externalSelectedPeriod !== undefined ? externalSelectedPeriod : internalSelectedPeriod);
    const setActivePeriod = context ? context.setSelectedPeriodId : (onPeriodChange || setInternalSelectedPeriod);
    const triggerRangeChange = context ? context.setDateRange : onRangeChange;

    const activePeriodRef = useRef(activePeriod);
    activePeriodRef.current = activePeriod;

    // Fetch inicial de periodos con cache
    useEffect(() => {
        if (!token || !currentCompany?.id) return;

        const key = `${token}-${currentCompany.id}`;
        let isMounted = true;

        const handlePeriods = (res: IFPeriod[]) => {
            if (!isMounted) return;
            setPeriods(res);

            // Si al cargar no hay ninguno seleccionado, elegimos por defecto
            if (!activePeriodRef.current) {
                const today = new Date();
                const current = res.find(p => {
                    const start = new Date(p.dateStart);
                    const end = new Date(p.dateStop);
                    return today >= start && today <= end;
                });

                if (current) {
                    setActivePeriod(current.id);
                } else if (res.length > 0) {
                    setActivePeriod(res[0].id);
                }
            }
        };

        if (cachedPeriods[key]) {
            handlePeriods(cachedPeriods[key]!);
        } else if (periodsPromise[key]) {
            periodsPromise[key]!.then(handlePeriods);
        } else {
            periodsPromise[key] = periodsService.getAll(token, currentCompany.id).then(res => {
                cachedPeriods[key] = res;
                return res;
            });
            periodsPromise[key]!.then(handlePeriods).catch(err => {
                console.error("Error loading periods:", err);
                periodsPromise[key] = undefined;
            });
        }

        return () => {
            isMounted = false;
        };
    }, [token, currentCompany?.id, setActivePeriod]);

    // Avisar al padre cuando cambia el periodo activo
    useEffect(() => {
        if (activePeriod && periods.length > 0) {
            const period = periods.find(p => p.id === activePeriod);
            if (period && triggerRangeChange) {
                const start = dayjs(period.dateStart).startOf('day').toDate();
                const end = dayjs(period.dateStop).endOf('day').toDate();

                triggerRangeChange([start, end]);
            }
        }
    }, [activePeriod, periods, triggerRangeChange]);

    return (
        <SelectBox
            dataSource={periods}
            valueExpr="id"
            displayExpr="name"
            value={activePeriod}
            onValueChanged={(e) => {
                // Previene el bug de DevExtreme: si la data aún no carga, evita que intente limpiar el valor a null
                if (periods.length === 0 && e.value === null) return;
                setActivePeriod(e.value);
            }}
            placeholder="Seleccione un periodo..."
            width={200}
            stylingMode="filled"
            className="!bg-primary-950/20"
        />
    );
};

export default CustomToolbarDateFilter;
