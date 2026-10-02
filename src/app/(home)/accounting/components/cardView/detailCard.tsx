'use client';

import { ACCOUNT_TYPE_LABELS } from '@/app/lib/constants/accounting.constants';
import { IFAccountLines } from "@repo/api-contracts/erp";
import { GenericDataGrid, IGenericDataGridColumn, Button } from '@repo/devextreme';
import { useAccounting } from '@/contexts/AccountingContext';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import DeleteAccount from '../actions/deleteAccount';
import EditAccount from '../actions/editAccount';
import ViewTransaction from '../actions/viewTransaction';
import KPI from './kpi';
import OverallDetail from './overallDetail';

import CustomToolbarDateFilter, { PeriodFilterContext } from '../CustomToolbarDateFilter';


const ItemsDetailCard = () => {
    const { accounts, selectedAccount, getAccountById, getAccountTransactions, refreshVersion } = useAccounting();
    const [isViewTransactionOpen, setIsViewTransactionOpen] = useState(false);
    const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
    const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null);
    const [history, setHistory] = useState<IFAccountLines[]>([]);
    const [openingBalance, setOpeningBalance] = useState(0);
    const [dateRange, setDateRange] = useState<[any, any]>([null, null]);
    const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

    const rootAccounts = useMemo(() => accounts.filter(acc => acc.isRoot), [accounts]);
    const currentAccount = useMemo(
        () => selectedAccount ? getAccountById(selectedAccount) : null,
        [selectedAccount, getAccountById]
    );
    const canImpute = currentAccount?.status === 'active';

    useEffect(() => {
        if (!selectedAccount) {
            setHistory([]);
            setOpeningBalance(0);
            return;
        }

        getAccountTransactions(selectedAccount).then((res) => {
            const sorted = res.items.sort((a, b) => dayjs(b.moveDate).valueOf() - dayjs(a.moveDate).valueOf());
            setHistory(sorted);
            setOpeningBalance(res.openingBalance);
        }).catch(err => {
            console.error(err);
        });

    }, [selectedAccount, getAccountTransactions, refreshVersion]);

    const filteredHistory = useMemo(() => {
        const [start, end] = dateRange || [null, null];
        return history.filter(line => {
            const date = dayjs(line.moveDate);
            const isAfterStart = start ? date.isAfter(dayjs(start).subtract(1, 'day')) : true;
            const isBeforeEnd = end ? date.isBefore(dayjs(end).add(1, 'day')) : true;
            return isAfterStart && isBeforeEnd;
        });
    }, [history, dateRange]);

    const kpiData = useMemo(() => {
        let totalDebit = 0;
        let totalCredit = 0;
        for (const line of filteredHistory) {
            totalDebit += line.debit;
            totalCredit += line.credit;
        }
        const balance = Math.abs(totalCredit - totalDebit);
        return { totalDebit, totalCredit, balance };
    }, [filteredHistory]);

    const handleRangeChange = useCallback((newRange: [any, any]) => {
        setDateRange(prev => {
            const prevStart = prev[0]?.getTime();
            const prevEnd = prev[1]?.getTime();
            const newStart = newRange[0]?.getTime();
            const newEnd = newRange[1]?.getTime();

            if (prevStart === newStart && prevEnd === newEnd) {
                return prev;
            }
            return newRange;
        });
    }, []);

    const toolbarItems = useMemo(() => [
        {
            location: 'before' as const,
            locateInMenu: 'auto' as const,
            render: () => <CustomToolbarDateFilter />
        },
        { name: 'searchPanel' },
        { name: 'exportButton' },
        { name: 'columnChooserButton' }
    ], []);

    const columns: IGenericDataGridColumn[] = useMemo(() => [
        {
            dataField: 'moveDate',
            caption: 'Fecha',
            dataType: 'date',
            format: 'dd/MM/yyyy',
            width: 100,
            alignment: 'center',
            allowSearch: false
        },
        {
            dataField: 'journalCode',
            caption: 'Diario',
            width: 80,
            alignment: 'center',
        },
        {
            dataField: 'moveName',
            caption: 'Descripción',
            minWidth: 200,
            cellRender: (cellData: { data: IFAccountLines }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-main truncate" title={cellData.data.moveName}>{cellData.data.moveName}</span>
                </div>
            )
        },
        {
            dataField: 'debit',
            caption: 'Debe',
            dataType: 'number',
            format: '#,##0.00',
            width: 120,
            alignment: 'center',
            headerCellRender: () => <div className="w-full text-center font-bold">Debe</div>,
            cellRender: (cellData: { data: IFAccountLines }) => (
                <div className="w-full flex justify-center items-center">
                    {cellData.data.debit > 0 ? (
                        <span className="font-mono text-main">${cellData.data.debit.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    ) : <span className="opacity-20">-</span>}
                </div>
            )
        },
        {
            dataField: 'credit',
            caption: 'Haber',
            dataType: 'number',
            format: '#,##0.00',
            width: 120,
            alignment: 'center',
            headerCellRender: () => <div className="w-full text-center font-bold">Haber</div>,
            cellRender: (cellData: { data: IFAccountLines }) => (
                <div className="w-full flex justify-center items-center">
                    {cellData.data.credit > 0 ? (
                        <span className="font-mono text-main">${cellData.data.credit.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    ) : <span className="opacity-20">-</span>}
                </div>
            )
        },
        {
            type: 'buttons',
            width: 50,
            alignment: 'center',
            allowEditing: false,
            buttons: [
                {
                    hint: 'Ver Detalle',
                    icon: 'eyeopen',
                    onClick: (e: any) => {
                        setSelectedMoveId(e.row.data.moveId);
                        setIsViewTransactionOpen(true);
                    }
                }
            ]
        }
    ], []);

    if (!selectedAccount) {
        return <OverallDetail rootAccounts={rootAccounts} />
    }

    return (
        <PeriodFilterContext.Provider value={{
            selectedPeriodId,
            setSelectedPeriodId,
            setDateRange: handleRangeChange
        }}>
            <div className="w-full h-full flex flex-col bg-primary-900 border border-primary-500/30 rounded-dx overflow-hidden shadow-2xl">
                <div className={`flex flex-col border-b border-primary-500/20 shadow-black/25 bg-primary-900/20`}>
                    <div className="p-3 px-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={`
                            size-11 rounded-dx flex items-center justify-center border shadow-sm
                            ${canImpute
                                    ? 'bg-linear-to-br from-focus-500/30 to-focus-500/10 text-focus-100 border-focus-500/40 shadow-black/10'
                                    : 'bg-primary-950/40 border-main/5'
                                }
                        `}>
                                <i className={`${canImpute ? 'dx-icon-money' : 'dx-icon-inactivefolder'} text-2xl`}></i>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-lg font-semibold text-main leading-tight">{currentAccount?.name}</h2>
                                    <div className="flex gap-1.5">
                                        <span className={`
                                        px-1.5 py-0 text-[10px] uppercase tracking-wider font-medium rounded-[3px] border
                                        ${canImpute ? 'bg-focus-500/20 text-focus-100 border-focus-500/20' : 'bg-primary-900/80 text-main border-main/5'}
                                    `}>
                                            {canImpute ? 'Imputable' : 'No Imputable'}
                                        </span>
                                        {currentAccount?.type && (
                                            <span className="px-1.5 py-0 text-[10px] uppercase tracking-wider font-medium rounded-[3px] border bg-primary-950/40 text-main/60 border-main/10">
                                                {ACCOUNT_TYPE_LABELS[currentAccount.type] ?? currentAccount.type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {currentAccount?.path && (
                                        <span className="text-xs !text-main/40 flex items-center gap-1">
                                            <i className="dx-icon-folder text-xs !text-main/40" /> {currentAccount.path}
                                        </span>
                                    )}
                                    <span className="py-0 px-1.5 bg-primary-900/20 text-[10px] font-mono text-main/60 rounded border border-main/5">
                                        ID: {currentAccount?.id.toString().padStart(6, '0')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className='gap-4'>
                            <Button
                                icon="edit"
                                stylingMode="text"
                                onClick={() => setIsEditAccountOpen(true)}
                                className="text-main/50! hover:text-main!"
                                hint="Editar Cuenta"
                            />
                            {currentAccount?.status === 'deprecated' && (
                                <Button
                                    icon="trash"
                                    stylingMode="text"
                                    type="danger"
                                    onClick={() => setIsDeleteAccountOpen(true)}
                                    hint="Eliminar Cuenta"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-h-0 flex flex-col p-5 gap-6 bg-primary-950/50 overflow-hidden custom-scrollbar">
                    <div className="grid grid-cols-3 gap-4">
                        <KPI
                            label="Saldo"
                            value={kpiData.balance}
                        />
                        <KPI
                            label="Debe"
                            value={kpiData.totalDebit}
                        />
                        <KPI
                            label="Haber"
                            value={kpiData.totalCredit}
                        />
                    </div>

                    <div className="flex-1 min-h-0 bg-primary-0/50 p-1 rounded-dx border border-main/5 overflow-hidden">
                        <GenericDataGrid
                            keyExpr="lineId"
                            columnAutoWidth={false}
                            allowColumnResizing={false}
                            dataSource={filteredHistory}
                            columns={columns}
                            gridId="accounting-history"
                            toolbarItems={toolbarItems}
                            height="100%"
                            remoteOperations={false}
                            filterRow={false}
                            headerFilter={false}
                            paging={{ enabled: true, pageSize: 20 }}
                            searchPanel={{ visible: true, placeholder: 'Buscar...' }}
                            export={{ enabled: true, fileName: `Historial_${currentAccount?.name}` }}
                            rowAlternationEnabled={true}
                            showBorders={false}
                            summary={{
                                totalItems: [
                                    {
                                        column: 'debit',
                                        summaryType: 'sum',
                                        customizeText: (data) => data.value > 0
                                            ? `$${data.value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                            : '-'
                                    },
                                    {
                                        column: 'credit',
                                        summaryType: 'sum',
                                        customizeText: (data) => data.value > 0
                                            ? `$${data.value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                            : '-'
                                    },
                                    {
                                        column: 'moveName',
                                        summaryType: 'count',
                                        customizeText: () => {
                                            const saldo = Math.abs(kpiData.totalDebit - kpiData.totalCredit);
                                            return `Saldo: $${saldo.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                        }
                                    }
                                ]
                            }}
                        />
                    </div>

                </div>


                <div className="h-1.5 w-full bg-gradient-to-r from-focus-500 to-primary-0 opacity-60"></div>

                <ViewTransaction
                    visible={isViewTransactionOpen}
                    onClose={() => setIsViewTransactionOpen(false)}
                    moveId={selectedMoveId}
                />

                <EditAccount
                    isOpen={isEditAccountOpen}
                    onClose={() => setIsEditAccountOpen(false)}
                    accountId={selectedAccount}
                />

                <DeleteAccount
                    isOpen={isDeleteAccountOpen}
                    onClose={() => setIsDeleteAccountOpen(false)}
                    accountId={selectedAccount}
                />

            </div>
        </PeriodFilterContext.Provider>
    );
};

export default ItemsDetailCard;
